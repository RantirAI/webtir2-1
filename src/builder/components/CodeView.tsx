import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { usePageStore } from '../store/usePageStore';
import { useStyleStore } from '../store/useStyleStore';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { exportHTML, exportCSS, exportJS, exportAstro } from '../utils/codeExport';
import { extractUsedFonts, generateGoogleFontsLink } from '../utils/export';
import { discoverComponents, getComponentCode, flattenComponents } from '../utils/componentCodeExport';
import { parseHTMLToInstance, parseHTMLPreservingLinks } from '../utils/codeImport';
import { parseCSSToStyleStore, validateCSS, extractCSSRules } from '../utils/cssImport';
import { getHeadingTypography } from '../utils/headingTypography';
import { ComponentInstance } from '../store/types';
import { Copy, Check, Monitor, Tablet, Smartphone, Upload, Lock, Sparkles } from 'lucide-react';
import { ImportModal } from './ImportModal';
import { FileTree } from './FileTree';
import { CreateComponentDialog } from './CreateComponentDialog';
import { CodeViewMediaPanel } from './CodeViewMediaPanel';
import { LockedCodeEditor } from './LockedCodeEditor';
import { AIChat } from './AIChat';
import { LockRegion } from '../primitives/core/types';
import { toast } from '@/hooks/use-toast';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

// Helper function to apply heading typography defaults to all headings in tree
function applyHeadingTypographyToTree(instance: ComponentInstance) {
  const { styles, setStyle } = useStyleStore.getState();
  
  if (instance.type === 'Heading') {
    const level = instance.props?.level || 'h1';
    const styleSourceId = instance.styleSourceIds?.[0];
    
    if (styleSourceId) {
      // Check if typography styles already exist for this style source
      const hasFontSize = Object.keys(styles).some(
        key => key.startsWith(`${styleSourceId}:`) && key.includes(':fontSize')
      );
      
      if (!hasFontSize) {
        const typography = getHeadingTypography(level);
        setStyle(styleSourceId, 'fontSize', typography.fontSize, 'desktop', 'default');
        setStyle(styleSourceId, 'fontWeight', typography.fontWeight, 'desktop', 'default');
        setStyle(styleSourceId, 'lineHeight', typography.lineHeight, 'desktop', 'default');
      }
    }
  }
  
  // Recurse into children
  instance.children?.forEach(child => applyHeadingTypographyToTree(child));
}

interface CodeViewProps {
  onClose: () => void;
  pages: string[];
  pageNames: Record<string, string>;
}

