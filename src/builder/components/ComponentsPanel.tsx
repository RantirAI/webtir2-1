import React from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { generateId } from '../utils/instance';
import * as Icons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const DraggableComponent: React.FC<{ type: string; label: string; icon: string }> = ({ type, label, icon }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `component-${type}`,
    data: { type, label },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = Icons[icon as keyof typeof Icons] as any;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left cursor-grab active:cursor-grabbing"
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      <span>{label}</span>
    </button>
  );
};

export const ComponentsPanel: React.FC = () => {
  const addInstance = useBuilderStore((state) => state.addInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);

  const handleAddComponent = (type: string) => {
    const meta = componentRegistry[type];
    if (!meta) return;

    const newInstance: ComponentInstance = {
      id: generateId(),
      type: meta.type,
      label: meta.label,
      props: { ...meta.defaultProps },
      styleSourceIds: [], // No default classes - created only when styles are set
      children: [],
    };

    // Add to selected instance if it's a Box or Container, otherwise add to root
    const selectedType = useBuilderStore.getState().getSelectedInstance()?.type;
    const parentId = selectedInstanceId && (selectedType === 'Box' || selectedType === 'Container')
      ? selectedInstanceId 
      : 'root';
    
    addInstance(newInstance, parentId);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {Object.values(componentRegistry).map((component) => (
          <div key={component.type} onDoubleClick={() => handleAddComponent(component.type)}>
            <DraggableComponent type={component.type} label={component.label} icon={component.icon} />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
