import React from 'react';
import { ComponentInstance } from '../store/types';
import { stylesToObject } from '../utils/style';
import { useStyleStore } from '../store/useStyleStore';

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
  const { getComputedStyles } = useStyleStore();
  const computedStyles = getComputedStyles(instance.styleSourceIds || []);
  const style = stylesToObject(computedStyles);

  return (
    <p
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      style={{
        position: 'relative',
        outline: isSelected ? '3px solid #3b82f6' : isHovered ? '2px solid #60a5fa' : 'none',
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
