import React, { useState, useEffect } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

interface SectionProps {
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

export const Section: React.FC<SectionProps> = ({
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
  const [isNewlyAdded, setIsNewlyAdded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNewlyAdded(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Only essential inline styles - let CSS classes control all layout/sizing
  const defaultStyles: React.CSSProperties = {
    outline: isNewlyAdded ? '2px dashed hsl(var(--primary) / 0.5)' : 'none',
    outlineOffset: '-2px',
    transition: 'outline 0.3s ease-out',
  };

  const finalStyles = defaultStyles;
  const classNames = (instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean);
  if (isNewlyAdded) classNames.push('animate-fade-in');

  return (
    <section
      data-instance-id={instance.id}
      className={classNames.length > 0 ? classNames.join(' ') : undefined}
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
    </section>
  );
};
