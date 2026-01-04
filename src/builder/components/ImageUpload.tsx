import React, { useRef, useState, useEffect } from 'react';
import { Upload, X, Check, Loader2, Image as ImageIcon, FolderOpen, ChevronLeft, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { useMediaStore, MediaAsset, MediaFolder } from '../store/useMediaStore';

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
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [libraryFolderId, setLibraryFolderId] = useState<string | null>(null);
  
  // Subscribe to assets and folders directly to ensure re-render on changes
  const assets = useMediaStore((state) => state.assets);
  const folders = useMediaStore((state) => state.folders);
  const addAsset = useMediaStore((state) => state.addAsset);
  const getFoldersInParent = useMediaStore((state) => state.getFoldersInParent);
  const getAssetsInFolder = useMediaStore((state) => state.getAssetsInFolder);
  
  const imageAssets = getAssetsInFolder(libraryFolderId).filter(a => a.type === 'image');
  const libraryFolders = getFoldersInParent(libraryFolderId);
  const currentLibraryFolder = libraryFolderId ? folders[libraryFolderId] : null;

  // Sync internal state when currentValue prop changes
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
        onImageChange(dataUrl);
        setUrlInput(dataUrl);
        
        // Also add to media store
        addAsset({
          name: file.name,
          type: 'image',
          url: dataUrl,
          size: file.size,
          mimeType: file.type,
          altText: '',
        });
        
        toast({
          title: 'Image applied',
          description: `${file.name} added to assets`,
        });
      };
      reader.readAsDataURL(file);
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
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSelectFromLibrary = (asset: MediaAsset) => {
    setPreviewUrl(asset.url);
    setUrlInput(asset.url);
    onImageChange(asset.url);
    setShowMediaLibrary(false);
    setLibraryFolderId(null);
    toast({
      title: 'Image applied',
      description: asset.name,
    });
  };
  
  const navigateToFolder = (folderId: string | null) => {
    setLibraryFolderId(folderId);
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
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold">{mode === 'src' ? 'Image Source' : 'Background'}</label>
                {previewUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px]"
                    onClick={handleRemoveImage}
                  >
                    <X className="w-2.5 h-2.5 mr-0.5" />
                    Clear
                  </Button>
                )}
              </div>
              
              {previewUrl && (
                <div className="relative rounded overflow-hidden border border-border h-16">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${previewUrl})` }}
                  />
                </div>
              )}
              
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-6 text-[10px]"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-2.5 h-2.5 mr-1" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-6 text-[10px]"
                  onClick={() => setShowMediaLibrary(!showMediaLibrary)}
                >
                  <FolderOpen className="w-2.5 h-2.5 mr-1" />
                  Library
                </Button>
              </div>
              
              {/* Media Library Selector */}
              {showMediaLibrary && (
                <div className="border rounded p-1.5 bg-muted/30">
                  <div className="flex items-center gap-1 mb-1">
                    {libraryFolderId && (
                      <button 
                        onClick={() => navigateToFolder(currentLibraryFolder?.parentId || null)}
                        className="p-0.5 rounded hover:bg-muted"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                    )}
                    <p className="text-[9px] text-muted-foreground flex-1">
                      {libraryFolderId ? currentLibraryFolder?.name : 'Select from assets'}
                    </p>
                  </div>
                  <ScrollArea className="h-24">
                    <div className="grid grid-cols-4 gap-1">
                      {/* Folders */}
                      {libraryFolders.map(folder => (
                        <button
                          key={folder.id}
                          className="aspect-square rounded border border-border overflow-hidden hover:border-primary transition-colors flex flex-col items-center justify-center bg-muted"
                          onClick={() => navigateToFolder(folder.id)}
                        >
                          <Folder className="w-4 h-4 text-amber-500" />
                          <span className="text-[7px] truncate w-full px-0.5 text-center">{folder.name}</span>
                        </button>
                      ))}
                      {/* Images */}
                      {imageAssets.map(asset => (
                        <button
                          key={asset.id}
                          className="aspect-square rounded border border-border overflow-hidden hover:border-primary transition-colors"
                          onClick={() => handleSelectFromLibrary(asset)}
                        >
                          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      {imageAssets.length === 0 && libraryFolders.length === 0 && (
                        <p className="col-span-4 text-[9px] text-muted-foreground text-center py-2">No images in {libraryFolderId ? 'folder' : 'library'}</p>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground">Image URL</label>
                <div className="flex gap-1">
                  <Input
                    type="text"
                    placeholder="https://..."
                    value={urlInput}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
                    className="flex-1 h-6 text-[10px]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleUrlApply}
                    disabled={!urlInput.trim() || urlInput === previewUrl}
                  >
                    <Check className="w-2.5 h-2.5" />
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-foreground">{label}</label>
        {previewUrl && mode === 'src' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-[10px]"
            onClick={handleRemoveImage}
          >
            <X className="w-2.5 h-2.5 mr-0.5" />
            Remove
          </Button>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative group rounded overflow-hidden border border-border bg-muted/30">
          {mode === 'src' ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-24 object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
              }}
            />
          ) : (
            <div
              className="w-full h-24 bg-cover bg-center"
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-6 text-[10px]"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    <Upload className="w-2.5 h-2.5 mr-1" />
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
                className="h-6 text-[10px]"
                onClick={handleRemoveImage}
              >
                <X className="w-2.5 h-2.5 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Buttons */}
      {!previewUrl && (
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 h-16 border-dashed hover:border-primary hover:bg-primary/5"
                  onClick={handleUploadClick}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-1.5" />
                      <span className="text-[10px]">Upload</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select from computer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            className="flex-1 h-16 border-dashed hover:border-primary hover:bg-primary/5"
            onClick={() => setShowMediaLibrary(!showMediaLibrary)}
          >
            <FolderOpen className="w-4 h-4 mr-1.5" />
            <span className="text-[10px]">Library</span>
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      {/* Media Library Selector */}
      {showMediaLibrary && (
        <div className="border rounded p-2 bg-muted/30">
          <div className="flex items-center gap-1 mb-1.5">
            {libraryFolderId && (
              <button 
                onClick={() => navigateToFolder(currentLibraryFolder?.parentId || null)}
                className="p-1 rounded hover:bg-muted"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            )}
            <p className="text-[10px] text-muted-foreground flex-1">
              {libraryFolderId ? currentLibraryFolder?.name : 'Select from assets'}
            </p>
          </div>
          <ScrollArea className="h-28">
            <div className="grid grid-cols-4 gap-1.5">
              {/* Folders */}
              {libraryFolders.map(folder => (
                <button
                  key={folder.id}
                  className="aspect-square rounded border border-border overflow-hidden hover:border-primary transition-colors flex flex-col items-center justify-center bg-muted group"
                  onClick={() => navigateToFolder(folder.id)}
                  title={folder.name}
                >
                  <Folder className="w-5 h-5 text-amber-500" />
                  <span className="text-[8px] truncate w-full px-0.5 text-center mt-0.5">{folder.name}</span>
                </button>
              ))}
              {/* Images */}
              {imageAssets.map(asset => (
                <button
                  key={asset.id}
                  className="aspect-square rounded border border-border overflow-hidden hover:border-primary transition-colors group relative"
                  onClick={() => handleSelectFromLibrary(asset)}
                  title={asset.name}
                >
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </button>
              ))}
              {imageAssets.length === 0 && libraryFolders.length === 0 && (
                <p className="col-span-4 text-[10px] text-muted-foreground text-center py-4">No images in {libraryFolderId ? 'folder' : 'library'}</p>
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* URL Input */}
      <div className="space-y-1">
        <label className="text-[10px] text-muted-foreground">Or enter image URL</label>
        <div className="flex gap-1">
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
            className="flex-1 h-7 text-[10px]"
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
  );
};