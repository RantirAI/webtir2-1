import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Globe, Github, FileCode, Package, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (source: string, content: string | File) => void;
}

const importSources = [
  { id: 'webflow', label: 'Webflow', icon: Globe },
  { id: 'figma', label: 'Figma', icon: FileCode },
  { id: 'framer', label: 'Framer', icon: Package },
  { id: 'github', label: 'GitHub', icon: Github },
  { id: 'wordpress', label: 'WordPress', icon: Globe },
  { id: 'shopify', label: 'Shopify', icon: ShoppingBag },
  { id: 'zip', label: 'ZIP File', icon: Upload },
  { id: 'code', label: 'HTML/CSS/JS', icon: FileCode },
];

export const ImportModal: React.FC<ImportModalProps> = ({ open, onOpenChange, onImport }) => {
  const [activeSource, setActiveSource] = useState('code');
  const [pastedCode, setPastedCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (activeSource === 'zip' && selectedFile) {
      onImport(activeSource, selectedFile);
      toast({
        title: 'Import Started',
        description: 'Processing your file...',
      });
    } else if (pastedCode.trim()) {
      onImport(activeSource, pastedCode);
      toast({
        title: 'Import Started',
        description: 'Processing your code...',
      });
    } else {
      toast({
        title: 'No Content',
        description: 'Please provide code or select a file to import.',
        variant: 'destructive',
      });
      return;
    }
    
    // Reset and close
    setPastedCode('');
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Code</DialogTitle>
          <DialogDescription>
            Import your design or code from various sources
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Source</Label>
            <div className="grid grid-cols-4 gap-2">
              {importSources.map((source) => {
                const Icon = source.icon;
                return (
                  <Button
                    key={source.id}
                    variant={activeSource === source.id ? 'default' : 'outline'}
                    className="flex flex-col h-20 gap-2"
                    onClick={() => setActiveSource(source.id)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{source.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Import Content */}
          <Tabs value={activeSource === 'zip' ? 'file' : 'paste'} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="paste">Paste Code</TabsTrigger>
              <TabsTrigger value="file">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="paste" className="space-y-4">
              <div>
                <Label htmlFor="code-input">Paste your HTML, CSS, or JavaScript</Label>
                <Textarea
                  id="code-input"
                  placeholder="Paste your code here..."
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  className="min-h-[300px] font-mono text-sm mt-2"
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-sm font-medium mb-2">
                    {selectedFile ? selectedFile.name : 'Choose a ZIP file or HTML file'}
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Supported: .zip, .html, .css, .js
                  </div>
                  <Button variant="outline" size="sm" type="button">
                    Browse Files
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".zip,.html,.css,.js"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Source-specific instructions */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {activeSource === 'webflow' && '📝 Export your Webflow site code and paste the HTML here, or upload as a ZIP file.'}
              {activeSource === 'figma' && '📝 Use a Figma-to-code plugin to export your design, then paste or upload the generated code.'}
              {activeSource === 'framer' && '📝 Export your Framer project code and paste it here, or upload as files.'}
              {activeSource === 'github' && '📝 Copy the raw HTML/CSS/JS from your GitHub repository and paste it here.'}
              {activeSource === 'wordpress' && '📝 Copy your WordPress theme code or page source and paste it here.'}
              {activeSource === 'shopify' && '📝 Export your Shopify theme code and paste or upload it.'}
              {activeSource === 'zip' && '📝 Upload a ZIP file containing your HTML, CSS, and JavaScript files.'}
              {activeSource === 'code' && '📝 Paste any HTML, CSS, or JavaScript code directly.'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
