import React from 'react';
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

interface CanvasProps {
  zoom: number;
  currentBreakpoint: string;
  pages: string[];
  currentPage: string;
}

export const Canvas: React.FC<CanvasProps> = ({ zoom, currentBreakpoint, pages, currentPage }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const hoveredInstanceId = useBuilderStore((state) => state.hoveredInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const setHoveredInstanceId = useBuilderStore((state) => state.setHoveredInstanceId);
  const { getComputedStyles } = useStyleStore();

  const currentBreakpointWidth = breakpoints.find(bp => bp.id === currentBreakpoint)?.width || 960;

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
    <div className="absolute inset-0 overflow-auto bg-[#e5e7eb] dark:bg-zinc-800" 
      style={{
        backgroundImage: `radial-gradient(circle, #9ca3af 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
      }}
    >
      <div 
        className="transition-transform origin-center flex items-start justify-center gap-8"
        style={{
          transform: `scale(${zoom / 100})`,
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
              width: `${currentBreakpointWidth}px`,
              minHeight: '1200px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'width 0.3s ease',
            }}
            className="dark:bg-zinc-900"
          >
            {index === 0 && rootInstance && renderInstance(rootInstance)}
          </div>
        ))}
      </div>
    </div>
  );
};
