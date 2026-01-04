import React, { useState, useMemo } from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { useComponentInstanceStore, createLinkedInstance, createLinkedInstanceFromMaster } from '../store/useComponentInstanceStore';
import { ComponentInstance, ComponentType } from '../store/types';
import { generateId } from '../utils/instance';
import * as Icons from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search, ChevronDown, Trash2, Package, Link2, Link2Off, Plus, Image as ImageIcon } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { CreateComponentDialog } from './CreateComponentDialog';
import { MediaPanel } from './MediaPanel';

const DraggableComponent: React.FC<{ type: string; label: string; icon: string; onAdd: () => void }> = ({ type, label, icon, onAdd }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${type}`,
    data: { type, label, isNewComponent: true },
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
      onClick={onAdd}
      className="group w-full h-20 flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border border-border bg-zinc-50 dark:bg-zinc-800 hover:bg-accent hover:border-primary hover:shadow-lg transition-all duration-200 text-center cursor-grab active:cursor-grabbing active:scale-95 hover:scale-[1.03]"
    >
      {IconComponent && <IconComponent className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors" />}
      <span className="text-[9px] leading-tight font-medium text-foreground line-clamp-2">{label}</span>
    </button>
  );
};

interface PrebuiltComponentData {
  id: string;
  name: string;
  instance: ComponentInstance;
  linkedCount?: number;
  isSystem?: boolean;
  category?: string;
}

const DraggablePrebuiltComponent: React.FC<{ 
  prebuilt: PrebuiltComponentData; 
  onAdd: () => void; 
  onDelete?: (e: React.MouseEvent) => void;
}> = ({ prebuilt, onAdd, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `prebuilt-${prebuilt.id}`,
    data: { type: 'Prebuilt', prebuiltId: prebuilt.id, isPrebuilt: true },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group relative p-3 rounded-lg border border-border bg-zinc-50 dark:bg-zinc-800 hover:bg-accent hover:border-green-500 transition-all cursor-grab active:cursor-grabbing"
      onClick={onAdd}
    >
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-green-500" />
        <span className="text-xs font-medium text-foreground truncate">{prebuilt.name}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-[10px] text-muted-foreground">
          {prebuilt.instance.type}
        </p>
        {prebuilt.linkedCount !== undefined && prebuilt.linkedCount > 0 && (
          <span className="flex items-center gap-0.5 text-[9px] text-green-600 dark:text-green-400">
            <Link2 className="w-3 h-3" />
            {prebuilt.linkedCount}
          </span>
        )}
      </div>
      {/* Only show delete button for user prebuilts, not system ones */}
      {!prebuilt.isSystem && onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-opacity"
          title="Delete prebuilt"
        >
          <Trash2 className="w-3 h-3 text-destructive" />
        </button>
      )}
    </div>
  );
};

export const ComponentsPanel: React.FC = () => {
  const addInstance = useBuilderStore((state) => state.addInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const { 
    prebuiltComponents, 
    removePrebuilt, 
    linkInstance, 
    getLinkedInstances 
  } = useComponentInstanceStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleAddComponent = (type: string) => {
    const meta = componentRegistry[type];
    if (!meta) return;

    const parentId = selectedInstanceId || 'root';
    const newId = generateId();
    
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
      setStyle(headingStyleId, 'fontSize', '32px');
      setStyle(headingStyleId, 'fontWeight', '700');
      setStyle(headingStyleId, 'lineHeight', '1.2');
      setStyle(headingStyleId, 'color', 'hsl(var(--foreground))');
      const nameLabelClassName = getNextAutoClassName('label');
      const nameLabelStyleId = createStyleSource('local', nameLabelClassName);
      setStyle(nameLabelStyleId, 'fontSize', '16px');
      setStyle(nameLabelStyleId, 'lineHeight', '1.5');
      setStyle(nameLabelStyleId, 'color', 'hsl(var(--foreground))');
      const nameInputClassName = getNextAutoClassName('input');
      const nameInputStyleId = createStyleSource('local', nameInputClassName);
      const emailLabelClassName = getNextAutoClassName('label');
      const emailLabelStyleId = createStyleSource('local', emailLabelClassName);
      setStyle(emailLabelStyleId, 'fontSize', '16px');
      setStyle(emailLabelStyleId, 'lineHeight', '1.5');
      setStyle(emailLabelStyleId, 'color', 'hsl(var(--foreground))');
      const emailInputClassName = getNextAutoClassName('input');
      const emailInputStyleId = createStyleSource('local', emailInputClassName);
      const messageLabelClassName = getNextAutoClassName('label');
      const messageLabelStyleId = createStyleSource('local', messageLabelClassName);
      setStyle(messageLabelStyleId, 'fontSize', '16px');
      setStyle(messageLabelStyleId, 'lineHeight', '1.5');
      setStyle(messageLabelStyleId, 'color', 'hsl(var(--foreground))');
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
      setStyle(labelStyleId, 'fontSize', '16px');
      setStyle(labelStyleId, 'lineHeight', '1.5');
      setStyle(labelStyleId, 'color', 'hsl(var(--foreground))');
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
      setStyle(h2StyleId, 'lineHeight', '1.2');
      setStyle(h2StyleId, 'color', 'hsl(var(--foreground))');
      
      const h3ClassName = getNextAutoClassName('heading');
      const h3StyleId = createStyleSource('local', h3ClassName);
      setStyle(h3StyleId, 'fontSize', '24px');
      setStyle(h3StyleId, 'fontWeight', '700');
      setStyle(h3StyleId, 'lineHeight', '1.2');
      setStyle(h3StyleId, 'color', 'hsl(var(--foreground))');
      
      const textClassName = getNextAutoClassName('text');
      const textStyleId = createStyleSource('local', textClassName);
      setStyle(textStyleId, 'fontSize', '16px');
      setStyle(textStyleId, 'lineHeight', '1.5');
      setStyle(textStyleId, 'color', 'hsl(var(--foreground))');
      
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
    { name: 'Layout', types: ['Section', 'Container', 'Div', 'Dropdown'] },
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
                  <DraggableComponent 
                    key={component.type} 
                    type={component.type} 
                    label={component.label} 
                    icon={component.icon} 
                    onAdd={() => handleAddComponent(component.type)} 
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );

  const handleAddPrebuilt = (prebuilt: typeof prebuiltComponents[0]) => {
    const parentId = selectedInstanceId || 'root';
    
    // Check if there's already a master for this prebuilt
    const { getMasterInstance } = useComponentInstanceStore.getState();
    const existingMaster = getMasterInstance(prebuilt.id);
    
    let result: { instance: ComponentInstance; styleIdMapping: Record<string, string> } | null;
    
    if (existingMaster) {
      // Clone from the existing master to share style source IDs
      result = createLinkedInstanceFromMaster(prebuilt.id, existingMaster.instanceId);
    } else {
      // First instance - create from prebuilt definition
      result = createLinkedInstance(prebuilt.id);
    }
    
    if (!result) {
      toast.error(`Failed to create instance of "${prebuilt.name}"`);
      return;
    }
    
    const { instance: newInstance, styleIdMapping } = result;
    
    // Add to canvas
    addInstance(newInstance, parentId);
    
    // Link the instance: first instance becomes master, subsequent ones are copies
    linkInstance(newInstance.id, prebuilt.id, styleIdMapping, !existingMaster);
    
    toast.success(`Added "${prebuilt.name}" to canvas (linked)`);
  };

  const handleDeletePrebuilt = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    removePrebuilt(id);
    toast.success(`Removed "${name}" from prebuilt components`);
  };

  const filteredPrebuiltComponents = useMemo(() => {
    const componentsWithCount = prebuiltComponents.map(p => ({
      ...p,
      linkedCount: getLinkedInstances(p.id).length,
    }));
    if (!debouncedSearch.trim()) return componentsWithCount;
    const searchLower = debouncedSearch.toLowerCase();
    return componentsWithCount.filter(p => p.name.toLowerCase().includes(searchLower));
  }, [debouncedSearch, prebuiltComponents, getLinkedInstances]);

  // Group prebuilts by category (system) and user prebuilts
  const groupedPrebuilts = useMemo(() => {
    const systemPrebuilts = filteredPrebuiltComponents.filter(p => p.isSystem);
    const userPrebuilts = filteredPrebuiltComponents.filter(p => !p.isSystem);
    
    // Group system prebuilts by category
    const categorizedSystem: Record<string, typeof systemPrebuilts> = {};
    systemPrebuilts.forEach(p => {
      const category = p.category || 'Other';
      if (!categorizedSystem[category]) {
        categorizedSystem[category] = [];
      }
      categorizedSystem[category].push(p);
    });
    
    return { categorizedSystem, userPrebuilts };
  }, [filteredPrebuiltComponents]);

  const [openPrebuiltCategories, setOpenPrebuiltCategories] = useState<Record<string, boolean>>({
    'Layout': true,
    'Sections': true,
    'Cards': true,
    'Custom': true,
  });

  const togglePrebuiltCategory = (category: string) => {
    setOpenPrebuiltCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-2 pb-1.5 shrink-0">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder="Search components..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all" />
        </div>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
          <TabsList className="w-full grid grid-cols-3 h-8 bg-muted/30">
            <TabsTrigger value="elements" className="text-xs">Elements</TabsTrigger>
            <TabsTrigger value="blocks" className="text-xs">Components</TabsTrigger>
            <TabsTrigger value="assets" className="text-xs gap-1">
              <ImageIcon className="w-3 h-3" />
              Assets
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {activeSubTab === 'elements' ? (
          <div className="px-2 pb-4">
            {renderCategorySection(filteredBasicCategories)}
            {filteredBasicCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No elements found</p>
              </div>
            )}
          </div>
        ) : activeSubTab === 'blocks' ? (
          <div className="px-2 pb-4 space-y-2">
            {/* Create new component button */}
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-accent/50 transition-all text-sm text-muted-foreground hover:text-foreground"
            >
              <Plus className="w-4 h-4" />
              <span>Create Component</span>
            </button>
            
            {/* System prebuilts grouped by category */}
            {Object.entries(groupedPrebuilts.categorizedSystem).map(([category, prebuilts]) => (
              <Collapsible 
                key={category} 
                open={openPrebuiltCategories[category] !== false} 
                onOpenChange={() => togglePrebuiltCategory(category)}
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.5px]">{category}</h3>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openPrebuiltCategories[category] !== false ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {prebuilts.map((prebuilt) => (
                      <DraggablePrebuiltComponent
                        key={prebuilt.id}
                        prebuilt={prebuilt}
                        onAdd={() => handleAddPrebuilt(prebuilt)}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
            
            {/* User prebuilts */}
            {groupedPrebuilts.userPrebuilts.length > 0 && (
              <Collapsible 
                open={openPrebuiltCategories['Custom'] !== false} 
                onOpenChange={() => togglePrebuiltCategory('Custom')}
              >
                <CollapsibleTrigger className="w-full flex items-center justify-between py-1.5">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.5px]">Custom</h3>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${openPrebuiltCategories['Custom'] !== false ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent className="pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {groupedPrebuilts.userPrebuilts.map((prebuilt) => (
                      <DraggablePrebuiltComponent
                        key={prebuilt.id}
                        prebuilt={prebuilt}
                        onAdd={() => handleAddPrebuilt(prebuilt)}
                        onDelete={(e) => handleDeletePrebuilt(e, prebuilt.id, prebuilt.name)}
                      />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {/* Empty state */}
            {filteredPrebuiltComponents.length === 0 && debouncedSearch.trim() && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <Search className="w-8 h-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No prebuilt components found</p>
              </div>
            )}
          </div>
        ) : (
          <MediaPanel />
        )}
      </div>
      
      <CreateComponentDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};

