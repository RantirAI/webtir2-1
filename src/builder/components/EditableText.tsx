import React, { useEffect, useRef, useState } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'a' | 'blockquote';
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  onDoubleClick?: () => void;
}

/**
 * IMPORTANT: During editing we must NOT "control" the content (no state-driven children updates per keystroke),
 * otherwise React reconciliation can reset the selection/caret and makes typing appear RTL/backwards.
 */
export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  as: Component = 'p',
  className = '',
  style = {},
  isSelected = false,
  onDoubleClick,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const editableRef = useRef<HTMLElement>(null);
  const liveValueRef = useRef<string>(value);

  // Keep the live ref in sync when NOT editing
  useEffect(() => {
    if (!isEditing) {
      liveValueRef.current = value;
    }
  }, [value, isEditing]);

  // Focus + select on edit start, and seed the DOM content once.
  useEffect(() => {
    if (!isEditing) return;
    const el = editableRef.current;
    if (!el) return;

    // Seed current value once at the start of editing
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
      onChange(next);
    } else {
      // Revert to previous value if emptied
      liveValueRef.current = value;
      if (editableRef.current) editableRef.current.textContent = value;
    }
  };

  const cancel = () => {
    setIsEditing(false);
    liveValueRef.current = value;
    if (editableRef.current) editableRef.current.textContent = value;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onDoubleClick?.();
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

  // LTR defaults (future: allow RTL only when explicitly set via style/class)
  const direction = style.direction ?? 'ltr';
  const unicodeBidi = (style as any).unicodeBidi ?? 'normal';

  if (isEditing) {
    return React.createElement(Component, {
      ref: editableRef as any,
      contentEditable: true,
      suppressContentEditableWarning: true,
      dir: direction,
      onBlur: commit,
      onKeyDown: handleKeyDown,
      onInput: (e: React.FormEvent<HTMLElement>) => {
        // Do NOT set React state here (keeps caret stable).
        liveValueRef.current = e.currentTarget.textContent ?? '';
      },
      className,
      style: {
        ...style,
        outline: 'none',
        cursor: 'text',
        direction,
        unicodeBidi,
      },
    });
  }

  return React.createElement(
    Component,
    {
      className,
      style: {
        ...style,
        direction,
        unicodeBidi,
      },
      onDoubleClick: handleDoubleClick,
    },
    value
  );
};
