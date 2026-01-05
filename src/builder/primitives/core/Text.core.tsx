/**
 * @core-file
 * 
 * Text Primitive - Core Logic (LOCKED)
 * 
 * This file contains the immutable core rendering logic for the Text primitive.
 * DO NOT MODIFY - Changes to this file may break style bindings and component behavior.
 * 
 * To customize this component:
 * 1. Use the editable slots defined in Text.editable.tsx
 * 2. Override styles via the StylePanel
 * 3. Fork the component for advanced customization
 */

import React from 'react';
import { CoreComponentProps } from './types';
import { useStyleStore } from '../../store/useStyleStore';

// @lock-start: core-logic (no-unlock)
// Core rendering logic - DO NOT MODIFY
export interface TextCoreProps extends CoreComponentProps {
  /** Text content to display */
  content: string;
  /** Handler for content changes */
  onContentChange?: (newContent: string) => void;
}

export const TextCore: React.FC<TextCoreProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isPreviewMode,
  dataBindingProps = {},
  slots,
  customStyles,
  customClassName,
  content,
  onContentChange,
}) => {
  // @lock-start: style-binding
  // Style resolution - connects to the style system
  const classNames = (instance.styleSourceIds || [])
    .map((id) => useStyleStore.getState().styleSources[id]?.name)
    .filter(Boolean)
    .join(' ');
  // @lock-end

  // @lock-start: structure
  // Extract non-style dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  // Merge all styles
  const mergedStyles: React.CSSProperties = {
    ...dataBindingStyle,
    ...customStyles,
  };

  // Combine class names
  const combinedClassName = [classNames, customClassName].filter(Boolean).join(' ');
  // @lock-end

  // @lock-start: core-logic
  // Event handlers for builder mode
  const handleClick = isPreviewMode ? undefined : (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleMouseEnter = isPreviewMode ? undefined : (e: React.MouseEvent) => {
    e.stopPropagation();
    onHover?.();
  };

  const handleMouseLeave = isPreviewMode ? undefined : (e: React.MouseEvent) => {
    e.stopPropagation();
    onHoverEnd?.();
  };
  // @lock-end

  return (
    <div
      data-instance-id={instance.id}
      className={combinedClassName}
      style={mergedStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={isPreviewMode ? undefined : onContextMenu}
      {...restDataBindingProps}
    >
      {/* @slot: content */}
      {slots?.content || (
        <p>{content || 'Text'}</p>
      )}
      {/* @slot-end */}
    </div>
  );
};
// @lock-end
