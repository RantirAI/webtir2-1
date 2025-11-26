import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { usePageStore } from '../store/usePageStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { exportHTML, exportCSS, exportJS, exportAstro } from '../utils/codeExport';
import { parseHTMLToInstance } from '../utils/codeImport';
import { Copy, Check, Monitor, Tablet, Smartphone, Upload, FileImage } from 'lucide-react';
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
  const allPagesData = usePageStore((state) => state.getAllPages());
  const [activeTab, setActiveTab] = useState('html');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showImportModal, setShowImportModal] = useState(false);
  const defaultFile = pages.length > 0 ? `/pages/${pages[0].toLowerCase().replace(/\s+/g, '-')}.html` : '/pages/page-1.html';
  const [selectedFile, setSelectedFile] = useState(defaultFile);
  const [isCodeEdited, setIsCodeEdited] = useState(false);
  
  const [pageHtmlCodes, setPageHtmlCodes] = useState<Record<string, string>>({});
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [astroCode, setAstroCode] = useState('');

  useEffect(() => {
    // Generate code for all pages
    const pageCodes: Record<string, string> = {};
    pages.forEach((pageId) => {
      const pageData = allPagesData.find(p => p.id === pageId);
      if (pageData) {
        const fileName = `${pageData.name.toLowerCase().replace(/\s+/g, '-')}.html`;
        pageCodes[`/pages/${fileName}`] = exportHTML(pageData.rootInstance, pageData.name);
      }
    });
    setPageHtmlCodes(pageCodes);
    
    // Generate global files
    setCssCode(exportCSS());
    setJsCode(exportJS(rootInstance));
    setAstroCode(exportAstro(rootInstance));
  }, [rootInstance, pages, allPagesData]);

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
      if (selectedFile.startsWith('/pages/') && selectedFile.endsWith('.html')) {
        const newInstance = parseHTMLToInstance(pageHtmlCodes[selectedFile] || '');
        if (newInstance && rootInstance) {
          // Update the root instance while preserving the ID
          updateInstance(rootInstance.id, {
            children: newInstance.children,
            styleSourceIds: newInstance.styleSourceIds,
          });
          
          toast({
            title: 'Code applied',
            description: 'HTML changes have been applied to the canvas',
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

  const getCurrentFileCode = () => {
    // If it's a page HTML file, return the specific page code
    if (selectedFile.startsWith('/pages/') && selectedFile.endsWith('.html')) {
      return pageHtmlCodes[selectedFile] || '';
    }
    
    // Global files
    if (selectedFile === '/styles.css') return cssCode;
    if (selectedFile === '/script.js') return jsCode;
    
    // Media files - show as link
    if (selectedFile.startsWith('/media/')) {
      const fileName = selectedFile.split('/').pop();
      return `/* Media file: ${fileName} */\n// This file is displayed in the preview panel`;
    }
    
    return '';
  };

  const getFileLanguage = () => {
    if (selectedFile.endsWith('.html')) return 'html';
    if (selectedFile.endsWith('.css')) return 'css';
    if (selectedFile.endsWith('.js')) return 'javascript';
    return 'javascript';
  };

  const getCode = (tab: string) => {
    switch (tab) {
      case 'html': return pageHtmlCodes[selectedFile] || Object.values(pageHtmlCodes)[0] || '';
      case 'css': return cssCode;
      case 'react': return jsCode;
      case 'astro': return astroCode;
      default: return '';
    }
  };

  const shouldShowHtmlPreview = () => {
    return selectedFile.endsWith('.html');
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
        <div className="flex items-center gap-4">
          {/* Only show export tabs when no specific file is selected, or when we want to export */}
          <div className="text-sm font-medium">
            Code Editor
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isCodeEdited && selectedFile.endsWith('.html') && (
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
            onClick={() => handleCopy(getCurrentFileCode(), selectedFile)}
            className="gap-2"
          >
            {copiedTab === selectedFile ? (
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
            <div className="h-10 border-b border-border flex items-center px-3 bg-muted/20">
              <span className="text-xs font-mono text-muted-foreground">{selectedFile}</span>
            </div>
            <CodeEditor 
              code={getCurrentFileCode()} 
              language={getFileLanguage()}
              onChange={(newCode) => {
                setIsCodeEdited(true);
                if (selectedFile.startsWith('/pages/') && selectedFile.endsWith('.html')) {
                  setPageHtmlCodes(prev => ({ ...prev, [selectedFile]: newCode }));
                } else if (selectedFile === '/styles.css') {
                  setCssCode(newCode);
                } else if (selectedFile === '/script.js') {
                  setJsCode(newCode);
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
              {shouldShowHtmlPreview() ? (
                <div 
                  className="bg-white dark:bg-zinc-900 border border-border rounded-lg shadow-xl transition-all duration-300 overflow-hidden"
                  style={{ 
                    width: getPreviewWidth(),
                    height: '100%',
                  }}
                >
                  <div className="w-full h-full overflow-auto">
                    <PreviewFrame htmlCode={getCurrentFileCode()} cssCode={cssCode} jsCode={jsCode} />
                  </div>
                </div>
              ) : selectedFile.startsWith('/media/') ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center p-8 border border-dashed border-border rounded-lg">
                    <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Media file preview</p>
                    <p className="text-xs text-muted-foreground mt-2">{selectedFile.split('/').pop()}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center p-8">
                    <p className="text-sm text-muted-foreground">No preview available</p>
                    <p className="text-xs text-muted-foreground mt-2">CSS and JS files cannot be previewed</p>
                  </div>
                </div>
              )}
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
