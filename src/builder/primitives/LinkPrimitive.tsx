import React from 'react';
import { ComponentInstance } from '../store/types';

import { useStyleStore } from '../store/useStyleStore';

interface LinkPrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
}

export const LinkPrimitive: React.FC<LinkPrimitiveProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isPreviewMode,
}) => {
  // Using CSS classes only; no inline computed styles

  return (
    <a
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      href={instance.props.href || '#'}
      style={{ position: 'relative' }}
      onClick={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect?.();
      }}
      onMouseEnter={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        onHover?.();
      }}
      onMouseLeave={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        onHoverEnd?.();
      }}
      onContextMenu={isPreviewMode ? undefined : onContextMenu}
    >
      {instance.props.children || 'Link'}
    </a>
  );
};
