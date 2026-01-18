import React from 'react';
import { Plus, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { generateId } from '../../utils/instance';

interface AccordionDataEditorProps {
  instance: ComponentInstance;
}

export const AccordionDataEditor: React.FC<AccordionDataEditorProps> = ({ instance }) => {
  const { updateInstance, addInstance } = useBuilderStore();
  
  // Count accordion item children
  const accordionItems = instance.children.filter(c => c.type === 'AccordionItem');

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

  const updateAccordionStyles = (updates: Partial<typeof accordionStyles>) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        accordionStyles: { ...accordionStyles, ...updates }
      }
    });
  };

  const addSection = () => {
    const newItem: ComponentInstance = {
      id: generateId(),
      type: 'AccordionItem',
      label: `Section ${accordionItems.length + 1}`,
      props: { 
        title: `Section ${accordionItems.length + 1}`, 
        defaultOpen: false 
      },
      children: [],
      styleSourceIds: [],
    };
    addInstance(newItem, instance.id);
  };

  return (
    <div className="space-y-3">
      {/* Accordion Sections Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-foreground">Accordion Sections</label>
          <span className="text-[9px] text-muted-foreground">{accordionItems.length} sections</span>
        </div>
        
        <div className="p-3 bg-muted/30 rounded-lg border border-border">
          <p className="text-[10px] text-muted-foreground mb-2">
            Sections are managed via the Navigator tree. Drag elements into each section to add content.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={addSection}
            className="h-7 w-full text-[10px]"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Section
          </Button>
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
