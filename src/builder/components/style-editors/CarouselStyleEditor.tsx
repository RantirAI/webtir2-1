import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface CarouselStyleEditorProps {
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

export const CarouselStyleEditor: React.FC<CarouselStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const styles = instance.props?.carouselStyles || {};

  const updateStyles = (key: string, value: string | boolean) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        carouselStyles: { ...styles, [key]: value }
      }
    });
  };

  const applyTemplate = (templateId: string) => {
    const templateStyle = templateStyles[templateId];
    if (templateStyle) {
      updateInstance(instance.id, {
        props: {
          ...instance.props,
          carouselStyles: { ...styles, ...templateStyle, template: templateId }
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-1.5">
        <Label className="text-[10px] text-muted-foreground">Template</Label>
        <Select value={styles.template || ''} onValueChange={applyTemplate}>
          <SelectTrigger className="h-7 text-[11px] bg-muted">
            <SelectValue placeholder="Choose template..." />
          </SelectTrigger>
          <SelectContent>
            {prebuiltTemplates.map(template => (
              <SelectItem key={template.value} value={template.value} className="text-[11px]">
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transition Effects */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Transition Effects</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Effect</Label>
            <Select value={styles.effect || 'slide'} onValueChange={(v) => updateStyles('effect', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slide" className="text-[10px]">Slide</SelectItem>
                <SelectItem value="fade" className="text-[10px]">Fade</SelectItem>
                <SelectItem value="zoom" className="text-[10px]">Zoom</SelectItem>
                <SelectItem value="flip" className="text-[10px]">Flip</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Duration (ms)</Label>
            <Input
              type="number"
              value={styles.transitionDuration || '300'}
              onChange={(e) => updateStyles('transitionDuration', e.target.value)}
              className="h-6 text-[10px] bg-muted"
              min={100}
              step={50}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[9px] text-muted-foreground">Timing Function</Label>
            <Select value={styles.transitionTiming || 'ease'} onValueChange={(v) => updateStyles('transitionTiming', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ease" className="text-[10px]">Ease</SelectItem>
                <SelectItem value="ease-in" className="text-[10px]">Ease In</SelectItem>
                <SelectItem value="ease-out" className="text-[10px]">Ease Out</SelectItem>
                <SelectItem value="ease-in-out" className="text-[10px]">Ease In Out</SelectItem>
                <SelectItem value="linear" className="text-[10px]">Linear</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Container */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Container</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Height</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={styles.height || '300'}
                onChange={(e) => updateStyles('height', e.target.value)}
                className="h-6 text-[10px] bg-muted flex-1"
              />
              <Select value={styles.heightUnit || 'px'} onValueChange={(v) => updateStyles('heightUnit', v)}>
                <SelectTrigger className="h-6 text-[10px] bg-muted w-14">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="px" className="text-[10px]">px</SelectItem>
                  <SelectItem value="vh" className="text-[10px]">vh</SelectItem>
                  <SelectItem value="%" className="text-[10px]">%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Radius</Label>
            <Input
              type="number"
              value={styles.borderRadius || '0'}
              onChange={(e) => updateStyles('borderRadius', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={styles.backgroundColor || ''}
              onChange={(v) => updateStyles('backgroundColor', v)}
            />
          </div>
        </div>
      </div>

      {/* Arrows Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Arrow Controls</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Style</Label>
            <Select value={styles.arrowStyle || 'circle'} onValueChange={(v) => updateStyles('arrowStyle', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle" className="text-[10px]">Circle</SelectItem>
                <SelectItem value="square" className="text-[10px]">Square</SelectItem>
                <SelectItem value="minimal" className="text-[10px]">Minimal</SelectItem>
                <SelectItem value="none" className="text-[10px]">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Size</Label>
            <Select value={styles.arrowSize || 'medium'} onValueChange={(v) => updateStyles('arrowSize', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small" className="text-[10px]">Small</SelectItem>
                <SelectItem value="medium" className="text-[10px]">Medium</SelectItem>
                <SelectItem value="large" className="text-[10px]">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Position</Label>
            <Select value={styles.arrowPosition || 'inside'} onValueChange={(v) => updateStyles('arrowPosition', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inside" className="text-[10px]">Inside</SelectItem>
                <SelectItem value="outside" className="text-[10px]">Outside</SelectItem>
                <SelectItem value="overlay" className="text-[10px]">Overlay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Color</Label>
            <ColorPicker
              value={styles.arrowColor || ''}
              onChange={(v) => updateStyles('arrowColor', v)}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={styles.arrowBackground || ''}
              onChange={(v) => updateStyles('arrowBackground', v)}
            />
          </div>
        </div>
      </div>

      {/* Dots Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Dot Indicators</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Style</Label>
            <Select value={styles.dotStyle || 'circle'} onValueChange={(v) => updateStyles('dotStyle', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle" className="text-[10px]">Circle</SelectItem>
                <SelectItem value="line" className="text-[10px]">Line</SelectItem>
                <SelectItem value="dash" className="text-[10px]">Dash</SelectItem>
                <SelectItem value="square" className="text-[10px]">Square</SelectItem>
                <SelectItem value="none" className="text-[10px]">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Size</Label>
            <Select value={styles.dotSize || 'medium'} onValueChange={(v) => updateStyles('dotSize', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small" className="text-[10px]">Small</SelectItem>
                <SelectItem value="medium" className="text-[10px]">Medium</SelectItem>
                <SelectItem value="large" className="text-[10px]">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Position</Label>
            <Select value={styles.dotPosition || 'bottom'} onValueChange={(v) => updateStyles('dotPosition', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom" className="text-[10px]">Bottom</SelectItem>
                <SelectItem value="top" className="text-[10px]">Top</SelectItem>
                <SelectItem value="outside" className="text-[10px]">Outside</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Color</Label>
            <ColorPicker
              value={styles.dotColor || ''}
              onChange={(v) => updateStyles('dotColor', v)}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[9px] text-muted-foreground">Active Color</Label>
            <ColorPicker
              value={styles.dotActiveColor || ''}
              onChange={(v) => updateStyles('dotActiveColor', v)}
            />
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Slide Content</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Alignment</Label>
            <Select value={styles.contentAlignment || 'center'} onValueChange={(v) => updateStyles('contentAlignment', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left" className="text-[10px]">Left</SelectItem>
                <SelectItem value="center" className="text-[10px]">Center</SelectItem>
                <SelectItem value="right" className="text-[10px]">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Position</Label>
            <Select value={styles.contentPosition || 'center'} onValueChange={(v) => updateStyles('contentPosition', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top" className="text-[10px]">Top</SelectItem>
                <SelectItem value="center" className="text-[10px]">Center</SelectItem>
                <SelectItem value="bottom" className="text-[10px]">Bottom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[9px] text-muted-foreground">Overlay</Label>
            <ColorPicker
              value={styles.overlayColor || ''}
              onChange={(v) => updateStyles('overlayColor', v)}
            />
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-foreground">Typography</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Title Color</Label>
            <ColorPicker
              value={styles.titleColor || ''}
              onChange={(v) => updateStyles('titleColor', v)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Title Size (px)</Label>
            <Input
              type="number"
              value={styles.titleSize || '24'}
              onChange={(e) => updateStyles('titleSize', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Title Weight</Label>
            <Select value={styles.titleWeight || '600'} onValueChange={(v) => updateStyles('titleWeight', v)}>
              <SelectTrigger className="h-6 text-[10px] bg-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400" className="text-[10px]">Normal</SelectItem>
                <SelectItem value="500" className="text-[10px]">Medium</SelectItem>
                <SelectItem value="600" className="text-[10px]">Semibold</SelectItem>
                <SelectItem value="700" className="text-[10px]">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Subtitle Size (px)</Label>
            <Input
              type="number"
              value={styles.subtitleSize || '14'}
              onChange={(e) => updateStyles('subtitleSize', e.target.value)}
              className="h-6 text-[10px] bg-muted"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Subtitle Color</Label>
            <ColorPicker
              value={styles.subtitleColor || ''}
              onChange={(v) => updateStyles('subtitleColor', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
