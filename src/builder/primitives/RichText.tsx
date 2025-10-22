import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { generateId } from '../utils/instance';
import { componentRegistry } from './registry';
import { Plus } from 'lucide-react';

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
  const { addInstance } = useBuilderStore();
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  const richTextElements = [
    { label: 'Heading 1', value: 'Heading', props: { level: 'h1', children: 'Heading 1' } },
    { label: 'Heading 2', value: 'Heading', props: { level: 'h2', children: 'Heading 2' } },
    { label: 'Heading 3', value: 'Heading', props: { level: 'h3', children: 'Heading 3' } },
    { label: 'Heading 4', value: 'Heading', props: { level: 'h4', children: 'Heading 4' } },
    { label: 'Heading 5', value: 'Heading', props: { level: 'h5', children: 'Heading 5' } },
    { label: 'Heading 6', value: 'Heading', props: { level: 'h6', children: 'Heading 6' } },
    { label: 'Paragraph', value: 'Text', props: { children: 'Text content goes here' } },
    { label: 'Numbered list', value: 'OrderedList', props: { items: ['Item 1', 'Item 2', 'Item 3'] } },
    { label: 'Bulleted list', value: 'UnorderedList', props: { items: ['Item A', 'Item B', 'Item C'] } },
    { label: 'Blockquote', value: 'Blockquote', props: { children: 'Block quote' } },
    { label: 'Code block', value: 'CodeBlock', props: { children: '// Code goes here' } },
  ];

  const handleAddElement = (element: typeof richTextElements[0]) => {
    const meta = componentRegistry[element.value];
    if (!meta) return;

    const newId = generateId();
    const newInstance: ComponentInstance = {
      id: newId,
      type: element.value as any,
      label: meta.label,
      props: element.props || { ...meta.defaultProps },
      styleSourceIds: [],
      children: [],
    };

    addInstance(newInstance, instance.id);
    setShowAddMenu(false);
  };

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
      
      {/* Add Element Button */}
      {!isPreviewMode && isSelected && (
        <div className="relative mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddMenu(!showAddMenu);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add element
          </button>

          {showAddMenu && (
            <div className="absolute top-full left-0 mt-1 bg-zinc-800 rounded-lg shadow-2xl py-1 z-50 min-w-[180px] max-h-60 overflow-y-auto">
              {richTextElements.map((element) => (
                <button
                  key={element.label}
                  className="w-full px-3 py-1.5 text-left hover:bg-zinc-700 text-white text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddElement(element);
                  }}
                >
                  {element.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
