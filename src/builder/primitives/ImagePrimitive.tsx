import React from 'react';
import { ComponentInstance } from '../store/types';
import { stylesToObject } from '../utils/style';

interface ImagePrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export const ImagePrimitive: React.FC<ImagePrimitiveProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
}) => {
  const style = stylesToObject(instance.styles);

  return (
    <img
      data-instance-id={instance.id}
      src={instance.props.src || 'https://via.placeholder.com/400x300'}
      alt={instance.props.alt || 'Image'}
      style={{
        ...style,
        position: 'relative',
        outline: isSelected ? '2px solid hsl(var(--primary))' : isHovered ? '2px solid hsl(var(--primary) / 0.5)' : 'none',
        outlineOffset: '2px',
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
    />
  );
};
