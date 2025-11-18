import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';

interface CellPrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
}

export const CellPrimitive: React.FC<CellPrimitiveProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isPreviewMode,
}) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);

  const handleTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: newText },
    });
  };

  return (
    <div
      data-instance-id={instance.id}
      className={`flex-1 ${(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}`}
      style={{ position: 'relative', minWidth: '0' }}
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
      <EditableText
        value={instance.props.children || 'Cell'}
        onChange={handleTextChange}
        as="span"
      />
    </div>
  );
};
