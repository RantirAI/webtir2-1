import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance } from '../store/types';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Heading } from '../primitives/Heading';
import { ButtonPrimitive } from '../primitives/ButtonPrimitive';
import { ImagePrimitive } from '../primitives/ImagePrimitive';
import { LinkPrimitive } from '../primitives/LinkPrimitive';
import { breakpoints } from './PageNavigation';
import { ContextMenu } from './ContextMenu';
import { SelectionOverlay } from './SelectionOverlay';
import { useDroppable } from '@dnd-kit/core';
import { componentRegistry } from '../primitives/registry';
import { generateId } from '../utils/instance';

interface CanvasProps {
  zoom: number;
  currentBreakpoint: string;
  pages: string[];
  currentPage: string;
  pageNames: Record<string, string>;
  onPageNameChange: (pageId: string, newName: string) => void;
  isPanMode: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ zoom, currentBreakpoint, pages, currentPage, pageNames, onPageNameChange, isPanMode }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const hoveredInstanceId = useBuilderStore((state) => state.hoveredInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const setHoveredInstanceId = useBuilderStore((state) => state.setHoveredInstanceId);
  const addInstance = useBuilderStore((state) => state.addInstance);
  const { findInstance } = useBuilderStore();
  const { getComputedStyles } = useStyleStore();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; instance: ComponentInstance } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const { setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  });

  const currentBreakpointWidth = breakpoints.find(bp => bp.id === currentBreakpoint)?.width || 960;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPanMode) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && isPanMode) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleContextMenu = (e: React.MouseEvent, instance: ComponentInstance) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, instance });
  };

  // Get selected element for overlay
  const selectedElement = selectedInstanceId 
    ? document.querySelector(`[data-instance-id="${selectedInstanceId}"]`) as HTMLElement
    : null;
  
  const selectedInstance = selectedInstanceId ? findInstance(selectedInstanceId) : null;

  const renderInstance = (instance: ComponentInstance): React.ReactNode => {
    const isSelected = instance.id === selectedInstanceId;
    const isHovered = instance.id === hoveredInstanceId;

    const commonProps = {
      instance,
      isSelected,
      isHovered,
      onSelect: () => setSelectedInstanceId(instance.id),
      onHover: () => setHoveredInstanceId(instance.id),
      onHoverEnd: () => setHoveredInstanceId(null),
      onContextMenu: (e: React.MouseEvent) => handleContextMenu(e, instance),
    };

    switch (instance.type) {
      case 'Box':
        return (
          <Box key={instance.id} {...commonProps}>
            {instance.children.map((child) => renderInstance(child))}
          </Box>
        );
      case 'Text':
        return <Text key={instance.id} {...commonProps} />;
      case 'Heading':
        return <Heading key={instance.id} {...commonProps} />;
      case 'Button':
        return <ButtonPrimitive key={instance.id} {...commonProps} />;
      case 'Image':
        return <ImagePrimitive key={instance.id} {...commonProps} />;
      case 'Link':
        return <LinkPrimitive key={instance.id} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={(node) => {
        canvasRef.current = node;
        setNodeRef(node);
      }}
      className="absolute inset-0 overflow-hidden bg-[#e5e7eb] dark:bg-zinc-800"
      style={{
        backgroundImage: `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        cursor: isPanMode ? (isPanning ? 'grabbing' : 'grab') : 'default',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="transition-transform origin-center flex items-start justify-center gap-8"
        style={{
          transform: `scale(${zoom / 100}) translate(${panOffset.x / (zoom / 100)}px, ${panOffset.y / (zoom / 100)}px)`,
          padding: '4rem',
          minHeight: '100vh',
          minWidth: '100%',
        }}
      >
        {pages.map((page, index) => (
          <div 
            key={page}
            style={{ 
              backgroundColor: '#ffffff',
              color: '#000000',
              width: `${currentBreakpointWidth}px`,
              minHeight: '1200px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'width 0.3s ease',
              position: 'relative',
              resize: 'horizontal',
              overflow: 'auto',
              maxWidth: '100%',
            }}
          >
            {/* Page Name Label */}
            <div 
              className="absolute -top-8 left-0 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {editingPageId === page ? (
                <input
                  type="text"
                  value={pageNames[page] || page}
                  onChange={(e) => onPageNameChange(page, e.target.value)}
                  onBlur={() => setEditingPageId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setEditingPageId(null);
                  }}
                  autoFocus
                  className="text-xs px-2 py-1 rounded bg-white border border-border"
                  style={{ minWidth: '80px' }}
                />
              ) : (
                <div
                  onClick={() => setEditingPageId(page)}
                  className="text-xs px-2 py-1 rounded bg-white border border-border cursor-pointer hover:bg-[#F5F5F5]"
                >
                  {pageNames[page] || page}
                </div>
              )}
            </div>
            {index === 0 && rootInstance && renderInstance(rootInstance)}
          </div>
        ))}
      </div>
      
      {/* Selection Overlay */}
      {selectedElement && selectedInstance && (
        <SelectionOverlay instance={selectedInstance} element={selectedElement} />
      )}
      
      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          instance={contextMenu.instance}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};
