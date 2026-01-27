import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { EditableText } from '../components/EditableText';
import { getCanvasComputedStyles } from '../utils/canvasStyles';

interface TextProps {
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

export const Text: React.FC<TextProps> = ({
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

  const handleTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: newText },
    });
  };

  // Extract non-style dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  // Compute breakpoint-aware styles for canvas preview
  const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);

  return (
    <div
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      style={{
        ...computedStyles,      // Breakpoint-aware computed styles
        ...dataBindingStyle     // dataBinding overrides if present
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
      {...restDataBindingProps}
    >
      <EditableText
        value={instance.props.children || 'Text'}
        onChange={handleTextChange}
        as="p"
        style={{}}
        isSelected={isSelected}
      />
    </div>
  );
};
