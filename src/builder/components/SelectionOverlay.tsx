import React, { useEffect, useState, useRef } from 'react';
import { ComponentInstance } from '../store/types';
import { ArrowUp, ArrowDown, Settings } from 'lucide-react';
import { useBuilderStore } from '../store/useBuilderStore';

interface SelectionOverlayProps {
  instance: ComponentInstance;
  element: HTMLElement;
  onOpenHeadingSettings?: (position: { x: number; y: number }) => void;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ instance, element, onOpenHeadingSettings }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { moveInstance, findInstance } = useBuilderStore();
  
  useEffect(() => {
    const updateRect = () => {
      const newRect = element.getBoundingClientRect();
      setRect(newRect);
    };
    
    updateRect();
    
    // Update on animation frames for smooth tracking
    let animationFrameId: number;
    const trackPosition = () => {
      updateRect();
      animationFrameId = requestAnimationFrame(trackPosition);
    };
    trackPosition();
    
    const observer = new ResizeObserver(updateRect);
    observer.observe(element);
    
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [element, instance.id]);
  
  if (!rect || instance.id === 'root') return null;

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rootInstance = useBuilderStore.getState().rootInstance;
    if (!rootInstance) return;
    
    const findParentAndIndex = (root: ComponentInstance): { parent: ComponentInstance; index: number } | null => {
      for (const child of root.children) {
        const idx = child.children.findIndex(c => c.id === instance.id);
        if (idx !== -1) return { parent: child, index: idx };
        const found = findParentAndIndex(child);
        if (found) return found;
      }
      const idx = root.children.findIndex(c => c.id === instance.id);
      if (idx !== -1) return { parent: root, index: idx };
      return null;
    };
    
    const result = findParentAndIndex(rootInstance);
    if (result && result.index > 0) {
      moveInstance(instance.id, result.parent.id, result.index - 1);
    }
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rootInstance = useBuilderStore.getState().rootInstance;
    if (!rootInstance) return;
    
    const findParentAndIndex = (root: ComponentInstance): { parent: ComponentInstance; index: number } | null => {
      for (const child of root.children) {
        const idx = child.children.findIndex(c => c.id === instance.id);
        if (idx !== -1) return { parent: child, index: idx };
        const found = findParentAndIndex(child);
        if (found) return found;
      }
      const idx = root.children.findIndex(c => c.id === instance.id);
      if (idx !== -1) return { parent: root, index: idx };
      return null;
    };
    
    const result = findParentAndIndex(rootInstance);
    if (result && result.index < result.parent.children.length - 1) {
      moveInstance(instance.id, result.parent.id, result.index + 1);
    }
  };

  const label = instance.label || instance.type;
  const isHeading = instance.type === 'Heading';
  
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenHeadingSettings && rect) {
      onOpenHeadingSettings({ 
        x: rect.left + rect.width + 10, 
        y: rect.top 
      });
    }
  };
  
  return (
    <div
      ref={overlayRef}
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    >
      {/* Blue border */}
      <div className="absolute inset-0 border-2 border-blue-500 rounded pointer-events-none" />
      
      {/* Label badge with arrows and settings */}
      <div className="absolute -top-7 left-0 flex items-center gap-0.5 pointer-events-auto">
        <div className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
          {label}
          {isHeading && (
            <span className="text-[9px] opacity-80">
              {instance.props.level || 'h1'}
            </span>
          )}
        </div>
        {isHeading && (
          <button
            onClick={handleSettingsClick}
            className="bg-blue-500 hover:bg-blue-600 text-white p-0.5 rounded transition-colors"
            title="Heading settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={handleMoveUp}
          className="bg-blue-500 hover:bg-blue-600 text-white p-0.5 rounded transition-colors"
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          onClick={handleMoveDown}
          className="bg-blue-500 hover:bg-blue-600 text-white p-0.5 rounded transition-colors"
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
