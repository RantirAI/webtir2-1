import React, { useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { 
  ChevronRight, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Box as BoxIcon, 
  Settings,
  Heading as HeadingIcon,
  Type,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  MousePointer,
  Package
} from 'lucide-react';
import { componentRegistry } from '../primitives/registry';
import { generateId } from '../utils/instance';

interface ContextMenuProps {
  x: number;
  y: number;
  instance: ComponentInstance;
  onClose: () => void;
  onSaveAsPrebuilt?: (instance: ComponentInstance) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, instance, onClose, onSaveAsPrebuilt }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const { deleteInstance, updateInstance, addInstance, findInstance } = useBuilderStore();
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleDuplicate = () => {
    const parent = useBuilderStore.getState().rootInstance;
    if (!parent) return;
    
    const findParent = (root: ComponentInstance): ComponentInstance | null => {
      for (const child of root.children) {
        if (child.id === instance.id) return root;
        const found = findParent(child);
        if (found) return found;
      }
      return null;
    };
    
    const parentInstance = findParent(parent);
    if (parentInstance) {
      const index = parentInstance.children.findIndex(c => c.id === instance.id);
      const duplicate = JSON.parse(JSON.stringify(instance));
      duplicate.id = `${instance.type.toLowerCase()}-${Date.now()}`;
      addInstance(duplicate, parentInstance.id, index + 1);
    }
    onClose();
  };

  const handleDelete = () => {
    if (instance.id !== 'root') {
      deleteInstance(instance.id);
    }
    onClose();
  };

  const handleWrapInBox = () => {
    const { rootInstance, addInstance, moveInstance } = useBuilderStore.getState();
    if (!rootInstance) return;
    
    const findParent = (root: ComponentInstance): ComponentInstance | null => {
      for (const child of root.children) {
        if (child.id === instance.id) return root;
        const found = findParent(child);
        if (found) return found;
      }
      return null;
    };
    
    const parentInstance = findParent(rootInstance);
    if (parentInstance) {
      const index = parentInstance.children.findIndex(c => c.id === instance.id);
      
      // Create a proper Div component
      const boxId = generateId();
      const wrapperBox: ComponentInstance = {
        id: boxId,
        type: 'Div',
        label: 'Div',
        props: {},
        styleSourceIds: [],
        children: [],
      };
      
      // Add the wrapper div at the same position
      addInstance(wrapperBox, parentInstance.id, index);
      
      // Move the original instance into the div
      moveInstance(instance.id, boxId, 0);
    }
    onClose();
  };

  const convertOptions = [
    { label: 'Heading', value: 'Heading' },
    { label: 'Paragraph', value: 'Text' },
    { label: 'Link', value: 'Link' },
    { label: 'Button', value: 'Button' },
  ];

  const richTextElements = [
    { label: 'Heading 1', value: 'Heading', icon: HeadingIcon, props: { level: 'h1', children: 'Heading 1' } },
    { label: 'Heading 2', value: 'Heading', icon: HeadingIcon, props: { level: 'h2', children: 'Heading 2' } },
    { label: 'Heading 3', value: 'Heading', icon: HeadingIcon, props: { level: 'h3', children: 'Heading 3' } },
    { label: 'Heading 4', value: 'Heading', icon: HeadingIcon, props: { level: 'h4', children: 'Heading 4' } },
    { label: 'Heading 5', value: 'Heading', icon: HeadingIcon, props: { level: 'h5', children: 'Heading 5' } },
    { label: 'Heading 6', value: 'Heading', icon: HeadingIcon, props: { level: 'h6', children: 'Heading 6' } },
    { label: 'Paragraph', value: 'Text', icon: Type, props: { children: 'Text content goes here' } },
    { label: 'Numbered list', value: 'OrderedList', icon: ListOrdered, props: { items: ['Item 1', 'Item 2', 'Item 3'] } },
    { label: 'Bulleted list', value: 'UnorderedList', icon: List, props: { items: ['Item A', 'Item B', 'Item C'] } },
    { label: 'Blockquote', value: 'Blockquote', icon: Quote, props: { children: 'Block quote' } },
    { label: 'Code block', value: 'CodeBlock', icon: Code, props: { children: '// Code goes here' } },
    { label: 'Link', value: 'Link', icon: LinkIcon, props: { href: '#', children: 'Link text' } },
    { label: 'Image', value: 'Image', icon: ImageIcon, props: { src: 'https://via.placeholder.com/400x300', alt: 'Image' } },
  ];

  const isInRichText = instance.type === 'RichText' || (() => {
    const parent = useBuilderStore.getState().rootInstance;
    const findParent = (root: ComponentInstance): ComponentInstance | null => {
      for (const child of root.children) {
        if (child.id === instance.id) return root;
        const found = findParent(child);
        if (found) return found;
      }
      return null;
    };
    const parentInstance = parent ? findParent(parent) : null;
    return parentInstance?.type === 'RichText';
  })();

  return (
    <div
      ref={menuRef}
      className="fixed bg-popover text-popover-foreground rounded-md shadow-lg border py-1 z-[10000] min-w-[180px] text-sm"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="px-2 py-1.5 text-xs text-muted-foreground border-b font-medium">
        {instance.label || instance.type}
      </div>
      
      <button
        className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
        onClick={handleDuplicate}
      >
        <Copy className="w-3.5 h-3.5" />
        <span className="flex-1">Duplicate</span>
        <span className="text-xs text-muted-foreground">⌘D</span>
      </button>
      
      <button
        className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-destructive disabled:opacity-50"
        onClick={handleDelete}
        disabled={instance.id === 'root'}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="flex-1">Delete</span>
        <span className="text-xs text-muted-foreground">⌫</span>
      </button>
      
      <div className="border-t my-1" />
      
      <div className="relative group">
        <button className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="flex-1">Convert to</span>
          <ChevronRight className="w-3 h-3" />
        </button>
        <div className="hidden group-hover:block absolute left-full top-0 ml-1 bg-popover border rounded-md shadow-lg py-1 min-w-[140px]">
          {convertOptions.map((option) => (
            <button
              key={option.value}
              className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              onClick={() => {
                updateInstance(instance.id, { type: option.value as any });
                onClose();
              }}
            >
              {option.value === 'Heading' && <HeadingIcon className="w-3.5 h-3.5" />}
              {option.value === 'Text' && <Type className="w-3.5 h-3.5" />}
              {option.value === 'Link' && <LinkIcon className="w-3.5 h-3.5" />}
              {option.value === 'Button' && <MousePointer className="w-3.5 h-3.5" />}
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <button
        className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
        onClick={handleWrapInBox}
      >
        <BoxIcon className="w-3.5 h-3.5" />
        <span>Wrap in Div</span>
      </button>
      
      <button
        className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-green-600"
        onClick={() => {
          onSaveAsPrebuilt?.(instance);
          onClose();
        }}
      >
        <Package className="w-3.5 h-3.5" />
        <span>Save as Prebuilt</span>
      </button>
      
      {isInRichText && (
        <>
          <div className="border-t my-1" />
          <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
            Add rich text element
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin">
            {richTextElements.map((element) => {
              const Icon = element.icon;
              return (
                <button
                  key={element.label}
                  className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
                  onClick={() => {
                    const newId = generateId();
                    const meta = componentRegistry[element.value];
                    
                    const newInstance: ComponentInstance = {
                      id: newId,
                      type: element.value as any,
                      label: element.label,
                      props: element.props || { ...meta?.defaultProps },
                      styleSourceIds: [],
                      children: [],
                    };
                    
                    addInstance(newInstance, instance.id);
                    onClose();
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {element.label}
                </button>
              );
            })}
          </div>
        </>
      )}
      
      <div className="border-t my-1" />
      
      <button
        className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
        onClick={onClose}
      >
        <Settings className="w-3.5 h-3.5" />
        <span>Open settings</span>
      </button>
    </div>
  );
};
