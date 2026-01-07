import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { useStyleStore } from '../../store/useStyleStore';

interface FeatureCardStyleEditorProps {
  instance: ComponentInstance;
}

const cardVariants = [
  { value: 'default', label: 'Default', description: 'Subtle border with background' },
  { value: 'outlined', label: 'Outlined', description: 'Border only, transparent bg' },
  { value: 'elevated', label: 'Elevated', description: 'Shadow with solid background' },
  { value: 'ghost', label: 'Ghost', description: 'No border or background' },
  { value: 'gradient', label: 'Gradient', description: 'Gradient background' },
];

const iconStyles = [
  { value: 'filled', label: 'Filled' },
  { value: 'outlined', label: 'Outlined' },
  { value: 'gradient', label: 'Gradient' },
  { value: 'none', label: 'None' },
];

const iconSizes = [
  { value: 'sm', label: 'Small', size: '32px' },
  { value: 'md', label: 'Medium', size: '48px' },
  { value: 'lg', label: 'Large', size: '64px' },
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

const alignments = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
];

const iconColors = [
  { value: 'primary', label: 'Primary', color: 'hsl(var(--primary))' },
  { value: 'secondary', label: 'Secondary', color: 'hsl(var(--secondary))' },
  { value: 'accent', label: 'Accent', color: 'hsl(var(--accent))' },
  { value: 'muted', label: 'Muted', color: 'hsl(var(--muted))' },
  { value: 'destructive', label: 'Destructive', color: 'hsl(var(--destructive))' },
];

export const FeatureCardStyleEditor: React.FC<FeatureCardStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const { setStyle } = useStyleStore();

  // Get current style values from props (for preset tracking) or defaults
  const cardVariant = instance.props?.cardVariant || 'default';
  const iconStyle = instance.props?.iconStyle || 'filled';
  const iconSize = instance.props?.iconSize || 'md';
  const iconColor = instance.props?.iconColor || 'primary';
  const cardPadding = instance.props?.cardPadding || 'default';
  const cardRadius = instance.props?.cardRadius || 'lg';
  const alignment = instance.props?.alignment || 'left';

  // Get style source IDs
  const cardStyleId = instance.styleSourceIds?.[0];
  const iconChild = instance.children?.[0];
  const headingChild = instance.children?.[1];
  const textChild = instance.children?.[2];
  const iconStyleId = iconChild?.styleSourceIds?.[0];

  const updateStyleProp = (prop: string, value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const applyCardVariant = (variant: string) => {
    updateStyleProp('cardVariant', variant);
    
    if (!cardStyleId) return;
    
    // Apply styles based on variant
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

  const applyIconStyle = (style: string) => {
    updateStyleProp('iconStyle', style);
    
    if (!iconStyleId) return;
    
    const color = iconColors.find(c => c.value === iconColor)?.color || 'hsl(var(--primary))';
    
    switch (style) {
      case 'filled':
        setStyle(iconStyleId, 'backgroundColor', `${color.replace(')', ' / 0.1)')}`, 'base', 'default');
        setStyle(iconStyleId, 'border', 'none', 'base', 'default');
        break;
      case 'outlined':
        setStyle(iconStyleId, 'backgroundColor', 'transparent', 'base', 'default');
        setStyle(iconStyleId, 'border', `1px solid ${color}`, 'base', 'default');
        break;
      case 'gradient':
        setStyle(iconStyleId, 'backgroundImage', `linear-gradient(135deg, ${color}, ${color.replace(')', ' / 0.6)')})`, 'base', 'default');
        setStyle(iconStyleId, 'border', 'none', 'base', 'default');
        break;
      case 'none':
        setStyle(iconStyleId, 'backgroundColor', 'transparent', 'base', 'default');
        setStyle(iconStyleId, 'border', 'none', 'base', 'default');
        break;
    }
  };

  const applyIconSize = (size: string) => {
    updateStyleProp('iconSize', size);
    
    if (!iconStyleId) return;
    
    const sizeValue = iconSizes.find(s => s.value === size)?.size || '48px';
    setStyle(iconStyleId, 'width', sizeValue, 'base', 'default');
    setStyle(iconStyleId, 'height', sizeValue, 'base', 'default');
  };

  const applyIconColor = (color: string) => {
    updateStyleProp('iconColor', color);
    
    if (!iconStyleId) return;
    
    const colorValue = iconColors.find(c => c.value === color)?.color || 'hsl(var(--primary))';
    
    // Re-apply icon style with new color
    applyIconStyle(iconStyle);
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
    updateStyleProp('alignment', align);
    
    if (!cardStyleId) return;
    
    setStyle(cardStyleId, 'alignItems', align === 'center' ? 'center' : 'flex-start', 'base', 'default');
    setStyle(cardStyleId, 'textAlign', align, 'base', 'default');
  };

  return (
    <div className="space-y-3">
      {/* Card Variant */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Card Variant</Label>
        <Select value={cardVariant} onValueChange={applyCardVariant}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue className="text-foreground" />
          </SelectTrigger>
          <SelectContent>
            {cardVariants.map((variant) => (
              <SelectItem key={variant.value} value={variant.value} className="text-[10px]">
                <div className="flex flex-col">
                  <span>{variant.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Icon Style */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Icon Style</Label>
        <Select value={iconStyle} onValueChange={applyIconStyle}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue className="text-foreground" />
          </SelectTrigger>
          <SelectContent>
            {iconStyles.map((style) => (
              <SelectItem key={style.value} value={style.value} className="text-[10px]">
                {style.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Icon Color */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Icon Color</Label>
        <Select value={iconColor} onValueChange={applyIconColor}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue className="text-foreground" />
          </SelectTrigger>
          <SelectContent>
            {iconColors.map((color) => (
              <SelectItem key={color.value} value={color.value} className="text-[10px]">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full border border-border" 
                    style={{ backgroundColor: color.color }}
                  />
                  {color.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Icon Size */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Icon Size</Label>
        <Select value={iconSize} onValueChange={applyIconSize}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue className="text-foreground" />
          </SelectTrigger>
          <SelectContent>
            {iconSizes.map((size) => (
              <SelectItem key={size.value} value={size.value} className="text-[10px]">
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card Padding */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Card Padding</Label>
        <Select value={cardPadding} onValueChange={applyPadding}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue className="text-foreground" />
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
            <SelectValue className="text-foreground" />
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

      {/* Alignment */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Alignment</Label>
        <Select value={alignment} onValueChange={applyAlignment}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue className="text-foreground" />
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
  );
};
