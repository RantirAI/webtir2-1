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

interface CanvasProps {
  zoom: number;
}

export const Canvas: React.FC<CanvasProps> = ({ zoom }) => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const hoveredInstanceId = useBuilderStore((state) => state.hoveredInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const setHoveredInstanceId = useBuilderStore((state) => state.setHoveredInstanceId);
  const { getComputedStyles } = useStyleStore();

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
    <div className="absolute inset-0 overflow-auto bg-zinc-100 dark:bg-zinc-800">
      <div 
        className="transition-transform origin-center flex items-start justify-center gap-8"
        style={{
          transform: `scale(${zoom / 100})`,
          backgroundImage: `
            radial-gradient(circle, hsl(240 5.9% 70%) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundAttachment: 'local',
          padding: '4rem',
          minHeight: '100vh',
          minWidth: '100%',
        }}
      >
        {/* Page 1 */}
        <div 
          style={{ 
            backgroundColor: '#ffffff',
            width: '960px',
            minHeight: '1200px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          {rootInstance && renderInstance(rootInstance)}
        </div>
        
        {/* Page 2 - Placeholder */}
        <div 
          style={{ 
            backgroundColor: '#ffffff',
            width: '960px',
            minHeight: '1200px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
        >
          <div>Page 2</div>
        </div>
      </div>
    </div>
  );
};
