import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ComponentInstance } from '../store/types';

interface DroppableContainerProps {
  instance: ComponentInstance;
  children: React.ReactNode;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  instance,
  children,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
}) => {
  const { setNodeRef } = useDroppable({
    id: `droppable-${instance.id}`,
    data: { instanceId: instance.id, type: instance.type },
  });

  // Full-width container types should take full width
  const isFullWidthContainer = ['Div', 'Section', 'Container', 'Navigation'].includes(instance.type);

  // Get child IDs for sortable context
  const childIds = instance.children.map(child => child.id);

  return (
    <div
      ref={setNodeRef}
      data-droppable-id={instance.id}
      style={{
        position: 'relative',
        width: isFullWidthContainer ? '100%' : undefined,
        minWidth: isFullWidthContainer ? '100%' : undefined,
        flexBasis: isFullWidthContainer ? '100%' : undefined,
        minHeight: isFullWidthContainer && instance.children.length === 0 ? '100px' : undefined,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
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
        {children}
      </SortableContext>
    </div>
  );
};
