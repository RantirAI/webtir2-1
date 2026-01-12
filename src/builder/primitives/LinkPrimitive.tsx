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
  dataBindingProps?: Record<string, any>;
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
  dataBindingProps = {},
}) => {
  const { style: dataBindingStyle, className: dataBindingClassName, ...restDataBindingProps } = dataBindingProps;

  // Merge classNames: style source classes + any dataBindingProps className (e.g., nav-link)
  const styleSourceClasses = (instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ');
  const finalClassName = [styleSourceClasses, dataBindingClassName].filter(Boolean).join(' ') || undefined;

  return (
    <a
      data-instance-id={instance.id}
      className={finalClassName}
      href={instance.props.href || '#'}
      style={{ position: 'relative', ...dataBindingStyle }}
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
      {...restDataBindingProps}
    >
      {instance.props.children || 'Link'}
    </a>
  );
};
