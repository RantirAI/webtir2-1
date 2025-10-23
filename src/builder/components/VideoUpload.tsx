import React, { useRef, useState } from 'react';
import { Upload, X, Check, Loader2, Video as VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface VideoUploadProps {
  currentValue: string;
  onVideoChange: (url: string) => void;
  loop?: boolean;
  autoplay?: boolean;
  showControls?: boolean;
  onLoopChange?: (loop: boolean) => void;
  onAutoplayChange?: (autoplay: boolean) => void;
  onShowControlsChange?: (showControls: boolean) => void;
  label?: string;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({
  currentValue,
  onVideoChange,
  loop = false,
  autoplay = false,
  showControls = false,
  onLoopChange,
  onAutoplayChange,
  onShowControlsChange,
  label = 'Background Video',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentValue);
  const [urlInput, setUrlInput] = useState(currentValue);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/webm', 'video/mp4', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file (webm, mp4, mov, ogg)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 30MB)
    if (file.size > 30 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a video smaller than 30MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create object URL for local preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      onVideoChange(objectUrl);
      setUrlInput(objectUrl);

      toast({
        title: 'Video uploaded successfully',
        description: `${file.name} has been uploaded`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to process the video',
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
      onVideoChange(urlInput);
      toast({
        title: 'Video URL applied',
        description: 'The video URL has been updated',
      });
    }
  };

  const handleRemoveVideo = () => {
    setPreviewUrl('');
    setUrlInput('');
    onVideoChange('');
    
    toast({
      title: 'Video removed',
      description: 'The video has been cleared',
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10pt] font-semibold text-foreground">{label}</label>
        {previewUrl && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10pt]"
            onClick={handleRemoveVideo}
          >
            <X className="w-3 h-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="relative group rounded-md overflow-hidden border border-border bg-muted/30">
          <video
            src={previewUrl}
            className="w-full h-32 object-cover"
            loop
            muted
            autoPlay
            playsInline
          />
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
            <Button
              variant="secondary"
              size="sm"
              className="h-8"
              onClick={handleRemoveVideo}
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
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
                    Upload video
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div>Select a video from your computer</div>
                <div className="text-[9px] opacity-70">Supported: webm, mp4, mov, ogg</div>
                <div className="text-[9px] opacity-70">Max size: 30MB</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/webm,video/mp4,video/ogg,video/quicktime"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* URL Input */}
      <div className="space-y-2">
        <label className="text-[10pt] text-muted-foreground">Or enter video URL</label>
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="https://example.com/video.mp4"
            value={urlInput}
            onChange={(e) => handleUrlChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlApply();
              }
            }}
            className="flex-1 h-8 text-[10pt]"
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

      {/* Video Settings */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="loop-video"
            checked={loop}
            onCheckedChange={(checked) => onLoopChange?.(checked as boolean)}
          />
          <label
            htmlFor="loop-video"
            className="text-[10pt] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Loop video
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="autoplay-video"
            checked={autoplay}
            onCheckedChange={(checked) => onAutoplayChange?.(checked as boolean)}
          />
          <label
            htmlFor="autoplay-video"
            className="text-[10pt] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Autoplay video
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-controls"
            checked={showControls}
            onCheckedChange={(checked) => onShowControlsChange?.(checked as boolean)}
          />
          <label
            htmlFor="show-controls"
            className="text-[10pt] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Include play/pause button
          </label>
        </div>
      </div>
    </div>
  );
};
