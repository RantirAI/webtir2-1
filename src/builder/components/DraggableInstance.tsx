import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

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

  const isFullWidth = ['Section', 'Container', 'Div', 'Box'].includes(instance.type);

  // Check if wrapped element needs proper positioning context (Webflow imports)
  const { styleSources } = useStyleStore();
  const hasPositionedContent = instance.styleSourceIds?.some(id => {
    const source = styleSources[id];
    const name = source?.name || '';
    return name.startsWith('wf-') || name.includes('absolute') || name.includes('background');
  });

  // Important: avoid setting an "identity" CSS transform (e.g. translate3d(0,0,0))
  // because some browsers have contentEditable caret/input bugs inside transformed ancestors.
  const hasTransform =
    !!transform &&
    (transform.x !== 0 || transform.y !== 0 || transform.scaleX !== 1 || transform.scaleY !== 1);

  // For container types, we need a proper wrapper for drag operations
  // For non-containers, use display: contents when not dragging to preserve CSS layout
  // Exception: Webflow imports need block display to preserve stacking context
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
    : isContainer
    ? {
        // For containers, use block display to allow proper sizing
        display: 'block',
        width: '100%',
      }
    : hasPositionedContent
    ? {
        // For Webflow imports, use block display to preserve stacking context
        display: 'block',
        width: '100%',
        position: 'relative',
        isolation: 'isolate',
      }
    : {
        // For non-containers (leaf elements), use display: contents
        display: 'contents',
      };

  // Show insertion indicator when dragging over (for reordering siblings)
  const showInsertIndicator = isOver && active && active.id !== instance.id && !isContainer;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* Top insertion indicator */}
      {showInsertIndicator && (
        <div
          className="bg-primary rounded"
          style={{
            position: 'absolute',
            top: '-2px',
            left: '0',
            right: '0',
            height: '4px',
            zIndex: 9999,
            pointerEvents: 'none',
            boxShadow: '0 0 8px hsl(var(--primary) / 0.6)',
          }}
        >
          {/* Left circle indicator */}
          <div
            className="bg-primary rounded-full"
            style={{
              position: 'absolute',
              left: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              boxShadow: '0 0 4px hsl(var(--primary) / 0.8)',
            }}
          />
          {/* Right circle indicator */}
          <div
            className="bg-primary rounded-full"
            style={{
              position: 'absolute',
              right: '-4px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '8px',
              boxShadow: '0 0 4px hsl(var(--primary) / 0.8)',
            }}
          />
        </div>
      )}

      {/* Drag placeholder when item is being dragged */}
      {isDragging && (
        <div
          className="border-2 border-dashed border-muted-foreground/30 bg-muted/10 rounded"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {children}
    </div>
  );
};
