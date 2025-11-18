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

    const newId = generateId();
    
    // Create composite structure for Form
    if (type === 'Form') {
      const formId = generateId();
      const headingId = generateId();
      const textInputBoxId = generateId();
      const textInputLabelId = generateId();
      const textInputId = generateId();
      const textAreaBoxId = generateId();
      const textAreaLabelId = generateId();
      const textAreaId = generateId();
      const selectBoxId = generateId();
      const selectLabelId = generateId();
      const selectId = generateId();
      const buttonId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      
      const formStyleId = createStyleSource('local', `form-${formId}`);
      setStyle(formStyleId, 'display', 'flex');
      setStyle(formStyleId, 'flexDirection', 'column');
      setStyle(formStyleId, 'gap', '16px');
      setStyle(formStyleId, 'padding', '24px');
      setStyle(formStyleId, 'backgroundColor', 'hsl(var(--background))');
      setStyle(formStyleId, 'border', '1px solid hsl(var(--border))');
      setStyle(formStyleId, 'borderRadius', '8px');
      
      const inputBoxStyleId = createStyleSource('local', `input-box-${textInputBoxId}`);
      setStyle(inputBoxStyleId, 'display', 'flex');
      setStyle(inputBoxStyleId, 'flexDirection', 'column');
      setStyle(inputBoxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: formId,
        type: 'Form',
        label: 'Form',
        props: {},
        styleSourceIds: [formStyleId],
        children: [
          {
            id: headingId,
            type: 'Heading',
            label: 'Form Title',
            props: { level: 'h2', children: 'Contact Form' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: textInputBoxId,
            type: 'Box',
            label: 'Name Input',
            props: {},
            styleSourceIds: [inputBoxStyleId],
            children: [
              {
                id: textInputLabelId,
                type: 'Text',
                label: 'Label',
                props: { children: 'Name' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: textInputId,
                type: 'TextInput',
                label: 'Input Field',
                props: { placeholder: 'Enter your name...' },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: textAreaBoxId,
            type: 'Box',
            label: 'Message Input',
            props: {},
            styleSourceIds: [inputBoxStyleId],
            children: [
              {
                id: textAreaLabelId,
                type: 'Text',
                label: 'Label',
                props: { children: 'Message' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: textAreaId,
                type: 'TextArea',
                label: 'Textarea Field',
                props: { placeholder: 'Enter your message...', rows: 4 },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: selectBoxId,
            type: 'Box',
            label: 'Category Select',
            props: {},
            styleSourceIds: [inputBoxStyleId],
            children: [
              {
                id: selectLabelId,
                type: 'Text',
                label: 'Label',
                props: { children: 'Category' },
                styleSourceIds: [],
                children: [],
              },
              {
                id: selectId,
                type: 'Select',
                label: 'Select Field',
                props: { 
                  placeholder: 'Select a category...',
                  options: [
                    { id: '1', label: 'General', value: 'general' },
                    { id: '2', label: 'Support', value: 'support' },
                    { id: '3', label: 'Feedback', value: 'feedback' },
                  ]
                },
                styleSourceIds: [],
                children: [],
              },
            ],
          },
          {
            id: buttonId,
            type: 'FormButton',
            label: 'Submit Button',
            props: { text: 'Submit', type: 'submit' },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
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
    
    // Create composite structure for InputLabel
    if (type === 'InputLabel') {
      const boxId = generateId();
      const labelId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      const boxStyleId = createStyleSource('local', `input-label-${boxId}`);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'flexDirection', 'column');
      setStyle(boxStyleId, 'gap', '4px');
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Box',
        label: 'Input Label',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: labelId,
            type: 'Text',
            label: 'Label Text',
            props: { children: 'Label' },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
    // Create composite structure for TextInput
    if (type === 'TextInput') {
      const boxId = generateId();
      const labelId = generateId();
      const inputId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      const boxStyleId = createStyleSource('local', `text-input-${boxId}`);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'flexDirection', 'column');
      setStyle(boxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Box',
        label: 'Text Input',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: labelId,
            type: 'Text',
            label: 'Label',
            props: { children: 'Text Input' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: inputId,
            type: 'TextInput',
            label: 'Input Field',
            props: { placeholder: 'Enter text...' },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
    // Create composite structure for TextArea
    if (type === 'TextArea') {
      const boxId = generateId();
      const labelId = generateId();
      const textareaId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      const boxStyleId = createStyleSource('local', `textarea-${boxId}`);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'flexDirection', 'column');
      setStyle(boxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Box',
        label: 'Text Area',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: labelId,
            type: 'Text',
            label: 'Label',
            props: { children: 'Text Area' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: textareaId,
            type: 'TextArea',
            label: 'Textarea Field',
            props: { placeholder: 'Enter text...', rows: 4 },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
    // Create composite structure for Select
    if (type === 'Select') {
      const boxId = generateId();
      const labelId = generateId();
      const selectId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      const boxStyleId = createStyleSource('local', `select-${boxId}`);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'flexDirection', 'column');
      setStyle(boxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Box',
        label: 'Select',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: labelId,
            type: 'Text',
            label: 'Label',
            props: { children: 'Select' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: selectId,
            type: 'Select',
            label: 'Select Field',
            props: { 
              placeholder: 'Select an option...',
              options: [
                { id: '1', label: 'Option 1', value: 'option1' },
                { id: '2', label: 'Option 2', value: 'option2' },
                { id: '3', label: 'Option 3', value: 'option3' },
              ]
            },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
    // Create composite structure for RadioGroup
    if (type === 'RadioGroup') {
      const boxId = generateId();
      const labelId = generateId();
      const radio1Id = generateId();
      const radio2Id = generateId();
      const radio3Id = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      const boxStyleId = createStyleSource('local', `radio-group-${boxId}`);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'flexDirection', 'column');
      setStyle(boxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Box',
        label: 'Radio Group',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: labelId,
            type: 'Text',
            label: 'Group Label',
            props: { children: 'Radio Group' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: radio1Id,
            type: 'RadioGroup',
            label: 'Radio Option 1',
            props: { label: 'Option 1', value: 'option1' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: radio2Id,
            type: 'RadioGroup',
            label: 'Radio Option 2',
            props: { label: 'Option 2', value: 'option2' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: radio3Id,
            type: 'RadioGroup',
            label: 'Radio Option 3',
            props: { label: 'Option 3', value: 'option3' },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
    // Create composite structure for CheckboxField
    if (type === 'CheckboxField') {
      const boxId = generateId();
      const checkboxId = generateId();
      const labelId = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      const boxStyleId = createStyleSource('local', `checkbox-field-${boxId}`);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'alignItems', 'center');
      setStyle(boxStyleId, 'gap', '8px');
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Box',
        label: 'Checkbox Field',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: checkboxId,
            type: 'CheckboxField',
            label: 'Checkbox',
            props: { label: 'Checkbox Label' },
            styleSourceIds: [],
            children: [],
          },
          {
            id: labelId,
            type: 'Text',
            label: 'Label Text',
            props: { children: 'Check this option' },
            styleSourceIds: [],
            children: [],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
      return;
    }
    
    // Create composite structure for Table
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
      const row1Cell1Id = generateId();
      const row1Cell2Id = generateId();
      const row1Cell3Id = generateId();
      const row2Id = generateId();
      const row2Cell1Id = generateId();
      const row2Cell2Id = generateId();
      const row2Cell3Id = generateId();
      
      const { createStyleSource, setStyle } = useStyleStore.getState();
      const tableStyleId = createStyleSource('local', `table-${tableId}`);
      setStyle(tableStyleId, 'width', '100%');
      setStyle(tableStyleId, 'borderCollapse', 'collapse');
      
      const headerRowStyleId = createStyleSource('local', `table-header-${headerRowId}`);
      setStyle(headerRowStyleId, 'display', 'flex');
      setStyle(headerRowStyleId, 'gap', '16px');
      setStyle(headerRowStyleId, 'borderBottom', '2px solid hsl(var(--border))');
      setStyle(headerRowStyleId, 'padding', '12px');
      setStyle(headerRowStyleId, 'fontWeight', '600');
      
      const rowStyleId = createStyleSource('local', `table-row-${row1Id}`);
      setStyle(rowStyleId, 'display', 'flex');
      setStyle(rowStyleId, 'gap', '16px');
      setStyle(rowStyleId, 'borderBottom', '1px solid hsl(var(--border))');
      setStyle(rowStyleId, 'padding', '12px');
      
      const container: ComponentInstance = {
        id: containerId,
        type: 'Container',
        label: 'Table',
        props: {},
        styleSourceIds: [],
        children: [
          {
            id: tableId,
            type: 'Box',
            label: 'Table',
            props: {},
            styleSourceIds: [tableStyleId],
            children: [
              {
                id: theadId,
                type: 'Box',
                label: 'Table Head',
                props: {},
                styleSourceIds: [],
                children: [
                  {
                    id: headerRowId,
                    type: 'Box',
                    label: 'Header Row',
                    props: {},
                    styleSourceIds: [headerRowStyleId],
                    children: [
                      { id: th1Id, type: 'Text', label: 'Column 1', props: { children: 'Column 1' }, styleSourceIds: [], children: [] },
                      { id: th2Id, type: 'Text', label: 'Column 2', props: { children: 'Column 2' }, styleSourceIds: [], children: [] },
                      { id: th3Id, type: 'Text', label: 'Column 3', props: { children: 'Column 3' }, styleSourceIds: [], children: [] },
                    ],
                  },
                ],
              },
              {
                id: tbodyId,
                type: 'Box',
                label: 'Table Body',
                props: {},
                styleSourceIds: [],
                children: [
                  {
                    id: row1Id,
                    type: 'Box',
                    label: 'Row 1',
                    props: {},
                    styleSourceIds: [rowStyleId],
                    children: [
                      { id: row1Cell1Id, type: 'Text', label: 'Cell', props: { children: 'Data 1' }, styleSourceIds: [], children: [] },
                      { id: row1Cell2Id, type: 'Text', label: 'Cell', props: { children: 'Data 2' }, styleSourceIds: [], children: [] },
                      { id: row1Cell3Id, type: 'Text', label: 'Cell', props: { children: 'Data 3' }, styleSourceIds: [], children: [] },
                    ],
                  },
                  {
                    id: row2Id,
                    type: 'Box',
                    label: 'Row 2',
                    props: {},
                    styleSourceIds: [rowStyleId],
                    children: [
                      { id: row2Cell1Id, type: 'Text', label: 'Cell', props: { children: 'Data 4' }, styleSourceIds: [], children: [] },
                      { id: row2Cell2Id, type: 'Text', label: 'Cell', props: { children: 'Data 5' }, styleSourceIds: [], children: [] },
                      { id: row2Cell3Id, type: 'Text', label: 'Cell', props: { children: 'Data 6' }, styleSourceIds: [], children: [] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      
      addInstance(container, selectedInstanceId || 'root');
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
    { name: 'Layout', types: ['Section', 'Container', 'Box', 'Navigation'] },
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

