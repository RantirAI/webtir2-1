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
        outline: isOver ? '3px dashed #10b981' : undefined,
        outlineOffset: '4px',
        backgroundColor: isOver ? 'rgba(16, 185, 129, 0.1)' : undefined,
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
        <>
          {/* Prominent drop indicator overlay */}
          <div 
            style={{
              position: 'absolute',
              inset: '0',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '3px dashed #10b981',
              borderRadius: '8px',
              zIndex: 9998,
              pointerEvents: 'none',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          
          {/* Drop inside label */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '700',
              borderRadius: '8px',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
            }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            Drop inside {instance.label || instance.type}
          </div>
          
          {/* Corner indicators */}
          {[
            { top: '8px', left: '8px' },
            { top: '8px', right: '8px' },
            { bottom: '8px', left: '8px' },
            { bottom: '8px', right: '8px' },
          ].map((pos, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                ...pos,
                width: '12px',
                height: '12px',
                backgroundColor: '#10b981',
                borderRadius: '2px',
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            />
          ))}
        </>
      )}
      {children}
    </div>
  );
};
