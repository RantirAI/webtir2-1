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
  const { setStyle } = useStyleStore();
  const level = instance.props.level || 'h1';

  // Ensure heading always has a style source with default styles
  React.useEffect(() => {
    const fontSizeMap: Record<string, string> = {
      h1: '48px',
      h2: '32px',
      h3: '24px',
      h4: '18px',
      h5: '14px',
      h6: '12px',
    };

    // If instance has no style source, create one
    if (!instance.styleSourceIds || instance.styleSourceIds.length === 0) {
      const { createStyleSource, getNextAutoClassName } = useStyleStore.getState();
      const headingClassName = getNextAutoClassName('heading');
      const styleSourceId = createStyleSource('local', headingClassName);
      
      // Apply default styles
      setStyle(styleSourceId, 'fontSize', fontSizeMap[level]);
      setStyle(styleSourceId, 'fontWeight', '700');
      
      // Attach style source to instance
      updateInstance(instance.id, {
        styleSourceIds: [styleSourceId],
      });
    } else {
      // Update font size when tag changes
      const primaryClassId = instance.styleSourceIds[0];
      const targetFontSize = fontSizeMap[level];
      setStyle(primaryClassId, 'fontSize', targetFontSize);
    }
  }, [level, instance.id, instance.styleSourceIds, setStyle, updateInstance]);

  const handleTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: newText },
    });
  };

  return (
    <div
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
