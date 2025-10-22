import React, { useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { ChevronRight } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  instance: ComponentInstance;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, instance, onClose }) => {
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
    const { rootInstance, updateInstance } = useBuilderStore.getState();
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
      
      // Create a proper Box component using addInstance
      const wrapperBox: ComponentInstance = {
        id: `box-${Date.now()}`,
        type: 'Box',
        label: 'Wrapper Box',
        props: {},
        styleSourceIds: [], // Will be assigned default styles when selected
        children: [],
      };
      
      // Use addInstance to properly create the box with the instance as its child
      addInstance(wrapperBox, parentInstance.id, index);
      
      // Remove the instance from its current parent
      const newParentChildren = parentInstance.children.filter(c => c.id !== instance.id);
      updateInstance(parentInstance.id, { children: newParentChildren });
      
      // Add instance to the new wrapper box
      addInstance(instance, wrapperBox.id, 0);
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
    { label: 'Heading 1', value: 'Heading', props: { level: 'h1', children: 'Heading 1' } },
    { label: 'Heading 2', value: 'Heading', props: { level: 'h2', children: 'Heading 2' } },
    { label: 'Heading 3', value: 'Heading', props: { level: 'h3', children: 'Heading 3' } },
    { label: 'Heading 4', value: 'Heading', props: { level: 'h4', children: 'Heading 4' } },
    { label: 'Heading 5', value: 'Heading', props: { level: 'h5', children: 'Heading 5' } },
    { label: 'Heading 6', value: 'Heading', props: { level: 'h6', children: 'Heading 6' } },
    { label: 'Paragraph', value: 'Text', props: { children: 'Text content goes here' } },
    { label: 'Numbered list', value: 'OrderedList', props: { items: ['Item 1', 'Item 2', 'Item 3'] } },
    { label: 'Bulleted list', value: 'UnorderedList', props: { items: ['Item A', 'Item B', 'Item C'] } },
    { label: 'Blockquote', value: 'Blockquote', props: { children: 'Block quote' } },
    { label: 'Code block', value: 'CodeBlock', props: { children: '// Code goes here' } },
    { label: 'Link', value: 'Link', props: { href: '#', children: 'Link text' } },
    { label: 'Image', value: 'Image', props: { src: 'https://via.placeholder.com/400x300', alt: 'Image' } },
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
      className="fixed bg-zinc-800 text-white rounded-lg shadow-2xl py-1 z-[10000] min-w-[220px] text-sm"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="px-3 py-2 text-xs text-zinc-400 border-b border-zinc-700">
        {instance.label || instance.type}
      </div>
      
      <button
        className="w-full px-3 py-1.5 text-left hover:bg-zinc-700 flex items-center justify-between"
        onClick={handleDuplicate}
      >
        <span>Duplicate</span>
        <span className="text-xs text-zinc-400">Ctrl + D</span>
      </button>
      
      <button
        className="w-full px-3 py-1.5 text-left hover:bg-zinc-700 flex items-center justify-between text-red-400"
        onClick={handleDelete}
        disabled={instance.id === 'root'}
      >
        <span>Delete</span>
        <span className="text-xs text-zinc-400">Backspace</span>
      </button>
      
      <div className="border-t border-zinc-700 my-1" />
      
      <div className="relative group">
        <button className="w-full px-3 py-1.5 text-left hover:bg-zinc-700 flex items-center justify-between">
          <span>Convert to</span>
          <ChevronRight className="w-3 h-3" />
        </button>
        <div className="hidden group-hover:block absolute left-full top-0 ml-1 bg-zinc-800 rounded-lg shadow-2xl py-1 min-w-[160px]">
          {convertOptions.map((option) => (
            <button
              key={option.value}
              className="w-full px-3 py-1.5 text-left hover:bg-zinc-700"
              onClick={() => {
                updateInstance(instance.id, { type: option.value as any });
                onClose();
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      <button
        className="w-full px-3 py-1.5 text-left hover:bg-zinc-700"
        onClick={handleWrapInBox}
      >
        Wrap in Box
      </button>
      
      {isInRichText && (
        <>
          <div className="border-t border-zinc-700 my-1" />
          <div className="px-3 py-2 text-xs text-zinc-400">
            Add rich text element
          </div>
          <div className="max-h-60 overflow-y-auto">
            {richTextElements.map((element) => (
              <button
                key={element.label}
                className="w-full px-3 py-1.5 text-left hover:bg-zinc-700"
                onClick={() => {
                  const { componentRegistry } = require('../primitives/registry');
                  const { generateId } = require('../utils/instance');
                  const { useStyleStore } = require('../store/useStyleStore');
                  const meta = componentRegistry[element.value];
                  if (!meta) return;
                  
                  const newId = generateId();
                  const newInstance: ComponentInstance = {
                    id: newId,
                    type: element.value as any,
                    label: meta.label,
                    props: element.props || { ...meta.defaultProps },
                    styleSourceIds: [],
                    children: [],
                  };
                  
                  addInstance(newInstance, instance.id);
                  onClose();
                }}
              >
                {element.label}
              </button>
            ))}
          </div>
        </>
      )}
      
      <div className="border-t border-zinc-700 my-1" />
      
      <button
        className="w-full px-3 py-1.5 text-left hover:bg-zinc-700 flex items-center justify-between"
        onClick={onClose}
      >
        <span>Open settings</span>
      </button>
    </div>
  );
};
