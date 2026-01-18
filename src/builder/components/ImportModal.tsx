import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle2, Package, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { detectPastedSource, parseWebflowData, getSourceLabel, ClipboardSource, inspectClipboard, parseFigmaData } from '../utils/clipboardInspector';
import { translateWebflowToWebtir, getWebflowDataSummary } from '../utils/webflowTranslator';
import { translateFigmaToWebtir, getFigmaDataSummary, isFigmaData } from '../utils/figmaTranslator';
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
  onImportComplete?: () => void; // Called after successful import to signal CodeView
}

// Design Tools - support paste + ZIP upload
const designToolSources = [
  { id: 'webflow', label: 'Webflow', icon: webflowIcon },
  { id: 'figma', label: 'Figma', icon: figmaIcon },
  { id: 'framer', label: 'Framer', icon: framerIcon },
];

// CMS/Package sources - ZIP upload only
const packageSources = [
  { id: 'wordpress', label: 'WordPress', icon: wordpressIcon },
  { id: 'shopify', label: 'Shopify', icon: shopifyIcon },
  { id: 'zip', label: 'ZIP File', icon: null },
];

// All platforms combined
const allPlatforms = [...designToolSources, ...packageSources];

export const ImportModal: React.FC<ImportModalProps> = ({ open, onOpenChange, onImport, onImportComplete }) => {
  const [activePlatform, setActivePlatform] = useState('webflow');
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [pastedCode, setPastedCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [detectedSource, setDetectedSource] = useState<ClipboardSource | null>(null);
  const [convertPreview, setConvertPreview] = useState<{ nodes: number; styles: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { addInstance, rootInstance } = useBuilderStore();

  // Check if current platform supports paste (only design tools)
  const isDesignTool = designToolSources.some(p => p.id === activePlatform);
  const supportsPaste = isDesignTool;

  // Handle paste detection
  const handlePasteChange = useCallback((text: string, forcedSource?: ClipboardSource) => {
    setPastedCode(text);

    if (!text.trim()) {
      setDetectedSource(null);
      setConvertPreview(null);
      return;
    }

    // Detect source (or force it if we detected via ClipboardEvent MIME types)
    const source = forcedSource ?? detectPastedSource(text);
    setDetectedSource(source);

    // If Webflow, show preview
    if (source === 'webflow') {
      const wfData = parseWebflowData(text);
      if (wfData) {
        const summary = getWebflowDataSummary(wfData);
        setConvertPreview({ nodes: summary.nodeCount, styles: summary.styleCount });
      }
    } else if (source === 'figma') {
      // Try to parse Figma data for preview (handles both HTML figmeta and raw JSON)
      const figmaData = parseFigmaData(text);
      if (figmaData && isFigmaData(figmaData)) {
        const summary = getFigmaDataSummary(figmaData);
        setConvertPreview({ nodes: summary.nodeCount, styles: summary.textCount });
      } else {
        setConvertPreview(null);
      }
    } else {
      setConvertPreview(null);
    }
  }, []);

  // IMPORTANT: Design tools often put data on custom clipboard MIME types.
  // React's onChange only sees what the browser decides to paste as text/plain.
  // So we also read the raw ClipboardEvent here.
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const payload = inspectClipboard(e.nativeEvent);

    if (payload.source !== 'webflow' && payload.source !== 'figma' && payload.source !== 'framer') {
      return; // let the browser paste normally
    }

    e.preventDefault();

    let text = payload.rawText;
    if (!text) {
      if (typeof payload.data === 'string') text = payload.data;
      else {
        try {
          text = JSON.stringify(payload.data, null, 2);
        } catch {
          text = '';
        }
      }
    }

    if (!text) return;

    // If user pasted a different design tool than the currently selected one, sync the UI.
    setActivePlatform(payload.source);
    setActiveTab('paste');

    handlePasteChange(text, payload.source);
  }, [handlePasteChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleConvert = async () => {
    if (!pastedCode.trim()) {
      toast({
        title: 'No Content',
        description: 'Please paste code to convert.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    
    // Yield to UI to show loading state
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
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
            // Signal CodeView that import completed so it can refresh
            onImportComplete?.();
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

      // Handle Figma conversion
      if (detectedSource === 'figma' || activePlatform === 'figma') {
        // Parse Figma data (handles both HTML figmeta format and raw JSON)
        const figmaData = parseFigmaData(pastedCode);
        
        // Check if we got actual node data vs just metadata
        if (figmaData) {
          // Check if this is the new format { meta, hasNodeData } from HTML extraction
          if (figmaData.meta && typeof figmaData.hasNodeData === 'boolean') {
            const fileKey = figmaData.meta.fileKey;
            const fileUrl = fileKey ? `https://www.figma.com/file/${fileKey}` : null;
            
            toast({
              title: 'Figma Uses Proprietary Format',
              description: `Figma's clipboard uses a binary format that can't be parsed directly.${fileKey ? ` File: ${fileKey}` : ''} Use a Figma-to-code plugin or the Figma REST API.`,
              variant: 'destructive',
            });
            return;
          }
          
          // Check if this is just figmeta metadata (fileKey, pasteID) without actual nodes
          if (figmaData.fileKey && figmaData.pasteID && !figmaData.nodes && !figmaData.type) {
            toast({
              title: 'Figma Metadata Only',
              description: `Detected Figma file: ${figmaData.fileKey}. Use a Figma-to-code plugin or export as JSON from Dev Mode.`,
              variant: 'destructive',
            });
            return;
          }
          
          if (isFigmaData(figmaData)) {
            const instance = translateFigmaToWebtir(figmaData);
            if (instance) {
              addInstance(instance, rootInstance.id);
              toast({
                title: 'Figma Import Success',
                description: `Imported ${convertPreview?.nodes || 0} components with ${convertPreview?.styles || 0} text elements.`,
              });
              onImportComplete?.();
              resetAndClose();
              return;
            }
          }
        }
        
        toast({
          title: 'Conversion Failed',
          description: 'Could not parse Figma data. Use a Figma-to-code plugin or export JSON from Dev Mode.',
          variant: 'destructive',
        });
        return;
      }

      // Framer - future implementation
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
    } finally {
      setIsImporting(false);
    }
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
      description: `Processing ${getPlatformLabel()} package...`,
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

  const getPlatformLabel = () => {
    const platform = allPlatforms.find(p => p.id === activePlatform);
    return platform?.label || 'Code';
  };

  // Get button label based on platform and detected source
  const getConvertButtonLabel = () => {
    if (detectedSource && detectedSource !== 'unknown' && detectedSource !== 'text') {
      return `Convert ${getSourceLabel(detectedSource)}`;
    }
    return `Convert ${getPlatformLabel()}`;
  };

  // Auto-switch to upload tab when selecting non-design tool
  const handlePlatformSelect = (platformId: string) => {
    setActivePlatform(platformId);
    setDetectedSource(null);
    setConvertPreview(null);
    
    // If selecting a package source, switch to upload tab
    if (packageSources.some(p => p.id === platformId)) {
      setActiveTab('upload');
    }
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
          {/* Design Tools Group */}
          <div>
            <Label className="text-[10px] font-medium mb-1.5 block text-muted-foreground uppercase tracking-wider">
              Design Tools
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {designToolSources.map((platform) => (
                <Button
                  key={platform.id}
                  variant={activePlatform === platform.id ? 'default' : 'outline'}
                  className="flex flex-col h-14 gap-1 text-xs px-2 py-1.5"
                  onClick={() => handlePlatformSelect(platform.id)}
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

          {/* CMS/Package Group */}
          <div>
            <Label className="text-[10px] font-medium mb-1.5 block text-muted-foreground uppercase tracking-wider">
              CMS & Packages
            </Label>
            <div className="grid grid-cols-3 gap-1.5">
              {packageSources.map((platform) => (
                <Button
                  key={platform.id}
                  variant={activePlatform === platform.id ? 'default' : 'outline'}
                  className="flex flex-col h-14 gap-1 text-xs px-2 py-1.5"
                  onClick={() => handlePlatformSelect(platform.id)}
                >
                  {platform.icon ? (
                    <img 
                      src={platform.icon} 
                      alt={platform.label}
                      className="w-5 h-5 object-contain rounded-sm"
                    />
                  ) : (
                    <Package className="w-5 h-5" />
                  )}
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
                    Paste your {getPlatformLabel()} code
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
                  placeholder={`Copy elements from ${getPlatformLabel()} and paste here...`}
                  value={pastedCode}
                  onPaste={handlePaste}
                  onChange={(e) => handlePasteChange(e.target.value)}
                  className="min-h-[160px] font-mono text-xs p-2"
                />
              </div>

              {/* Conversion Preview */}
              {convertPreview && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5">
                  <p className="text-xs text-green-700 dark:text-green-400">
                    ✓ Ready to import: <strong>{convertPreview.nodes}</strong> components with <strong>{convertPreview.styles}</strong> styles
                  </p>
                </div>
              )}

              {/* Platform Instructions */}
              <div className="bg-muted/50 p-2 rounded-lg">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activePlatform === 'webflow' && '📝 In Webflow, select elements and use Cmd/Ctrl+C to copy. Paste the JSON data here.'}
                  {activePlatform === 'figma' && '📝 Standard Figma copy doesn\'t include node data. Use Dev Mode → Export as JSON, or use a Figma-to-code plugin like html.to.design.'}
                  {activePlatform === 'framer' && '📝 In Framer, copy components or use export to get the code.'}
                </p>
              </div>

              {/* Convert Button */}
              <div className="flex justify-end gap-1.5">
                <Button variant="outline" onClick={resetAndClose} className="h-8 text-xs px-3" disabled={isImporting}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConvert} 
                  className="h-8 text-xs px-3 gap-2"
                  disabled={!pastedCode.trim() || isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    getConvertButtonLabel()
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Upload ZIP Tab */}
            <TabsContent value="upload" className="space-y-3 mt-3">
              <div className="border-2 border-dashed border-border rounded-lg p-5 text-center">
                <Upload className="h-7 w-7 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-xs font-medium mb-1">
                    {selectedFile ? selectedFile.name : `Upload ${getPlatformLabel()} Package`}
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2">
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
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{selectedFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {getPlatformLabel()} Package
                  </Badge>
                </div>
              )}

              {/* Platform Instructions */}
              <div className="bg-muted/50 p-2 rounded-lg">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activePlatform === 'webflow' && '📦 Export your Webflow site as a ZIP file and upload it here.'}
                  {activePlatform === 'figma' && '📦 Use a Figma plugin to export your design as HTML/CSS and upload the ZIP.'}
                  {activePlatform === 'framer' && '📦 Export your Framer project as code and upload the ZIP.'}
                  {activePlatform === 'wordpress' && '📦 Export your WordPress theme or page as a ZIP file.'}
                  {activePlatform === 'shopify' && '📦 Export your Shopify theme files as a ZIP.'}
                  {activePlatform === 'zip' && '📦 Upload any ZIP file containing HTML, CSS, and JavaScript files.'}
                </p>
              </div>

              {/* Upload Button */}
              <div className="flex justify-end gap-1.5">
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