export const CodeView: React.FC<CodeViewProps> = ({ onClose, pages, pageNames }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const { getCurrentPage, getPageCustomCode, getAllPages, getGlobalComponents } = usePageStore();
  const currentPage = getCurrentPage();
  const customCode = currentPage ? getPageCustomCode(currentPage.id) : { header: '', body: '', footer: '' };
  const allProjectPages = getAllPages();
  const globalComponents = getGlobalComponents();
  
  // Subscribe to style store changes for CSS export sync
  const styles = useStyleStore((state) => state.styles);
  const styleSources = useStyleStore((state) => state.styleSources);
  
  // Create a stable version number that changes when styles change
  // This triggers CSS regeneration without excessive re-renders
  const styleVersion = useMemo(() => {
    const stylesCount = Object.keys(styles).length;
    const sourcesCount = Object.keys(styleSources).length;
    // Include a hash of style content for more granular change detection
    const contentHash = Object.values(styles).reduce((acc, s) => acc + JSON.stringify(s).length, 0);
    return `${stylesCount}-${sourcesCount}-${contentHash}`;
  }, [styles, styleSources]);
  
  // Debounce style changes to prevent excessive regeneration during AI builds
  const debouncedStyleVersion = useDebounce(styleVersion, 300);
  
  // Calculate export stats for debugging truncation issues
  const sectionCount = rootInstance?.children?.length || 0;
  
  const [activeTab, setActiveTab] = useState('html');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateComponentDialog, setShowCreateComponentDialog] = useState(false);
  const defaultFile = pages.length > 0 ? `/pages/${pages[0].toLowerCase().replace(/\s+/g, '-')}.html` : '/pages/page-1.html';
  const [selectedFile, setSelectedFile] = useState(defaultFile);
  const [currentPreviewPage, setCurrentPreviewPage] = useState(defaultFile);
  const [showAIChat, setShowAIChat] = useState(false);
  const [isCodeEdited, setIsCodeEdited] = useState(false);
  
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [astroCode, setAstroCode] = useState('');
  
  // Track which tabs have been edited (user-modified content)
  const [editedTabs, setEditedTabs] = useState<Record<string, boolean>>({
    html: false,
    css: false,
    react: false,
    astro: false,
  });

  // Discover components from canvas
  const componentEntries = useMemo(() => {
    if (!rootInstance) return [];
    return discoverComponents(rootInstance);
  }, [rootInstance]);

  // Check if selected file is a component file, page file, or media
  const isComponentFile = selectedFile.startsWith('/components/');
  const isPageFile = selectedFile.startsWith('/pages/');
  const isMediaFile = selectedFile.startsWith('/media');
  const isCoreFile = selectedFile.includes('.core.') || selectedFile.includes('/core/');
  
  const componentCode = useMemo(() => {
    if (!isComponentFile) return null;
    return getComponentCode(componentEntries, selectedFile);
  }, [isComponentFile, componentEntries, selectedFile]);

  // Get list of component types that should be locked in page view
  const lockedComponentTypes = ['Section', 'Navigation', 'Header', 'Footer', 'Card', 'Accordion', 'Carousel', 'Tabs'];

  // Handle attempts to edit locked code regions
  const handleLockedEditAttempt = (region: LockRegion) => {
    toast({
      title: 'Protected Code Region',
      description: `This ${region.type} region is locked to protect critical functionality. ${region.allowUnlock ? 'Use the unlock button for advanced editing.' : 'This region cannot be unlocked.'}`,
      variant: 'destructive',
    });
  };

  // Generate HTML with custom code sections and component placeholders for page files
  const generatePageHTML = () => {
    const baseHTML = exportHTML(rootInstance);
    
    // Inject custom code sections
    let modifiedHTML = baseHTML;
    
    // Add custom header code before </head>
    if (customCode.header) {
      modifiedHTML = modifiedHTML.replace(
        '</head>',
        `  <!-- Custom Header Code -->\n${customCode.header}\n  </head>`
      );
    }
    
    // Add custom body code after <body>
    if (customCode.body) {
      modifiedHTML = modifiedHTML.replace(
        /<body[^>]*>/,
        `$&\n  <!-- Custom Body Start Code -->\n${customCode.body}\n`
      );
    }
    
    // Add custom footer code before </body>
    if (customCode.footer) {
      modifiedHTML = modifiedHTML.replace(
        '</body>',
        `  <!-- Custom Footer Code -->\n${customCode.footer}\n  </body>`
      );
    }
    
    return modifiedHTML;
  };

  // Identify component regions in HTML for read-only display
  const componentRegions = useMemo(() => {
    if (!isPageFile || !rootInstance) return [];
    
    const regions: { start: number; end: number; componentName: string }[] = [];
    const html = generatePageHTML();
    
    // Find component markers in the HTML
    componentEntries.forEach(entry => {
      const componentMarkerStart = `<!-- Component: ${entry.name} -->`;
      const componentMarkerEnd = `<!-- /Component: ${entry.name} -->`;
      
      let startIdx = html.indexOf(componentMarkerStart);
      while (startIdx !== -1) {
        const endIdx = html.indexOf(componentMarkerEnd, startIdx);
        if (endIdx !== -1) {
          regions.push({
            start: startIdx,
            end: endIdx + componentMarkerEnd.length,
            componentName: entry.name,
          });
        }
        startIdx = html.indexOf(componentMarkerStart, startIdx + 1);
      }
    });
    
    return regions;
  }, [isPageFile, rootInstance, componentEntries, customCode]);

  useEffect(() => {
    // Generate code exports based on selected file
    // Only regenerate tabs that haven't been user-edited
    if (isComponentFile && componentCode) {
      if (!editedTabs.html) setHtmlCode(componentCode.html);
      if (!editedTabs.css) setCssCode(componentCode.css);
    } else {
      if (!editedTabs.html) setHtmlCode(generatePageHTML());
      if (!editedTabs.css) setCssCode(exportCSS());
    }
    if (!editedTabs.react) setJsCode(exportJS(rootInstance));
    if (!editedTabs.astro) setAstroCode(exportAstro(rootInstance));
    // Note: debouncedStyleVersion triggers CSS regeneration when styles change
  }, [rootInstance, selectedFile, isComponentFile, componentCode, customCode, debouncedStyleVersion]);

  const handleCopy = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleImport = (source: string, content: string | File) => {
    console.log('Importing from:', source, content);
    // TODO: Implement actual import logic
    // This would parse the content and update the builder store
  };

  // Apply code changes to builder
  const applyCodeChanges = () => {
    try {
      if (activeTab === 'html') {
        // Use link-preserving parser to maintain component connections
        const newInstance = parseHTMLPreservingLinks(htmlCode, rootInstance);
        if (newInstance && rootInstance) {
          // Update the root instance while preserving the ID and links
          updateInstance(rootInstance.id, {
            children: newInstance.children,
            styleSourceIds: newInstance.styleSourceIds,
            props: newInstance.props,
          });
          
          // Apply heading typography defaults for any headings missing font styles
          applyHeadingTypographyToTree(newInstance);
          
          toast({
            title: 'Code applied',
            description: 'HTML changes have been applied to the canvas. Component links preserved.',
          });
        }
      } else if (activeTab === 'css') {
        // Validate CSS - warn but don't block
        const validation = validateCSS(cssCode);
        if (!validation.valid) {
          console.warn('CSS validation warnings:', validation.errors);
        }
        
        // Extract supported (class selectors) and unsupported (element/id/complex) rules
        const { supportedCSS, unsupportedCSS } = extractCSSRules(cssCode);
        
        // Parse and apply class-based CSS to style store
        const result = parseCSSToStyleStore(supportedCSS);
        
        // Store unsupported CSS as raw overrides
        const { setRawCssOverrides } = useStyleStore.getState();
        setRawCssOverrides(unsupportedCSS);
        
        const classDesc = `Updated ${result.classesUpdated} classes, created ${result.classesCreated} new classes, set ${result.propertiesSet} properties.`;
        const rawDesc = unsupportedCSS.trim() ? ` Injected raw CSS for element/complex selectors.` : '';
        toast({
          title: 'CSS applied',
          description: !validation.valid 
            ? `${classDesc}${rawDesc} (Some rules may have been skipped)`
            : `${classDesc}${rawDesc}`,
        });
      }
      
      setIsCodeEdited(false);
      // Clear edited flag for this tab after applying so it can sync again
      setEditedTabs(prev => ({ ...prev, [activeTab]: false }));
    } catch (error) {
      toast({
        title: 'Error applying code',
        description: `Failed to parse ${activeTab.toUpperCase()}. Please check for syntax errors.`,
        variant: 'destructive',
      });
    }
  };

  const getCode = (tab: string) => {
    switch (tab) {
      case 'html': return htmlCode;
      case 'css': return cssCode;
      case 'react': return jsCode;
      case 'astro': return astroCode;
      default: return '';
    }
  };

  const getPreviewWidth = () => {
    switch (previewSize) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      {/* Top Bar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-10">
          <TabsList className="h-10 bg-muted/50">
            <TabsTrigger value="html" className="data-[state=active]:bg-background text-xs">
              HTML
            </TabsTrigger>
            <TabsTrigger value="react" className="data-[state=active]:bg-background text-xs">
              React
            </TabsTrigger>
            <TabsTrigger value="astro" className="data-[state=active]:bg-background text-xs">
              Astro
            </TabsTrigger>
            <TabsTrigger value="css" className="data-[state=active]:bg-background text-xs">
              CSS
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center gap-2">
          {isCodeEdited && (activeTab === 'html' || activeTab === 'css') && (
            <Button
              variant="default"
              size="sm"
              onClick={applyCodeChanges}
              className="gap-2"
            >
              Apply Changes to Canvas
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(getCode(activeTab), activeTab)}
            className="gap-2"
          >
            {copiedTab === activeTab ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-4rem)]">
        {/* File Tree Sidebar / AI Chat */}
        <ResizablePanel defaultSize={12} minSize={8} maxSize={25}>
          <div className="h-full border-r border-border bg-muted/20 flex flex-col">
            <div className="h-10 border-b border-border flex items-center justify-between px-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">
                {showAIChat ? 'AI Chat' : 'Files'}
              </h3>
              <Button
                variant={showAIChat ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setShowAIChat(!showAIChat)}
                className="h-6 w-6 p-0"
                title={showAIChat ? 'Show Files' : 'Show AI Chat'}
              >
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            </div>
            {showAIChat ? (
              <div className="flex-1 overflow-hidden">
                <AIChat />
              </div>
            ) : (
              <FileTree 
                onFileSelect={(path) => {
                  setSelectedFile(path);
                  // Sync tab based on file type
                  if (path === '/styles.css') {
                    setActiveTab('css');
                  } else if (path === '/script.js') {
                    setActiveTab('react');
                  } else if (path.endsWith('.html')) {
                    setActiveTab('html');
                  }
                }}
                selectedFile={selectedFile}
                pages={pages}
                onAddComponent={() => setShowCreateComponentDialog(true)}
                onAddPage={() => {
                  toast({
                    title: 'Add Page',
                    description: 'Use the page navigation at the bottom to add new pages.',
                  });
                }}
                onAddMedia={() => {
                  toast({
                    title: 'Add Media',
                    description: 'Drag and drop media files onto the canvas to add them.',
                  });
                }}
              />
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Code Editor or Media Panel - Center */}
        <ResizablePanel defaultSize={44} minSize={30}>
          {isMediaFile ? (
            <CodeViewMediaPanel selectedPath={selectedFile} />
          ) : (
            <div className="h-full border-r border-border overflow-hidden flex flex-col">
              {/* File path + Export Stats */}
              <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-muted/20">
                <span className="text-xs font-mono text-muted-foreground">{selectedFile}</span>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span title="Top-level sections on canvas">
                    📦 {sectionCount} section{sectionCount !== 1 ? 's' : ''}
                  </span>
                  <span title="HTML character count">
                    HTML: {htmlCode.length.toLocaleString()} chars
                  </span>
                  <span title="CSS character count">
                    CSS: {cssCode.length.toLocaleString()} chars
                  </span>
                </div>
              </div>
              {/* Warning banner for incomplete pages */}
              {sectionCount > 0 && sectionCount < 3 && (
                <div className="px-3 py-1.5 bg-yellow-500/10 border-b border-yellow-500/20 text-xs text-yellow-600 dark:text-yellow-400">
                  ⚠️ Page has only {sectionCount} section{sectionCount !== 1 ? 's' : ''}. Complete pages typically have 5+ sections (Nav, Hero, Features, etc.)
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <LockedCodeEditor 
                  code={getCode(activeTab)} 
                  language={activeTab === 'astro' || activeTab === 'html' ? 'html' : activeTab === 'react' ? 'jsx' : activeTab}
                  onChange={(newCode) => {
                    setIsCodeEdited(true);
                    // Mark this tab as edited so it won't be overwritten
                    setEditedTabs(prev => ({ ...prev, [activeTab]: true }));
                    switch (activeTab) {
                      case 'html': setHtmlCode(newCode); break;
                      case 'css': setCssCode(newCode); break;
                      case 'react': setJsCode(newCode); break;
                      case 'astro': setAstroCode(newCode); break;
                    }
                  }}
                  enforceLocking={activeTab === 'react' || isComponentFile}
                  onLockedEditAttempt={handleLockedEditAttempt}
                  allowUnlock={true}
                  filePath={selectedFile}
                />
              </div>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview - Right Side */}
        <ResizablePanel defaultSize={44} minSize={30}>
          <div className="h-full bg-muted/30 flex flex-col">
            {/* Preview Controls */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/50">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
                {/* Page selector for multi-page preview */}
                {allProjectPages.length > 1 && (
                  <select
                    value={currentPreviewPage}
                    onChange={(e) => setCurrentPreviewPage(e.target.value)}
                    className="h-7 px-2 text-xs bg-muted border border-border rounded text-foreground"
                  >
                    {allProjectPages.map((page) => {
                      const pagePath = `/pages/${page.name.toLowerCase().replace(/\s+/g, '-')}.html`;
                      return (
                        <option key={page.id} value={pagePath}>
                          {page.name}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant={previewSize === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewSize('desktop')}
                  className="h-8 w-8 p-0"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewSize === 'tablet' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewSize('tablet')}
                  className="h-8 w-8 p-0"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewSize === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewSize('mobile')}
                  className="h-8 w-8 p-0"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 overflow-hidden flex justify-center items-start p-4">
              <div 
                className="bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-xl transition-all duration-300 overflow-hidden"
                style={{ 
                  width: getPreviewWidth(),
                  height: '100%',
                }}
              >
                <div className="w-full h-full overflow-auto">
                  {/* Use edited CSS when user has made changes, otherwise use exported CSS */}
                  <PreviewFrame 
                    htmlCode={htmlCode} 
                    cssCode={editedTabs.css ? cssCode : exportCSS()} 
                    jsCode={jsCode}
                    allPages={allProjectPages}
                    currentPage={currentPreviewPage}
                    onNavigate={setCurrentPreviewPage}
                    globalComponents={globalComponents}
                  />
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <ImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImport={handleImport}
        onImportComplete={() => {
          // After import, mark code as edited so user can review and apply changes
          setIsCodeEdited(true);
          setEditedTabs(prev => ({ ...prev, html: true, css: true }));
          // Force regenerate code from canvas
          setHtmlCode(generatePageHTML());
          setCssCode(exportCSS());
        }}
      />
      
      <CreateComponentDialog
        open={showCreateComponentDialog}
        onOpenChange={setShowCreateComponentDialog}
      />
    </div>
  );
};

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (preRef.current) {
      const highlighted = Prism.highlight(
        code,
        Prism.languages[language] || Prism.languages.markup,
        language
      );
      preRef.current.innerHTML = highlighted;
    }
  }, [code, language]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Syntax Highlighted Display */}
      <pre
        ref={preRef}
        className="absolute inset-0 p-4 m-0 pointer-events-none overflow-auto font-mono text-sm leading-6 bg-transparent"
        style={{ 
          tabSize: 2,
          whiteSpace: 'pre',
          wordWrap: 'normal'
        }}
      />
      
      {/* Editable Textarea */}
      <textarea
        ref={textareaRef}
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        spellCheck={false}
        className="absolute inset-0 p-4 m-0 font-mono text-sm leading-6 bg-transparent text-transparent caret-white resize-none focus:outline-none selection:bg-primary/30"
        style={{ 
          tabSize: 2,
          whiteSpace: 'pre',
          wordWrap: 'normal',
          caretColor: 'hsl(var(--foreground))'
        }}
      />
    </div>
  );
};

interface PreviewFrameProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  allPages?: Array<{ id: string; name: string; rootInstance: any }>;
  currentPage?: string;
  onNavigate?: (pagePath: string) => void;
  globalComponents?: { header: any; footer: any };
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ 
  htmlCode, 
  cssCode, 
  jsCode, 
  allPages = [], 
  currentPage,
  onNavigate,
  globalComponents 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for navigation messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'navigate' && onNavigate) {
        const pagePath = event.data.page;
        onNavigate(pagePath);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onNavigate]);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // Extract body content from full HTML
        const bodyMatch = htmlCode.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        let bodyContent = bodyMatch ? bodyMatch[1] : htmlCode;
        
        // Remove external script and link tags (we inject CSS/JS inline)
        bodyContent = bodyContent
          .replace(/<script[^>]*src=[^>]*><\/script>/gi, '')
          .replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, '');
        
        // Build page paths map for navigation script
        const pagePathsMap = allPages.reduce((acc, page) => {
          const path = `/pages/${page.name.toLowerCase().replace(/\s+/g, '-')}.html`;
          acc[path] = page.name;
          return acc;
        }, {} as Record<string, string>);
        
        // Navigation interception script
        const navigationScript = `
          // Intercept all anchor clicks for internal page navigation
          document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
              const url = new URL(link.href, window.location.origin);
              const path = url.pathname;
              const pageNames = ${JSON.stringify(pagePathsMap)};
              
              // Check if it's an internal page link
              if (path.startsWith('/pages/') && path.endsWith('.html')) {
                if (pageNames[path]) {
                  e.preventDefault();
                  window.parent.postMessage({ type: 'navigate', page: path }, '*');
                }
              }
            }
          });
        `;
        
        // Extract used fonts and generate Google Fonts link
        const usedFonts = extractUsedFonts();
        const googleFontsLink = generateGoogleFontsLink(usedFonts);
        
        // Build the complete preview HTML - CSS is injected AFTER base reset so exported styles take precedence
        const previewHTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${googleFontsLink}
    <style>
      ${cssCode}
    </style>
  </head>
  <body>
    ${bodyContent}
    <script>
      try {
        ${navigationScript}
        ${jsCode}
      } catch(e) {
        console.error('Preview script error:', e);
      }
    </script>
  </body>
</html>`;
        
        doc.open();
        doc.write(previewHTML);
        doc.close();
      }
    }
  }, [htmlCode, cssCode, jsCode, allPages]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full min-h-screen border-0 bg-white"
      title="Preview"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};
