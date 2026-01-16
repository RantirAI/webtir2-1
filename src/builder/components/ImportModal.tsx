import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { detectPastedSource, parseWebflowData, getSourceLabel, ClipboardSource } from '../utils/clipboardInspector';
import { translateWebflowToWebtir, getWebflowDataSummary } from '../utils/webflowTranslator';
import { useBuilderStore } from '../store/useBuilderStore';

// Import platform icons
import webflowIcon from '@/assets/webflow-icon.png';
import figmaIcon from '@/assets/figma-icon.jpg';
import framerIcon from '@/assets/framer-icon.png';
import wordpressIcon from '@/assets/wordpress-icon.png';
import shopifyIcon from '@/assets/shopify-icon.png';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (source: string, content: string | File) => void;
}

// Platform sources with icons (Design Tools & CMS)
const platformSources = [
  { id: 'webflow', label: 'Webflow', icon: webflowIcon },
  { id: 'figma', label: 'Figma', icon: figmaIcon },
  { id: 'framer', label: 'Framer', icon: framerIcon },
  { id: 'wordpress', label: 'WordPress', icon: wordpressIcon },
  { id: 'shopify', label: 'Shopify', icon: shopifyIcon },
];

// Platforms that support paste (have structured JSON format)
const pasteSupportedPlatforms = ['webflow', 'figma', 'framer'];

