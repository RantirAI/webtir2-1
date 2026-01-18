import React from 'react';
import { Plus, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { generateId } from '../../utils/instance';

interface CarouselDataEditorProps {
  instance: ComponentInstance;
}

const prebuiltTemplates = [
  { value: 'hero-slider', label: 'Hero Slider' },
  { value: 'product-carousel', label: 'Product Carousel' },
  { value: 'testimonial-slider', label: 'Testimonial Slider' },
  { value: 'image-gallery', label: 'Image Gallery' },
  { value: 'feature-showcase', label: 'Feature Showcase' },
];

const templateStyles: Record<string, any> = {
  'hero-slider': {
    effect: 'fade',
    transitionDuration: '500',
    transitionTiming: 'ease-in-out',
    height: '500',
    heightUnit: 'px',
    borderRadius: '0',
    arrowStyle: 'circle',
    arrowSize: 'large',
    arrowColor: 'hsl(var(--background))',
    arrowBackground: 'hsl(var(--foreground) / 0.5)',
    arrowPosition: 'inside',
    dotStyle: 'circle',
    dotSize: 'medium',
    dotColor: 'hsl(var(--muted-foreground))',
    dotActiveColor: 'hsl(var(--background))',
    dotPosition: 'bottom',
    contentAlignment: 'center',
    contentPosition: 'center',
    overlayColor: 'hsl(0 0% 0% / 0.4)',
    titleColor: 'hsl(var(--background))',
    titleSize: '48',
    titleWeight: '700',
    subtitleColor: 'hsl(var(--background) / 0.9)',
    subtitleSize: '18',
  },
  'product-carousel': {
    effect: 'slide',
    transitionDuration: '300',
    transitionTiming: 'ease-out',
    height: '300',
    heightUnit: 'px',
    borderRadius: '8',
    arrowStyle: 'minimal',
    arrowSize: 'medium',
    arrowColor: 'hsl(var(--foreground))',
    arrowBackground: 'transparent',
    arrowPosition: 'outside',
    dotStyle: 'line',
    dotSize: 'small',
    dotColor: 'hsl(var(--muted))',
    dotActiveColor: 'hsl(var(--primary))',
    dotPosition: 'bottom',
    contentAlignment: 'left',
    contentPosition: 'bottom',
    overlayColor: 'transparent',
    titleColor: 'hsl(var(--foreground))',
    titleSize: '16',
    titleWeight: '600',
    subtitleColor: 'hsl(var(--muted-foreground))',
    subtitleSize: '14',
  },
  'testimonial-slider': {
    effect: 'fade',
    transitionDuration: '400',
    transitionTiming: 'ease',
    height: '250',
    heightUnit: 'px',
    borderRadius: '12',
    arrowStyle: 'circle',
    arrowSize: 'small',
    arrowColor: 'hsl(var(--primary))',
    arrowBackground: 'hsl(var(--primary) / 0.1)',
    arrowPosition: 'inside',
    dotStyle: 'circle',
    dotSize: 'small',
    dotColor: 'hsl(var(--muted))',
    dotActiveColor: 'hsl(var(--primary))',
    dotPosition: 'bottom',
    contentAlignment: 'center',
    contentPosition: 'center',
    overlayColor: 'transparent',
    titleColor: 'hsl(var(--foreground))',
    titleSize: '20',
    titleWeight: '500',
    subtitleColor: 'hsl(var(--muted-foreground))',
    subtitleSize: '14',
    backgroundColor: 'hsl(var(--muted))',
  },
  'image-gallery': {
    effect: 'slide',
    transitionDuration: '250',
    transitionTiming: 'ease-out',
    height: '400',
    heightUnit: 'px',
    borderRadius: '4',
    arrowStyle: 'square',
    arrowSize: 'medium',
    arrowColor: 'hsl(var(--background))',
    arrowBackground: 'hsl(var(--foreground) / 0.7)',
    arrowPosition: 'overlay',
    dotStyle: 'square',
    dotSize: 'small',
    dotColor: 'hsl(var(--muted))',
    dotActiveColor: 'hsl(var(--foreground))',
    dotPosition: 'outside',
    contentAlignment: 'left',
    contentPosition: 'bottom',
    overlayColor: 'transparent',
    titleColor: 'hsl(var(--foreground))',
    titleSize: '14',
    titleWeight: '500',
    subtitleColor: 'hsl(var(--muted-foreground))',
    subtitleSize: '12',
  },
  'feature-showcase': {
    effect: 'zoom',
    transitionDuration: '600',
    transitionTiming: 'ease-in-out',
    height: '450',
    heightUnit: 'px',
    borderRadius: '16',
    arrowStyle: 'circle',
    arrowSize: 'large',
    arrowColor: 'hsl(var(--primary-foreground))',
    arrowBackground: 'hsl(var(--primary))',
    arrowPosition: 'inside',
    dotStyle: 'dash',
    dotSize: 'medium',
    dotColor: 'hsl(var(--muted))',
    dotActiveColor: 'hsl(var(--primary))',
    dotPosition: 'bottom',
    contentAlignment: 'left',
    contentPosition: 'bottom',
    overlayColor: 'linear-gradient(to top, hsl(0 0% 0% / 0.6), transparent)',
    titleColor: 'hsl(var(--background))',
    titleSize: '32',
    titleWeight: '700',
    subtitleColor: 'hsl(var(--background) / 0.8)',
    subtitleSize: '16',
  },
};

export const CarouselDataEditor: React.FC<CarouselDataEditorProps> = ({ instance }) => {
  const { updateInstance, addInstance } = useBuilderStore();
  
  // Get CarouselSlide children
  const carouselSlides = instance.children.filter(c => c.type === 'CarouselSlide');
  
  const currentTemplate = instance.props?.carouselStyles?.template || '';

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  const applyTemplate = (templateId: string) => {
    const templateStyle = templateStyles[templateId];
    if (templateStyle) {
      updateInstance(instance.id, {
        props: {
          ...instance.props,
          carouselStyles: { ...instance.props?.carouselStyles, ...templateStyle, template: templateId }
        }
      });
    }
  };

  const addSlide = () => {
    const slideNum = carouselSlides.length + 1;
    
    const newSlide: ComponentInstance = {
      id: generateId(),
      type: 'CarouselSlide',
      label: `Slide ${slideNum}`,
      props: { 
        title: `Slide ${slideNum}`, 
        description: `Content for slide ${slideNum}` 
      },
      children: [],
      styleSourceIds: [],
    };
    addInstance(newSlide, instance.id);
  };

  return (
    <div className="space-y-4">
      {/* Carousel Slides Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Carousel Slides</Label>
          <span className="text-[9px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
            {carouselSlides.length} slide{carouselSlides.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="p-2 bg-muted/30 rounded border border-border">
          <div className="flex items-start gap-2">
            <Info className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Slides are managed via the Navigator tree. Select individual slides to edit their content and style. Drop elements into slides to customize them.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={addSlide}
          className="w-full h-7 text-[10px]"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Slide
        </Button>
      </div>

      {/* Template Selection */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Template</Label>
        <Select value={currentTemplate} onValueChange={applyTemplate}>
          <SelectTrigger className="h-7 text-[11px] bg-background border-border">
            <SelectValue placeholder="Choose a template..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border z-50">
            {prebuiltTemplates.map(template => (
              <SelectItem key={template.value} value={template.value} className="text-[11px]">
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </div>
  );
};
