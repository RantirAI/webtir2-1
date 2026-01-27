import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ComponentInstance } from '../store/types';
import { useBuilderStore } from '../store/useBuilderStore';
import { getCanvasComputedStyles } from '../utils/canvasStyles';

interface TableElementProps {
  instance: ComponentInstance;
  parentInstance: ComponentInstance | null;
  isPreviewMode: boolean;
  getComputedStyles: (styleSourceIds: string[], breakpointId?: string, state?: string) => Record<string, any>;
  renderInstance: (child: ComponentInstance, parent: ComponentInstance, idx: number) => React.ReactNode;
  setSelectedInstanceId: (id: string | null) => void;
  setHoveredInstanceId: (id: string | null) => void;
  handleContextMenu: (e: React.MouseEvent, instance: ComponentInstance) => void;
}

// TableRow component with droppable directly on <tr>
export const TableRowElement: React.FC<TableElementProps> = ({
  instance,
  parentInstance,
  isPreviewMode,
  getComputedStyles,
  renderInstance,
  setSelectedInstanceId,
  setHoveredInstanceId,
  handleContextMenu,
}) => {
  const { setNodeRef } = useDroppable({
    id: `droppable-${instance.id}`,
    data: { instanceId: instance.id, type: instance.type },
  });

  // Get tableStyles from parent Table for styling
  const parentTable = parentInstance && parentInstance.type === 'Table' ? parentInstance : null;
  const tableStyles = parentTable?.props?.tableStyles || {};
  const isHeader = instance.props?.isHeader || false;
  const rowIndex = parentInstance?.children.filter(c => !c.props?.isHeader).indexOf(instance) ?? 0;
  const isStriped = tableStyles.striped && !isHeader && rowIndex % 2 === 1;

  const childIds = instance.children.map(child => child.id);

  return (
    <tr
      ref={isPreviewMode ? undefined : setNodeRef}
      data-instance-id={instance.id}
      data-droppable-id={instance.id}
      style={{
        ...getCanvasComputedStyles(instance.id, instance.styleSourceIds || []) as React.CSSProperties,
        backgroundColor: isStriped ? (tableStyles.stripedColor || 'hsl(var(--muted) / 0.5)') : undefined,
        ...(tableStyles.hoverable && !isHeader ? { cursor: 'pointer' } : {}),
      }}
      className={tableStyles.hoverable && !isHeader ? 'hover:bg-muted/50' : ''}
      onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
      onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
      onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
      onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
    >
      {isPreviewMode ? (
        instance.children.map((child, idx) => renderInstance(child, instance, idx))
      ) : (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {instance.children.length > 0 
            ? instance.children.map((child, idx) => renderInstance(child, instance, idx))
            : (
              <td colSpan={100}>
                <div className="flex items-center justify-center h-10 border-2 border-dashed border-blue-300 rounded bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-xs text-blue-500 font-medium">Drop cells here</span>
                </div>
              </td>
            )}
        </SortableContext>
      )}
    </tr>
  );
};

