import React from 'react';
import { ComponentInstance } from '../store/types';
import { stylesToObject } from '../utils/style';
import { useStyleStore } from '../store/useStyleStore';

interface LinkPrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const LinkPrimitive: React.FC<LinkPrimitiveProps> = ({
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
    <a
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      href={instance.props.href || '#'}
      style={{
        ...style,
        position: 'relative',
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
      onContextMenu={onContextMenu}
    >
      {instance.props.children || 'Link'}
    </a>
  );
};
