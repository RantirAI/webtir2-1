import React from 'react';
import { Plus, X, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface AccordionItem {
  id: string;
  title: string;
  content: string;
  defaultOpen?: boolean;
}

interface AccordionDataEditorProps {
  instance: ComponentInstance;
}

export const AccordionDataEditor: React.FC<AccordionDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const items: AccordionItem[] = instance.props?.items || [
    { id: '1', title: 'Item 1', content: 'Content for item 1', defaultOpen: true },
    { id: '2', title: 'Item 2', content: 'Content for item 2' },
    { id: '3', title: 'Item 3', content: 'Content for item 3' },
  ];

  const updateItems = (newItems: AccordionItem[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, items: newItems }
    });
  };

  const addItem = () => {
    const newItem: AccordionItem = {
      id: Date.now().toString(),
      title: `Item ${items.length + 1}`,
      content: `Content for item ${items.length + 1}`,
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof AccordionItem, value: string | boolean) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateItems(newItems);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    updateItems(items.filter(item => item.id !== id));
  };

  const [expandedId, setExpandedId] = React.useState<string | null>(items[0]?.id || null);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-foreground">Accordion Items</label>
        <Button
          size="sm"
          variant="ghost"
          onClick={addItem}
          className="h-5 px-1.5 text-[9px]"
        >
          <Plus className="w-3 h-3 mr-0.5" /> Add
        </Button>
      </div>
      
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {items.map((item) => (
          <div key={item.id} className="border border-border rounded bg-muted/30">
            <div 
              className="flex items-center gap-1 p-1.5 cursor-pointer hover:bg-muted/50"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
              {expandedId === item.id ? (
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
              <span className="flex-1 text-[10px] truncate">{item.title || 'Untitled'}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                disabled={items.length <= 1}
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
            
            {expandedId === item.id && (
              <div className="p-2 pt-0 space-y-2 border-t border-border">
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-foreground">Title</label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                    className="h-5 text-[10px]"
                    placeholder="Accordion title"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-muted-foreground">Content</label>
                  <Textarea
                    value={item.content}
                    onChange={(e) => updateItem(item.id, 'content', e.target.value)}
                    className="text-[10px] min-h-[60px] resize-none"
                    placeholder="Accordion content..."
                  />
                </div>
                <label className="flex items-center gap-1.5 text-[9px]">
                  <input
                    type="checkbox"
                    checked={item.defaultOpen || false}
                    onChange={(e) => updateItem(item.id, 'defaultOpen', e.target.checked)}
                    className="w-3 h-3"
                  />
                  Default open
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
