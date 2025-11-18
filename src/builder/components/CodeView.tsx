import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportHTML, exportCSS, exportJS, exportAstro } from '../utils/codeExport';
import { Copy, Check, Monitor, Tablet, Smartphone } from 'lucide-react';
import { Canvas } from './Canvas';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';

interface CodeViewProps {
  onClose: () => void;
  currentBreakpoint: string;
}

export const CodeView: React.FC<CodeViewProps> = ({ onClose, currentBreakpoint }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const [activeTab, setActiveTab] = useState('html');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>(
    currentBreakpoint === 'mobile' ? 'mobile' : currentBreakpoint === 'tablet' ? 'tablet' : 'desktop'
  );
  
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
    <div className="fixed inset-0 z-40 bg-background animate-fade-in pt-16">
      {/* Top Bar */}
      <div className="h-12 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-9">
            <TabsList className="h-9 bg-muted/50 p-1">
              <TabsTrigger value="html" className="text-xs px-3 py-1 data-[state=active]:bg-background">
                HTML
              </TabsTrigger>
              <TabsTrigger value="css" className="text-xs px-3 py-1 data-[state=active]:bg-background">
                CSS
              </TabsTrigger>
              <TabsTrigger value="js" className="text-xs px-3 py-1 data-[state=active]:bg-background">
                JS
              </TabsTrigger>
              <TabsTrigger value="astro" className="text-xs px-3 py-1 data-[state=active]:bg-background">
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
            className="gap-2 h-8"
          >
            {copiedTab === activeTab ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span className="text-xs">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-xs">Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-7rem)]">
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
          <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-background/50">
            <h3 className="text-xs font-medium text-muted-foreground">Preview</h3>
            <div className="flex gap-1">
              <Button
                variant={previewSize === 'desktop' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPreviewSize('desktop')}
                className="h-7 w-7 p-0"
              >
                <Monitor className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={previewSize === 'tablet' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPreviewSize('tablet')}
                className="h-7 w-7 p-0"
              >
                <Tablet className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={previewSize === 'mobile' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPreviewSize('mobile')}
                className="h-7 w-7 p-0"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Canvas Preview */}
          <div className="flex-1 overflow-hidden bg-background">
            <div 
              className="h-full transition-all duration-300"
              style={{ 
                width: getPreviewWidth(),
                margin: '0 auto'
              }}
            >
              <div className="h-full [&_.builder-canvas]:bg-background [&_.builder-canvas]:dark:bg-background">
                <Canvas 
                  isPreviewMode={true}
                  currentBreakpoint={previewSize}
                  zoom={100}
                  isPanMode={false}
                  pages={['preview-page']}
                  currentPage="preview-page"
                  pageNames={{ 'preview-page': 'Preview' }}
                  onPageNameChange={() => {}}
                />
              </div>
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

