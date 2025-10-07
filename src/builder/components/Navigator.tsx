import React, { useState } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as Icons from 'lucide-react';
import { componentRegistry } from '../primitives/registry';

export const Navigator: React.FC = () => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const deleteInstance = useBuilderStore((state) => state.deleteInstance);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderTreeNode = (instance: ComponentInstance, level: number = 0): React.ReactNode => {
    const isExpanded = expandedIds.has(instance.id);
    const isSelected = instance.id === selectedInstanceId;
    const hasChildren = instance.children.length > 0;
    
    const meta = componentRegistry[instance.type];
    const IconComponent = meta ? Icons[meta.icon as keyof typeof Icons] as any : null;

    return (
      <div key={instance.id}>
        <div
          className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-md group ${
            isSelected ? 'bg-accent text-accent-foreground' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(instance.id);
            }}
            className="p-0.5 hover:bg-background rounded"
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )
            ) : (
              <div className="w-3 h-3" />
            )}
          </button>
          
          <div
            onClick={() => setSelectedInstanceId(instance.id)}
            className="flex-1 flex items-center gap-2 min-w-0"
          >
            {IconComponent && <IconComponent className="w-3 h-3 flex-shrink-0" />}
            <span className="truncate">{instance.label || instance.type}</span>
          </div>

          {instance.id !== 'root' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteInstance(instance.id);
              }}
              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {instance.children.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground">Navigator</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {rootInstance && renderTreeNode(rootInstance)}
        </div>
      </ScrollArea>
    </div>
  );
};
