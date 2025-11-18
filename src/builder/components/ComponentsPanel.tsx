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
    
    // Create composite structure for Navigation
    if (type === 'Navigation') {
      const containerId = generateId();
      const logoBoxId = generateId();
      const logoImageId = generateId();
      const linksBoxId = generateId();
      const link1Id = generateId();
      const link2Id = generateId();
      const link3Id = generateId();
      const buttonBoxId = generateId();
      const buttonId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      
      const containerStyleId = createStyleSource('local', `nav-${containerId}`);
      setStyle(containerStyleId, 'display', 'flex');
      setStyle(containerStyleId, 'flexDirection', 'row');
      setStyle(containerStyleId, 'alignItems', 'center');
      setStyle(containerStyleId, 'justifyContent', 'space-between');
      setStyle(containerStyleId, 'padding', '16px');
      setStyle(containerStyleId, 'backgroundColor', 'hsl(var(--background))');
      setStyle(containerStyleId, 'borderBottom', '1px solid hsl(var(--border))');
      
      const logoBoxStyleId = createStyleSource('local', `logo-${logoBoxId}`);
      setStyle(logoBoxStyleId, 'display', 'flex');
      setStyle(logoBoxStyleId, 'alignItems', 'center');
      
      const logoImageStyleId = createStyleSource('local', `img-${logoImageId}`);
      setStyle(logoImageStyleId, 'width', '120px');
      setStyle(logoImageStyleId, 'height', 'auto');
      
      const linksBoxStyleId = createStyleSource('local', `links-${linksBoxId}`);
      setStyle(linksBoxStyleId, 'display', 'flex');
      setStyle(linksBoxStyleId, 'gap', '24px');
      setStyle(linksBoxStyleId, 'alignItems', 'center');
      
      const linkStyleId = createStyleSource('local', `link-${link1Id}`);
      setStyle(linkStyleId, 'color', 'hsl(var(--foreground))');
      setStyle(linkStyleId, 'textDecoration', 'none');
      
      const container: ComponentInstance = {
        id: containerId,
        type: 'Box',
        label: 'Navigation',
        props: {},
        styleSourceIds: [containerStyleId],
        children: [
          {
            id: logoBoxId,
            type: 'Box',
            label: 'Logo Container',
            props: {},
            styleSourceIds: [logoBoxStyleId],
            children: [
              {
                id: logoImageId,
                type: 'Image',
                label: 'Logo',
                props: { src: 'https://via.placeholder.com/120x40', alt: 'Logo' },
                styleSourceIds: [logoImageStyleId],
                children: [],
              },
            ],
          },
          {
            id: linksBoxId,
            type: 'Box',
            label: 'Navigation Links',
            props: {},
            styleSourceIds: [linksBoxStyleId],
            children: [
              { id: link1Id, type: 'Link', label: 'Home Link', props: { href: '#', children: 'Home' }, styleSourceIds: [linkStyleId], children: [] },
              { id: link2Id, type: 'Link', label: 'About Link', props: { href: '#', children: 'About' }, styleSourceIds: [linkStyleId], children: [] },
              { id: link3Id, type: 'Link', label: 'Contact Link', props: { href: '#', children: 'Contact' }, styleSourceIds: [linkStyleId], children: [] },
            ],
          },
          {
            id: buttonBoxId,
            type: 'Box',
            label: 'Button Container',
            props: {},
            styleSourceIds: [],
            children: [{ id: buttonId, type: 'FormButton', label: 'CTA Button', props: { text: 'Get Started' }, styleSourceIds: [], children: [] }],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
    // InputLabel
    if (type === 'InputLabel') {
      const inputLabelInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
      };
      addInstance(inputLabelInstance, selectedInstanceId || 'root');
      return;
    }
    
    // TextInput
    if (type === 'TextInput') {
      const textInputInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
      };
      addInstance(textInputInstance, selectedInstanceId || 'root');
      return;
    }
    
    // TextArea
    if (type === 'TextArea') {
      const textAreaInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
      };
      addInstance(textAreaInstance, selectedInstanceId || 'root');
      return;
    }
    
    // Select
    if (type === 'Select') {
      const selectInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
      };
      addInstance(selectInstance, selectedInstanceId || 'root');
      return;
    }
    
    // RadioGroup
    if (type === 'RadioGroup') {
      const radioGroupInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
      };
      addInstance(radioGroupInstance, selectedInstanceId || 'root');
      return;
    }
    
    // CheckboxField
    if (type === 'CheckboxField') {
      const checkboxFieldInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
      };
      addInstance(checkboxFieldInstance, selectedInstanceId || 'root');
      return;
    }
    
    // Table
    if (type === 'Table') {
      const tableInstance: ComponentInstance = {
        id: newId,
        type: meta.type,
        label: meta.label,
        props: { ...meta.defaultProps },
        styleSourceIds: [],
        children: [],
      };
      addInstance(tableInstance, selectedInstanceId || 'root');
      return;
    }
    
    // Create default children for RichText component
    const defaultChildren: ComponentInstance[] = [];
    if (type === 'RichText') {
      const headingId = generateId();
      defaultChildren.push(
        { id: headingId, type: 'Heading', label: 'Heading', props: { level: 'h2', children: 'Heading 2' }, styleSourceIds: [], children: [] },
        { id: `${headingId}-2`, type: 'Heading', label: 'Heading', props: { level: 'h3', children: 'Heading 3' }, styleSourceIds: [], children: [] },
        { id: generateId(), type: 'Text', label: 'Text', props: { children: 'This is a text paragraph.' }, styleSourceIds: [], children: [] }
      );
    }

    let styleSourceId: string | undefined;
    if (type === 'Button' && meta.defaultStyles) {
      const { createStyleSource, setStyle } = useStyleStore.getState();
      styleSourceId = createStyleSource('local', 'button');
      Object.entries(meta.defaultStyles).forEach(([property, value]) => {
        setStyle(styleSourceId!, property, value);
      });
    }

    const newInstance: ComponentInstance = {
      id: newId,
      type,
      label: meta.label,
      props: { ...meta.defaultProps },
      styleSourceIds: styleSourceId ? [styleSourceId] : [],
      children: defaultChildren,
    };

    addInstance(newInstance, selectedInstanceId || 'root');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('elements');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 'Layout': true, 'Typography': true, 'Media': true, 'Forms': true, 'Data': true });
  const debouncedSearch = useDebounce(searchQuery, 300);

  const basicCategories = [
    { name: 'Layout', types: ['Section', 'Container', 'Box'] },
    { name: 'Typography', types: ['Heading', 'Text', 'RichText', 'Button', 'Link'] },
    { name: 'Media', types: ['Image', 'Video', 'Youtube', 'Lottie'] },
    { name: 'Forms', types: ['Form', 'FormButton', 'InputLabel', 'TextInput', 'TextArea', 'Select', 'RadioGroup', 'CheckboxField'] },
    { name: 'Data', types: ['Table', 'KeyValue'] },
  ];

  const filteredBasicCategories = useMemo(() => {
    if (!debouncedSearch.trim()) return basicCategories;
    const searchLower = debouncedSearch.toLowerCase();
    return basicCategories.map(cat => ({ ...cat, types: cat.types.filter(t => componentRegistry[t]?.label.toLowerCase().includes(searchLower)) })).filter(cat => cat.types.length > 0);
  }, [debouncedSearch]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  const renderCategorySection = (categories: typeof basicCategories) => (
    <div className="space-y-2">
      {categories.map((category) => {
        const components = category.types.map(type => componentRegistry[type]).filter(Boolean);
        if (components.length === 0) return null;
        return (
          <Collapsible key={category.name} open={openCategories[category.name]} onOpenChange={() => toggleCategory(category.name)}>
            <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.5px]">{category.name}</h3>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openCategories[category.name] ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pb-2">
              <div className="grid grid-cols-3 gap-2">
                {components.map((component) => (
                  <div key={component.type} onDoubleClick={() => handleAddComponent(component.type)}>
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
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search components..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
        </div>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="w-full grid grid-cols-2 h-8 bg-muted/30">
            <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
            <TabsTrigger value="blocks" className="text-xs">Blocks</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto px-2 pb-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {activeSubTab === 'elements' ? (
          <>{renderCategorySection(filteredBasicCategories)}{filteredBasicCategories.length === 0 && (<div className="flex flex-col items-center justify-center py-12 text-center space-y-2"><Search className="w-8 h-8 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">No elements found</p></div>)}</>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-3"><Icons.Package className="w-12 h-12 text-muted-foreground/50" /><div className="space-y-1"><p className="text-sm font-medium text-foreground">Components Coming Soon</p><p className="text-xs text-muted-foreground">Pre-built component blocks will be available here</p></div></div>
        )}
      </div>
    </div>
  );
};

