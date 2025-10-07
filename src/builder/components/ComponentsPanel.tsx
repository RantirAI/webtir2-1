import React from 'react';
import { componentRegistry } from '../primitives/registry';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { generateId } from '../utils/instance';
import * as Icons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      styles: { ...meta.defaultStyles },
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
