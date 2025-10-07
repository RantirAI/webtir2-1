import React from 'react';
import { ComponentInstance } from '../store/types';
import { stylesToObject } from '../utils/style';

interface TextProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export const Text: React.FC<TextProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
}) => {
  const style = stylesToObject(instance.styles);

  return (
    <p
      data-instance-id={instance.id}
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
    >
      {instance.props.children || 'Text'}
    </p>
  );
};
