import React, { useState, useEffect, createElement } from 'react';
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
  dataBindingProps?: Record<string, any>;
}

// Valid HTML tags for Section component
type SectionTag = 'section' | 'div' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';

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
  dataBindingProps = {},
}) => {
  const [isNewlyAdded, setIsNewlyAdded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNewlyAdded(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Get the HTML tag from props, default to 'section'
  const htmlTag: SectionTag = (instance.props?.htmlTag as SectionTag) || 'section';

  // Only essential inline styles - let CSS classes control all layout/sizing
  const defaultStyles: React.CSSProperties = {
    outline: isNewlyAdded ? '2px dashed hsl(var(--primary) / 0.5)' : 'none',
    outlineOffset: '-2px',
    transition: 'outline 0.3s ease-out',
    ...(dataBindingProps.style || {}),
  };

  const finalStyles = defaultStyles;
  const classNames = (instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean);
  if (isNewlyAdded) classNames.push('animate-fade-in');
  
  // Add className from dataBindingProps if provided (e.g., nav-{id} for navigation sections)
  if (dataBindingProps.className) {
    classNames.push(dataBindingProps.className);
  }

  // Extract non-style and non-className dataBindingProps
  const { style: _style, className: _className, ...restDataBindingProps } = dataBindingProps;

  // Note: Selection is handled by DroppableContainer wrapper, not here
  // This prevents double-handling of clicks when nested containers exist
  const elementProps = {
    'data-instance-id': instance.id,
    className: classNames.length > 0 ? classNames.join(' ') : undefined,
    style: finalStyles,
    onContextMenu: isPreviewMode ? undefined : onContextMenu,
    ...restDataBindingProps,
  };

  return createElement(htmlTag, elementProps, children);
};
