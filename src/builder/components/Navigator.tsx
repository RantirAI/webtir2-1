import React, { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { useComponentInstanceStore } from '../store/useComponentInstanceStore';
import { usePageStore } from '../store/usePageStore';
import { ComponentInstance } from '../store/types';
import { ChevronRight, ChevronDown, Trash2, Component, Copy, Plus, Globe } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as Icons from 'lucide-react';
import { componentRegistry } from '../primitives/registry';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { canDropInside } from '../utils/instance';
import { duplicateInstanceWithLinkage, applyDuplicationLinks } from '../utils/duplication';
import { CreateComponentDialog } from './CreateComponentDialog';
import { getCanvasComputedStyles } from '../utils/canvasStyles';

// Type for drop position - where the item should be inserted
type DropPosition = 'before' | 'inside' | 'after' | null;

interface ContextMenuState {
  x: number;
  y: number;
  instance: ComponentInstance;
}

export const Navigator: React.FC = () => {
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const selectedInstanceId = useBuilderStore((state) => state.selectedInstanceId);
  const isolatedInstanceId = useBuilderStore((state) => state.isolatedInstanceId);
  const setSelectedInstanceId = useBuilderStore((state) => state.setSelectedInstanceId);
  const deleteInstance = useBuilderStore((state) => state.deleteInstance);
  const addInstance = useBuilderStore((state) => state.addInstance);
  const findInstance = useBuilderStore((state) => state.findInstance);
  const enterIsolationMode = useBuilderStore((state) => state.enterIsolationMode);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root']));
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Close context menu on click outside or escape
  useEffect(() => {
    if (!contextMenu) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [contextMenu]);

  // Auto-expand newly added instances with children
  useEffect(() => {
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

  const handleContextMenuDuplicate = () => {
    if (!contextMenu) return;
    const instance = contextMenu.instance;
    const parent = useBuilderStore.getState().rootInstance;
    if (!parent) return;
    
    const findParent = (root: ComponentInstance): ComponentInstance | null => {
      for (const child of root.children) {
        if (child.id === instance.id) return root;
        const found = findParent(child);
        if (found) return found;
      }
      return null;
    };
    
    const parentInstance = findParent(parent);
    if (parentInstance) {
      const index = parentInstance.children.findIndex(c => c.id === instance.id);
      
      // Use unified duplication that preserves all nested component linkages
      const { instance: duplicate, links } = duplicateInstanceWithLinkage(instance);
      addInstance(duplicate, parentInstance.id, index + 1);
      // Apply linkage to all nested linked components
      applyDuplicationLinks(links);
    }
    setContextMenu(null);
  };

  const handleContextMenuDelete = () => {
    if (!contextMenu) return;
    if (contextMenu.instance.id !== 'root') {
      deleteInstance(contextMenu.instance.id);
    }
    setContextMenu(null);
  };

  const TreeNode: React.FC<{ instance: ComponentInstance; level: number; isInsidePrebuilt?: boolean; prebuiltName?: string; isGlobal?: boolean; siblingIds?: string[] }> = ({ 
    instance, 
    level, 
    isInsidePrebuilt = false,
    prebuiltName,
    isGlobal = false,
    siblingIds = []
  }) => {
    const isExpanded = expandedIds.has(instance.id);
    const isSelected = instance.id === selectedInstanceId;
    const hasChildren = instance.children.length > 0;
    const isRoot = instance.id === 'root';
    const nodeRef = useRef<HTMLDivElement>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition>(null);
    
    // Check if this is a linked prebuilt instance
    const isLinkedInstance = useComponentInstanceStore((state) => state.isLinkedInstance);
    const getInstanceLink = useComponentInstanceStore((state) => state.getInstanceLink);
    const getPrebuilt = useComponentInstanceStore((state) => state.getPrebuilt);
    
    const isPrebuiltRoot = isLinkedInstance(instance.id);
    const instanceLink = isPrebuiltRoot ? getInstanceLink(instance.id) : null;
    const prebuiltComponent = instanceLink ? getPrebuilt(instanceLink.prebuiltId) : null;
    
    // Determine if this node should be styled as prebuilt (either root or nested)
    const isPrebuiltStyled = isPrebuiltRoot || isInsidePrebuilt;
    const currentPrebuiltName = isPrebuiltRoot && prebuiltComponent ? prebuiltComponent.name : prebuiltName;
    
    const meta = componentRegistry[instance.type];
    const IconComponent = meta ? Icons[meta.icon as keyof typeof Icons] as any : null;

    // Get computed dimensions - use scoped state (Navigator shows default state)
    const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);
    const width = computedStyles.width || 'auto';
    const height = computedStyles.height || 'auto';
    
    // Get dynamic label from primary style source (first class name)
    const styleSources = useStyleStore((state) => state.styleSources);
    const primaryStyleId = instance.styleSourceIds?.[0];
    const primaryClassName = primaryStyleId ? styleSources[primaryStyleId]?.name : null;
    
    // For prebuilt root, show the prebuilt name; otherwise show class name or type
    const displayLabel = isPrebuiltRoot && prebuiltComponent 
      ? prebuiltComponent.name 
      : (primaryClassName || instance.label || instance.type);

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

    // Setup droppable for this element (both container and between-sibling drops)
    const { isOver, setNodeRef: setDropRef, active } = useDroppable({
      id: instance.id,
      disabled: isRoot,
      data: { 
        instanceId: instance.id, 
        type: instance.type,
        isContainer: canDropInside(instance.type),
      },
    });

    // Determine drop position based on pointer location
    useEffect(() => {
      if (!isOver || !active || !nodeRef.current) {
        setDropPosition(null);
        return;
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!nodeRef.current) return;
        
        const rect = nodeRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const topThird = height / 3;
        const bottomThird = height * 2 / 3;
        
        const activeInstance = active.data.current?.instance as ComponentInstance | undefined;
        const draggedType = activeInstance?.type || active.data.current?.type;
        const canBeContainer = canDropInside(instance.type, draggedType);
        
        if (y < topThird) {
          setDropPosition('before');
        } else if (y > bottomThird) {
          setDropPosition('after');
        } else if (canBeContainer) {
          setDropPosition('inside');
        } else {
          // If not a container, treat middle as "after"
          setDropPosition('after');
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }, [isOver, active, instance.type]);

    // Determine if this is a valid drop target for "inside"
    const activeInstance = active?.data.current?.instance as ComponentInstance | undefined;
    const draggedType = activeInstance?.type || active?.data.current?.type;
    const canAcceptDrop = canDropInside(instance.type, draggedType);
    
    // Visual states
    const showInsideDropZone = isOver && dropPosition === 'inside' && canAcceptDrop;
    const showBeforeIndicator = isOver && dropPosition === 'before' && !isRoot;
    const showAfterIndicator = isOver && dropPosition === 'after' && !isRoot;

    // Combine refs
    const setNodeRef = (node: HTMLElement | null) => {
      (nodeRef as React.MutableRefObject<HTMLElement | null>).current = node;
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

    const handleRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, instance });
    };

    return (
      <div ref={setNodeRef} style={style} {...(!isRoot ? attributes : {})} {...(!isRoot ? listeners : {})}>
        {/* Before insertion indicator */}
        {showBeforeIndicator && (
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

        {/* Inside container drop zone indicator */}
        {showInsideDropZone && (
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

        {/* Component row - styled green for prebuilt components and their children */}
        <div
          className={`flex items-center gap-1 px-2 py-1 text-sm cursor-pointer rounded-md group relative ${
            isSelected 
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
              : 'hover:bg-muted'
          } ${isDragging ? 'opacity-40' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onContextMenu={handleRightClick}
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
                <ChevronDown className={`w-3 h-3 ${isPrebuiltStyled ? 'text-emerald-500' : ''}`} />
              ) : (
                <ChevronRight className={`w-3 h-3 ${isPrebuiltStyled ? 'text-emerald-500' : ''}`} />
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
              {isPrebuiltRoot ? (
                <Component className="w-3.5 h-3.5 flex-shrink-0 text-emerald-500" />
              ) : (
                IconComponent && <IconComponent className={`w-3 h-3 flex-shrink-0 ${isPrebuiltStyled ? 'text-emerald-500' : ''}`} />
              )}
              <span className={`truncate ${isPrebuiltStyled ? 'text-emerald-500 font-medium' : ''}`}>
                {displayLabel}
              </span>
              {canDropInside(instance.type) && !isPrebuiltStyled && (
                <span className="text-[10px] text-muted-foreground">●</span>
              )}
            </div>
            {!isPrebuiltStyled && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {width} × {height}
              </span>
            )}
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

        {/* After insertion indicator */}
        {showAfterIndicator && !hasChildren && (
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              bottom: '-2px',
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

        {/* Children with SortableContext for proper reordering */}
        {hasChildren && isExpanded && (
          <SortableContext 
            items={instance.children.map(c => c.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div>
              {instance.children.map((child) => (
                <TreeNode 
                  key={child.id} 
                  instance={child} 
                  level={level + 1} 
                  isInsidePrebuilt={isPrebuiltStyled}
                  prebuiltName={currentPrebuiltName}
                  siblingIds={instance.children.map(c => c.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    );
  };

  // Get global components
  const { getGlobalComponents } = usePageStore();
  const globalComponents = getGlobalComponents();
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ScrollArea className="flex-1 [&_[data-radix-scroll-area-scrollbar]]:opacity-0 [&:hover_[data-radix-scroll-area-scrollbar]]:opacity-100 [&_[data-radix-scroll-area-scrollbar]]:transition-opacity">
        <div className="p-2 space-y-0.5">
          {/* Global Components Section */}
          {(globalComponents.header || globalComponents.footer) && (
            <div className="mb-2 pb-2 border-b border-border">
              <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Global Components
              </div>
              {globalComponents.header && (
                <TreeNode instance={globalComponents.header} level={0} isGlobal={true} />
              )}
              {globalComponents.footer && (
                <TreeNode instance={globalComponents.footer} level={0} isGlobal={true} />
              )}
            </div>
          )}
          
          {rootInstance && <TreeNode instance={rootInstance} level={0} />}
        </div>
      </ScrollArea>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-popover text-popover-foreground rounded-md shadow-lg border py-1 z-[10000] min-w-[160px] text-sm"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <div className="px-2 py-1.5 text-xs text-muted-foreground border-b font-medium">
            {contextMenu.instance.label || contextMenu.instance.type}
          </div>
          
          <button
            className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
            onClick={handleContextMenuDuplicate}
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="flex-1">Duplicate</span>
            <span className="text-xs text-muted-foreground">⌘D</span>
          </button>
          
          <button
            className="w-full px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-destructive disabled:opacity-50"
            onClick={handleContextMenuDelete}
            disabled={contextMenu.instance.id === 'root'}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="flex-1">Delete</span>
            <span className="text-xs text-muted-foreground">⌫</span>
          </button>
        </div>
      )}
      
      <CreateComponentDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
};
