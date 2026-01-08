import React from 'react';
import { Plus, X, GripVertical, ChevronDown, ChevronRight, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}

interface AccordionDataEditorProps {
  instance: ComponentInstance;
}

export const AccordionDataEditor: React.FC<AccordionDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const items: AccordionItem[] = instance.props?.items || [
    { id: '1', title: 'Item 1', content: 'Content for item 1', defaultOpen: true },
    { id: '2', title: 'Item 2', content: 'Content for item 2' },
    { id: '3', title: 'Item 3', content: 'Content for item 3' },
  ];

  // Get current accordion style props with defaults
  const accordionStyles = instance.props?.accordionStyles || {
    orientation: 'vertical',
    collapseMode: 'single',
    triggerBackground: 'transparent',
    triggerHoverBackground: 'hsl(var(--muted))',
    triggerActiveBackground: 'hsl(var(--muted))',
    triggerTextColor: 'hsl(var(--foreground))',
    iconPosition: 'right',
    iconStyle: 'chevron',
    contentBackground: 'transparent',
    contentPadding: '16',
    animationDuration: '200',
    dividerStyle: 'solid',
    dividerColor: 'hsl(var(--border))',
    outerBorderRadius: '8',
  };

  const updateItems = (newItems: AccordionItem[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, items: newItems }
    });
  };

  const updateAccordionStyles = (updates: Partial<typeof accordionStyles>) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        accordionStyles: { ...accordionStyles, ...updates }
      }
    });
  };

  const addItem = () => {
    const newItem: AccordionItem = {
      id: Date.now().toString(),
      title: `Item ${items.length + 1}`,
      content: `Content for item ${items.length + 1}`,
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof AccordionItem, value: string | boolean) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateItems(newItems);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    updateItems(items.filter(item => item.id !== id));
  };

  const [expandedId, setExpandedId] = React.useState<string | null>(items[0]?.id || null);

  return (
    <div className="space-y-3">
      {/* Accordion Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-foreground">Accordion Items</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addItem}
            className="h-5 px-1.5 text-[9px]"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Add
          </Button>
        </div>
        
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="border border-border rounded bg-muted/30">
              <div 
                className="flex items-center gap-1 p-1.5 cursor-pointer hover:bg-muted/50"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
                {expandedId === item.id ? (
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                )}
                <span className="flex-1 text-[10px] truncate">{item.title || 'Untitled'}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                  }}
                  className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                  disabled={items.length <= 1}
                >
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>
              
              {expandedId === item.id && (
                <div className="p-2 pt-0 space-y-2 border-t border-border">
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground">Title</label>
                    <Input
                      value={item.title}
                      onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                      className="h-5 text-[10px]"
                      placeholder="Accordion title"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] text-muted-foreground">Content</label>
                    <Textarea
                      value={item.content}
                      onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                      className="text-[10px] min-h-[60px] resize-none"
                      placeholder="Accordion content..."
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-[9px]">
                    <input
                      type="checkbox"
                      checked={item.defaultOpen || false}
                      onChange={(e) => updateItem(item.id, 'defaultOpen', e.target.checked)}
                      className="w-3 h-3"
                    />
                    Default open
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Accordion Settings */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Accordion Settings</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Orientation</Label>
            <Select 
              value={accordionStyles.orientation} 
              onValueChange={(val) => updateAccordionStyles({ orientation: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">
                  <span className="flex items-center gap-1.5">
                    <ArrowDown className="w-3 h-3" /> Vertical
                  </span>
                </SelectItem>
                <SelectItem value="horizontal">
                  <span className="flex items-center gap-1.5">
                    <ArrowRight className="w-3 h-3" /> Horizontal
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Collapse Mode</Label>
            <Select 
              value={accordionStyles.collapseMode} 
              onValueChange={(val) => updateAccordionStyles({ collapseMode: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="multiple">Multiple</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Icon Position</Label>
            <Select 
              value={accordionStyles.iconPosition} 
              onValueChange={(val) => updateAccordionStyles({ iconPosition: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Icon Style</Label>
            <Select 
              value={accordionStyles.iconStyle} 
              onValueChange={(val) => updateAccordionStyles({ iconStyle: val })}
            >
              <SelectTrigger className="h-6 text-[10px] bg-muted text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chevron">Chevron</SelectItem>
                <SelectItem value="plus-minus">Plus/Minus</SelectItem>
                <SelectItem value="arrow">Arrow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Appearance */}
      <div className="space-y-3">
        <Label className="text-[10px] font-medium text-foreground">Appearance</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Trigger Bg</Label>
            <ColorPicker
              value={accordionStyles.triggerBackground}
              onChange={(val) => updateAccordionStyles({ triggerBackground: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Hover Bg</Label>
            <ColorPicker
              value={accordionStyles.triggerHoverBackground}
              onChange={(val) => updateAccordionStyles({ triggerHoverBackground: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Active Bg</Label>
            <ColorPicker
              value={accordionStyles.triggerActiveBackground}
              onChange={(val) => updateAccordionStyles({ triggerActiveBackground: val })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Text Color</Label>
            <ColorPicker
              value={accordionStyles.triggerTextColor}
              onChange={(val) => updateAccordionStyles({ triggerTextColor: val })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Content Bg</Label>
            <ColorPicker
              value={accordionStyles.contentBackground}
              onChange={(val) => updateAccordionStyles({ contentBackground: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Content Padding</Label>
            <Input
              type="number"
              value={accordionStyles.contentPadding}
              onChange={(e) => updateAccordionStyles({ contentPadding: e.target.value })}
              className="h-6 text-[10px] bg-muted text-foreground"
              min="0"
              max="64"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Divider Style</Label>
            <Select 
              value={accordionStyles.dividerStyle} 
              onValueChange={(val) => updateAccordionStyles({ dividerStyle: val })}
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
          <div className="flex items-center justify-between">
            <Label className="text-[9px] text-muted-foreground">Divider Color</Label>
            <ColorPicker
              value={accordionStyles.dividerColor}
              onChange={(val) => updateAccordionStyles({ dividerColor: val })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Border Radius (px)</Label>
            <Input
              type="number"
              value={accordionStyles.outerBorderRadius}
              onChange={(e) => updateAccordionStyles({ outerBorderRadius: e.target.value })}
              className="h-6 text-[10px] bg-muted text-foreground"
              min="0"
              max="32"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Animation (ms)</Label>
            <Input
              type="number"
              value={accordionStyles.animationDuration}
              onChange={(e) => updateAccordionStyles({ animationDuration: e.target.value })}
              className="h-6 text-[10px] bg-muted text-foreground"
              min="0"
              max="1000"
              step="50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
