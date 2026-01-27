import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ComponentInstance } from '../store/types';
import { canDropInside } from '../utils/instance';
import { useStyleStore } from '../store/useStyleStore';

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
    'Form', 'Navigation', 'Breadcrumb',
    'Calendar', 'CalendarHeader', 'CalendarFooter'
  ];
  const isContainerType = containerTypes.includes(instance.type);

  // Check for Webflow imports that need stacking context
  const { styleSources, styles } = useStyleStore();
  const hasWebflowImport = instance.styleSourceIds?.some(id => {
    const name = styleSources[id]?.name;
    return name?.startsWith('wf-');
  });
  
  // Check if this element has absolute/fixed positioning (should not get position: relative)
  const hasAbsolutePosition = instance.styleSourceIds?.some(id => {
    const positionKey = `${id}:desktop:default:position`;
    const positionValue = styles[positionKey];
    return positionValue === 'absolute' || positionValue === 'fixed';
  });
  
  // Check if this is a droppable container (for min-height when empty)
  const isDroppableContainer = canDropInside(instance.type);

  // Get child IDs for sortable context
  const childIds = instance.children.map(child => child.id);

  // Check if this is the Navigation root (Section with htmlTag='nav')
  const isNavigationRoot = instance.type === 'Section' && instance.props?.htmlTag === 'nav';

  // Check for components that use prop-based content (not children) - these should not show empty state
  const hasPropBasedContent = 
    (instance.type === 'Separator' && instance.props?.separatorSettings);

  // Only show empty state for non-root droppable containers that have no children
  // Root instance should never show the "Drop elements here" placeholder
  const isEmpty = isDroppableContainer && instance.children.length === 0 && !isRootInstance && !hasPropBasedContent;

  // Determine if we're being dragged over with a valid dragged item
  const isDragActive = !!active;
  const isValidDropTarget = isOver && isDragActive && isDroppableContainer;

  // CRITICAL: For container types, we need a measurable wrapper for dnd-kit collision detection.
  // Using display: contents makes the element invisible to collision detection.
  // For containers and Webflow imports, use display: block with width: 100% to ensure proper bounding box.
  // 
  // KEY FIX: For Webflow imports, we must NOT set position: relative on the wrapper because:
  // 1. It creates an unintended containing block for absolutely positioned children
  // 2. Absolutely positioned elements (decorative lines, etc.) would be positioned relative to 
  //    the wrapper instead of their actual CSS-styled parent
  // 3. We use isolation: isolate instead - it creates stacking context WITHOUT being a containing block
  const wrapperStyle: React.CSSProperties = isContainerType
    ? {
        display: 'block',
        width: '100%',
        // For Webflow imports, don't set position - let CSS classes control containing blocks
        // For native builder containers, set position:relative for proper dnd-kit behavior
        position: hasWebflowImport ? undefined : 'relative' as const,
        // NOTE: No isolation:isolate here - page-level stacking context (.builder-page) handles z-index
        // Add prominent blue visual feedback when dragging over this container
        outline: isValidDropTarget ? '2px dashed #3b82f6' : undefined,
        outlineOffset: isValidDropTarget ? '-2px' : undefined,
        backgroundColor: isValidDropTarget ? 'rgba(59, 130, 246, 0.08)' : undefined,
        borderRadius: isValidDropTarget ? '6px' : undefined,
        transition: 'outline 150ms ease, background-color 150ms ease',
      }
    : hasWebflowImport && !hasAbsolutePosition
    ? {
        // Webflow non-container elements - no isolation needed, page-level stacking context handles z-index
        display: 'block',
        width: '100%',
      }
    : hasWebflowImport && hasAbsolutePosition
    ? {
        // For absolutely positioned Webflow elements, use display: contents
        // to allow CSS classes to fully control positioning
        display: 'contents',
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
            className="flex items-center justify-center rounded-lg transition-all duration-150"
            style={{ 
              minHeight: '60px', 
              width: '100%',
              border: isValidDropTarget ? '2px dashed #3b82f6' : '2px dashed #cbd5e1',
              backgroundColor: isValidDropTarget ? 'rgba(59, 130, 246, 0.08)' : 'rgba(241, 245, 249, 0.5)',
            }}
          >
            <span 
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: isValidDropTarget ? '#3b82f6' : '#94a3b8' }}
            >
              {isValidDropTarget ? 'Drop here' : 'Drop elements here'}
            </span>
          </div>
        ) : (
          children
        )}
      </SortableContext>
    </div>
  );
};
