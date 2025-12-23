import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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
  const [portalStyle, setPortalStyle] = useState<React.CSSProperties>({});
  const elementRef = useRef<HTMLElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // Update portal position based on original element's bounding rect
  const updatePortalPosition = useCallback(() => {
    if (!elementRef.current || !isEditing) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(elementRef.current);
    
    setPortalStyle({
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      // Copy typography styles from the original element
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle,
      lineHeight: computedStyle.lineHeight,
      letterSpacing: computedStyle.letterSpacing,
      textAlign: computedStyle.textAlign as React.CSSProperties['textAlign'],
      color: computedStyle.color,
      textDecoration: computedStyle.textDecoration,
      textTransform: computedStyle.textTransform as React.CSSProperties['textTransform'],
      // Background to match
      backgroundColor: computedStyle.backgroundColor,
      // Padding/margin already accounted for in bounding rect
      padding: 0,
      margin: 0,
      border: 'none',
      outline: 'none',
      cursor: 'text',
      zIndex: 99999,
      // Ensure no transform issues
      transform: 'none',
      // Overflow handling
      overflow: 'visible',
      whiteSpace: computedStyle.whiteSpace as React.CSSProperties['whiteSpace'],
      wordBreak: computedStyle.wordBreak as React.CSSProperties['wordBreak'],
    });
  }, [isEditing]);

  // Set up position tracking when editing
  useEffect(() => {
    if (!isEditing) return;
    
    updatePortalPosition();
    
    // Track scroll and resize to keep portal aligned
    const handleScroll = () => updatePortalPosition();
    const handleResize = () => updatePortalPosition();
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    // Use RAF for smooth tracking during any animations
    let rafId: number;
    const trackPosition = () => {
      updatePortalPosition();
      rafId = requestAnimationFrame(trackPosition);
    };
    rafId = requestAnimationFrame(trackPosition);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [isEditing, updatePortalPosition]);

  // Focus and select text when portal mounts
  useEffect(() => {
    if (isEditing && portalRef.current) {
      portalRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(portalRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing, portalStyle]); // Also depend on portalStyle to ensure element is positioned

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

  // Render the portal editor outside the transformed canvas
  const portalEditor = isEditing ? createPortal(
    <div
      ref={portalRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onInput={(e: React.FormEvent<HTMLDivElement>) => {
        setEditValue(e.currentTarget.textContent || '');
      }}
      style={portalStyle}
    >
      {editValue}
    </div>,
    document.body
  ) : null;

  return (
    <>
      {React.createElement(
        Component,
        {
          ref: elementRef as any,
          className,
          style: {
            ...style,
            // Hide original element visually while editing, but keep layout
            visibility: isEditing ? 'hidden' : 'visible',
          },
          onDoubleClick: handleDoubleClick,
        },
        value
      )}
      {portalEditor}
    </>
  );
};
