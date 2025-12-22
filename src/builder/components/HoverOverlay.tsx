import React, { useEffect, useState } from 'react';
import { useComponentInstanceStore } from '../store/useComponentInstanceStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';

interface HoverOverlayProps {
  element: HTMLElement;
  instanceId?: string;
}

// Check if an instance is inside any linked prebuilt subtree
const isInsideLinkedPrebuilt = (instanceId: string, rootInstance: ComponentInstance | null): boolean => {
  if (!rootInstance) return false;
  const { instanceLinks } = useComponentInstanceStore.getState();
  
  // Helper to find instance in tree
  const findInTree = (tree: ComponentInstance, id: string): ComponentInstance | null => {
    if (tree.id === id) return tree;
    for (const child of tree.children || []) {
      const found = findInTree(child, id);
      if (found) return found;
    }
    return null;
  };
  
  for (const link of instanceLinks) {
    const linkedRoot = findInTree(rootInstance, link.instanceId);
    if (!linkedRoot) continue;
    if (link.instanceId === instanceId) return true;
    if (findInTree(linkedRoot, instanceId)) return true;
  }
  return false;
};

export const HoverOverlay: React.FC<HoverOverlayProps> = ({ element, instanceId }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const { isLinkedInstance } = useComponentInstanceStore();
  const rootInstance = useBuilderStore(state => state.rootInstance);
  
  // Check both direct link AND if inside a linked prebuilt subtree
  const isPrebuilt = instanceId 
    ? (isLinkedInstance(instanceId) || isInsideLinkedPrebuilt(instanceId, rootInstance)) 
    : false;
  const borderColor = isPrebuilt ? '#22c55e' : '#3b82f6';
  const bgColor = isPrebuilt ? 'rgba(34, 197, 94, 0.05)' : 'rgba(59, 130, 246, 0.05)';
  
  useEffect(() => {
    const updateRect = () => {
      const newRect = element.getBoundingClientRect();
      setRect(newRect);
    };
    
    updateRect();
    
    const observer = new ResizeObserver(updateRect);
    observer.observe(element);
    
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [element]);
  
  if (!rect) return null;
  
  return (
    <div
      className="fixed pointer-events-none z-[9998]"
      style={{
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    >
      {/* Dashed border */}
      <div 
        className="absolute inset-0 rounded pointer-events-none" 
        style={{
          border: `2px dashed ${borderColor}`,
          backgroundColor: bgColor,
        }}
      />
    </div>
  );
};
