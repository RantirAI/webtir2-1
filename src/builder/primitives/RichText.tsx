import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useBuilderStore } from '../store/useBuilderStore';
import { generateId } from '../utils/instance';
import { componentRegistry } from './registry';
import { Plus, Sparkles, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, Type, List, ListOrdered, Quote, Code } from 'lucide-react';

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
  showAddMenu?: boolean;
  addMenuPosition?: { x: number; y: number };
  onCloseAddMenu?: () => void;
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
  showAddMenu: externalShowAddMenu,
  addMenuPosition,
  onCloseAddMenu,
}) => {
  const { addInstance } = useBuilderStore();

  const richTextElements = [
    { label: 'Heading 1', value: 'Heading', icon: Heading1, props: { level: 'h1', children: 'Heading 1' } },
    { label: 'Heading 2', value: 'Heading', icon: Heading2, props: { level: 'h2', children: 'Heading 2' } },
    { label: 'Heading 3', value: 'Heading', icon: Heading3, props: { level: 'h3', children: 'Heading 3' } },
    { label: 'Heading 4', value: 'Heading', icon: Heading4, props: { level: 'h4', children: 'Heading 4' } },
    { label: 'Heading 5', value: 'Heading', icon: Heading5, props: { level: 'h5', children: 'Heading 5' } },
    { label: 'Heading 6', value: 'Heading', icon: Heading6, props: { level: 'h6', children: 'Heading 6' } },
    { label: 'Paragraph', value: 'Text', icon: Type, props: { children: 'Text content goes here' } },
    { label: 'Numbered list', value: 'OrderedList', icon: ListOrdered, props: { items: ['Item 1', 'Item 2', 'Item 3'] } },
    { label: 'Bulleted list', value: 'UnorderedList', icon: List, props: { items: ['Item A', 'Item B', 'Item C'] } },
    { label: 'Blockquote', value: 'Blockquote', icon: Quote, props: { children: 'Block quote' } },
    { label: 'Code block', value: 'CodeBlock', icon: Code, props: { children: '// Code goes here' } },
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
    onCloseAddMenu?.();
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
      
      {/* Add Element Dropdown - now only visible from selection overlay */}
      {!isPreviewMode && externalShowAddMenu && (
        <div 
          className="rich-text-add-menu fixed bg-background border border-border rounded-lg shadow-2xl py-1 z-[10000] w-[200px] overflow-hidden"
          style={{
            left: `${addMenuPosition?.x || 0}px`,
            top: `${addMenuPosition?.y || 0}px`,
          }}
        >
          {/* Generate button */}
          <button
            className="w-full px-3 py-2 text-left hover:bg-accent text-foreground text-sm flex items-center gap-2 border-b border-border"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement generate functionality
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Generate</span>
          </button>
          
          {/* Rich text elements */}
          <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
            {richTextElements.map((element) => {
              const Icon = element.icon;
              return (
                <button
                  key={element.label}
                  className="w-full px-3 py-2 text-left hover:bg-accent text-foreground text-sm flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddElement(element);
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {element.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
