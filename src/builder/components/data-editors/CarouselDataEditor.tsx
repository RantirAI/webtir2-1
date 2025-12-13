import React from 'react';
import { Plus, X, GripVertical, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface CarouselSlide {
  id: string;
  imageUrl?: string;
  title?: string;
  description?: string;
}

interface CarouselDataEditorProps {
  instance: ComponentInstance;
}

export const CarouselDataEditor: React.FC<CarouselDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const slides: CarouselSlide[] = instance.props?.slides || [
    { id: '1', imageUrl: '', title: 'Slide 1', description: 'Description for slide 1' },
    { id: '2', imageUrl: '', title: 'Slide 2', description: 'Description for slide 2' },
    { id: '3', imageUrl: '', title: 'Slide 3', description: 'Description for slide 3' },
  ];

  const updateSlides = (newSlides: CarouselSlide[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, slides: newSlides }
    });
  };

  const addSlide = () => {
    const newSlide: CarouselSlide = {
      id: Date.now().toString(),
      imageUrl: '',
      title: `Slide ${slides.length + 1}`,
      description: `Description for slide ${slides.length + 1}`,
    };
    updateSlides([...slides, newSlide]);
  };

  const updateSlide = (id: string, field: keyof CarouselSlide, value: string) => {
    const newSlides = slides.map(slide =>
      slide.id === id ? { ...slide, [field]: value } : slide
    );
    updateSlides(newSlides);
  };

  const removeSlide = (id: string) => {
    if (slides.length <= 1) return;
    updateSlides(slides.filter(slide => slide.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Settings */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-foreground">Carousel Settings</label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-1.5 text-[9px]">
            <Checkbox
              checked={instance.props?.autoPlay ?? false}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, autoPlay: !!checked }
              })}
              className="h-3 w-3"
            />
            Auto-play
          </label>
          <label className="flex items-center gap-1.5 text-[9px]">
            <Checkbox
              checked={instance.props?.loop ?? true}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, loop: !!checked }
              })}
              className="h-3 w-3"
            />
            Loop
          </label>
          <label className="flex items-center gap-1.5 text-[9px]">
            <Checkbox
              checked={instance.props?.showArrows ?? true}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, showArrows: !!checked }
              })}
              className="h-3 w-3"
            />
            Show arrows
          </label>
          <label className="flex items-center gap-1.5 text-[9px]">
            <Checkbox
              checked={instance.props?.showDots ?? true}
              onCheckedChange={(checked) => updateInstance(instance.id, {
                props: { ...instance.props, showDots: !!checked }
              })}
              className="h-3 w-3"
            />
            Show dots
          </label>
        </div>
        {instance.props?.autoPlay && (
          <div className="space-y-1">
            <label className="text-[9px] text-muted-foreground">Auto-play interval (ms)</label>
            <Input
              type="number"
              value={instance.props?.autoPlayInterval || 3000}
              onChange={(e) => updateInstance(instance.id, {
                props: { ...instance.props, autoPlayInterval: parseInt(e.target.value) || 3000 }
              })}
              className="h-5 text-[10px] w-24"
              min={500}
              step={500}
            />
          </div>
        )}
      </div>

      {/* Slides */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-foreground">Slides</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addSlide}
            className="h-5 px-1.5 text-[9px]"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Add
          </Button>
        </div>
        
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {slides.map((slide, index) => (
            <div key={slide.id} className="p-2 border border-border rounded bg-muted/30 space-y-2">
              <div className="flex items-center gap-1">
                <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                <span className="flex-1 text-[10px] font-medium">Slide {index + 1}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeSlide(slide.id)}
                  className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                  disabled={slides.length <= 1}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground">Image URL</label>
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-muted-foreground" />
                  <Input
                    value={slide.imageUrl || ''}
                    onChange={(e) => updateSlide(slide.id, 'imageUrl', e.target.value)}
                    className="h-5 text-[10px]"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground">Title</label>
                <Input
                  value={slide.title || ''}
                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                  className="h-5 text-[10px]"
                  placeholder="Slide title"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground">Description</label>
                <Textarea
                  value={slide.description || ''}
                  onChange={(e) => updateSlide(slide.id, 'description', e.target.value)}
                  className="text-[10px] min-h-[40px] resize-none"
                  placeholder="Slide description..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
