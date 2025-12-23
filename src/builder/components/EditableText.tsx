import React, { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div' | 'a' | 'blockquote';
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
  onDoubleClick?: () => void;
}

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
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text in contentEditable element
      const range = document.createRange();
      range.selectNodeContents(inputRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onDoubleClick?.();
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim()) {
      onChange(editValue);
    } else {
      setEditValue(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    // Use a contentEditable div instead of textarea to preserve all inherited styles
    // Fix for text appearing reversed in scaled containers - apply explicit LTR direction
    return React.createElement(
      Component,
      {
        ref: inputRef as any,
        contentEditable: true,
        suppressContentEditableWarning: true,
        onBlur: handleBlur,
        onKeyDown: handleKeyDown,
        onInput: (e: React.FormEvent<HTMLElement>) => {
          setEditValue(e.currentTarget.textContent || '');
        },
        className,
        style: {
          ...style,
          outline: 'none',
          cursor: 'text',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          textAlign: style.textAlign || 'inherit',
        },
        dangerouslySetInnerHTML: undefined,
      },
      editValue
    );
  }

  return React.createElement(
    Component,
    {
      className,
      style,
      onDoubleClick: handleDoubleClick,
    },
    value
  );
};