export const ImportModal: React.FC<ImportModalProps> = ({ open, onOpenChange, onImport }) => {
  const [activePlatform, setActivePlatform] = useState('webflow');
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [pastedCode, setPastedCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedSource, setDetectedSource] = useState<ClipboardSource | null>(null);
  const [convertPreview, setConvertPreview] = useState<{ nodes: number; styles: number } | null>(null);
  const { toast } = useToast();
  const { addInstance, rootInstance } = useBuilderStore();

  // Check if current platform supports paste
  const supportsPaste = pasteSupportedPlatforms.includes(activePlatform);

  // Handle paste detection
  const handlePasteChange = useCallback((text: string) => {
    setPastedCode(text);
    
    if (!text.trim()) {
      setDetectedSource(null);
      setConvertPreview(null);
      return;
    }

    // Detect source
    const source = detectPastedSource(text);
    setDetectedSource(source);

    // If Webflow, show preview
    if (source === 'webflow') {
      const wfData = parseWebflowData(text);
      if (wfData) {
        const summary = getWebflowDataSummary(wfData);
        setConvertPreview({ nodes: summary.nodeCount, styles: summary.styleCount });
      }
    } else {
      setConvertPreview(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConvert = () => {
    if (!pastedCode.trim()) {
      toast({
        title: 'No Content',
        description: 'Please paste code to convert.',
        variant: 'destructive',
      });
      return;
    }

    // Handle Webflow conversion
    if (detectedSource === 'webflow' || activePlatform === 'webflow') {
      const wfData = parseWebflowData(pastedCode);
      if (wfData) {
        const instance = translateWebflowToWebtir(wfData);
        if (instance) {
          addInstance(instance, rootInstance.id);
          toast({
            title: 'Webflow Import Success',
            description: `Imported ${convertPreview?.nodes || 0} components with ${convertPreview?.styles || 0} styles.`,
          });
          resetAndClose();
          return;
        }
      }
      toast({
        title: 'Conversion Failed',
        description: 'Could not parse Webflow data. Make sure you copied from Webflow correctly.',
        variant: 'destructive',
      });
      return;
    }

    // Figma and Framer - future implementation
    if (detectedSource === 'figma' || activePlatform === 'figma') {
      toast({
        title: 'Figma Import',
        description: 'Figma import coming soon. For now, use a Figma-to-code plugin and paste the HTML.',
      });
      return;
    }

    if (detectedSource === 'framer' || activePlatform === 'framer') {
      toast({
        title: 'Framer Import',
        description: 'Framer import coming soon. For now, export as code and paste the HTML.',
      });
      return;
    }

    // Fallback - pass to legacy handler
    onImport(activePlatform, pastedCode);
    resetAndClose();
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a ZIP file to upload.',
        variant: 'destructive',
      });
      return;
    }

    onImport(activePlatform, selectedFile);
    toast({
      title: 'Import Started',
      description: `Processing ${activePlatform} package...`,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setPastedCode('');
    setSelectedFile(null);
    setDetectedSource(null);
    setConvertPreview(null);
    onOpenChange(false);
  };

  // Get button label based on platform and detected source
  const getConvertButtonLabel = () => {
    if (detectedSource && detectedSource !== 'unknown' && detectedSource !== 'text') {
      return `Convert ${getSourceLabel(detectedSource)}`;
    }
    const platform = platformSources.find(p => p.id === activePlatform);
    return `Convert ${platform?.label || 'Code'}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base">Import Code</DialogTitle>
          <DialogDescription className="text-xs">
            Import designs from Webflow, Figma, Framer, or upload a package
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Platform Selection */}
          <div>
            <Label className="text-xs font-medium mb-2 block">Select Platform</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {platformSources.map((platform) => (
                <Button
                  key={platform.id}
                  variant={activePlatform === platform.id ? 'default' : 'outline'}
                  className="flex flex-col h-16 gap-1.5 text-xs px-2 py-2"
                  onClick={() => {
                    setActivePlatform(platform.id);
                    // Reset state on platform change
                    setDetectedSource(null);
                    setConvertPreview(null);
                  }}
                >
                  <img 
                    src={platform.icon} 
                    alt={platform.label}
                    className="w-5 h-5 object-contain rounded-sm"
                  />
                  <span className="text-[10px] leading-tight">{platform.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Import Method Tabs */}
          <Tabs 
            value={supportsPaste ? activeTab : 'upload'} 
            onValueChange={(v) => setActiveTab(v as 'paste' | 'upload')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger 
                value="paste" 
                className="text-xs py-1"
                disabled={!supportsPaste}
              >
                Paste Code
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs py-1">
                Upload ZIP
              </TabsTrigger>
            </TabsList>

            {/* Paste Code Tab */}
            <TabsContent value="paste" className="space-y-3 mt-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="code-input" className="text-xs">
                    Paste your {platformSources.find(p => p.id === activePlatform)?.label} code
                  </Label>
                  {detectedSource && detectedSource !== 'unknown' && detectedSource !== 'text' && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      {getSourceLabel(detectedSource)} Detected
                    </Badge>
                  )}
                </div>
                <Textarea
                  id="code-input"
                  placeholder={`Copy elements from ${platformSources.find(p => p.id === activePlatform)?.label} and paste here...`}
                  value={pastedCode}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  className="min-h-[180px] font-mono text-xs p-2"
                />
              </div>

              {/* Conversion Preview */}
              {convertPreview && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    ✓ Ready to import: <strong>{convertPreview.nodes}</strong> components with <strong>{convertPreview.styles}</strong> styles
                  </p>
                </div>
              )}

              {/* Platform Instructions */}
              <div className="bg-muted/50 p-2.5 rounded-lg">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activePlatform === 'webflow' && '📝 In Webflow, select elements and use Cmd/Ctrl+C to copy. Paste the JSON data here.'}
                  {activePlatform === 'figma' && '📝 In Figma, select frames and copy. Alternatively, use a Figma-to-code plugin.'}
                  {activePlatform === 'framer' && '📝 In Framer, copy components or use export to get the code.'}
                </p>
              </div>

              {/* Convert Button */}
              <div className="flex justify-end gap-1.5 pt-1">
                <Button variant="outline" onClick={resetAndClose} className="h-8 text-xs px-3">
                  Cancel
                </Button>
                <Button 
                  onClick={handleConvert} 
                  className="h-8 text-xs px-3"
                  disabled={!pastedCode.trim()}
                >
                  {getConvertButtonLabel()}
                </Button>
              </div>
            </TabsContent>

            {/* Upload ZIP Tab */}
            <TabsContent value="upload" className="space-y-3 mt-3">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-xs font-medium mb-1">
                    {selectedFile ? selectedFile.name : `Upload ${platformSources.find(p => p.id === activePlatform)?.label} Package`}
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-3">
                    Supported: .zip files containing HTML, CSS, and JS
                  </div>
                  <Button variant="outline" size="sm" type="button" className="h-7 text-xs px-3">
                    Browse Files
                  </Button>
                </Label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Selected File Info */}
              {selectedFile && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{selectedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {platformSources.find(p => p.id === activePlatform)?.label} Package
                  </Badge>
                </div>
              )}

              {/* Platform Instructions */}
              <div className="bg-muted/50 p-2.5 rounded-lg">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activePlatform === 'webflow' && '📦 Export your Webflow site as a ZIP file and upload it here.'}
                  {activePlatform === 'figma' && '📦 Use a Figma plugin to export your design as HTML/CSS and upload the ZIP.'}
                  {activePlatform === 'framer' && '📦 Export your Framer project as code and upload the ZIP.'}
                  {activePlatform === 'wordpress' && '📦 Export your WordPress theme or page as a ZIP file.'}
                  {activePlatform === 'shopify' && '📦 Export your Shopify theme files as a ZIP.'}
                </p>
              </div>

              {/* Upload Button */}
              <div className="flex justify-end gap-1.5 pt-1">
                <Button variant="outline" onClick={resetAndClose} className="h-8 text-xs px-3">
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpload} 
                  className="h-8 text-xs px-3"
                  disabled={!selectedFile}
                >
                  Import and Convert
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
