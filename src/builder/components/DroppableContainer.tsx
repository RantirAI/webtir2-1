import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ComponentInstance } from '../store/types';
import { canDropInside } from '../utils/instance';

interface DroppableContainerProps {
  instance: ComponentInstance;
  children: React.ReactNode;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isInsideNavigation?: boolean;
  isRootInstance?: boolean; // Flag to identify root instance - don't show empty state for root
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  instance,
  children,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isInsideNavigation = false,
  isRootInstance = false,
}) => {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `droppable-${instance.id}`,
    data: { instanceId: instance.id, type: instance.type },
  });

  // Container types that need measurable bounding boxes for drag-and-drop
  const containerTypes = [
    'Div', 'Section', 'Container', 'Box', 'RichText', 
    'Accordion', 'AccordionItem', 'Tabs', 'TabPanel', 
    'Carousel', 'CarouselSlide', 'Table', 'TableCell', 
    'Form', 'Navigation', 'Breadcrumb'
  ];
  const isContainerType = containerTypes.includes(instance.type);
  
  // Check if this is a droppable container (for min-height when empty)
  const isDroppableContainer = canDropInside(instance.type);

  // Get child IDs for sortable context
  const childIds = instance.children.map(child => child.id);

  // Check if this is the Navigation root (Section with htmlTag='nav')
  const isNavigationRoot = instance.type === 'Section' && instance.props?.htmlTag === 'nav';

  // Only show empty state for non-root droppable containers that have no children
  // Root instance should never show the "Drop elements here" placeholder
  const isEmpty = isDroppableContainer && instance.children.length === 0 && !isRootInstance;

  // Determine if we're being dragged over with a valid dragged item
  const isDragActive = !!active;
  const isValidDropTarget = isOver && isDragActive && isDroppableContainer;

  // CRITICAL: For container types, we need a measurable wrapper for dnd-kit collision detection.
  // Using display: contents makes the element invisible to collision detection.
  // For containers, use display: block with width: 100% to ensure proper bounding box.
  const wrapperStyle: React.CSSProperties = isContainerType
    ? {
        display: 'block',
        width: '100%',
        position: 'relative' as const,
        // Add visual feedback when dragging over this container
        outline: isValidDropTarget ? '2px dashed hsl(var(--primary) / 0.6)' : undefined,
        outlineOffset: isValidDropTarget ? '-2px' : undefined,
        backgroundColor: isValidDropTarget ? 'hsl(var(--primary) / 0.05)' : undefined,
        borderRadius: isValidDropTarget ? '4px' : undefined,
      }
    : {
        // For non-containers, use display: contents to preserve layout
        display: 'contents',
      };

  return (
    <div
      ref={setNodeRef}
      data-droppable-id={instance.id}
      data-is-container={isContainerType}
      style={wrapperStyle}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        const closestDroppable = target.closest('[data-droppable-id]');
        const clickedDroppableId = closestDroppable?.getAttribute('data-droppable-id');
        
        // Find the actual clicked instance element
        const clickedInstanceEl = target.closest('[data-instance-id]');
        const clickedInstanceId = clickedInstanceEl?.getAttribute('data-instance-id');

        // If this is the Navigation root, handle clicks specially
        if (isNavigationRoot) {
          // Check if click was directly on a leaf element (Text, Link, Button, etc.)
          // These are elements that have data-instance-id but are NOT droppable containers
          const isLeafElement = clickedInstanceId && clickedInstanceId !== clickedDroppableId;
          
          if (isLeafElement) {
            // Click was on a leaf child element - don't intercept, let normal selection happen
            // But the leaf element's DraggableInstance should handle this
            return;
          }
          
          // Click was on the Container area (padding) or directly on Section
          // Select the Navigation root
          e.stopPropagation();
          onSelect?.();
          return;
        }

        // If this is a Container inside Navigation and user clicked on this container's area,
        // let the click bubble up to the Navigation root
        if (isInsideNavigation && instance.type === 'Container') {
          // Check if click was on a leaf element inside this container
          const isLeafElement = clickedInstanceId && clickedInstanceId !== clickedDroppableId;
          
          if (isLeafElement) {
            // Click was on a leaf child - don't intercept
            return;
          }
          
          // Click was on Container padding - let it bubble to Navigation root
          return;
        }

        // If the closest droppable is this container, select it
        if (clickedDroppableId === instance.id) {
          e.stopPropagation();
          onSelect?.();
        }
        // Otherwise, let the click bubble up
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHover?.();
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onHoverEnd?.();
      }}
      onContextMenu={onContextMenu}
    >
      {/* Wrap children in SortableContext for reordering */}
      <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
        {isEmpty ? (
          <div 
            className="flex items-center justify-center border-2 border-dashed border-primary/40 rounded-lg bg-primary/5"
            style={{ 
              minHeight: '60px', 
              width: '100%',
            }}
          >
            <span className="text-sm text-primary font-medium">Drop elements here</span>
          </div>
        ) : (
          children
        )}
      </SortableContext>
    </div>
  );
};
