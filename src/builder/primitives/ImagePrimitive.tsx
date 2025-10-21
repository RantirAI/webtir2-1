import React from 'react';
import { ComponentInstance } from '../store/types';
import { stylesToObject } from '../utils/style';
import { useStyleStore } from '../store/useStyleStore';

interface ImagePrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const ImagePrimitive: React.FC<ImagePrimitiveProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
}) => {
  const { getComputedStyles } = useStyleStore();
  const computedStyles = getComputedStyles(instance.styleSourceIds || [], undefined, 'default');
  const style = stylesToObject(computedStyles);

  return (
    <img
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      src={instance.props.src || 'https://via.placeholder.com/400x300'}
      alt={instance.props.alt || 'Image'}
      style={{
        ...style,
        position: 'relative',
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
    />
  );
};
