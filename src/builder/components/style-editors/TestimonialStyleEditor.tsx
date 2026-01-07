import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { useStyleStore } from '../../store/useStyleStore';
import { ColorPicker } from '../ColorPicker';

interface TestimonialStyleEditorProps {
  instance: ComponentInstance;
}

const cardVariants = [
  { value: 'default', label: 'Default', description: 'Subtle border with background' },
  { value: 'outlined', label: 'Outlined', description: 'Border only, transparent bg' },
  { value: 'elevated', label: 'Elevated', description: 'Shadow with solid background' },
  { value: 'ghost', label: 'Ghost', description: 'No border or background' },
  { value: 'gradient', label: 'Gradient', description: 'Gradient background' },
];

const paddingSizes = [
  { value: 'compact', label: 'Compact', padding: '16px' },
  { value: 'default', label: 'Default', padding: '32px' },
  { value: 'spacious', label: 'Spacious', padding: '48px' },
];

const borderRadii = [
  { value: 'none', label: 'None', radius: '0' },
  { value: 'sm', label: 'Small', radius: '4px' },
  { value: 'md', label: 'Medium', radius: '8px' },
  { value: 'lg', label: 'Large', radius: '12px' },
  { value: 'xl', label: 'Extra Large', radius: '16px' },
  { value: 'full', label: 'Full', radius: '24px' },
];

const avatarShapes = [
  { value: 'circle', label: 'Circle', radius: '50%' },
  { value: 'rounded', label: 'Rounded Square', radius: '8px' },
  { value: 'square', label: 'Square', radius: '0' },
];

const avatarSizes = [
  { value: 'sm', label: 'Small', size: '40px' },
  { value: 'md', label: 'Medium', size: '56px' },
  { value: 'lg', label: 'Large', size: '72px' },
  { value: 'xl', label: 'Extra Large', size: '96px' },
];

const avatarPositions = [
  { value: 'top', label: 'Top' },
  { value: 'left', label: 'Left (Inline)' },
  { value: 'inline', label: 'Inline with Author' },
];

const avatarBorderStyles = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
  { value: 'ring', label: 'Ring' },
];

const quoteFontSizes = [
  { value: 'sm', label: 'Small', size: '14px' },
  { value: 'default', label: 'Default', size: '18px' },
  { value: 'lg', label: 'Large', size: '22px' },
  { value: 'xl', label: 'Extra Large', size: '26px' },
];

const quoteStyles = [
  { value: 'normal', label: 'Normal' },
  { value: 'italic', label: 'Italic' },
];

const quoteMarkStyles = [
  { value: 'none', label: 'None' },
  { value: 'curly', label: 'Curly "..."' },
  { value: 'angled', label: 'Angled «...»' },
  { value: 'icon', label: 'Quote Icon' },
];

const alignments = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
];

const starSizes = [
  { value: 'sm', label: 'Small', size: '14px' },
  { value: 'md', label: 'Medium', size: '18px' },
  { value: 'lg', label: 'Large', size: '24px' },
];

const hoverEffects = [
  { value: 'none', label: 'None' },
  { value: 'scale', label: 'Scale Up' },
  { value: 'lift', label: 'Lift (Shadow)' },
  { value: 'glow', label: 'Glow' },
  { value: 'tilt', label: 'Tilt' },
];

const carouselNavigationStyles = [
  { value: 'arrows', label: 'Arrows' },
  { value: 'dots', label: 'Dots' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'None' },
];

const cardsPerViewOptions = [
  { value: '1', label: '1 Card' },
  { value: '2', label: '2 Cards' },
  { value: '3', label: '3 Cards' },
];

