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
  // Ensure level is a valid heading tag string (h1-h6)
  // Handle both number format (1-6) and string format ('h1'-'h6')
  const rawLevel = instance.props.level;
  let level: string;
  if (typeof rawLevel === 'number') {
    level = `h${Math.min(Math.max(rawLevel, 1), 6)}`;
  } else if (typeof rawLevel === 'string') {
    // Handle both 'h1' format and '1' format
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(rawLevel)) {
      level = rawLevel;
    } else if (['1', '2', '3', '4', '5', '6'].includes(rawLevel)) {
      level = `h${rawLevel}`;
    } else {
      level = 'h1';
    }
  } else {
    level = 'h1';
  }

  const handleTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: newText },
    });
  };

  // Get className from styleSourceIds to apply directly to heading element
  const className = (instance.styleSourceIds || [])
    .map((id) => useStyleStore.getState().styleSources[id]?.name)
    .filter(Boolean)
    .join(' ');

  // Extract non-style dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  return (
    <div
      data-instance-id={instance.id}
      style={dataBindingStyle}
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
        value={instance.props.children || 'Heading'}
        onChange={handleTextChange}
        as={level as any}
        className={className}
        isSelected={isSelected}
      />
    </div>
  );
};
