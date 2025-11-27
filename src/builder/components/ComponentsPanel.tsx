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
      
      const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
      
      const navClassName = getNextAutoClassName('navigation');
      const navStyleId = createStyleSource('local', navClassName);
      setStyle(navStyleId, 'display', 'flex');
      setStyle(navStyleId, 'flexDirection', 'row');
      setStyle(navStyleId, 'alignItems', 'center');
      setStyle(navStyleId, 'justifyContent', 'space-between');
      setStyle(navStyleId, 'padding', '16px 32px');
      setStyle(navStyleId, 'backgroundColor', 'hsl(var(--background))');
      setStyle(navStyleId, 'borderBottom', '1px solid hsl(var(--border))');
      setStyle(navStyleId, 'width', '100%');
      
      const logoBoxClassName = getNextAutoClassName('div');
      const logoBoxStyleId = createStyleSource('local', logoBoxClassName);
      setStyle(logoBoxStyleId, 'display', 'flex');
      setStyle(logoBoxStyleId, 'alignItems', 'center');
      setStyle(logoBoxStyleId, 'gap', '8px');
      
      const linksBoxClassName = getNextAutoClassName('div');
      const linksBoxStyleId = createStyleSource('local', linksBoxClassName);
      setStyle(linksBoxStyleId, 'display', 'flex');
      setStyle(linksBoxStyleId, 'gap', '24px');
      setStyle(linksBoxStyleId, 'alignItems', 'center');
      
      // Auto-classes for child components
      const logoImageClassName = getNextAutoClassName('image');
      const logoImageStyleId = createStyleSource('local', logoImageClassName);
      const link1ClassName = getNextAutoClassName('link');
      const link1StyleId = createStyleSource('local', link1ClassName);
      const link2ClassName = getNextAutoClassName('link');
      const link2StyleId = createStyleSource('local', link2ClassName);
      const link3ClassName = getNextAutoClassName('link');
      const link3StyleId = createStyleSource('local', link3ClassName);
      const buttonClassName = getNextAutoClassName('button');
      const buttonStyleId = createStyleSource('local', buttonClassName);
      
      const container: ComponentInstance = {
        id: navId,
        type: 'Div' as ComponentType,
        label: 'Navigation',
        props: {},
        styleSourceIds: [navStyleId],
        children: [
          {
            id: logoBoxId,
            type: 'Div' as ComponentType,
            label: 'Div',
            props: {},
            styleSourceIds: [logoBoxStyleId],
            children: [
              {
                id: logoId,
                type: 'Image' as ComponentType,
                label: 'Image',
                props: { src: '/placeholder.svg', alt: 'Logo' },
                styleSourceIds: [logoImageStyleId],
                children: [],
              },
            ],
          },
          {
            id: linksBoxId,
            type: 'Div' as ComponentType,
            label: 'Div',
            props: {},
            styleSourceIds: [linksBoxStyleId],
            children: [
              {
                id: link1Id,
                type: 'Link' as ComponentType,
                label: 'Link',
                props: { href: '#', children: 'Home' },
                styleSourceIds: [link1StyleId],
                children: [],
              },
              {
                id: link2Id,
                type: 'Link' as ComponentType,
                label: 'Link',
                props: { href: '#', children: 'About' },
                styleSourceIds: [link2StyleId],
                children: [],
              },
              {
                id: link3Id,
                type: 'Link' as ComponentType,
                label: 'Link',
                props: { href: '#', children: 'Contact' },
                styleSourceIds: [link3StyleId],
                children: [],
              },
            ],
          },
          {
            id: buttonBoxId,
            type: 'Div' as ComponentType,
            label: 'Div',
            props: {},
            styleSourceIds: [],
            children: [
              {
                id: buttonId,
                type: 'Button' as ComponentType,
                label: 'Button',
                props: { children: 'Get Started' },
                styleSourceIds: [buttonStyleId],
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
      
      const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
      
      const dropdownClassName = getNextAutoClassName('dropdown');
      const dropdownStyleId = createStyleSource('local', dropdownClassName);
      setStyle(dropdownStyleId, 'display', 'flex');
      setStyle(dropdownStyleId, 'flexDirection', 'column');
      setStyle(dropdownStyleId, 'position', 'relative');
      setStyle(dropdownStyleId, 'width', 'fit-content');
      
      const menuClassName = getNextAutoClassName('div');
      const menuStyleId = createStyleSource('local', menuClassName);
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
      
      // Auto-classes for child components
      const triggerButtonClassName = getNextAutoClassName('button');
      const triggerButtonStyleId = createStyleSource('local', triggerButtonClassName);
      const menuLink1ClassName = getNextAutoClassName('link');
      const menuLink1StyleId = createStyleSource('local', menuLink1ClassName);
      const menuLink2ClassName = getNextAutoClassName('link');
      const menuLink2StyleId = createStyleSource('local', menuLink2ClassName);
      const menuButtonClassName = getNextAutoClassName('button');
      const menuButtonStyleId = createStyleSource('local', menuButtonClassName);
      
      const container: ComponentInstance = {
        id: dropdownId,
        type: 'Div' as ComponentType,
        label: 'Dropdown',
        props: {},
        styleSourceIds: [dropdownStyleId],
        children: [
          {
            id: triggerId,
            type: 'Button' as ComponentType,
            label: 'Button',
            props: { children: 'Open Menu' },
            styleSourceIds: [triggerButtonStyleId],
            children: [],
          },
          {
            id: menuId,
            type: 'Div' as ComponentType,
            label: 'Div',
            props: {},
            styleSourceIds: [menuStyleId],
            children: [
              {
                id: item1Id,
                type: 'Link' as ComponentType,
                label: 'Link',
                props: { href: '#', children: 'Link' },
                styleSourceIds: [menuLink1StyleId],
                children: [],
              },
              {
                id: item2Id,
                type: 'Link' as ComponentType,
                label: 'Link',
                props: { href: '#', children: 'Link' },
                styleSourceIds: [menuLink2StyleId],
                children: [],
              },
              {
                id: item3Id,
                type: 'Button' as ComponentType,
                label: 'Button',
                props: { children: 'Button' },
                styleSourceIds: [menuButtonStyleId],
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
      
      const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
      
      const formClassName = getNextAutoClassName('form');
      const formStyleId = createStyleSource('local', formClassName);
      setStyle(formStyleId, 'display', 'flex');
      setStyle(formStyleId, 'flexDirection', 'column');
      setStyle(formStyleId, 'gap', '20px');
      setStyle(formStyleId, 'padding', '24px');
      setStyle(formStyleId, 'backgroundColor', 'hsl(var(--card))');
      setStyle(formStyleId, 'border', '1px solid hsl(var(--border))');
      setStyle(formStyleId, 'borderRadius', '8px');
      setStyle(formStyleId, 'maxWidth', '500px');
      
      const fieldBoxClassName = getNextAutoClassName('div');
      const fieldBoxStyleId = createStyleSource('local', fieldBoxClassName);
      setStyle(fieldBoxStyleId, 'display', 'flex');
      setStyle(fieldBoxStyleId, 'flexDirection', 'column');
      setStyle(fieldBoxStyleId, 'gap', '8px');
      
      // Auto-classes for form components
      const headingClassName = getNextAutoClassName('heading');
      const headingStyleId = createStyleSource('local', headingClassName);
      const nameLabelClassName = getNextAutoClassName('label');
      const nameLabelStyleId = createStyleSource('local', nameLabelClassName);
      const nameInputClassName = getNextAutoClassName('input');
      const nameInputStyleId = createStyleSource('local', nameInputClassName);
      const emailLabelClassName = getNextAutoClassName('label');
      const emailLabelStyleId = createStyleSource('local', emailLabelClassName);
      const emailInputClassName = getNextAutoClassName('input');
      const emailInputStyleId = createStyleSource('local', emailInputClassName);
      const messageLabelClassName = getNextAutoClassName('label');
      const messageLabelStyleId = createStyleSource('local', messageLabelClassName);
      const messageTextareaClassName = getNextAutoClassName('textarea');
      const messageTextareaStyleId = createStyleSource('local', messageTextareaClassName);
      const submitButtonClassName = getNextAutoClassName('button');
      const submitButtonStyleId = createStyleSource('local', submitButtonClassName);
      
      const container: ComponentInstance = {
        id: formId,
        type: 'Div' as ComponentType,
        label: 'Form',
        props: {},
        styleSourceIds: [formStyleId],
        children: [
          {
            id: headingId,
            type: 'Heading' as ComponentType,
            label: 'Heading',
            props: { level: 'h2', children: 'Heading' },
            styleSourceIds: [headingStyleId],
            children: [],
          },
          {
            id: nameBoxId,
            type: 'Div' as ComponentType,
            label: 'Div',
            props: {},
            styleSourceIds: [fieldBoxStyleId],
            children: [
              {
                id: nameLabelId,
                type: 'Text' as ComponentType,
                label: 'Text',
                props: { children: 'Label' },
                styleSourceIds: [nameLabelStyleId],
                children: [],
              },
              {
                id: nameInputId,
                type: 'TextInput' as ComponentType,
                label: 'TextInput',
                props: { placeholder: 'Input', type: 'text' },
                styleSourceIds: [nameInputStyleId],
                children: [],
              },
            ],
          },
          {
            id: emailBoxId,
            type: 'Div' as ComponentType,
            label: 'Div',
            props: {},
            styleSourceIds: [fieldBoxStyleId],
            children: [
              {
                id: emailLabelId,
                type: 'Text' as ComponentType,
                label: 'Text',
                props: { children: 'Label' },
                styleSourceIds: [emailLabelStyleId],
                children: [],
              },
              {
                id: emailInputId,
                type: 'TextInput' as ComponentType,
                label: 'TextInput',
                props: { placeholder: 'Input', type: 'email' },
                styleSourceIds: [emailInputStyleId],
                children: [],
              },
            ],
          },
          {
            id: messageBoxId,
            type: 'Div' as ComponentType,
            label: 'Div',
            props: {},
            styleSourceIds: [fieldBoxStyleId],
            children: [
              {
                id: messageLabelId,
                type: 'Text' as ComponentType,
                label: 'Text',
                props: { children: 'Label' },
                styleSourceIds: [messageLabelStyleId],
                children: [],
              },
              {
                id: messageTextareaId,
                type: 'TextArea' as ComponentType,
                label: 'TextArea',
                props: { placeholder: 'Input', rows: 4 },
                styleSourceIds: [messageTextareaStyleId],
                children: [],
              },
            ],
          },
          {
            id: buttonId,
            type: 'FormButton' as ComponentType,
            label: 'FormButton',
            props: { text: 'Button', type: 'submit' },
            styleSourceIds: [submitButtonStyleId],
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
      
      const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
      
      const boxClassName = getNextAutoClassName('radio');
      const boxStyleId = createStyleSource('local', boxClassName);
      setStyle(boxStyleId, 'display', 'flex');
      setStyle(boxStyleId, 'flexDirection', 'column');
      setStyle(boxStyleId, 'gap', '8px');
      
      // Auto-classes for child components
      const labelClassName = getNextAutoClassName('text');
      const labelStyleId = createStyleSource('local', labelClassName);
      const radioGroupClassName = getNextAutoClassName('radio');
      const radioGroupStyleId = createStyleSource('local', radioGroupClassName);
      
      const container: ComponentInstance = {
        id: boxId,
        type: 'Div' as ComponentType,
        label: 'Radio Group',
        props: {},
        styleSourceIds: [boxStyleId],
        children: [
          {
            id: labelId,
            type: 'Text' as ComponentType,
            label: 'Text',
            props: { children: 'Label' },
            styleSourceIds: [labelStyleId],
            children: [],
          },
          {
            id: radioId,
            type: 'RadioGroup' as ComponentType,
            label: 'RadioGroup',
            props: {
              name: 'radio-group',
              options: [
                { id: '1', label: 'Option 1', value: 'option1' },
                { id: '2', label: 'Option 2', value: 'option2' },
                { id: '3', label: 'Option 3', value: 'option3' },
              ],
            },
            styleSourceIds: [radioGroupStyleId],
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
      
      const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
      
      const tableClassName = getNextAutoClassName('table');
      const tableStyleId = createStyleSource('local', tableClassName);
      setStyle(tableStyleId, 'width', '100%');
      setStyle(tableStyleId, 'display', 'flex');
      setStyle(tableStyleId, 'flexDirection', 'column');
      setStyle(tableStyleId, 'border', '1px solid hsl(var(--border))');
      setStyle(tableStyleId, 'borderRadius', '8px');
      setStyle(tableStyleId, 'overflow', 'hidden');
      
      const headerRowClassName = getNextAutoClassName('div');
      const headerRowStyleId = createStyleSource('local', headerRowClassName);
      setStyle(headerRowStyleId, 'display', 'flex');
      setStyle(headerRowStyleId, 'gap', '0');
      setStyle(headerRowStyleId, 'padding', '0');
      setStyle(headerRowStyleId, 'backgroundColor', 'hsl(var(--muted))');
      setStyle(headerRowStyleId, 'fontWeight', '600');
      setStyle(headerRowStyleId, 'borderBottom', '2px solid hsl(var(--border))');
      
      const rowClassName = getNextAutoClassName('div');
      const rowStyleId = createStyleSource('local', rowClassName);
      setStyle(rowStyleId, 'display', 'flex');
      setStyle(rowStyleId, 'gap', '0');
      setStyle(rowStyleId, 'padding', '0');
      setStyle(rowStyleId, 'borderBottom', '1px solid hsl(var(--border))');

      const cellClassName = getNextAutoClassName('cell');
      const cellStyleId = createStyleSource('local', cellClassName);
      setStyle(cellStyleId, 'flex', '1');
      setStyle(cellStyleId, 'padding', '12px');
      setStyle(cellStyleId, 'borderRight', '1px solid hsl(var(--border))');
      
      // Auto-class for container
      const containerClassName = getNextAutoClassName('container');
      const containerStyleId = createStyleSource('local', containerClassName);
      
      const container: ComponentInstance = {
        id: containerId,
        type: 'Container' as ComponentType,
        label: 'Table',
        props: {},
        styleSourceIds: [containerStyleId],
        children: [
          {
            id: tableId,
            type: 'Div' as ComponentType,
            label: 'Table',
            props: {},
            styleSourceIds: [tableStyleId],
            children: [
              {
                id: theadId,
                type: 'Div' as ComponentType,
                label: 'Table Head',
                props: {},
                styleSourceIds: [],
                children: [
                  {
                    id: headerRowId,
                    type: 'Div' as ComponentType,
                    label: 'Header Row',
                    props: {},
                    styleSourceIds: [headerRowStyleId],
                    children: [
                      {
                        id: th1Id,
                        type: 'Cell' as ComponentType,
                        label: 'Header Cell 1',
                        props: { children: 'Column 1' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                      {
                        id: th2Id,
                        type: 'Cell' as ComponentType,
                        label: 'Header Cell 2',
                        props: { children: 'Column 2' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                      {
                        id: th3Id,
                        type: 'Cell' as ComponentType,
                        label: 'Header Cell 3',
                        props: { children: 'Column 3' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                    ],
                  },
                ],
              },
              {
                id: tbodyId,
                type: 'Div' as ComponentType,
                label: 'Table Body',
                props: {},
                styleSourceIds: [],
                children: [
                  {
                    id: row1Id,
                    type: 'Div' as ComponentType,
                    label: 'Row 1',
                    props: {},
                    styleSourceIds: [rowStyleId],
                    children: [
                      {
                        id: cell1Id,
                        type: 'Cell' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 1' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                      {
                        id: cell2Id,
                        type: 'Cell' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 2' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                      {
                        id: cell3Id,
                        type: 'Cell' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 3' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                    ],
                  },
                  {
                    id: row2Id,
                    type: 'Div' as ComponentType,
                    label: 'Row 2',
                    props: {},
                    styleSourceIds: [rowStyleId],
                    children: [
                      {
                        id: cell4Id,
                        type: 'Cell' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 4' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                      {
                        id: cell5Id,
                        type: 'Cell' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 5' },
                        styleSourceIds: [cellStyleId],
                        children: [],
                      },
                      {
                        id: cell6Id,
                        type: 'Cell' as ComponentType,
                        label: 'Cell',
                        props: { children: 'Data 6' },
                        styleSourceIds: [cellStyleId],
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
      const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
      
      // Create style sources for each child element
      const h2ClassName = getNextAutoClassName('heading');
      const h2StyleId = createStyleSource('local', h2ClassName);
      setStyle(h2StyleId, 'fontSize', '32px');
      setStyle(h2StyleId, 'fontWeight', '700');
      
      const h3ClassName = getNextAutoClassName('heading');
      const h3StyleId = createStyleSource('local', h3ClassName);
      setStyle(h3StyleId, 'fontSize', '24px');
      setStyle(h3StyleId, 'fontWeight', '700');
      
      const textClassName = getNextAutoClassName('text');
      const textStyleId = createStyleSource('local', textClassName);
      
      const headingId = generateId();
      defaultChildren.push(
        { id: headingId, type: 'Heading', label: 'Heading', props: { level: 'h2', children: 'Heading 2' }, styleSourceIds: [h2StyleId], children: [] },
        { id: `${headingId}-2`, type: 'Heading', label: 'Heading', props: { level: 'h3', children: 'Heading 3' }, styleSourceIds: [h3StyleId], children: [] },
        { id: generateId(), type: 'Text', label: 'Text', props: { children: 'This is a text paragraph.' }, styleSourceIds: [textStyleId], children: [] }
      );
    }

    // Create auto-class style source for all components
    const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
    const autoClassName = getNextAutoClassName(type);
    const styleSourceId = createStyleSource('local', autoClassName);
    
    // Apply default styles if component has them
    if (meta.defaultStyles) {
      Object.entries(meta.defaultStyles).forEach(([property, value]) => {
        setStyle(styleSourceId, property, value);
      });
    }

    const newInstance: ComponentInstance = {
      id: newId,
      type: type as ComponentType,
      label: meta.label,
      props: { ...meta.defaultProps },
      styleSourceIds: [styleSourceId],
      children: defaultChildren,
    };

    addInstance(newInstance, selectedInstanceId || 'root');
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('elements');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ 'Layout': true, 'Typography': true, 'Media': true, 'Forms': true, 'Data': true });
  const debouncedSearch = useDebounce(searchQuery, 300);

  const basicCategories = [
    { name: 'Layout', types: ['Section', 'Container', 'Div', 'Navigation', 'Dropdown'] },
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

