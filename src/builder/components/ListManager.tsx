import React from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListItem {
  id: string;
  enabled: boolean;
}

interface ListManagerProps<T extends ListItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
}

function SortableItem<T extends ListItem>({
  item,
  onToggle,
  onDelete,
  renderItem,
}: {
  item: T;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-muted/50 rounded border border-border mb-2"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="flex-1 min-w-0">{renderItem(item)}</div>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onToggle(item.id)}
        className="h-7 w-7 p-0"
      >
        {item.enabled ? (
          <Eye className="w-3 h-3" />
        ) : (
          <EyeOff className="w-3 h-3 text-muted-foreground" />
        )}
      </Button>
      
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onDelete(item.id)}
        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

export function ListManager<T extends ListItem>({
  items,
  onReorder,
  onToggle,
  onDelete,
  renderItem,
}: ListManagerProps<T>) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);

      onReorder(newItems);
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              onToggle={onToggle}
              onDelete={onDelete}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
