import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Tag, Link as LinkIcon, ExternalLink, ArrowLeft, ArrowRight, Check, X, Star, Heart, Bell, Info } from 'lucide-react';

interface BadgeDataEditorProps {
  instance: ComponentInstance;
}

const iconOptions = [
  { value: 'none', label: 'None', icon: null },
  { value: 'tag', label: 'Tag', icon: Tag },
  { value: 'star', label: 'Star', icon: Star },
  { value: 'heart', label: 'Heart', icon: Heart },
  { value: 'bell', label: 'Bell', icon: Bell },
  { value: 'info', label: 'Info', icon: Info },
  { value: 'check', label: 'Check', icon: Check },
  { value: 'x', label: 'Close', icon: X },
  { value: 'external', label: 'External', icon: ExternalLink },
];

export const BadgeDataEditor: React.FC<BadgeDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

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

  const text = instance.props?.text || 'Badge';
  const icon = instance.props?.icon || 'none';
  const iconPosition = instance.props?.iconPosition || 'left';
  const linkUrl = instance.props?.linkUrl || '';
  const openInNewTab = instance.props?.openInNewTab ?? false;

  return (
    <div className="space-y-4">
      {/* Badge Text */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Content</Label>
        
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Badge Text</Label>
          <Input
            value={text}
            onChange={(e) => updateProps({ text: e.target.value })}
            className="h-7 text-[10px] bg-muted text-foreground"
            placeholder="Badge text"
          />
        </div>
      </div>

      <Separator />

      {/* Icon Settings */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Icon</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Icon</Label>
            <Select value={icon} onValueChange={(val) => updateProps({ icon: val })}>
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-1.5">
                      {opt.icon && <opt.icon className="w-3 h-3" />}
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Position</Label>
            <Select 
              value={iconPosition} 
              onValueChange={(val) => updateProps({ iconPosition: val })}
              disabled={icon === 'none'}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">
                  <span className="flex items-center gap-1.5">
                    <ArrowLeft className="w-3 h-3" /> Left
                  </span>
                </SelectItem>
                <SelectItem value="right">
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3" /> Right
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Badge Settings */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Badge Settings</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Variant</Label>
            <Select 
              value={badgeStyles.variant} 
              onValueChange={(val) => updateBadgeStyles({ variant: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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

        <div className="grid grid-cols-2 gap-2">
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

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Style</Label>
            <Select 
              value={badgeStyles.borderStyle} 
              onValueChange={(val) => updateBadgeStyles({ borderStyle: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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
            <Label className="text-[9px] text-muted-foreground">Border Radius</Label>
            <Select 
              value={badgeStyles.borderRadius} 
              onValueChange={(val) => updateBadgeStyles({ borderRadius: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Border Color</Label>
            <ColorPicker
              value={badgeStyles.borderColor}
              onChange={(val) => updateBadgeStyles({ borderColor: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Width</Label>
            <Input
              type="number"
              value={badgeStyles.borderWidth}
              onChange={(e) => updateBadgeStyles({ borderWidth: e.target.value })}
              className="h-6 text-[10px] bg-muted text-foreground"
              min="0"
              max="8"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Font Weight</Label>
            <Select 
              value={badgeStyles.fontWeight} 
              onValueChange={(val) => updateBadgeStyles({ fontWeight: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
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
            <Label className="text-[9px] text-muted-foreground">Letter Spacing</Label>
            <Input
              type="number"
              value={badgeStyles.letterSpacing}
              onChange={(e) => updateBadgeStyles({ letterSpacing: e.target.value })}
              className="h-6 text-[10px] bg-muted text-foreground"
              min="-2"
              max="8"
              step="0.5"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Link Settings */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Link</Label>
        
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">URL (optional)</Label>
            <div className="relative">
              <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                value={linkUrl}
                onChange={(e) => updateProps({ linkUrl: e.target.value })}
                className="h-7 text-[10px] bg-muted text-foreground pl-7"
                placeholder="https://..."
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Checkbox
              id="openInNewTab"
              checked={openInNewTab}
              onCheckedChange={(checked) => updateProps({ openInNewTab: !!checked })}
              disabled={!linkUrl}
            />
            <Label htmlFor="openInNewTab" className="text-[9px] text-muted-foreground cursor-pointer">
              Open in new tab
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
