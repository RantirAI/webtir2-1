import React, { useState, useEffect } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { stylesToObject } from '../utils/style';

interface ContainerProps {
  instance: ComponentInstance;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const Container: React.FC<ContainerProps> = ({
  instance,
  children,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
}) => {
  const containerType = instance.props.containerType || 'container';
  const [isNewlyAdded, setIsNewlyAdded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNewlyAdded(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Get computed styles from the style store
  const computedStyles = useStyleStore.getState().getComputedStyles(
    instance.styleSourceIds || []
  );
  const customStyles = stylesToObject(computedStyles);

  // Default styles
  const defaultStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '100px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    outline: isNewlyAdded ? '2px dashed hsl(var(--primary) / 0.5)' : 'none',
    outlineOffset: '-2px',
    transition: 'outline 0.3s ease-out',
  };

  // Merge styles, custom styles take precedence
  const finalStyles = { ...defaultStyles, ...customStyles };

  return (
    <div
      data-instance-id={instance.id}
      className={`${containerType} ${(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')} ${isNewlyAdded ? 'animate-fade-in' : ''}`}
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