// TableHeaderCell component with droppable directly on <th>
export const TableHeaderCellElement: React.FC<TableElementProps> = ({
  instance,
  parentInstance,
  isPreviewMode,
  getComputedStyles,
  renderInstance,
  setSelectedInstanceId,
  setHoveredInstanceId,
  handleContextMenu,
}) => {
  const { setNodeRef } = useDroppable({
    id: `droppable-${instance.id}`,
    data: { instanceId: instance.id, type: instance.type },
  });

  // Get tableStyles from grandparent Table
  let tableStyles: any = {};
  if (parentInstance?.type === 'TableRow') {
    const { rootInstance } = useBuilderStore.getState();
    const tableParent = rootInstance.children.find(c => 
      c.type === 'Table' && c.children.some(row => row.id === parentInstance.id)
    );
    tableStyles = tableParent?.props?.tableStyles || {};
  }

  const childIds = instance.children.map(child => child.id);

  return (
    <th
      ref={isPreviewMode ? undefined : setNodeRef}
      data-instance-id={instance.id}
      data-droppable-id={instance.id}
      style={{
        ...getCanvasComputedStyles(instance.id, instance.styleSourceIds || []) as React.CSSProperties,
        padding: `${tableStyles.cellPadding || 12}px`,
        fontWeight: tableStyles.headerFontWeight || '600',
        fontSize: `${tableStyles.headerFontSize || 14}px`,
        textAlign: 'left',
        backgroundColor: tableStyles.headerBackground || 'hsl(var(--muted))',
        color: tableStyles.headerTextColor || 'hsl(var(--foreground))',
        borderBottom: tableStyles.borderStyle !== 'none' ? `${tableStyles.borderWidth || 1}px solid ${tableStyles.borderColor || 'hsl(var(--border))'}` : undefined,
        ...(tableStyles.bordered ? { border: `${tableStyles.borderWidth || 1}px solid ${tableStyles.borderColor || 'hsl(var(--border))'}` } : {}),
      }}
      onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
      onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
      onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
      onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
    >
      {isPreviewMode ? (
        instance.children.length > 0 
          ? instance.children.map((child, idx) => renderInstance(child, instance, idx))
          : (instance.props?.content || 'Header')
      ) : (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {instance.children.length > 0 
            ? instance.children.map((child, idx) => renderInstance(child, instance, idx))
            : (instance.props?.content || 'Header')}
        </SortableContext>
      )}
    </th>
  );
};

// TableCell component with droppable directly on <td>
export const TableCellElement: React.FC<TableElementProps> = ({
  instance,
  parentInstance,
  isPreviewMode,
  getComputedStyles,
  renderInstance,
  setSelectedInstanceId,
  setHoveredInstanceId,
  handleContextMenu,
}) => {
  const { setNodeRef } = useDroppable({
    id: `droppable-${instance.id}`,
    data: { instanceId: instance.id, type: instance.type },
  });

  // Get tableStyles from grandparent Table
  let tableStyles: any = {};
  if (parentInstance?.type === 'TableRow') {
    const { rootInstance } = useBuilderStore.getState();
    const tableParent = rootInstance.children.find(c => 
      c.type === 'Table' && c.children.some(row => row.id === parentInstance.id)
    );
    tableStyles = tableParent?.props?.tableStyles || {};
  }

  const childIds = instance.children.map(child => child.id);

  return (
    <td
      ref={isPreviewMode ? undefined : setNodeRef}
      data-instance-id={instance.id}
      data-droppable-id={instance.id}
      style={{
        ...getCanvasComputedStyles(instance.id, instance.styleSourceIds || []) as React.CSSProperties,
        padding: `${tableStyles.cellPadding || 12}px`,
        fontSize: `${tableStyles.cellFontSize || 14}px`,
        backgroundColor: tableStyles.cellBackground || 'transparent',
        color: tableStyles.cellTextColor || 'hsl(var(--foreground))',
        borderBottom: tableStyles.borderStyle !== 'none' ? `${tableStyles.borderWidth || 1}px solid ${tableStyles.borderColor || 'hsl(var(--border))'}` : undefined,
        ...(tableStyles.bordered ? { border: `${tableStyles.borderWidth || 1}px solid ${tableStyles.borderColor || 'hsl(var(--border))'}` } : {}),
      }}
      onClick={isPreviewMode ? undefined : (e) => { e.stopPropagation(); setSelectedInstanceId(instance.id); }}
      onMouseEnter={isPreviewMode ? undefined : () => setHoveredInstanceId(instance.id)}
      onMouseLeave={isPreviewMode ? undefined : () => setHoveredInstanceId(null)}
      onContextMenu={isPreviewMode ? undefined : (e) => handleContextMenu(e, instance)}
    >
      {isPreviewMode ? (
        instance.children.length > 0 
          ? instance.children.map((child, idx) => renderInstance(child, instance, idx))
          : (instance.props?.content || '')
      ) : (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          {instance.children.length > 0 
            ? instance.children.map((child, idx) => renderInstance(child, instance, idx))
            : (instance.props?.content || '')}
        </SortableContext>
      )}
    </td>
  );
};
