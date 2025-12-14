import React from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from '../ColorPicker';
import { ChevronDown, ChevronRight, ChevronUp, Plus, Minus, ArrowRight, ArrowDown } from 'lucide-react';

interface AccordionStyleEditorProps {
  instance: ComponentInstance;
}

export const AccordionStyleEditor: React.FC<AccordionStyleEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  
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

  return (
    <div className="space-y-4">
      {/* Orientation & Collapse */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Orientation</Label>
          <Select 
            value={accordionStyles.orientation} 
            onValueChange={(val) => updateAccordionStyles({ orientation: val })}
          >
            <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
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
            <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="multiple">Multiple</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Trigger Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Trigger</Label>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Background</Label>
              <ColorPicker
                value={accordionStyles.triggerBackground}
                onChange={(val) => updateAccordionStyles({ triggerBackground: val })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Hover Background</Label>
              <ColorPicker
                value={accordionStyles.triggerHoverBackground}
                onChange={(val) => updateAccordionStyles({ triggerHoverBackground: val })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Active Background</Label>
              <ColorPicker
                value={accordionStyles.triggerActiveBackground}
                onChange={(val) => updateAccordionStyles({ triggerActiveBackground: val })}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Text Color</Label>
              <ColorPicker
                value={accordionStyles.triggerTextColor}
                onChange={(val) => updateAccordionStyles({ triggerTextColor: val })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Icon Position</Label>
              <Select 
                value={accordionStyles.iconPosition} 
                onValueChange={(val) => updateAccordionStyles({ iconPosition: val })}
              >
                <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
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
                <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chevron">
                    <span className="flex items-center gap-1.5">
                      <ChevronDown className="w-3 h-3" /> Chevron
                    </span>
                  </SelectItem>
                  <SelectItem value="plus-minus">
                    <span className="flex items-center gap-1.5">
                      <Plus className="w-3 h-3" /> Plus/Minus
                    </span>
                  </SelectItem>
                  <SelectItem value="arrow">
                    <span className="flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3" /> Arrow
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Content Styling */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Content</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Background</Label>
            <ColorPicker
              value={accordionStyles.contentBackground}
              onChange={(val) => updateAccordionStyles({ contentBackground: val })}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Padding (px)</Label>
            <Input
              type="number"
              value={accordionStyles.contentPadding}
              onChange={(e) => updateAccordionStyles({ contentPadding: e.target.value })}
              className="h-7 text-[10px] bg-muted text-foreground"
              min="0"
              max="64"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Animation Duration (ms)</Label>
          <Input
            type="number"
            value={accordionStyles.animationDuration}
            onChange={(e) => updateAccordionStyles({ animationDuration: e.target.value })}
            className="h-7 text-[10px] bg-muted text-foreground"
            min="0"
            max="1000"
            step="50"
          />
        </div>
      </div>

      <Separator />

      {/* Borders & Dividers */}
      <div className="space-y-2">
        <Label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Dividers</Label>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[9px] text-muted-foreground">Divider Style</Label>
            <Select 
              value={accordionStyles.dividerStyle} 
              onValueChange={(val) => updateAccordionStyles({ dividerStyle: val })}
            >
              <SelectTrigger className="h-7 text-[10px] bg-[hsl(var(--muted))] text-foreground">
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
            <Label className="text-[9px] text-muted-foreground">Divider Color</Label>
            <ColorPicker
              value={accordionStyles.dividerColor}
              onChange={(val) => updateAccordionStyles({ dividerColor: val })}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <Label className="text-[9px] text-muted-foreground">Container Border Radius (px)</Label>
          <Input
            type="number"
            value={accordionStyles.outerBorderRadius}
            onChange={(e) => updateAccordionStyles({ outerBorderRadius: e.target.value })}
            className="h-7 text-[10px] bg-muted text-foreground"
            min="0"
            max="32"
          />
        </div>
      </div>
    </div>
  );
};
