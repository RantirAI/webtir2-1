import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { exportHTML, exportCSS, exportJS, exportAstro } from '../utils/codeExport';
import { parseHTMLToInstance } from '../utils/codeImport';
import { useMediaStore } from '../store/useMediaStore';
import { Copy, Check, Monitor, Tablet, Smartphone, Upload, Image as ImageIcon, FileVideo, FileAudio, FileCode } from 'lucide-react';
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
  const { assets, getAllAssets, getAssetsByType } = useMediaStore();
  const [activeTab, setActiveTab] = useState('html');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showImportModal, setShowImportModal] = useState(false);
  const defaultFile = pages.length > 0 ? `/pages/${pages[0].toLowerCase().replace(/\s+/g, '-')}.html` : '/pages/page-1.html';
  const [selectedFile, setSelectedFile] = useState(defaultFile);
  const hasMedia = getAllAssets().length > 0;
  const [isCodeEdited, setIsCodeEdited] = useState(false);
  
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [astroCode, setAstroCode] = useState('');

  useEffect(() => {
    // Generate code exports
    setHtmlCode(exportHTML(rootInstance));
    setCssCode(exportCSS());
    setJsCode(exportJS(rootInstance));
    setAstroCode(exportAstro(rootInstance));
  }, [rootInstance]);

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
        const newInstance = parseHTMLToInstance(htmlCode);
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

  const getCode = (tab: string) => {
    switch (tab) {
      case 'html': return htmlCode;
      case 'css': return cssCode;
      case 'react': return jsCode;
      case 'astro': return astroCode;
      case 'media': return generateMediaList();
      case 'design': return '/* Design system tokens and variables */\n' + cssCode;
      case 'ai': return '// AI Chat interface coming soon';
      default: return '';
    }
  };
  
  const generateMediaList = () => {
    const allAssets = getAllAssets();
    if (allAssets.length === 0) {
      return '// No media assets added yet\n// Upload images, videos, or Lottie files to see them here';
    }
    
    const assetsByType = {
      image: getAssetsByType('image'),
      video: getAssetsByType('video'),
      lottie: getAssetsByType('lottie'),
      audio: getAssetsByType('audio'),
      other: getAssetsByType('other'),
    };
    
    let output = '// Media Assets\n\n';
    
    Object.entries(assetsByType).forEach(([type, items]) => {
      if (items.length > 0) {
        output += `// ${type.toUpperCase()} (${items.length})\n`;
        items.forEach(asset => {
          output += `// ${asset.name} - ${asset.url}\n`;
        });
        output += '\n';
      }
    });
    
    return output;
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
              <TabsTrigger value="media" className="data-[state=active]:bg-background text-xs">
                Media
              </TabsTrigger>
              <TabsTrigger value="design" className="data-[state=active]:bg-background text-xs">
                Design System
              </TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-background text-xs">
                AI Chat
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
              hasMedia={hasMedia}
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
              code={getCode(activeTab)} 
              language={activeTab === 'astro' || activeTab === 'html' ? 'html' : activeTab === 'react' ? 'jsx' : activeTab}
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
