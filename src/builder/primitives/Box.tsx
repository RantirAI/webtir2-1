import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

interface DivProps {
  instance: ComponentInstance;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
  dataBindingProps?: Record<string, any>;
}

export const Div: React.FC<DivProps> = ({
  instance,
  children,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isPreviewMode,
  dataBindingProps = {},
}) => {
  const isRoot = instance.id === 'root';

  // Only essential inline styles - let CSS classes control all layout/sizing
  // No default background color - divs should be transparent by default
  const defaultStyles: React.CSSProperties = {
    ...(dataBindingProps.style || {}), // Apply visibility and other data binding styles
  };

  const finalStyles = defaultStyles;

  const classNames = (instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ');
  
  // Extract non-style dataBindingProps
  const { style: _style, ...restDataBindingProps } = dataBindingProps;
  
  return (
    <div
      data-instance-id={instance.id}
      className={classNames || undefined}
      style={finalStyles}
      onClick={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
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
      {children}
    </div>
  );
};
