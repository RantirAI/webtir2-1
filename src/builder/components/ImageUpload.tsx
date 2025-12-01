import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentValue: string;
  onImageChange: (url: string) => void;
  mode: 'src' | 'background';
  label?: string;
  compact?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentValue,
  onImageChange,
  mode,
  label = 'Image',
  compact = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentValue);
  const [urlInput, setUrlInput] = useState(currentValue);

  // Sync internal state when currentValue prop changes (e.g., from another upload source)
  useEffect(() => {
    setPreviewUrl(currentValue);
    setUrlInput(currentValue);
  }, [currentValue]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (PNG, JPG, GIF, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 10MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create object URL for local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onImageChange(objectUrl);
      setUrlInput(objectUrl);

      toast({
        title: 'Image applied successfully',
        description: `${file.name} has been uploaded`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to process the image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput);
      onImageChange(urlInput);
      toast({
        title: 'Image URL applied',
        description: 'The image URL has been updated',
      });
    }
  };

  const handleRemoveImage = () => {
    const defaultUrl = mode === 'src' ? 'https://via.placeholder.com/400x300' : '';
    setPreviewUrl(defaultUrl);
    setUrlInput(defaultUrl);
    onImageChange(defaultUrl);
    
    toast({
      title: 'Image removed',
      description: 'The image has been cleared',
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Compact mode - small button that opens a popover
  if (compact) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="w-7 h-7 rounded border border-input flex items-center justify-center hover:bg-accent transition-colors overflow-hidden"
              style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
            >
              {!previewUrl && <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">{mode === 'src' ? 'Image Source' : 'Background Image'}</label>
                {previewUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              
              {previewUrl && (
                <div className="relative rounded-md overflow-hidden border border-border h-20">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${previewUrl})` }}
                  />
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 mr-1" />
                )}
                {previewUrl ? 'Replace' : 'Upload'}
              </Button>
              
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground">Image URL</label>
                <div className="flex gap-1">
                  <Input
                    type="text"
                    placeholder="https://..."
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
                    className="flex-1 h-7 text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2"
                    onClick={handleUrlApply}
                    disabled={!urlInput.trim() || urlInput === previewUrl}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground">{label}</label>
        {previewUrl && mode === 'src' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleRemoveImage}
          >
            <X className="w-3 h-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative group rounded-md overflow-hidden border border-border bg-muted/30">
          {mode === 'src' ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-32 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
              }}
            />
          ) : (
            <div
              className="w-full h-32 bg-cover bg-center"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    Replace
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upload from device</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {mode === 'background' && (
              <Button
                variant="secondary"
                size="sm"
                className="h-8"
                onClick={handleRemoveImage}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {!previewUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-24 border-dashed hover:border-primary hover:bg-primary/5"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Upload from device
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select an image from your computer</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">Or enter image URL</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="https://example.com/image.jpg"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlApply();
              }
            }}
            className="flex-1 h-8 text-xs"
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3"
            onClick={handleUrlApply}
            disabled={!urlInput.trim() || urlInput === previewUrl}
          >
            <Check className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};
