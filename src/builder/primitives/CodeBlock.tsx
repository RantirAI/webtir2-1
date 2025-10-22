import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';

interface CodeBlockProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
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

  const handleCodeChange = (e: React.FocusEvent<HTMLElement>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: e.currentTarget.textContent || '' },
    });
  };

  return (
    <pre
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
      <code
        contentEditable={!isPreviewMode}
        suppressContentEditableWarning
        onBlur={handleCodeChange}
        style={{ outline: 'none' }}
      >
        {instance.props.children || '// Code goes here'}
      </code>
    </pre>
  );
};
