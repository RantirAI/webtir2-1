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
