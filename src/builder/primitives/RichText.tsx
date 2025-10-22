import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

interface RichTextProps {
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

export const RichText: React.FC<RichTextProps> = ({
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
  return (
    <div
      data-instance-id={instance.id}
      className={`builder-richtext ${(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}`}
      style={{
        position: 'relative',
        width: '100%',
      }}
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
