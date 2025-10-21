import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { EditableText } from '../components/EditableText';

interface HeadingProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
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
}) => {
  const { updateInstance } = useBuilderStore();
  const level = instance.props.level || 'h2';

  const handleTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: newText },
    });
  };

  return (
    <div
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      style={{
        position: 'relative',
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
      <EditableText
        value={instance.props.children || 'Heading'}
        onChange={handleTextChange}
        as={level as any}
        style={{}}
        isSelected={isSelected}
      />
    </div>
  );
};
