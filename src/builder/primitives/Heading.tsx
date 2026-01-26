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
  const editableRef = useRef<HTMLHeadingElement>(null);
  const liveValueRef = useRef<string>(instance.props.children || 'Heading');

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

  const textContent = instance.props.children || 'Heading';

  // Keep the live ref in sync when NOT editing
  useEffect(() => {
    if (!isEditing) {
      liveValueRef.current = textContent;
    }
  }, [textContent, isEditing]);

  // Focus + select on edit start
  useEffect(() => {
    if (!isEditing) return;
    const el = editableRef.current;
    if (!el) return;

    el.textContent = liveValueRef.current;
    el.focus();

    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [isEditing]);

  const commit = () => {
    const next = (editableRef.current?.textContent ?? '').trim();
    setIsEditing(false);

    if (next) {
      liveValueRef.current = next;
      updateInstance(instance.id, {
        props: { ...instance.props, children: next },
      });
    } else {
      liveValueRef.current = textContent;
      if (editableRef.current) editableRef.current.textContent = textContent;
    }
  };

  const cancel = () => {
    setIsEditing(false);
    liveValueRef.current = textContent;
    if (editableRef.current) editableRef.current.textContent = textContent;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPreviewMode) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHover?.();
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onHoverEnd?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  // Get className from styleSourceIds to apply directly to heading element
  const className = (instance.styleSourceIds || [])
    .map((id) => useStyleStore.getState().styleSources[id]?.name)
    .filter(Boolean)
    .join(' ');

  // Extract style from dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  // Common props for the heading element
  const headingProps = {
    ref: editableRef,
    'data-instance-id': instance.id,
    className,
    style: {
      ...dataBindingStyle,
      ...(isEditing ? { outline: 'none', cursor: 'text' } : {}),
    },
    onClick: isPreviewMode ? undefined : handleClick,
    onMouseEnter: isPreviewMode ? undefined : handleMouseEnter,
    onMouseLeave: isPreviewMode ? undefined : handleMouseLeave,
    onContextMenu: isPreviewMode ? undefined : onContextMenu,
    onDoubleClick: isPreviewMode ? undefined : handleDoubleClick,
    ...restDataBindingProps,
  };

  // Render as semantic heading tag directly (no wrapper div)
  if (isEditing) {
    return React.createElement(
      level,
      {
        ...headingProps,
        contentEditable: true,
        suppressContentEditableWarning: true,
        onBlur: commit,
        onKeyDown: handleKeyDown,
        onInput: (e: React.FormEvent<HTMLHeadingElement>) => {
          liveValueRef.current = e.currentTarget.textContent ?? '';
        },
      }
    );
  }

  return React.createElement(
    level,
    headingProps,
    textContent
  );
};
