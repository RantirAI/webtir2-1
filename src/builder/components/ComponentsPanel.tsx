import React from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance } from '../store/types';
import { generateId } from '../utils/instance';
import * as Icons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export const ComponentsPanel: React.FC = () => {
  const addInstance = useBuilderStore((state) => state.addInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const createStyleSource = useStyleStore((state) => state.createStyleSource);
  const setStyle = useStyleStore((state) => state.setStyle);

  const handleAddComponent = (type: string) => {
    const meta = componentRegistry[type];
    if (!meta) return;

    // Create a new style source for this component
    const styleSourceId = createStyleSource('local', `${meta.type.toLowerCase()}-style`);
    
    // Apply default styles to the style source
    Object.entries(meta.defaultStyles).forEach(([property, value]) => {
      if (value) {
        setStyle(styleSourceId, property, value);
      }
    });

    const newInstance: ComponentInstance = {
      id: generateId(),
      type: meta.type,
      label: meta.label,
      props: { ...meta.defaultProps },
      styleSourceIds: [styleSourceId],
      children: [],
    };

    // Add to selected instance if it's a Box, otherwise add to root
    const parentId = selectedInstanceId && useBuilderStore.getState().getSelectedInstance()?.type === 'Box' 
      ? selectedInstanceId 
      : 'root';
    
    addInstance(newInstance, parentId);
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {Object.values(componentRegistry).map((component) => {
          const IconComponent = Icons[component.icon as keyof typeof Icons] as any;
          
          return (
            <button
              key={component.type}
              onClick={() => handleAddComponent(component.type)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-left"
            >
              {IconComponent && <IconComponent className="w-4 h-4" />}
              <span>{component.label}</span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
