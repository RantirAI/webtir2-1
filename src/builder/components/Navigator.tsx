import React, { useState } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { ComponentInstance } from '../store/types';
import { ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as Icons from 'lucide-react';
import { componentRegistry } from '../primitives/registry';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { canDropInside } from '../utils/instance';

export const Navigator: React.FC = () => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const deleteInstance = useBuilderStore((state) => state.deleteInstance);
  const { getComputedStyles } = useStyleStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));

  // Auto-expand newly added instances with children
  React.useEffect(() => {
    if (rootInstance) {
      const findInstancesWithChildren = (instance: ComponentInstance): string[] => {
        const ids: string[] = [];
        if (instance.children && instance.children.length > 0) {
          ids.push(instance.id);
          instance.children.forEach(child => {
            ids.push(...findInstancesWithChildren(child));
          });
        }
        return ids;
      };
      
      const allParentIds = findInstancesWithChildren(rootInstance);
      setExpandedIds(prev => {
        const next = new Set(prev);
        allParentIds.forEach(id => next.add(id));
        return next;
      });
    }
  }, [rootInstance]);

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

  const TreeNode: React.FC<{ instance: ComponentInstance; level: number }> = ({ instance, level }) => {
    const isExpanded = expandedIds.has(instance.id);
    const isSelected = instance.id === selectedInstanceId;
    const hasChildren = instance.children.length > 0;
    const isRoot = instance.id === 'root';
    
    const meta = componentRegistry[instance.type];
    const IconComponent = meta ? Icons[meta.icon as keyof typeof Icons] as any : null;

    // Get computed dimensions
    const computedStyles = getComputedStyles(instance.styleSourceIds);
    const width = computedStyles.width || 'auto';
    const height = computedStyles.height || 'auto';
    
    // Get dynamic label from primary style source (first class name)
    const styleSources = useStyleStore((state) => state.styleSources);
    const primaryStyleId = instance.styleSourceIds?.[0];
    const primaryClassName = primaryStyleId ? styleSources[primaryStyleId]?.name : null;
    const displayLabel = primaryClassName || instance.label || instance.type;

    // Setup drag-and-drop for non-root elements
    const {
      attributes,
      listeners,
      setNodeRef: setDragRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: instance.id,
      disabled: isRoot,
      data: {
        type: instance.type,
        instanceId: instance.id,
        instance: instance,
        isContainer: canDropInside(instance.type),
      },
    });

    // Setup droppable for container elements
    const { isOver, setNodeRef: setDropRef, active } = useDroppable({
      id: `nav-drop-${instance.id}`,
      disabled: isRoot,
      data: { 
        instanceId: instance.id, 
        type: instance.type,
        isContainer: canDropInside(instance.type),
      },
    });

    // Determine if this is a valid drop target
    const activeInstance = active?.data.current?.instance as ComponentInstance | undefined;
    const draggedType = activeInstance?.type || active?.data.current?.type;
    const canAcceptDrop = canDropInside(instance.type, draggedType);
    const showValidDropZone = isOver && canAcceptDrop;
    const showInvalidDropZone = isOver && !canAcceptDrop;

    // Combine refs
    const setNodeRef = (node: HTMLElement | null) => {
      if (!isRoot) {
        setDragRef(node);
        setDropRef(node);
      }
    };

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition: transition || 'transform 150ms ease',
      opacity: isDragging ? 0.4 : 1,
      position: 'relative',
    };

    return (
      <div ref={setNodeRef} style={style} {...(!isRoot ? attributes : {})} {...(!isRoot ? listeners : {})}>
        {/* Valid drop zone indicator */}
        {showValidDropZone && (
          <div
            className="absolute inset-0 pointer-events-none rounded-md"
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '2px solid hsl(217, 91%, 60%)',
              boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)',
              zIndex: 10,
            }}
          />
        )}

        {/* Invalid drop zone indicator */}
        {showInvalidDropZone && (
          <div
            className="absolute inset-0 pointer-events-none rounded-md"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '2px dashed hsl(0, 84%, 60%)',
              zIndex: 10,
            }}
          />
        )}

        <div
          className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer hover:bg-accent rounded-md group relative ${
            isSelected ? 'bg-accent text-accent-foreground' : ''
          } ${isDragging ? 'opacity-40' : ''}`}
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
            className="flex-1 flex items-center justify-between gap-2 min-w-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              {IconComponent && <IconComponent className="w-3 h-3 flex-shrink-0" />}
              <span className="truncate">{displayLabel}</span>
              {canDropInside(instance.type) && (
                <span className="text-[10px] text-muted-foreground">●</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {width} × {height}
            </span>
          </div>

          {!isRoot && (
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

        {/* Insertion line indicator between siblings */}
        {isOver && !canAcceptDrop && (
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              top: '-2px',
              height: '4px',
              backgroundColor: 'hsl(217, 91%, 60%)',
              borderRadius: '2px',
              boxShadow: '0 0 4px rgba(59, 130, 246, 0.6)',
              zIndex: 20,
            }}
          >
            <div
              className="absolute"
              style={{
                left: `${level * 16}px`,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                backgroundColor: 'hsl(217, 91%, 60%)',
                borderRadius: '50%',
              }}
            />
          </div>
        )}

        {hasChildren && isExpanded && (
          <div>
            {instance.children.map((child) => (
              <TreeNode key={child.id} instance={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-0.5">
        {rootInstance && <TreeNode instance={rootInstance} level={0} />}
      </div>
    </ScrollArea>
  );
};
