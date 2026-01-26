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
  // We need to distinguish between:
  // 1. Elements that ARE positioned (absolute/fixed) - don't override their position
  // 2. Elements that CONTAIN positioned children - need stacking context (isolation: isolate)
  const { styleSources, styles } = useStyleStore();
  
  // Check if this element has Webflow-imported styles
  const hasWebflowStyles = instance.styleSourceIds?.some(id => {
    const name = styleSources[id]?.name || '';
    return name.startsWith('wf-');
  });
  
  // Check if this element itself has position: absolute or fixed defined
  const hasAbsolutePosition = instance.styleSourceIds?.some(id => {
    const positionKey = `${id}:desktop:default:position`;
    const positionValue = styles[positionKey];
    return positionValue === 'absolute' || positionValue === 'fixed';
  });
  
  // Webflow imports that are NOT absolutely positioned need stacking context wrapper
  const needsStackingContext = hasWebflowStyles && !hasAbsolutePosition;

  // Important: avoid setting an "identity" CSS transform (e.g. translate3d(0,0,0))
  // because some browsers have contentEditable caret/input bugs inside transformed ancestors.
  const hasTransform =
    !!transform &&
    (transform.x !== 0 || transform.y !== 0 || transform.scaleX !== 1 || transform.scaleY !== 1);

  // For container types, we need a proper wrapper for drag operations
  // For non-containers, use display: contents when not dragging to preserve CSS layout
  // 
  // KEY FIX: For Webflow imports, we must NOT set position: relative on the wrapper because:
  // 1. It creates an unintended containing block for absolutely positioned children
  // 2. Absolutely positioned elements would be positioned relative to wrapper instead of 
  //    their actual CSS-styled parent
  // 3. We use isolation: isolate instead - creates stacking context WITHOUT being containing block
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
        // No position:relative - let CSS classes control containing blocks
        display: 'block',
        width: '100%',
        // For Webflow containers, add isolation for stacking context without containing block
        isolation: hasWebflowStyles ? 'isolate' : undefined,
      }
    : needsStackingContext
    ? {
        // For Webflow imports that contain positioned children, create stacking context
        // but DON'T set position to allow CSS classes to control positioning
        display: 'block',
        width: '100%',
        isolation: 'isolate',
        // NO position: relative - this is the key fix for decorative elements visibility
      }
    : hasAbsolutePosition
    ? {
        // For absolutely positioned elements, use display: contents to not interfere
        // with CSS class positioning - the element itself will be positioned by CSS
        display: 'contents',
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
