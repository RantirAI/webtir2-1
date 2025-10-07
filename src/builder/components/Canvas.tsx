import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { Box } from '../primitives/Box';
import { Text } from '../primitives/Text';
import { Heading } from '../primitives/Heading';
import { ButtonPrimitive } from '../primitives/ButtonPrimitive';
import { ImagePrimitive } from '../primitives/ImagePrimitive';
import { LinkPrimitive } from '../primitives/LinkPrimitive';

interface CanvasProps {
  zoom: number;
}

export const Canvas: React.FC<CanvasProps> = ({ zoom }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const hoveredInstanceId = useBuilderStore((state) => state.hoveredInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const setHoveredInstanceId = useBuilderStore((state) => state.setHoveredInstanceId);

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
    <div className="absolute inset-0 overflow-auto">
      <div 
        className="min-h-full transition-transform origin-center"
        style={{
          transform: `scale(${zoom / 100})`,
          backgroundImage: `
            radial-gradient(circle, hsl(var(--muted-foreground) / 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundColor: '#ffffff',
          padding: '8rem',
        }}
      >
        {rootInstance && renderInstance(rootInstance)}
      </div>
    </div>
  );
};
