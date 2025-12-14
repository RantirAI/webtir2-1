import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
            className="h-8 text-[11px] bg-muted text-foreground"
            placeholder="Badge text"
          />
        </div>
      </div>

      <Separator />

      {/* Icon Settings */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Icon</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Icon</Label>
            <Select value={icon} onValueChange={(val) => updateProps({ icon: val })}>
              <SelectTrigger className="h-8 text-[10px] bg-[hsl(var(--muted))] text-foreground">
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
              <SelectTrigger className="h-8 text-[10px] bg-[hsl(var(--muted))] text-foreground">
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
                className="h-8 text-[11px] bg-muted text-foreground pl-7"
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