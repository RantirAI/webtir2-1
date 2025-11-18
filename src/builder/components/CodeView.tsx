import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { exportHTML, exportCSS, exportJS, exportAstro } from '../utils/codeExport';
import { Copy, Check } from 'lucide-react';

interface CodeViewProps {
  onClose: () => void;
}

export const CodeView: React.FC<CodeViewProps> = ({ onClose }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const [activeTab, setActiveTab] = useState('html');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  
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

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Code View</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-muted/50 p-0">
          <TabsTrigger value="html" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            HTML
          </TabsTrigger>
          <TabsTrigger value="css" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            CSS
          </TabsTrigger>
          <TabsTrigger value="js" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            JavaScript
          </TabsTrigger>
          <TabsTrigger value="astro" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            Astro
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 relative overflow-hidden">
          <TabsContent value="html" className="h-full m-0">
            <CodeEditor code={htmlCode} language="html" onCopy={() => handleCopy(htmlCode, 'html')} copied={copiedTab === 'html'} />
          </TabsContent>
          <TabsContent value="css" className="h-full m-0">
            <CodeEditor code={cssCode} language="css" onCopy={() => handleCopy(cssCode, 'css')} copied={copiedTab === 'css'} />
          </TabsContent>
          <TabsContent value="js" className="h-full m-0">
            <CodeEditor code={jsCode} language="javascript" onCopy={() => handleCopy(jsCode, 'js')} copied={copiedTab === 'js'} />
          </TabsContent>
          <TabsContent value="astro" className="h-full m-0">
            <CodeEditor code={astroCode} language="astro" onCopy={() => handleCopy(astroCode, 'astro')} copied={copiedTab === 'astro'} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

interface CodeEditorProps {
  code: string;
  language: string;
  onCopy: () => void;
  copied: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onCopy, copied }) => {
  return (
    <div className="h-full relative">
      <Button
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm"
        onClick={onCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <pre className="h-full overflow-auto p-4 text-sm font-mono bg-muted/30">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};
