import React from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbDataEditorProps {
  instance: ComponentInstance;
}

export const BreadcrumbDataEditor: React.FC<BreadcrumbDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const items: BreadcrumbItem[] = instance.props?.items || [
    { id: '1', label: 'Home', href: '/' },
    { id: '2', label: 'Products', href: '/products' },
    { id: '3', label: 'Current Page', isCurrentPage: true },
  ];

  const updateItems = (newItems: BreadcrumbItem[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, items: newItems }
    });
  };

  const addItem = () => {
    const newItem: BreadcrumbItem = {
      id: Date.now().toString(),
      label: `Page ${items.length + 1}`,
      href: '#',
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof BreadcrumbItem, value: string | boolean) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateItems(newItems);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    updateItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-foreground">Breadcrumb Items</label>
        <Button
          size="sm"
          variant="ghost"
          onClick={addItem}
          className="h-5 px-1.5 text-[9px]"
        >
          <Plus className="w-3 h-3 mr-0.5" /> Add
        </Button>
      </div>
      
      <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
        {items.map((item, index) => (
          <div key={item.id} className="p-2 border border-border rounded bg-muted/30 space-y-2">
            <div className="flex items-center gap-1">
              <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
              <span className="flex-1 text-[10px] font-medium">Item {index + 1}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeItem(item.id)}
                className="h-4 w-4 p-0 text-destructive hover:text-destructive"
                disabled={items.length <= 1}
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] text-muted-foreground">Label</label>
              <Input
                value={item.label}
                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                className="h-5 text-[10px]"
                placeholder="Page name"
              />
            </div>
            
            {!item.isCurrentPage && (
              <div className="space-y-1">
                <label className="text-[9px] text-muted-foreground">URL</label>
                <Input
                  value={item.href || ''}
                  onChange={(e) => updateItem(item.id, 'href', e.target.value)}
                  className="h-5 text-[10px]"
                  placeholder="/page-path"
                />
              </div>
            )}
            
            <label className="flex items-center gap-1.5 text-[9px]">
              <Checkbox
                checked={item.isCurrentPage || false}
                onCheckedChange={(checked) => {
                  // Only one can be current page
                  const newItems = items.map(i => ({
                    ...i,
                    isCurrentPage: i.id === item.id ? !!checked : false
                  }));
                  updateItems(newItems);
                }}
                className="h-3 w-3"
              />
              Current page (no link)
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
