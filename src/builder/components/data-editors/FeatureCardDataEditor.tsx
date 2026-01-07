import React, { useState, useMemo } from 'react';
import { Search, icons } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface FeatureCardDataEditorProps {
  instance: ComponentInstance;
}

// Get icon component from lucide-react icons object
const Icon = ({ name, size = 16 }: { name: string; size?: number }) => {
  const LucideIcon = icons[name as keyof typeof icons];
  if (!LucideIcon) {
    return <div className="w-4 h-4 bg-muted rounded" />;
  }
  return <LucideIcon size={size} />;
};

// Popular icons for quick selection
const popularIcons = [
  'Star', 'Heart', 'Zap', 'Shield', 'Rocket', 'Target',
  'TrendingUp', 'CheckCircle', 'Award', 'Gift', 'Lightbulb', 'Compass',
  'Cpu', 'Database', 'Globe', 'Lock', 'Settings', 'Users',
  'Sparkles', 'Crown', 'Flame', 'Gem', 'Infinity', 'Layers'
];

export const FeatureCardDataEditor: React.FC<FeatureCardDataEditorProps> = ({ instance }) => {
  const { updateInstance, findInstance } = useBuilderStore();
  const [iconSearch, setIconSearch] = useState('');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Get child instances
  const iconChild = instance.children?.[0];
  const headingChild = instance.children?.[1];
  const textChild = instance.children?.[2];

  // Get current values
  const currentIcon = instance.props?.icon || 'star';
  const title = headingChild?.props?.children || 'Feature Title';
  const description = textChild?.props?.children || 'Describe your feature here.';
  const linkUrl = instance.props?.linkUrl || '';
  const linkTarget = instance.props?.linkTarget || '_self';

  // Filter icons based on search
  const allIconNames = Object.keys(icons);
  const filteredIcons = useMemo(() => {
    if (!iconSearch) return popularIcons;
    const search = iconSearch.toLowerCase();
    return allIconNames.filter(name => name.toLowerCase().includes(search)).slice(0, 48);
  }, [iconSearch, allIconNames]);

  const updateCardProp = (prop: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const updateTitle = (value: string) => {
    if (!headingChild) return;
    updateInstance(headingChild.id, {
      props: { ...headingChild.props, children: value }
    });
  };

  const updateDescription = (value: string) => {
    if (!textChild) return;
    updateInstance(textChild.id, {
      props: { ...textChild.props, children: value }
    });
  };

  const selectIcon = (iconName: string) => {
    updateCardProp('icon', iconName);
    setIconPickerOpen(false);
    setIconSearch('');
  };

  return (
    <div className="space-y-3">
      {/* Icon Selection */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium">Icon</Label>
        <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-8 justify-start gap-2 text-[10px]"
            >
              <Icon name={currentIcon} size={16} />
              <span className="flex-1 text-left truncate">{currentIcon}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-2" align="start">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="h-7 pl-7 text-[10px]"
                />
              </div>
              <ScrollArea className="h-[200px]">
                <div className="grid grid-cols-6 gap-1">
                  {filteredIcons.map((iconName) => (
                    <button
                      key={iconName}
                      onClick={() => selectIcon(iconName)}
                      className={`p-2 rounded hover:bg-accent flex items-center justify-center ${
                        currentIcon === iconName ? 'bg-accent ring-1 ring-primary' : ''
                      }`}
                      title={iconName}
                    >
                      <Icon name={iconName} size={16} />
                    </button>
                  ))}
                </div>
                {filteredIcons.length === 0 && (
                  <p className="text-[10px] text-muted-foreground text-center py-4">
                    No icons found
                  </p>
                )}
              </ScrollArea>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium">Title</Label>
        <Input
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Feature title..."
          className="h-7 text-[10px]"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="Describe your feature..."
          className="text-[10px] min-h-[60px] resize-none"
          rows={3}
        />
      </div>

      {/* Link Settings */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Label className="text-[10px] font-medium">Link (Optional)</Label>
        <Input
          value={linkUrl}
          onChange={(e) => updateCardProp('linkUrl', e.target.value)}
          placeholder="https://..."
          className="h-7 text-[10px]"
        />
        <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Checkbox
            checked={linkTarget === '_blank'}
            onCheckedChange={(checked) => updateCardProp('linkTarget', checked ? '_blank' : '_self')}
            className="w-3 h-3"
          />
          Open in new tab
        </label>
      </div>
    </div>
  );
};
