import React from 'react';
import { ComponentInstance } from '../store/types';
import { stylesToObject } from '../utils/style';

interface LinkPrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export const LinkPrimitive: React.FC<LinkPrimitiveProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
}) => {
  const style = stylesToObject(instance.styles);

  return (
    <a
      data-instance-id={instance.id}
      href={instance.props.href || '#'}
      style={{
        ...style,
        position: 'relative',
        outline: isSelected ? '2px solid hsl(var(--primary))' : isHovered ? '2px solid hsl(var(--primary) / 0.5)' : 'none',
        outlineOffset: '2px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
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
      {instance.props.children || 'Link'}
    </a>
  );
};
