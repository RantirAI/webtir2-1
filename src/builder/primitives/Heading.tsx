import React, { useState, useRef, useEffect } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';

interface HeadingProps {
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

export const Heading: React.FC<HeadingProps> = ({
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
  const { updateInstance } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLHeadingElement>(null);

  // Ensure level is a valid heading tag string (h1-h6)
  const rawLevel = instance.props.level;
  let level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  if (typeof rawLevel === 'number') {
    level = `h${Math.min(Math.max(rawLevel, 1), 6)}` as typeof level;
  } else if (typeof rawLevel === 'string') {
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rawLevel)) {
      level = rawLevel as typeof level;
    } else if (['1', '2', '3', '4', '5', '6'].includes(rawLevel)) {
      level = `h${rawLevel}` as typeof level;
    } else {
      level = 'h1';
    }
  } else {
    level = 'h1';
  }

  const handleTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: newText },
    });
  };

  // Get className from styleSourceIds to apply directly to heading element
  const className = (instance.styleSourceIds || [])
    .map((id) => useStyleStore.getState().styleSources[id]?.name)
    .filter(Boolean)
    .join(' ');

  // Extract non-style dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  const content = instance.props.children || 'Heading';

  // Handle double-click to enter edit mode
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  // Handle blur to exit edit mode and save
  const handleBlur = () => {
    if (elementRef.current) {
      const newText = elementRef.current.textContent || '';
      handleTextChange(newText);
    }
    setIsEditing(false);
  };

  // Handle key events for editing
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      elementRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      if (elementRef.current) {
        elementRef.current.textContent = content;
      }
    }
  };

  // Focus element when entering edit mode
  useEffect(() => {
    if (isEditing && elementRef.current) {
      elementRef.current.focus();
      // Select all text
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(elementRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  // Render the semantic heading tag directly using React.createElement
  return React.createElement(
    level,
    {
      ref: elementRef,
      'data-instance-id': instance.id,
      className: className || undefined,
      style: dataBindingStyle,
      contentEditable: isEditing,
      suppressContentEditableWarning: true,
      onClick: isPreviewMode ? undefined : (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect?.();
      },
      onDoubleClick: handleDoubleClick,
      onMouseEnter: isPreviewMode ? undefined : (e: React.MouseEvent) => {
        e.stopPropagation();
        onHover?.();
      },
      onMouseLeave: isPreviewMode ? undefined : (e: React.MouseEvent) => {
        e.stopPropagation();
        onHoverEnd?.();
      },
      onContextMenu: isPreviewMode ? undefined : onContextMenu,
      onBlur: isEditing ? handleBlur : undefined,
      onKeyDown: isEditing ? handleKeyDown : undefined,
      ...restDataBindingProps,
    },
    content
  );
};
