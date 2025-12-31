import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { usePageStore } from '../store/usePageStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { exportHTML, exportCSS, exportJS, exportAstro } from '../utils/codeExport';
import { discoverComponents, getComponentCode, flattenComponents } from '../utils/componentCodeExport';
import { parseHTMLToInstance, parseHTMLPreservingLinks } from '../utils/codeImport';
import { Copy, Check, Monitor, Tablet, Smartphone, Upload, Lock } from 'lucide-react';
import { ImportModal } from './ImportModal';
import { FileTree } from './FileTree';
import { toast } from '@/hooks/use-toast';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

interface CodeViewProps {
  onClose: () => void;
  pages: string[];
  pageNames: Record<string, string>;
}

export const CodeView: React.FC<CodeViewProps> = ({ onClose, pages, pageNames }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const { getCurrentPage, getPageCustomCode } = usePageStore();
  const currentPage = getCurrentPage();
  const customCode = currentPage ? getPageCustomCode(currentPage.id) : { header: '', body: '', footer: '' };
  
  const [activeTab, setActiveTab] = useState('html');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showImportModal, setShowImportModal] = useState(false);
  const defaultFile = pages.length > 0 ? `/pages/${pages[0].toLowerCase().replace(/\s+/g, '-')}.html` : '/pages/page-1.html';
  const [selectedFile, setSelectedFile] = useState(defaultFile);
  const [isCodeEdited, setIsCodeEdited] = useState(false);
  
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [astroCode, setAstroCode] = useState('');

  // Discover components from canvas
  const componentEntries = useMemo(() => {
    if (!rootInstance) return [];
    return discoverComponents(rootInstance);
  }, [rootInstance]);

  // Check if selected file is a component file or page file
  const isComponentFile = selectedFile.startsWith('/components/');
  const isPageFile = selectedFile.startsWith('/pages/');
  
  const componentCode = useMemo(() => {
    if (!isComponentFile) return null;
    return getComponentCode(componentEntries, selectedFile);
  }, [isComponentFile, componentEntries, selectedFile]);

  // Get list of component types that should be locked in page view
  const lockedComponentTypes = ['Section', 'Navigation', 'Header', 'Footer', 'Card', 'Accordion', 'Carousel', 'Tabs'];

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
    if (isComponentFile && componentCode) {
      setHtmlCode(componentCode.html);
      setCssCode(componentCode.css);
    } else {
      setHtmlCode(generatePageHTML());
      setCssCode(exportCSS());
    }
    setJsCode(exportJS(rootInstance));
    setAstroCode(exportAstro(rootInstance));
  }, [rootInstance, selectedFile, isComponentFile, componentCode, customCode]);

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
          
          toast({
            title: 'Code applied',
            description: 'HTML changes have been applied to the canvas. Component links preserved.',
          });
        }
      }
      
      setIsCodeEdited(false);
    } catch (error) {
      toast({
        title: 'Error applying code',
        description: 'Failed to parse HTML. Please check for syntax errors.',
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

  // Page files are editable but show component regions as visually locked
  const hasLockedComponents = isPageFile && activeTab === 'html';

  return (
    <div className="fixed inset-0 z-50 bg-background animate-fade-in">
      {/* Top Bar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
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
          
          {hasLockedComponents && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded">
              <Lock className="w-3 h-3" />
              <span>Component sections (greyed) should be edited in /components</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isCodeEdited && activeTab === 'html' && (
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
        {/* File Tree Sidebar */}
        <ResizablePanel defaultSize={12} minSize={8} maxSize={25}>
          <div className="h-full border-r border-border bg-muted/20">
            <div className="h-10 border-b border-border flex items-center px-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase">Files</h3>
            </div>
            <FileTree 
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              pages={pages}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Code Editor - Center */}
        <ResizablePanel defaultSize={44} minSize={30}>
          <div className="h-full border-r border-border overflow-hidden">
            <div className="h-10 border-b border-border flex items-center justify-between px-3 bg-muted/20">
              <span className="text-xs font-mono text-muted-foreground">{selectedFile}</span>
              {hasLockedComponents && (
                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Components locked
                </span>
              )}
            </div>
            <CodeEditor 
              code={getCode(activeTab)} 
              language={activeTab === 'astro' || activeTab === 'html' ? 'html' : activeTab === 'react' ? 'jsx' : activeTab}
              highlightComponentRegions={hasLockedComponents}
              onChange={(newCode) => {
                setIsCodeEdited(true);
                switch (activeTab) {
                  case 'html': setHtmlCode(newCode); break;
                  case 'css': setCssCode(newCode); break;
                  case 'react': setJsCode(newCode); break;
                  case 'astro': setAstroCode(newCode); break;
                }
              }}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview - Right Side */}
        <ResizablePanel defaultSize={44} minSize={30}>
          <div className="h-full bg-muted/30 flex flex-col">
            {/* Preview Controls */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/50">
              <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
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
                  <PreviewFrame htmlCode={htmlCode} cssCode={cssCode} jsCode={jsCode} />
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
      />
    </div>
  );
};

interface CodeEditorProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
  highlightComponentRegions?: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange, highlightComponentRegions = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Find component regions in code (lines between @component markers)
  const componentLineRanges = useMemo(() => {
    if (!highlightComponentRegions) return [];
    
    const lines = code.split('\n');
    const ranges: { start: number; end: number; name: string }[] = [];
    let currentComponent: { start: number; name: string } | null = null;
    
    lines.forEach((line, index) => {
      const startMatch = line.match(/<!-- @component:(.+?) -->/);
      const endMatch = line.match(/<!-- @\/component:(.+?) -->/);
      
      if (startMatch && !currentComponent) {
        currentComponent = { start: index, name: startMatch[1] };
      } else if (endMatch && currentComponent) {
        ranges.push({ start: currentComponent.start, end: index, name: currentComponent.name });
        currentComponent = null;
      }
    });
    
    return ranges;
  }, [code, highlightComponentRegions]);

  useEffect(() => {
    if (preRef.current) {
      let highlighted = Prism.highlight(
        code,
        Prism.languages[language] || Prism.languages.markup,
        language
      );
      
      // Add visual markers to component regions
      if (highlightComponentRegions && componentLineRanges.length > 0) {
        const lines = highlighted.split('\n');
        const modifiedLines = lines.map((line, index) => {
          const isInComponent = componentLineRanges.some(r => index >= r.start && index <= r.end);
          if (isInComponent) {
            return `<span class="component-region">${line}</span>`;
          }
          return line;
        });
        highlighted = modifiedLines.join('\n');
      }
      
      preRef.current.innerHTML = highlighted;
    }
  }, [code, language, highlightComponentRegions, componentLineRanges]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
    if (overlayRef.current) {
      overlayRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Component region overlay backgrounds */}
      {highlightComponentRegions && componentLineRanges.length > 0 && (
        <div 
          ref={overlayRef}
          className="absolute inset-0 p-4 pointer-events-none overflow-hidden"
          style={{ tabSize: 2 }}
        >
          {componentLineRanges.map((range, idx) => (
            <div
              key={idx}
              className="absolute left-0 right-0 bg-amber-500/10 border-l-2 border-amber-500/50"
              style={{
                top: `calc(1rem + ${range.start * 1.5}rem)`,
                height: `calc(${(range.end - range.start + 1) * 1.5}rem)`,
              }}
            >
              <span className="absolute right-2 top-0 text-[9px] text-amber-500/70 font-mono">
                {range.name} (edit in /components)
              </span>
            </div>
          ))}
        </div>
      )}
      
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
      
      {/* Component regions indicator */}
      {highlightComponentRegions && componentLineRanges.length > 0 && (
        <div className="absolute top-2 right-2 bg-amber-500/20 text-amber-500 text-[10px] px-2 py-1 rounded flex items-center gap-1">
          <Lock className="w-3 h-3" />
          {componentLineRanges.length} component{componentLineRanges.length !== 1 ? 's' : ''} locked
        </div>
      )}
    </div>
  );
};

interface PreviewFrameProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
}

const PreviewFrame: React.FC<PreviewFrameProps> = ({ htmlCode, cssCode, jsCode }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        // Extract body content from full HTML
        const bodyMatch = htmlCode.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : htmlCode;
        
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>${cssCode}</style>
            </head>
            <body>
              ${bodyContent}
              <script>${jsCode}</script>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [htmlCode, cssCode, jsCode]);

  return (
    <iframe
      ref={iframeRef}
      className="w-full h-full min-h-screen border-0"
      title="Preview"
      sandbox="allow-scripts"
    />
  );
};
