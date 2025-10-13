import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DragOverEvent } from '@dnd-kit/core';
import { ComponentInstance } from '../store/types';

interface DropZone {
  type: 'inside' | 'between';
  parentId: string;
  parentLabel: string;
  index?: number;
  rect: DOMRect;
  isValid: boolean;
}

interface DropIndicatorProps {
  dragOverEvent: DragOverEvent | null;
  canvasElement: HTMLElement | null;
  zoom: number;
  panOffset: { x: number; y: number };
  findInstance: (id: string) => ComponentInstance | null;
}

export const DropIndicator: React.FC<DropIndicatorProps> = ({
  dragOverEvent,
  canvasElement,
  zoom,
  panOffset,
  findInstance,
}) => {
  const [dropZone, setDropZone] = useState<DropZone | null>(null);

  useEffect(() => {
    if (!dragOverEvent || !canvasElement) {
      setDropZone(null);
      return;
    }

    const { over, active } = dragOverEvent;
    if (!over || !active) {
      setDropZone(null);
      return;
    }

    const overId = over.id.toString();
    const activeType = active.data.current?.type;
    const activeInstance = active.data.current?.instance as ComponentInstance | undefined;

    // Determine target instance
    let targetInstanceId = overId;
    if (overId.startsWith('droppable-')) {
      targetInstanceId = over.data.current?.instanceId || 'root';
    }

    const targetInstance = findInstance(targetInstanceId);
    if (!targetInstance && targetInstanceId !== 'root') {
      setDropZone(null);
      return;
    }

    // Check if drop is valid
    const isContainerType = ['Box', 'Container', 'Section'].includes(targetInstance?.type || 'Box');
    const isDraggingSection = activeType === 'Section' || activeInstance?.type === 'Section';
    const isTargetSection = targetInstance?.type === 'Section';

    // Sections cannot be nested
    if (isDraggingSection && isTargetSection) {
      setDropZone({
        type: 'inside',
        parentId: targetInstanceId,
        parentLabel: targetInstance?.label || targetInstance?.type || 'Body',
        rect: new DOMRect(),
        isValid: false,
      });
      return;
    }

    // Get target element from DOM
    const targetElement = targetInstanceId === 'root'
      ? canvasElement.querySelector('[data-instance-id="root"]')
      : document.querySelector(`[data-instance-id="${targetInstanceId}"]`);

    if (!targetElement) {
      setDropZone(null);
      return;
    }

    const rect = targetElement.getBoundingClientRect();
    
    // Determine drop type
    const dropType: 'inside' | 'between' = isContainerType ? 'inside' : 'between';

    setDropZone({
      type: dropType,
      parentId: targetInstanceId,
      parentLabel: targetInstance?.label || targetInstance?.type || 'Body',
      rect,
      isValid: true,
    });
  }, [dragOverEvent, canvasElement, zoom, panOffset, findInstance]);

  if (!dropZone) {
    return null;
  }

  const { rect, type, parentLabel, isValid } = dropZone;

  // Calculate scaled position
  const scale = zoom / 100;
  const scaledRect = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };

  const indicatorColor = isValid ? '#10b981' : '#ef4444';
  const indicatorBgColor = isValid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  if (type === 'inside') {
    return createPortal(
      <div
        style={{
          position: 'fixed',
          left: `${scaledRect.left}px`,
          top: `${scaledRect.top}px`,
          width: `${scaledRect.width}px`,
          height: `${scaledRect.height}px`,
          pointerEvents: 'none',
          zIndex: 9998,
          transition: 'all 0.15s ease-out',
        }}
      >
        {/* Background overlay */}
        <div
          style={{
            position: 'absolute',
            inset: '0',
            backgroundColor: indicatorBgColor,
            border: `3px dashed ${indicatorColor}`,
            borderRadius: '8px',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          }}
        />

        {/* Label badge */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: indicatorColor,
            color: 'white',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '700',
            borderRadius: '8px',
            boxShadow: `0 4px 12px ${indicatorColor}66`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isValid ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              Drop inside {parentLabel}
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M15 9l-6 6M9 9l6 6" />
              </svg>
              Cannot drop here
            </>
          )}
        </div>

        {/* Corner indicators */}
        {isValid && [
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
              backgroundColor: indicatorColor,
              borderRadius: '2px',
            }}
          />
        ))}
      </div>,
      document.body
    );
  }

  // For 'between' type, show insertion line
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: `${scaledRect.left}px`,
        top: `${scaledRect.top - 2}px`,
        width: `${scaledRect.width}px`,
        height: '4px',
        pointerEvents: 'none',
        zIndex: 9999,
        transition: 'all 0.15s ease-out',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#3b82f6',
          borderRadius: '2px',
          boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
        }}
      >
        {/* Left circle */}
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
        {/* Right circle */}
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
    </div>,
    document.body
  );
};
