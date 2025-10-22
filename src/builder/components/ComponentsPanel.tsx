import React, { useState, useMemo } from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance } from '../store/types';
import { generateId } from '../utils/instance';
import * as Icons from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search, ChevronDown } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
      className="group w-full h-20 flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border border-border bg-zinc-50 dark:bg-zinc-800 hover:bg-accent hover:border-primary hover:shadow-lg transition-all duration-200 text-center cursor-grab active:cursor-grabbing active:scale-95 hover:scale-[1.03]"
    >
      {IconComponent && <IconComponent className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors" />}
      <span className="text-[9px] leading-tight font-medium text-foreground line-clamp-2">{label}</span>
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
    
    // Create default children for RichText component
    const defaultChildren: ComponentInstance[] = [];
    if (type === 'RichText') {
      const headingId = generateId();
      const textId = generateId();
      const blockquoteId = generateId();
      const orderedListId = generateId();
      const unorderedListId = generateId();
      
      defaultChildren.push(
        {
          id: headingId,
          type: 'Heading',
          label: 'Heading',
          props: { level: 'h2', children: 'Heading 2' },
          styleSourceIds: [],
          children: [],
        },
        {
          id: `${headingId}-2`,
          type: 'Heading',
          label: 'Heading',
          props: { level: 'h3', children: 'Heading 3' },
          styleSourceIds: [],
          children: [],
        },
        {
          id: `${headingId}-3`,
          type: 'Heading',
          label: 'Heading',
          props: { level: 'h4', children: 'Heading 4' },
          styleSourceIds: [],
          children: [],
        },
        {
          id: `${headingId}-4`,
          type: 'Heading',
          label: 'Heading',
          props: { level: 'h5', children: 'Heading 5' },
          styleSourceIds: [],
          children: [],
        },
        {
          id: `${headingId}-5`,
          type: 'Heading',
          label: 'Heading',
          props: { level: 'h6', children: 'Heading 6' },
          styleSourceIds: [],
          children: [],
        },
        {
          id: textId,
          type: 'Text',
          label: 'Text',
          props: { children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.' },
          styleSourceIds: [],
          children: [],
        },
        {
          id: blockquoteId,
          type: 'Blockquote',
          label: 'Blockquote',
          props: { children: 'Block quote' },
          styleSourceIds: [],
          children: [],
        },
        {
          id: orderedListId,
          type: 'OrderedList',
          label: 'Numbered List',
          props: { items: ['Item 1', 'Item 2', 'Item 3'] },
          styleSourceIds: [],
          children: [],
        },
        {
          id: unorderedListId,
          type: 'UnorderedList',
          label: 'Bulleted List',
          props: { items: ['Item A', 'Item B', 'Item C'] },
          styleSourceIds: [],
          children: [],
        }
      );
    }
    
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
      children: defaultChildren,
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
  const [activeSubTab, setActiveSubTab] = useState('elements');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    'Layouts': true,
    'Typography': true,
    'Media': true,
    'Forms': true,
    'Data': true,
    'Navigation': true,
    'Charts': true,
    'Presentation': true,
    'Advanced Inputs': true,
    'Containers': true,
    'Interactive': true,
    'Localization': true,
  });

  // Basic components (foundational UI)
  const basicCategories = [
    { 
      name: 'Layouts', 
      types: ['Section', 'Container', 'Box'] 
    },
    { 
      name: 'Typography', 
      types: ['Heading', 'Text', 'RichText', 'Blockquote', 'OrderedList', 'UnorderedList', 'CodeBlock'] 
    },
    { 
      name: 'Media', 
      types: ['Image', 'Link'] 
    },
    { 
      name: 'Forms', 
      types: ['Form', 'FormButton', 'InputLabel', 'TextInput', 'TextArea', 'Select', 'RadioGroup', 'CheckboxField'] 
    },
    { 
      name: 'Data', 
      types: ['Table', 'KeyValue'] 
    },
    { 
      name: 'Navigation', 
      types: ['Navigation', 'Button'] 
    },
  ];

  // Advanced components (extended elements)
  const advancedCategories = [
    { 
      name: 'Charts', 
      types: ['BarChart', 'LineChart', 'PieChart', 'MixedChart', 'BubbleChart', 'FunnelChart', 'HeatMap', 'PlotlyJSONChart', 'SankeyChart', 'ScatterChart', 'Sparkline', 'StackedBarChart', 'SunburstChart', 'Treemap', 'WaterfallChart'] 
    },
    { 
      name: 'Presentation', 
      types: ['Alert', 'Avatar', 'AvatarGroup', 'Calendar', 'CircularImage', 'Divider', 'EventList', 'Icon', 'IconText', 'ImageGrid', 'PDF', 'ProgressBar', 'ProgressCircle', 'QRCode', 'Spacer', 'Statistic', 'Status', 'Tags', 'Timeline', 'Video'] 
    },
    { 
      name: 'Advanced Inputs', 
      types: ['EditableText', 'EditableTextArea', 'Email', 'JSONEditor', 'Password', 'RichTextEditor', 'URL', 'NumberInput'] 
    },
    { 
      name: 'Containers', 
      types: ['TabbedContainer', 'Sheet', 'Dialog', 'Collapsible', 'Accordion'] 
    },
    { 
      name: 'Interactive', 
      types: ['NavigationMenu', 'Tabs', 'Popover', 'Tooltip', 'Switch'] 
    },
    { 
      name: 'Localization', 
      types: ['Time'] 
    },
  ];

  // Filter categories based on search
  const filteredBasicCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return basicCategories;

    const searchLower = debouncedSearch.toLowerCase();
    return basicCategories
      .map(category => ({
        ...category,
        types: category.types.filter(type => {
          const component = componentRegistry[type];
          return component?.label.toLowerCase().includes(searchLower);
        }),
      }))
      .filter(category => category.types.length > 0);
  }, [debouncedSearch]);

  const filteredAdvancedCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return advancedCategories;

    const searchLower = debouncedSearch.toLowerCase();
    return advancedCategories
      .map(category => ({
        ...category,
        types: category.types.filter(type => {
          const component = componentRegistry[type];
          return component?.label.toLowerCase().includes(searchLower);
        }),
      }))
      .filter(category => category.types.length > 0);
  }, [debouncedSearch]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const renderCategorySection = (categories: typeof basicCategories) => (
    <div className="space-y-2">
      {categories.map((category) => {
        const components = category.types
          .map(type => componentRegistry[type])
          .filter(Boolean);
        
        if (components.length === 0) return null;
        
        return (
          <Collapsible
            key={category.name}
            open={openCategories[category.name]}
            onOpenChange={() => toggleCategory(category.name)}
            className="animate-fade-in"
          >
            <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5 transition-colors">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.5px]">
                {category.name}
              </h3>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openCategories[category.name] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-2">
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
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 pb-1.5 shrink-0">
        {/* Search input */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* Subtabs */}
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="w-full grid grid-cols-2 h-8 bg-muted/30">
            <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
            <TabsTrigger value="blocks" className="text-xs">Blocks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {activeSubTab === 'elements' ? (
          <>
            {renderCategorySection(filteredBasicCategories)}
            {filteredBasicCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No elements found</p>
                <p className="text-xs text-muted-foreground/70">Try a different search term</p>
              </div>
            )}
          </>
        ) : (
          <>
            {renderCategorySection(filteredAdvancedCategories)}
            {filteredAdvancedCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No blocks found</p>
                <p className="text-xs text-muted-foreground/70">Try a different search term</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};