export const TestimonialStyleEditor: React.FC<TestimonialStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const { setStyle } = useStyleStore();

  // Get current style values from props or defaults
  const cardVariant = instance.props?.cardVariant || 'default';
  const cardPadding = instance.props?.cardPadding || 'default';
  const cardRadius = instance.props?.cardRadius || 'lg';
  const cardBgColor = instance.props?.cardBgColor || 'hsl(var(--card))';
  const cardBorderColor = instance.props?.cardBorderColor || 'hsl(var(--border))';
  
  // Avatar styles
  const showAvatar = instance.props?.showAvatar !== false;
  const avatarShape = instance.props?.avatarShape || 'circle';
  const avatarSize = instance.props?.avatarSize || 'md';
  const avatarPosition = instance.props?.avatarPosition || 'top';
  const avatarBorderStyle = instance.props?.avatarBorderStyle || 'none';
  const avatarBorderColor = instance.props?.avatarBorderColor || 'hsl(var(--primary))';
  const avatarShadow = instance.props?.avatarShadow || 'none';
  
  // Quote styles
  const quoteFontSize = instance.props?.quoteFontSize || 'default';
  const quoteStyle = instance.props?.quoteStyle || 'italic';
  const quoteColor = instance.props?.quoteColor || 'hsl(var(--foreground))';
  const quoteMarkStyle = instance.props?.quoteMarkStyle || 'none';
  const quoteAlignment = instance.props?.quoteAlignment || 'left';
  
  // Author styles
  const nameColor = instance.props?.nameColor || 'hsl(var(--foreground))';
  const roleColor = instance.props?.roleColor || 'hsl(var(--muted-foreground))';
  
  // Rating styles
  const starColor = instance.props?.starColor || '#FBBF24';
  const starSize = instance.props?.starSize || 'md';

  // Hover effect styles
  const hoverEffect = instance.props?.hoverEffect || 'none';
  const glowColor = instance.props?.glowColor || 'hsl(var(--primary))';

  // Carousel styles
  const displayMode = instance.props?.displayMode || 'single';
  const navigationStyle = instance.props?.navigationStyle || 'arrows';
  const cardsPerView = instance.props?.cardsPerView || '1';

  // Get style source IDs
  const cardStyleId = instance.styleSourceIds?.[0];

  const updateStyleProp = (prop: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const applyCardVariant = (variant: string) => {
    updateStyleProp('cardVariant', variant);
    
    if (!cardStyleId) return;
    
    switch (variant) {
      case 'default':
        setStyle(cardStyleId, 'backgroundColor', 'hsl(var(--card))', 'base', 'default');
        setStyle(cardStyleId, 'border', '1px solid hsl(var(--border))', 'base', 'default');
        setStyle(cardStyleId, 'boxShadow', 'none', 'base', 'default');
        break;
      case 'outlined':
        setStyle(cardStyleId, 'backgroundColor', 'transparent', 'base', 'default');
        setStyle(cardStyleId, 'border', '1px solid hsl(var(--border))', 'base', 'default');
        setStyle(cardStyleId, 'boxShadow', 'none', 'base', 'default');
        break;
      case 'elevated':
        setStyle(cardStyleId, 'backgroundColor', 'hsl(var(--card))', 'base', 'default');
        setStyle(cardStyleId, 'border', 'none', 'base', 'default');
        setStyle(cardStyleId, 'boxShadow', '0 4px 12px hsl(var(--foreground) / 0.1)', 'base', 'default');
        break;
      case 'ghost':
        setStyle(cardStyleId, 'backgroundColor', 'transparent', 'base', 'default');
        setStyle(cardStyleId, 'border', 'none', 'base', 'default');
        setStyle(cardStyleId, 'boxShadow', 'none', 'base', 'default');
        break;
      case 'gradient':
        setStyle(cardStyleId, 'backgroundColor', 'transparent', 'base', 'default');
        setStyle(cardStyleId, 'backgroundImage', 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.05))', 'base', 'default');
        setStyle(cardStyleId, 'border', '1px solid hsl(var(--primary) / 0.2)', 'base', 'default');
        break;
    }
  };

  const applyPadding = (padding: string) => {
    updateStyleProp('cardPadding', padding);
    
    if (!cardStyleId) return;
    
    const paddingValue = paddingSizes.find(p => p.value === padding)?.padding || '32px';
    setStyle(cardStyleId, 'padding', paddingValue, 'base', 'default');
  };

  const applyRadius = (radius: string) => {
    updateStyleProp('cardRadius', radius);
    
    if (!cardStyleId) return;
    
    const radiusValue = borderRadii.find(r => r.value === radius)?.radius || '12px';
    setStyle(cardStyleId, 'borderRadius', radiusValue, 'base', 'default');
  };

  const applyAlignment = (align: string) => {
    updateStyleProp('quoteAlignment', align);
    
    if (!cardStyleId) return;
    
    setStyle(cardStyleId, 'alignItems', align === 'center' ? 'center' : 'flex-start', 'base', 'default');
    setStyle(cardStyleId, 'textAlign', align, 'base', 'default');
  };

  return (
    <div className="space-y-4">
      {/* Section indicator */}
      <div className="text-[9px] text-muted-foreground px-1">
        {displayMode === 'carousel' ? '8 sections' : '7 sections'} • scroll to see all
      </div>

      {/* Card Container Section */}
      <div className="space-y-3">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Card Container</Label>
        
        {/* Card Variant */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Variant</Label>
          <Select value={cardVariant} onValueChange={applyCardVariant}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cardVariants.map((variant) => (
                <SelectItem key={variant.value} value={variant.value} className="text-[10px]">
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Card Padding */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Padding</Label>
          <Select value={cardPadding} onValueChange={applyPadding}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {paddingSizes.map((size) => (
                <SelectItem key={size.value} value={size.value} className="text-[10px]">
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Border Radius</Label>
          <Select value={cardRadius} onValueChange={applyRadius}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {borderRadii.map((radius) => (
                <SelectItem key={radius.value} value={radius.value} className="text-[10px]">
                  {radius.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Background Color */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Background Color</Label>
          <div className="flex items-center gap-2">
            <ColorPicker 
              value={cardBgColor} 
              onChange={(val) => {
                updateStyleProp('cardBgColor', val);
                if (cardStyleId) setStyle(cardStyleId, 'backgroundColor', val, 'base', 'default');
              }} 
            />
          </div>
        </div>

        {/* Border Color */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Border Color</Label>
          <div className="flex items-center gap-2">
            <ColorPicker 
              value={cardBorderColor} 
              onChange={(val) => {
                updateStyleProp('cardBorderColor', val);
                if (cardStyleId) setStyle(cardStyleId, 'borderColor', val, 'base', 'default');
              }} 
            />
          </div>
        </div>
      </div>

      {/* Hover Effects Section - Moved up for visibility */}
      <div className="space-y-3 pt-3 border-t border-border">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Hover Effects</Label>
        
        {/* Hover Effect Type */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Effect Type</Label>
          <Select value={hoverEffect} onValueChange={(val) => updateStyleProp('hoverEffect', val)}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {hoverEffects.map((effect) => (
                <SelectItem key={effect.value} value={effect.value} className="text-[10px]">
                  {effect.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hoverEffect === 'glow' && (
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-foreground">Glow Color</Label>
            <div className="flex items-center gap-2">
              <ColorPicker value={glowColor} onChange={(val) => updateStyleProp('glowColor', val)} />
            </div>
          </div>
        )}
      </div>

      {/* Carousel Settings Section - Moved up for visibility */}
      {displayMode === 'carousel' && (
        <div className="space-y-3 pt-3 border-t border-border">
          <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Carousel Styles</Label>
          
          {/* Navigation Style */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-foreground">Navigation</Label>
            <Select value={navigationStyle} onValueChange={(val) => updateStyleProp('navigationStyle', val)}>
              <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {carouselNavigationStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value} className="text-[10px]">
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cards Per View */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-foreground">Cards Per View</Label>
            <Select value={cardsPerView} onValueChange={(val) => updateStyleProp('cardsPerView', val)}>
              <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cardsPerViewOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-[10px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Avatar Section */}
      <div className="space-y-3 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Avatar / Picture</Label>
          <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <Checkbox
              checked={showAvatar}
              onCheckedChange={(checked) => updateStyleProp('showAvatar', !!checked)}
              className="w-3 h-3"
            />
            Show
          </label>
        </div>
        
        {showAvatar && (
          <>
            {/* Avatar Shape */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-foreground">Shape</Label>
              <Select value={avatarShape} onValueChange={(val) => updateStyleProp('avatarShape', val)}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {avatarShapes.map((shape) => (
                    <SelectItem key={shape.value} value={shape.value} className="text-[10px]">
                      {shape.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Avatar Size */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-foreground">Size</Label>
              <Select value={avatarSize} onValueChange={(val) => updateStyleProp('avatarSize', val)}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {avatarSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value} className="text-[10px]">
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Avatar Position */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-foreground">Position</Label>
              <Select value={avatarPosition} onValueChange={(val) => updateStyleProp('avatarPosition', val)}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {avatarPositions.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value} className="text-[10px]">
                      {pos.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Avatar Border Style */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-foreground">Border Style</Label>
              <Select value={avatarBorderStyle} onValueChange={(val) => updateStyleProp('avatarBorderStyle', val)}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {avatarBorderStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value} className="text-[10px]">
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {avatarBorderStyle !== 'none' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-medium text-foreground">Border Color</Label>
                <div className="flex items-center gap-2">
                  <ColorPicker 
                    value={avatarBorderColor} 
                    onChange={(val) => updateStyleProp('avatarBorderColor', val)} 
                  />
                </div>
              </div>
            )}

            {/* Avatar Shadow */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-foreground">Shadow</Label>
              <Select value={avatarShadow} onValueChange={(val) => updateStyleProp('avatarShadow', val)}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-[10px]">None</SelectItem>
                  <SelectItem value="subtle" className="text-[10px]">Subtle</SelectItem>
                  <SelectItem value="medium" className="text-[10px]">Medium</SelectItem>
                  <SelectItem value="strong" className="text-[10px]">Strong</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      {/* Quote Text Section */}
      <div className="space-y-3 pt-3 border-t border-border">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Quote Text</Label>
        
        {/* Quote Font Size */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Font Size</Label>
          <Select value={quoteFontSize} onValueChange={(val) => updateStyleProp('quoteFontSize', val)}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quoteFontSizes.map((size) => (
                <SelectItem key={size.value} value={size.value} className="text-[10px]">
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quote Style */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Font Style</Label>
          <Select value={quoteStyle} onValueChange={(val) => updateStyleProp('quoteStyle', val)}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quoteStyles.map((style) => (
                <SelectItem key={style.value} value={style.value} className="text-[10px]">
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quote Color */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Color</Label>
          <div className="flex items-center gap-2">
            <ColorPicker value={quoteColor} onChange={(val) => updateStyleProp('quoteColor', val)} />
          </div>
        </div>

        {/* Quote Mark Style */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Quote Marks</Label>
          <Select value={quoteMarkStyle} onValueChange={(val) => updateStyleProp('quoteMarkStyle', val)}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {quoteMarkStyles.map((style) => (
                <SelectItem key={style.value} value={style.value} className="text-[10px]">
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quote Alignment */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Alignment</Label>
          <Select value={quoteAlignment} onValueChange={applyAlignment}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {alignments.map((align) => (
                <SelectItem key={align.value} value={align.value} className="text-[10px]">
                  {align.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Author Section */}
      <div className="space-y-3 pt-3 border-t border-border">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Author</Label>
        
        {/* Name Color */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Name Color</Label>
          <div className="flex items-center gap-2">
            <ColorPicker value={nameColor} onChange={(val) => updateStyleProp('nameColor', val)} />
          </div>
        </div>

        {/* Role Color */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Role Color</Label>
          <div className="flex items-center gap-2">
            <ColorPicker value={roleColor} onChange={(val) => updateStyleProp('roleColor', val)} />
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="space-y-3 pt-3 border-t border-border">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Rating</Label>
        
        {/* Star Color */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Star Color</Label>
          <div className="flex items-center gap-2">
            <ColorPicker value={starColor} onChange={(val) => updateStyleProp('starColor', val)} />
          </div>
        </div>

        {/* Star Size */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Star Size</Label>
          <Select value={starSize} onValueChange={(val) => updateStyleProp('starSize', val)}>
            <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {starSizes.map((size) => (
                <SelectItem key={size.value} value={size.value} className="text-[10px]">
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

    </div>
  );
};
