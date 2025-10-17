import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { stylesToObject } from '../utils/style';

interface BoxProps {
  instance: ComponentInstance;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
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
}) => {
  const isRoot = instance.id === 'root';

  // Get computed styles from the style store
  const computedStyles = useStyleStore.getState().getComputedStyles(
    instance.styleSourceIds || []
  );
  const customStyles = stylesToObject(computedStyles);

  // Default styles
  const defaultStyles: React.CSSProperties = {
    width: '100%',
    minWidth: isRoot ? undefined : '100%',
    flexBasis: isRoot ? undefined : '100%',
    height: isRoot ? undefined : '100%',
    position: 'relative',
    backgroundColor: isRoot ? '#ffffff' : 'transparent',
    display: 'flex',
    flexDirection: isRoot ? 'column' : 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  };

  // Merge styles, custom styles take precedence
  const finalStyles = { ...defaultStyles, ...customStyles };

  return (
    <div
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      style={finalStyles}
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
    >
      {children}
    </div>
  );
};
