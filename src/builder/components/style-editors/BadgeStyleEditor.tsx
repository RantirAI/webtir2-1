import React from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';

interface BadgeStyleEditorProps {
  instance: ComponentInstance;
}

export const BadgeStyleEditor: React.FC<BadgeStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  
  // Get current badge style props with defaults
  const badgeStyles = instance.props?.badgeStyles || {
    variant: 'default',
    size: 'medium',
    backgroundColor: 'hsl(var(--primary))',
    textColor: 'hsl(var(--primary-foreground))',
    borderColor: 'hsl(var(--border))',
    borderWidth: '0',
    borderStyle: 'solid',
    borderRadius: 'pill',
    paddingX: '10',
    paddingY: '2',
    fontWeight: '500',
    letterSpacing: '0',
  };

  const updateBadgeStyles = (updates: Partial<typeof badgeStyles>) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        badgeStyles: { ...badgeStyles, ...updates }
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Variant & Size */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Variant</Label>
          <Select 
            value={badgeStyles.variant} 
            onValueChange={(val) => updateBadgeStyles({ variant: val })}
          >
            <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Size</Label>
          <Select 
            value={badgeStyles.size} 
            onValueChange={(val) => updateBadgeStyles({ size: val })}
          >
            <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Colors */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Colors</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={badgeStyles.backgroundColor}
              onChange={(val) => updateBadgeStyles({ backgroundColor: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Text</Label>
            <ColorPicker
              value={badgeStyles.textColor}
              onChange={(val) => updateBadgeStyles({ textColor: val })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Border */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Border</Label>
        
        <div className="grid grid-cols-2 gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Style</Label>
            <Select 
              value={badgeStyles.borderStyle} 
              onValueChange={(val) => updateBadgeStyles({ borderStyle: val })}
            >
              <SelectTrigger className="h-8 text-[10px] bg-[hsl(var(--muted))] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Color</Label>
            <div className="h-8 flex items-center">
              <ColorPicker
                value={badgeStyles.borderColor}
                onChange={(val) => updateBadgeStyles({ borderColor: val })}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Width (px)</Label>
            <Input
              type="number"
              value={badgeStyles.borderWidth}
              onChange={(e) => updateBadgeStyles({ borderWidth: e.target.value })}
              className="h-8 text-[11px] bg-muted text-foreground w-full px-2"
              min="0"
              max="8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Radius</Label>
            <Select 
              value={badgeStyles.borderRadius} 
              onValueChange={(val) => updateBadgeStyles({ borderRadius: val })}
            >
              <SelectTrigger className="h-8 text-[10px] bg-[hsl(var(--muted))] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pill">Pill</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="square">Square</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Padding */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Padding</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Horizontal (px)</Label>
            <Input
              type="number"
              value={badgeStyles.paddingX}
              onChange={(e) => updateBadgeStyles({ paddingX: e.target.value })}
              className="h-8 text-[11px] bg-muted text-foreground w-full px-2"
              min="0"
              max="32"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Vertical (px)</Label>
            <Input
              type="number"
              value={badgeStyles.paddingY}
              onChange={(e) => updateBadgeStyles({ paddingY: e.target.value })}
              className="h-8 text-[11px] bg-muted text-foreground w-full px-2"
              min="0"
              max="32"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Typography */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Typography</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Font Weight</Label>
            <Select 
              value={badgeStyles.fontWeight} 
              onValueChange={(val) => updateBadgeStyles({ fontWeight: val })}
            >
              <SelectTrigger className="h-8 text-[10px] bg-[hsl(var(--muted))] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Normal</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semibold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Letter Spacing (px)</Label>
            <Input
              type="number"
              value={badgeStyles.letterSpacing}
              onChange={(e) => updateBadgeStyles({ letterSpacing: e.target.value })}
              className="h-8 text-[11px] bg-muted text-foreground w-full px-2"
              min="-2"
              max="8"
              step="0.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
};