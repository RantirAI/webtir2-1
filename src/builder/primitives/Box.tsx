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
}) => {
  const isRoot = instance.id === 'root';

  // Only essential inline styles - let CSS classes control all layout/sizing
  const defaultStyles: React.CSSProperties = {
    backgroundColor: isRoot ? '#ffffff' : undefined,
  };

  const finalStyles = defaultStyles;

  const classNames = (instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ');
  
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
    >
      {children}
    </div>
  );
};
