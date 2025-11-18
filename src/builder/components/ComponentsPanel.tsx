import React, { useState, useMemo } from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance, ComponentType } from '../store/types';
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

    const parentId = selectedInstanceId || 'root';
    const newId = generateId();
    
    // NAVIGATION - Box wrapper with children
    if (type === 'Navigation') {
      const navId = generateId();
      const logoBoxId = generateId();
      const logoId = generateId();
      const linksBoxId = generateId();
      const link1Id = generateId();
      const link2Id = generateId();
      const link3Id = generateId();
      const buttonBoxId = generateId();
      const buttonId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      
      const navStyleId = createStyleSource('local', `nav-${navId}`);
      setStyle(navStyleId, 'display', 'flex');
      setStyle(navStyleId, 'flexDirection', 'row');
      setStyle(navStyleId, 'alignItems', 'center');
      setStyle(navStyleId, 'justifyContent', 'space-between');
      setStyle(navStyleId, 'padding', '16px 32px');
      setStyle(navStyleId, 'backgroundColor', 'hsl(var(--background))');
      setStyle(navStyleId, 'borderBottom', '1px solid hsl(var(--border))');
      setStyle(navStyleId, 'width', '100%');
      
      const logoBoxStyleId = createStyleSource('local', `logo-box-${logoBoxId}`);
      setStyle(logoBoxStyleId, 'display', 'flex');
      setStyle(logoBoxStyleId, 'alignItems', 'center');
      setStyle(logoBoxStyleId, 'gap', '8px');
      
      const linksBoxStyleId = createStyleSource('local', `links-box-${linksBoxId}`);
      setStyle(linksBoxStyleId, 'display', 'flex');
      setStyle(linksBoxStyleId, 'gap', '24px');
      setStyle(linksBoxStyleId, 'alignItems', 'center');
      
      const container: ComponentInstance = {
        id: navId,
        type: 'Box' as ComponentType,
        label: 'Navigation',
        props: {},
        styleSourceIds: [navStyleId],
        children: [
          {
            id: logoBoxId,
            type: 'Box' as ComponentType,
            label: 'Logo Container',
            props: {},
            styleSourceIds: [logoBoxStyleId],
            children: [
              {
                id: logoId,
                type: 'Image' as ComponentType,
                label: 'Logo',
                props: { src: '/placeholder.svg', alt: 'Logo' },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: linksBoxId,
            type: 'Box' as ComponentType,
            label: 'Navigation Links',
            props: {},
            styleSourceIds: [linksBoxStyleId],
            children: [
              {
                id: link1Id,
                type: 'Link' as ComponentType,
                label: 'Home Link',
                props: { href: '#', children: 'Home' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: link2Id,
                type: 'Link' as ComponentType,
                label: 'About Link',
                props: { href: '#', children: 'About' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: link3Id,
                type: 'Link' as ComponentType,
                label: 'Contact Link',
                props: { href: '#', children: 'Contact' },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: buttonBoxId,
            type: 'Box' as ComponentType,
            label: 'Button Container',
            props: {},
            styleSourceIds: [],
            children: [
              {
                id: buttonId,
                type: 'FormButton' as ComponentType,
                label: 'CTA Button',
                props: { text: 'Get Started', type: 'button' },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
        ],
      };
      
      addInstance(container, parentId);
      return;
    }
    
    // DROPDOWN - Box wrapper with Button and Menu
    if (type === 'Dropdown') {
      const dropdownId = generateId();
      const triggerId = generateId();
      const menuId = generateId();
      const item1Id = generateId();
      const item2Id = generateId();
      const item3Id = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      
      const dropdownStyleId = createStyleSource('local', `dropdown-${dropdownId}`);
      setStyle(dropdownStyleId, 'display', 'flex');
      setStyle(dropdownStyleId, 'flexDirection', 'column');
      setStyle(dropdownStyleId, 'position', 'relative');
      setStyle(dropdownStyleId, 'width', 'fit-content');
      
      const menuStyleId = createStyleSource('local', `menu-${menuId}`);
      setStyle(menuStyleId, 'display', 'flex');
      setStyle(menuStyleId, 'flexDirection', 'column');
      setStyle(menuStyleId, 'position', 'absolute');
      setStyle(menuStyleId, 'top', '100%');
      setStyle(menuStyleId, 'left', '0');
      setStyle(menuStyleId, 'marginTop', '4px');
      setStyle(menuStyleId, 'backgroundColor', 'hsl(var(--popover))');
      setStyle(menuStyleId, 'border', '1px solid hsl(var(--border))');
      setStyle(menuStyleId, 'borderRadius', '8px');
      setStyle(menuStyleId, 'padding', '8px');
      setStyle(menuStyleId, 'minWidth', '200px');
      setStyle(menuStyleId, 'boxShadow', '0 10px 15px -3px rgba(0, 0, 0, 0.1)');
      setStyle(menuStyleId, 'zIndex', '50');
      setStyle(menuStyleId, 'gap', '4px');
      
      const container: ComponentInstance = {
        id: dropdownId,
        type: 'Box' as ComponentType,
        label: 'Dropdown',
        props: {},
        styleSourceIds: [dropdownStyleId],
        children: [
          {
            id: triggerId,
            type: 'Button' as ComponentType,
            label: 'Trigger Button',
            props: { children: 'Open Menu' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: menuId,
            type: 'Box' as ComponentType,
            label: 'Menu',
            props: {},
            styleSourceIds: [menuStyleId],
            children: [
              {
                id: item1Id,
                type: 'Link' as ComponentType,
                label: 'Menu Item 1',
                props: { href: '#', children: 'Option 1' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: item2Id,
                type: 'Link' as ComponentType,
                label: 'Menu Item 2',
                props: { href: '#', children: 'Option 2' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: item3Id,
                type: 'Button' as ComponentType,
                label: 'Menu CTA',
                props: { children: 'Action' },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
        ],
      };
      
      addInstance(container, parentId);
      return;
    }
    
    // FORM - Box wrapper with children
    if (type === 'Form') {
      const formId = generateId();
      const headingId = generateId();
      const nameBoxId = generateId();
      const nameLabelId = generateId();
      const nameInputId = generateId();
      const emailBoxId = generateId();
      const emailLabelId = generateId();
      const emailInputId = generateId();
      const messageBoxId = generateId();
      const messageLabelId = generateId();
      const messageTextareaId = generateId();
      const buttonId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      
      const formStyleId = createStyleSource('local', `form-${formId}`);
      setStyle(formStyleId, 'display', 'flex');
      setStyle(formStyleId, 'flexDirection', 'column');
      setStyle(formStyleId, 'gap', '20px');
      setStyle(formStyleId, 'padding', '24px');
      setStyle(formStyleId, 'backgroundColor', 'hsl(var(--card))');
      setStyle(formStyleId, 'border', '1px solid hsl(var(--border))');
      setStyle(formStyleId, 'borderRadius', '8px');
      setStyle(formStyleId, 'maxWidth', '500px');
      
      const fieldBoxStyleId = createStyleSource('local', `field-box-${nameBoxId}`);
      setStyle(fieldBoxStyleId, 'display', 'flex');
      setStyle(fieldBoxStyleId, 'flexDirection', 'column');
      setStyle(fieldBoxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: formId,
        type: 'Box' as ComponentType,
        label: 'Form',
        props: {},
        styleSourceIds: [formStyleId],
        children: [
          {
            id: headingId,
            type: 'Heading' as ComponentType,
            label: 'Form Heading',
            props: { level: 'h2', children: 'Contact Us' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: nameBoxId,
            type: 'Box' as ComponentType,
            label: 'Name Field',
            props: {},
            styleSourceIds: [fieldBoxStyleId],
            children: [
              {
                id: nameLabelId,
                type: 'Text' as ComponentType,
                label: 'Name Label',
                props: { children: 'Name' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: nameInputId,
                type: 'TextInput' as ComponentType,
                label: 'Name Input',
                props: { placeholder: 'Enter your name', type: 'text' },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: emailBoxId,
            type: 'Box' as ComponentType,
            label: 'Email Field',
            props: {},
            styleSourceIds: [fieldBoxStyleId],
            children: [
              {
                id: emailLabelId,
                type: 'Text' as ComponentType,
                label: 'Email Label',
                props: { children: 'Email' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: emailInputId,
                type: 'TextInput' as ComponentType,
                label: 'Email Input',
                props: { placeholder: 'Enter your email', type: 'email' },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: messageBoxId,
            type: 'Box' as ComponentType,
            label: 'Message Field',
            props: {},
            styleSourceIds: [fieldBoxStyleId],
            children: [
              {
                id: messageLabelId,
                type: 'Text' as ComponentType,
                label: 'Message Label',
                props: { children: 'Message' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: messageTextareaId,
                type: 'TextArea' as ComponentType,
                label: 'Message Textarea',
                props: { placeholder: 'Enter your message', rows: 4 },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: buttonId,
            type: 'FormButton' as ComponentType,
            label: 'Submit Button',
            props: { text: 'Submit', type: 'submit' },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, parentId);
      return;
    }
    
    // RADIO GROUP - Box wrapper with label and RadioGroup
    if (type === 'RadioGroup') {
      const boxId = generateId();
      const labelId = generateId();
      const radioId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      
      const boxStyleId = createStyleSource('local', `radio-group-${boxId}`);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'flexDirection', 'column');
      setStyle(boxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Box' as ComponentType,
        label: 'Radio Group',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: labelId,
            type: 'Text' as ComponentType,
            label: 'Group Label',
            props: { children: 'Choose an option:' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: radioId,
            type: 'RadioGroup' as ComponentType,
            label: 'Radio Options',
            props: {
              name: 'radio-group',
              options: [
                { id: '1', label: 'Option 1', value: 'option1' },
                { id: '2', label: 'Option 2', value: 'option2' },
                { id: '3', label: 'Option 3', value: 'option3' },
              ],
            },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, parentId);
      return;
    }
    
    // TABLE - Container with Box structure
    if (type === 'Table') {
      const containerId = generateId();
      const tableId = generateId();
      const theadId = generateId();
      const headerRowId = generateId();
      const th1Id = generateId();
      const th2Id = generateId();
      const th3Id = generateId();
      const tbodyId = generateId();
      const row1Id = generateId();
      const cell1Id = generateId();
      const cell2Id = generateId();
      const cell3Id = generateId();
      const row2Id = generateId();
      const cell4Id = generateId();
      const cell5Id = generateId();
      const cell6Id = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      
      const tableStyleId = createStyleSource('local', `table-${tableId}`);
      setStyle(tableStyleId, 'width', '100%');
      setStyle(tableStyleId, 'display', 'flex');
      setStyle(tableStyleId, 'flexDirection', 'column');
      setStyle(tableStyleId, 'border', '1px solid hsl(var(--border))');
      setStyle(tableStyleId, 'borderRadius', '8px');
      setStyle(tableStyleId, 'overflow', 'hidden');
      
      const headerRowStyleId = createStyleSource('local', `header-row-${headerRowId}`);
      setStyle(headerRowStyleId, 'display', 'flex');
      setStyle(headerRowStyleId, 'gap', '16px');
      setStyle(headerRowStyleId, 'padding', '12px');
      setStyle(headerRowStyleId, 'backgroundColor', 'hsl(var(--muted))');
      setStyle(headerRowStyleId, 'fontWeight', '600');
      setStyle(headerRowStyleId, 'borderBottom', '2px solid hsl(var(--border))');
      
      const rowStyleId = createStyleSource('local', `row-${row1Id}`);
      setStyle(rowStyleId, 'display', 'flex');
      setStyle(rowStyleId, 'gap', '16px');
      setStyle(rowStyleId, 'padding', '12px');
      setStyle(rowStyleId, 'borderBottom', '1px solid hsl(var(--border))');
      
      const container: ComponentInstance = {
        id: containerId,
        type: 'Container' as ComponentType,
        label: 'Table',
        props: {},
        styleSourceIds: [],
        children: [
          {
            id: tableId,
            type: 'Box' as ComponentType,
            label: 'Table',
            props: {},
            styleSourceIds: [tableStyleId],
            children: [
              {
                id: theadId,
                type: 'Box' as ComponentType,
                label: 'Table Head',
                props: {},
                styleSourceIds: [],
                children: [
                  {
                    id: headerRowId,
                    type: 'Box' as ComponentType,
                    label: 'Header Row',
                    props: {},
                    styleSourceIds: [headerRowStyleId],
                    children: [
                      {
                        id: th1Id,
                        type: 'Text' as ComponentType,
                        label: 'Column 1',
                        props: { children: 'Column 1' },
                        styleSourceIds: [],
                        children: [],
                      },
                      {
                        id: th2Id,
                        type: 'Text' as ComponentType,
                        label: 'Column 2',
                        props: { children: 'Column 2' },
                        styleSourceIds: [],
                        children: [],
                      },
                      {
                        id: th3Id,
                        type: 'Text' as ComponentType,
                        label: 'Column 3',
                        props: { children: 'Column 3' },
                        styleSourceIds: [],
                        children: [],
                      },
                    ],
                  },
                ],
              },
              {
                id: tbodyId,
                type: 'Box' as ComponentType,
                label: 'Table Body',
                props: {},
                styleSourceIds: [],
                children: [
                  {
                    id: row1Id,
                    type: 'Box' as ComponentType,
                    label: 'Row 1',
                    props: {},
                    styleSourceIds: [rowStyleId],
                    children: [
                      {
                        id: cell1Id,
                        type: 'Text' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 1' },
                        styleSourceIds: [],
                        children: [],
                      },
                      {
                        id: cell2Id,
                        type: 'Text' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 2' },
                        styleSourceIds: [],
                        children: [],
                      },
                      {
                        id: cell3Id,
                        type: 'Text' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 3' },
                        styleSourceIds: [],
                        children: [],
                      },
                    ],
                  },
                  {
                    id: row2Id,
                    type: 'Box' as ComponentType,
                    label: 'Row 2',
                    props: {},
                    styleSourceIds: [rowStyleId],
                    children: [
                      {
                        id: cell4Id,
                        type: 'Text' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 4' },
                        styleSourceIds: [],
                        children: [],
                      },
                      {
                        id: cell5Id,
                        type: 'Text' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 5' },
                        styleSourceIds: [],
                        children: [],
                      },
                      {
                        id: cell6Id,
                        type: 'Text' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 6' },
                        styleSourceIds: [],
                        children: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      
      addInstance(container, parentId);
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
      type: type as ComponentType,
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
    { name: 'Layout', types: ['Section', 'Container', 'Box', 'Navigation', 'Dropdown'] },
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

