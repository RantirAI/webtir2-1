import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

interface BoxProps {
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

export const Box: React.FC<BoxProps> = ({
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

  // No inline computed styles - use CSS classes only
  // Only essential non-layout defaults - let CSS classes control display/flex/grid
  const defaultStyles: React.CSSProperties = {
    width: '100%',
    minWidth: isRoot ? undefined : '100%',
    flexBasis: isRoot ? undefined : '100%',
    height: isRoot ? undefined : '100%',
    position: 'relative',
    backgroundColor: isRoot ? '#ffffff' : 'transparent',
  };

  const finalStyles = defaultStyles;

  return (
    <div
      data-instance-id={instance.id}
      className={`builder-box ${(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}`}
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
