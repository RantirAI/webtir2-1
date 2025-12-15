import React from 'react';
import { Plus, X, GripVertical, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface CarouselSlide {
  id: string;
  imageUrl?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  altText?: string;
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

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
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
    <div className="space-y-4">
      {/* Autoplay Settings */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Autoplay Settings</Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.autoPlay ?? false}
              onCheckedChange={(checked) => updateProps({ autoPlay: !!checked })}
              className="h-3.5 w-3.5"
            />
            Enable autoplay
          </label>
          
          {instance.props?.autoPlay && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] text-muted-foreground">Duration (ms)</Label>
                  <Input
                    type="number"
                    value={instance.props?.autoPlayInterval || 3000}
                    onChange={(e) => updateProps({ autoPlayInterval: parseInt(e.target.value) || 3000 })}
                    className="h-6 text-[10px]"
                    min={1000}
                    step={500}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[10px]">
                <Checkbox
                  checked={instance.props?.pauseOnHover ?? true}
                  onCheckedChange={(checked) => updateProps({ pauseOnHover: !!checked })}
                  className="h-3.5 w-3.5"
                />
                Pause on hover
              </label>
            </>
          )}
        </div>
      </div>

      {/* Navigation Settings */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Navigation</Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.showArrows ?? true}
              onCheckedChange={(checked) => updateProps({ showArrows: !!checked })}
              className="h-3.5 w-3.5"
            />
            Show arrows
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.showDots ?? true}
              onCheckedChange={(checked) => updateProps({ showDots: !!checked })}
              className="h-3.5 w-3.5"
            />
            Show dots
          </label>
          <label className="flex items-center gap-2 text-[10px]">
            <Checkbox
              checked={instance.props?.loop ?? true}
              onCheckedChange={(checked) => updateProps({ loop: !!checked })}
              className="h-3.5 w-3.5"
            />
            Loop
          </label>
        </div>
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Slides Per View</Label>
          <Select 
            value={String(instance.props?.slidesPerView || '1')} 
            onValueChange={(v) => updateProps({ slidesPerView: parseInt(v) })}
          >
            <SelectTrigger className="h-6 text-[10px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1" className="text-[10px]">1</SelectItem>
              <SelectItem value="2" className="text-[10px]">2</SelectItem>
              <SelectItem value="3" className="text-[10px]">3</SelectItem>
              <SelectItem value="4" className="text-[10px]">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Slides */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Slides</Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addSlide}
            className="h-5 px-1.5 text-[9px]"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Add
          </Button>
        </div>
        
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
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
                <Label className="text-[9px] text-muted-foreground">Image URL</Label>
                <div className="flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  <Input
                    value={slide.imageUrl || ''}
                    onChange={(e) => updateSlide(slide.id, 'imageUrl', e.target.value)}
                    className="h-5 text-[10px]"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Alt Text</Label>
                <Input
                  value={slide.altText || ''}
                  onChange={(e) => updateSlide(slide.id, 'altText', e.target.value)}
                  className="h-5 text-[10px]"
                  placeholder="Image description"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Title</Label>
                <Input
                  value={slide.title || ''}
                  onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                  className="h-5 text-[10px]"
                  placeholder="Slide title"
                />
              </div>
              
              <div className="space-y-1">
                <Label className="text-[9px] text-muted-foreground">Description</Label>
                <Textarea
                  value={slide.description || ''}
                  onChange={(e) => updateSlide(slide.id, 'description', e.target.value)}
                  className="text-[10px] min-h-[40px] resize-none"
                  placeholder="Slide description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] text-muted-foreground">Button Text</Label>
                  <Input
                    value={slide.buttonText || ''}
                    onChange={(e) => updateSlide(slide.id, 'buttonText', e.target.value)}
                    className="h-5 text-[10px]"
                    placeholder="Learn more"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] text-muted-foreground">Button Link</Label>
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <Input
                      value={slide.buttonLink || ''}
                      onChange={(e) => updateSlide(slide.id, 'buttonLink', e.target.value)}
                      className="h-5 text-[10px]"
                      placeholder="/page"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
