import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportHTML, exportCSS, exportJS, exportAstro } from '../utils/codeExport';
import { Copy, Check, Monitor, Tablet, Smartphone, X } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

interface CodeViewProps {
  onClose: () => void;
}

export const CodeView: React.FC<CodeViewProps> = ({ onClose }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const [activeTab, setActiveTab] = useState('html');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
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

  const getCode = (tab: string) => {
    switch (tab) {
      case 'html': return htmlCode;
      case 'css': return cssCode;
      case 'js': return jsCode;
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
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-10">
            <TabsList className="h-10 bg-muted/50">
              <TabsTrigger value="html" className="data-[state=active]:bg-background">
                HTML
              </TabsTrigger>
              <TabsTrigger value="css" className="data-[state=active]:bg-background">
                CSS
              </TabsTrigger>
              <TabsTrigger value="js" className="data-[state=active]:bg-background">
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="astro" className="data-[state=active]:bg-background">
                Astro
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
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
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Code Editor - Left Side */}
        <div className="flex-1 border-r border-border overflow-hidden">
          <CodeEditor 
            code={getCode(activeTab)} 
            language={activeTab === 'astro' ? 'html' : activeTab}
            onChange={(newCode) => {
              switch (activeTab) {
                case 'html': setHtmlCode(newCode); break;
                case 'css': setCssCode(newCode); break;
                case 'js': setJsCode(newCode); break;
                case 'astro': setAstroCode(newCode); break;
              }
            }}
          />
        </div>

        {/* Preview - Right Side */}
        <div className="w-1/2 bg-muted/30 flex flex-col">
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
          <div className="flex-1 overflow-auto p-8 flex justify-center">
            <div 
              className="bg-background border border-border rounded-lg shadow-xl transition-all duration-300 h-fit"
              style={{ 
                width: getPreviewWidth(),
                minHeight: '100%'
              }}
            >
              <PreviewFrame htmlCode={htmlCode} cssCode={cssCode} jsCode={jsCode} />
            </div>
          </div>
        </div>
      </div>
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
