import React, { useEffect, useState, useRef } from 'react';
import { ComponentInstance } from '../store/types';
import { ArrowUp, ArrowDown, Settings, Plus } from 'lucide-react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { useComponentInstanceStore } from '../store/useComponentInstanceStore';
import { usePageStore } from '../store/usePageStore';
import { getCanvasComputedStyles } from '../utils/canvasStyles';

interface SelectionOverlayProps {
  instance: ComponentInstance;
  element: HTMLElement;
  onOpenHeadingSettings?: (position: { x: number; y: number }) => void;
  onAddElement?: (position: { x: number; y: number }) => void;
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
    // Get the linked root instance
    const linkedRoot = findInTree(rootInstance, link.instanceId);
    if (!linkedRoot) continue;
    
    // Check if instanceId is the linked root OR is a descendant of it
    if (link.instanceId === instanceId) return true;
    if (findInTree(linkedRoot, instanceId)) return true;
  }
  return false;
};

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ instance, element, onOpenHeadingSettings, onAddElement }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { moveInstance, rootInstance } = useBuilderStore();
  const { isLinkedInstance } = useComponentInstanceStore();
  const { getGlobalComponent } = usePageStore();
  
  // Check both direct link AND if inside a linked prebuilt subtree
  const isPrebuilt = isLinkedInstance(instance.id) || isInsideLinkedPrebuilt(instance.id, rootInstance);
  
  // Check if this instance is a global component
  const globalHeader = getGlobalComponent('header');
  const globalFooter = getGlobalComponent('footer');
  const isGlobalHeader = globalHeader?.id === instance.id;
  const isGlobalFooter = globalFooter?.id === instance.id;
  const globalLabel = isGlobalHeader ? 'Global Header' : isGlobalFooter ? 'Global Footer' : null;
  
  // Get computed styles to check if element has grid display - use scoped state
  const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);
  const isGrid = computedStyles.display === 'grid';
  
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
  const isRichText = instance.type === 'RichText';
  
  // Colors based on prebuilt status
  const borderColor = isPrebuilt ? 'border-green-500' : 'border-blue-500';
  const bgColor = isPrebuilt ? 'bg-green-500' : 'bg-blue-500';
  const hoverBgColor = isPrebuilt ? 'hover:bg-green-600' : 'hover:bg-blue-600';

  // Parse grid template columns/rows for grid overlay
  const parseGridTemplate = (template: string | undefined): number => {
    if (!template) return 0;
    // Handle repeat() notation
    const repeatMatch = template.match(/repeat\((\d+),/);
    if (repeatMatch) return parseInt(repeatMatch[1]);
    // Handle space-separated values
    const values = template.split(' ').filter(v => v.trim());
    return values.length;
  };

  const gridCols = isGrid ? parseGridTemplate(computedStyles.gridTemplateColumns) : 0;
  const gridRows = isGrid ? parseGridTemplate(computedStyles.gridTemplateRows) : 0;
  
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenHeadingSettings && rect) {
      onOpenHeadingSettings({ 
        x: rect.left + rect.width + 10, 
        y: rect.top 
      });
    }
  };

  const handleAddElementClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddElement && rect) {
      onAddElement({ 
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
      {/* Border - green for prebuilt, blue for normal */}
      <div className={`absolute inset-0 border-2 ${borderColor} rounded pointer-events-none`} />
      
      {/* Grid overlay for grid layouts */}
      {isGrid && gridCols > 0 && gridRows > 0 && (
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Vertical lines for columns */}
          {Array.from({ length: gridCols + 1 }).map((_, i) => {
            const x = (i / gridCols) * 100;
            return (
              <line
                key={`col-${i}`}
                x1={`${x}%`}
                y1="0"
                x2={`${x}%`}
                y2="100%"
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            );
          })}
          
          {/* Horizontal lines for rows */}
          {Array.from({ length: gridRows + 1 }).map((_, i) => {
            const y = (i / gridRows) * 100;
            return (
              <line
                key={`row-${i}`}
                x1="0"
                y1={`${y}%`}
                x2="100%"
                y2={`${y}%`}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            );
          })}
        </svg>
      )}
      
      {/* Label badge with arrows and settings */}
      <div className="absolute -top-7 left-0 flex items-center gap-0.5 pointer-events-auto">
        <div className={`${bgColor} text-white p-1 rounded text-[10px] font-medium flex items-center gap-1`}>
          {label}
          {isPrebuilt && <span className="text-[9px] opacity-80">●</span>}
          {isHeading && (
            <span className="text-[9px] opacity-80">
              {instance.props.level || 'h1'}
            </span>
          )}
        </div>
        {isHeading && (
          <button
            onClick={handleSettingsClick}
            className={`${bgColor} ${hoverBgColor} text-white p-0.5 rounded transition-colors`}
            title="Heading settings"
          >
            <Settings className="w-3 h-3" />
          </button>
        )}
        {isRichText && (
          <button
            onClick={handleAddElementClick}
            className={`${bgColor} ${hoverBgColor} text-white p-0.5 rounded transition-colors`}
            title="Add element"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={handleMoveUp}
          className={`${bgColor} ${hoverBgColor} text-white p-0.5 rounded transition-colors`}
          title="Move up"
        >
          <ArrowUp className="w-3 h-3" />
        </button>
        <button
          onClick={handleMoveDown}
          className={`${bgColor} ${hoverBgColor} text-white p-0.5 rounded transition-colors`}
          title="Move down"
        >
          <ArrowDown className="w-3 h-3" />
        </button>
      </div>
      
      {/* Global component badge on the right */}
      {globalLabel && (
        <div className="absolute -top-7 right-0 pointer-events-none">
          <div className="bg-green-500 text-white p-1 rounded text-[10px] font-medium whitespace-nowrap">
            {globalLabel}
          </div>
        </div>
      )}
    </div>
  );
};
