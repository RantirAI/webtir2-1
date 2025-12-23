import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';

interface OrderedListProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
}

export const OrderedList: React.FC<OrderedListProps> = ({
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
    const items = [...(instance.props.items || ['Item 1', 'Item 2', 'Item 3'])];
    items[index] = newValue;
    updateInstance(instance.id, {
      props: { ...instance.props, items },
    });
  };

  const items = instance.props.items || ['Item 1', 'Item 2', 'Item 3'];

  return (
    <ol
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
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
            style={{ outline: 'none', direction: 'ltr', unicodeBidi: 'normal' }}
          >
            {item}
          </span>
        </li>
      ))}
    </ol>
  );
};
