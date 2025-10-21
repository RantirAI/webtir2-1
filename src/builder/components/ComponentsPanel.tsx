import React from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance } from '../store/types';
import { generateId } from '../utils/instance';
import * as Icons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Search } from 'lucide-react';

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
      className="w-full aspect-square flex flex-col items-center justify-center gap-1 p-2 rounded-md border border-border bg-card hover:bg-accent hover:border-primary transition-all text-center cursor-grab active:cursor-grabbing"
    >
      {IconComponent && <IconComponent className="w-5 h-5 text-foreground" />}
      <span className="text-[9px] leading-tight font-medium text-foreground">{label}</span>
    </button>
  );
};

export const ComponentsPanel: React.FC = () => {
  const addInstance = useBuilderStore((state) => state.addInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);

  const handleAddComponent = (type: string) => {
    const meta = componentRegistry[type];
    if (!meta) return;

    const newId = generateId();
    
    // Only create style source with default styles for Button component
    let styleSourceId: string | undefined;
    if (type === 'Button' && meta.defaultStyles && Object.keys(meta.defaultStyles).length > 0) {
      const { createStyleSource, setStyle } = useStyleStore.getState();
      // Use "button" as the class name for Button components
      styleSourceId = createStyleSource('local', 'button');
      
      // Apply default styles
      Object.entries(meta.defaultStyles).forEach(([property, value]) => {
        setStyle(styleSourceId!, property, value);
      });
    }

    const newInstance: ComponentInstance = {
      id: newId,
      type: meta.type,
      label: meta.label,
      props: { ...meta.defaultProps },
      styleSourceIds: styleSourceId ? [styleSourceId] : [],
      children: [],
    };

    // Add to selected instance if it's a container type, otherwise add to root
    const selectedType = useBuilderStore.getState().getSelectedInstance()?.type;
    const parentId = selectedInstanceId && (selectedType === 'Box' || selectedType === 'Container' || selectedType === 'Section')
      ? selectedInstanceId 
      : 'root';
    
    addInstance(newInstance, parentId);
  };

  // Group components by category
  const categories = [
    { name: 'Layout', types: ['Container', 'Section', 'Box'] },
    { name: 'Typography', types: ['Heading', 'Text'] },
    { name: 'Interactive', types: ['Button', 'Link'] },
    { name: 'Media', types: ['Image'] },
  ];

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find components"
            className="w-full h-8 pl-9 pr-3 text-xs rounded-md border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Categories */}
        {categories.map((category) => {
          const components = category.types
            .map(type => componentRegistry[type])
            .filter(Boolean);
          
          if (components.length === 0) return null;
          
          return (
            <div key={category.name}>
              <h3 className="text-xs font-semibold text-foreground mb-2">{category.name}</h3>
              <div className="grid grid-cols-3 gap-2">
                {components.map((component) => (
                  <div key={component.type} onDoubleClick={() => handleAddComponent(component.type)}>
                    <DraggableComponent type={component.type} label={component.label} icon={component.icon} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
