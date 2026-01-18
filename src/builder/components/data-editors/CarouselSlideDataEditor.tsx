import React from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { ImageUpload } from '../ImageUpload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Type, FileText } from 'lucide-react';

interface CarouselSlideDataEditorProps {
  instance: ComponentInstance;
}

export const CarouselSlideDataEditor: React.FC<CarouselSlideDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const imageUrl = instance.props?.imageUrl || '';
  const alt = instance.props?.alt || '';
  const title = instance.props?.title || '';
  const description = instance.props?.description || '';

  const updateProp = (key: string, value: string) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Slide Image */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3 h-3 text-muted-foreground" />
          <Label className="text-xs font-semibold">Slide Image</Label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Background image for this slide. Only shown when the slide has no child elements.
        </p>
        <ImageUpload
          currentValue={imageUrl}
          onImageChange={(url) => updateProp('imageUrl', url)}
          mode="src"
          label="Background Image"
        />
      </div>

      {/* Alt Text */}
      <div className="space-y-1.5">
        <Label htmlFor="slide-alt" className="text-xs flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-muted-foreground" />
          Alt Text
        </Label>
        <Input
          id="slide-alt"
          value={alt}
          onChange={(e) => updateProp('alt', e.target.value)}
          placeholder="Describe the image..."
          className="h-7 text-xs"
        />
      </div>

      {/* Overlay Content */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Type className="w-3 h-3 text-muted-foreground" />
          <Label className="text-xs font-semibold">Overlay Content</Label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Optional title and description shown over the image. Only visible when no child elements.
        </p>
        
        <div className="space-y-1.5">
          <Label htmlFor="slide-title" className="text-[10px] text-muted-foreground">Title</Label>
          <Input
            id="slide-title"
            value={title}
            onChange={(e) => updateProp('title', e.target.value)}
            placeholder="Slide title..."
            className="h-7 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slide-description" className="text-[10px] text-muted-foreground">Description</Label>
          <Input
            id="slide-description"
            value={description}
            onChange={(e) => updateProp('description', e.target.value)}
            placeholder="Slide description..."
            className="h-7 text-xs"
          />
        </div>
      </div>

      {/* Info about dropping elements */}
      <div className="p-2 rounded bg-muted/50 border border-border">
        <p className="text-[10px] text-muted-foreground">
          <strong>Tip:</strong> Drop elements directly into this slide from the Elements panel to create custom slide content. The background image and overlay text are hidden when child elements are present.
        </p>
      </div>
    </div>
  );
};
