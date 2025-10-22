import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';

interface UnorderedListProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
}

export const UnorderedList: React.FC<UnorderedListProps> = ({
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

  const handleItemChange = (index: number, newValue: string) => {
    const items = [...(instance.props.items || ['Item A', 'Item B', 'Item C'])];
    items[index] = newValue;
    updateInstance(instance.id, {
      props: { ...instance.props, items },
    });
  };

  const items = instance.props.items || ['Item A', 'Item B', 'Item C'];

  return (
    <ul
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
      {items.map((item: string, index: number) => (
        <li key={index}>
          <span
            contentEditable={!isPreviewMode}
            suppressContentEditableWarning
            onBlur={(e) => handleItemChange(index, e.currentTarget.textContent || '')}
            style={{ outline: 'none' }}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
};
