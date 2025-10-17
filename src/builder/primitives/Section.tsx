import React, { useState, useEffect } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { stylesToObject } from '../utils/style';

interface SectionProps {
  instance: ComponentInstance;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
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
}) => {
  const [isNewlyAdded, setIsNewlyAdded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNewlyAdded(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Get computed styles from style store
  const computedStyles = useStyleStore.getState().getComputedStyles(instance.styleSourceIds || []);
  const customStyles = stylesToObject(computedStyles);

  // Default styles that can be overridden
  const defaultStyles: React.CSSProperties = {
    width: '100%',
    minWidth: '100%',
    flexBasis: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: '100px',
  };

  // Merge styles with custom styles taking precedence
  const mergedStyles: React.CSSProperties = {
    ...defaultStyles,
    ...customStyles,
    // Always apply these regardless of custom styles
    outline: isNewlyAdded ? '2px dashed hsl(var(--primary) / 0.5)' : 'none',
    outlineOffset: '-2px',
    transition: 'outline 0.3s ease-out',
  };

  return (
    <section
      data-instance-id={instance.id}
      className={`${(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')} ${isNewlyAdded ? 'animate-fade-in' : ''}`}
      style={mergedStyles}
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
    </section>
  );
};
