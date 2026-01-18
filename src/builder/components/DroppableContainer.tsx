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
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  instance,
  children,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isInsideNavigation = false,
}) => {
  const { setNodeRef } = useDroppable({
    id: `droppable-${instance.id}`,
    data: { instanceId: instance.id, type: instance.type },
  });

  // Full-width container types should take full width
  // Use canDropInside to include all container-like components
  const fullWidthTypes = ['Div', 'Section', 'Container', 'Navigation', 'Accordion', 'Tabs', 'Carousel', 'Breadcrumb', 'Table'];
  const isFullWidthContainer = fullWidthTypes.includes(instance.type);
  
  // Check if this is a droppable container (for min-height when empty)
  const isDroppableContainer = canDropInside(instance.type);

  // Get child IDs for sortable context
  const childIds = instance.children.map(child => child.id);

  // Check if this is the Navigation root (Section with htmlTag='nav')
  const isNavigationRoot = instance.type === 'Section' && instance.props?.htmlTag === 'nav';

  const isEmpty = isDroppableContainer && instance.children.length === 0;

  return (
    <div
      ref={setNodeRef}
      data-droppable-id={instance.id}
      style={{
        // Use display: contents to make wrapper invisible to CSS layout
        // This preserves flex/grid child positioning and CSS selectors for imported components
        display: 'contents',
      }}
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
            className="flex items-center justify-center border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 dark:bg-blue-950/20"
            style={{ minHeight: '60px', width: '100%' }}
          >
            <span className="text-sm text-blue-500 font-medium">Drop elements here</span>
          </div>
        ) : (
          children
        )}
      </SortableContext>
    </div>
  );
};
