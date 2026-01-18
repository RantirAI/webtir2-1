import React from 'react';
import { Plus, ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
    iconPosition: 'right',
    iconStyle: 'chevron',
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
    const sectionNum = accordionItems.length + 1;
    const headingId = generateId();
    
    const newItem: ComponentInstance = {
      id: generateId(),
      type: 'AccordionItem',
      label: `Section ${sectionNum}`,
      props: { defaultOpen: false },
      children: [
        {
          id: headingId,
          type: 'Heading',
          label: 'Section Title',
          props: { children: `Section ${sectionNum}`, level: 'h3' },
          children: [],
          styleSourceIds: [],
        }
      ],
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
    </div>
  );
};
