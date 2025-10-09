import React from 'react';
import { useDroppable } from '@dnd-kit/core';
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
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${instance.id}`,
    data: { instanceId: instance.id, type: instance.type },
  });

  return (
    <div
      ref={setNodeRef}
      data-droppable-id={instance.id}
      style={{
        position: 'relative',
        outline: isOver ? '2px solid #3b82f6' : undefined,
        outlineOffset: '2px',
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : undefined,
        transition: 'all 0.2s ease',
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
      {isOver && (
        <div 
          style={{
            position: 'absolute',
            top: '-20px',
            left: '0',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: '600',
            borderRadius: '4px',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          {instance.label || instance.type}
        </div>
      )}
      {children}
    </div>
  );
};
