import React, { useState, useEffect } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

interface ContainerProps {
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

export const Container: React.FC<ContainerProps> = ({
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
  const containerType = instance.props.containerType || 'container';
  const [isNewlyAdded, setIsNewlyAdded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNewlyAdded(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // No inline computed styles - use CSS classes only
  // Only essential non-layout defaults - let CSS classes control display/flex/grid
  const defaultStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minHeight: '100px',
    outline: isNewlyAdded ? '2px dashed hsl(var(--primary) / 0.5)' : 'none',
    outlineOffset: '-2px',
    transition: 'outline 0.3s ease-out',
  };

  const finalStyles = defaultStyles;

  return (
    <div
      data-instance-id={instance.id}
      className={`builder-container ${containerType} ${(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')} ${isNewlyAdded ? 'animate-fade-in' : ''}`}
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
