import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentInstance } from '../store/types';

interface DraggableInstanceProps {
  instance: ComponentInstance;
  children: React.ReactNode;
  isContainer: boolean;
}

export const DraggableInstance: React.FC<DraggableInstanceProps> = ({
  instance,
  children,
  isContainer,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({
    id: instance.id,
    data: {
      type: instance.type,
      instanceId: instance.id,
      instance: instance,
      isContainer,
    },
  });

  const isFullWidth = ['Section', 'Container'].includes(instance.type);

  // Important: avoid setting an "identity" CSS transform (e.g. translate3d(0,0,0))
  // because some browsers have contentEditable caret/input bugs inside transformed ancestors.
  const hasTransform =
    !!transform &&
    (transform.x !== 0 || transform.y !== 0 || transform.scaleX !== 1 || transform.scaleY !== 1);

  // Use display: contents when not dragging to make wrapper invisible to CSS layout
  // This preserves flex/grid child positioning and CSS selectors for imported components
  const style: React.CSSProperties = isDragging
    ? {
        transform: hasTransform ? CSS.Transform.toString(transform) : undefined,
        transition: transition || 'transform 200ms cubic-bezier(0.2, 0, 0, 1)',
        opacity: 0.4,
        position: 'relative',
        zIndex: 1000,
        width: isFullWidth ? '100%' : undefined,
        minWidth: isFullWidth ? '100%' : undefined,
        flexBasis: isFullWidth ? '100%' : undefined,
      }
    : {
        display: 'contents',
      };

  // Show insertion indicator when dragging over (for reordering siblings)
  const showInsertIndicator = isOver && active && active.id !== instance.id;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Top insertion indicator */}
      {showInsertIndicator && (
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '0',
            right: '0',
            height: '4px',
            backgroundColor: '#3b82f6',
            borderRadius: '2px',
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
          }}
        >
          {/* Left circle indicator */}
          <div
            style={{
              position: 'absolute',
              left: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(59, 130, 246, 0.8)',
            }}
          />
          {/* Right circle indicator */}
          <div
            style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              boxShadow: '0 0 4px rgba(59, 130, 246, 0.8)',
            }}
          />
        </div>
      )}

      {/* Drag placeholder when item is being dragged */}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px dashed #cbd5e1',
            backgroundColor: 'rgba(203, 213, 225, 0.1)',
            borderRadius: '4px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {children}
    </div>
  );
};
