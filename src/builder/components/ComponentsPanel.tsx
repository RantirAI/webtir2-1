import React, { useState, useMemo } from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance } from '../store/types';
import { generateId } from '../utils/instance';
import * as Icons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

const DraggableComponent: React.FC<{ type: string; label: string; icon: string }> = ({ type, label, icon }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${type}`,
    data: { type, label },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = Icons[icon as keyof typeof Icons] as any;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group w-full aspect-square flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary hover:shadow-lg transition-all duration-200 text-center cursor-grab active:cursor-grabbing active:scale-95 hover:scale-[1.03]"
    >
      {IconComponent && <IconComponent className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />}
      <span className="text-[9px] leading-tight font-medium text-foreground">{label}</span>
    </button>
  );
};

export const ComponentsPanel: React.FC = () => {
  const addInstance = useBuilderStore((state) => state.addInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);

  const handleAddComponent = (type: string) => {
    const meta = componentRegistry[type];
    if (!meta) return;

    const newId = generateId();
    
    // Only create style source with default styles for Button component
    let styleSourceId: string | undefined;
    if (type === 'Button' && meta.defaultStyles && Object.keys(meta.defaultStyles).length > 0) {
      const { createStyleSource, setStyle } = useStyleStore.getState();
      // Use "button" as the class name for Button components
      styleSourceId = createStyleSource('local', 'button');
      
      // Apply default styles
      Object.entries(meta.defaultStyles).forEach(([property, value]) => {
        setStyle(styleSourceId!, property, value);
      });
    }

    const newInstance: ComponentInstance = {
      id: newId,
      type: meta.type,
      label: meta.label,
      props: { ...meta.defaultProps },
      styleSourceIds: styleSourceId ? [styleSourceId] : [],
      children: [],
    };

    // Add to selected instance if it's a container type, otherwise add to root
    const selectedType = useBuilderStore.getState().getSelectedInstance()?.type;
    const parentId = selectedInstanceId && (selectedType === 'Box' || selectedType === 'Container' || selectedType === 'Section')
      ? selectedInstanceId 
      : 'root';
    
    addInstance(newInstance, parentId);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Group components by category - Commonly Used is always first
  const categories = [
    { 
      name: 'Commonly Used', 
      types: ['Table', 'Text', 'Button', 'TextInput', 'NumberInput', 'Select', 'Container', 'Form', 'TabbedContainer', 'MixedChart', 'KeyValue', 'Image', 'Navigation'],
      pinned: true 
    },
    { 
      name: 'Text Inputs', 
      types: ['EditableText', 'EditableTextArea', 'Email', 'JSONEditor', 'Password', 'RichTextEditor', 'TextArea', 'TextInput', 'URL'] 
    },
    { 
      name: 'Charts', 
      types: ['BarChart', 'BubbleChart', 'FunnelChart', 'HeatMap', 'LineChart', 'MixedChart', 'PieChart', 'PlotlyJSONChart', 'SankeyChart', 'ScatterChart', 'Sparkline', 'StackedBarChart', 'SunburstChart', 'Treemap', 'WaterfallChart'] 
    },
    { 
      name: 'Presentation', 
      types: ['Alert', 'Avatar', 'AvatarGroup', 'Calendar', 'CircularImage', 'Divider', 'EventList', 'Icon', 'IconText', 'Image', 'ImageGrid', 'PDF', 'ProgressBar', 'ProgressCircle', 'QRCode', 'Spacer', 'Statistic', 'Status', 'Tags', 'Text', 'Timeline', 'Video'] 
    },
    { 
      name: 'Layout', 
      types: ['Container', 'Section', 'Box'] 
    },
    { 
      name: 'Typography', 
      types: ['Heading', 'Text'] 
    },
    { 
      name: 'Forms', 
      types: ['Form', 'Button', 'InputLabel', 'TextInput', 'TextArea', 'Select', 'Radio', 'Checkbox'] 
    },
    { 
      name: 'Localization', 
      types: ['Time'] 
    },
    { 
      name: 'Radix', 
      types: ['Sheet', 'NavigationMenu', 'Tabs', 'Accordion', 'Dialog', 'Collapsible', 'Popover', 'Tooltip', 'Select', 'Switch', 'RadioGroup', 'Checkbox', 'Label'] 
    },
  ];

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return categories;

    const searchLower = debouncedSearch.toLowerCase();
    return categories
      .map(category => ({
        ...category,
        types: category.types.filter(type => {
          const component = componentRegistry[type];
          return component?.label.toLowerCase().includes(searchLower);
        }),
      }))
      .filter(category => category.types.length > 0);
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 pb-2 flex-shrink-0">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 space-y-5 pb-6">
          {/* Categories */}
          {filteredCategories.map((category) => {
            const components = category.types
              .map(type => componentRegistry[type])
              .filter(Boolean);
            
            if (components.length === 0) return null;
            
            return (
              <div key={category.name} className="space-y-2.5 animate-fade-in">
                <div className="flex items-center gap-2 sticky top-0 bg-background/95 backdrop-blur-sm py-1 -mx-4 px-4 z-10">
                  <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                    {category.name}
                  </h3>
                  <div className="flex-1 h-px bg-border/50"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {components.map((component) => (
                    <div 
                      key={component.type} 
                      onDoubleClick={() => handleAddComponent(component.type)}
                      className="animate-scale-in"
                    >
                      <DraggableComponent type={component.type} label={component.label} icon={component.icon} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <Search className="w-8 h-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No components found</p>
              <p className="text-xs text-muted-foreground/70">Try a different search term</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
