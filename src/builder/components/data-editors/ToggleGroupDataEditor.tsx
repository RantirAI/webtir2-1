import React from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface ToggleItem {
  id: string;
  value: string;
  label: string;
  disabled?: boolean;
}

interface ToggleGroupDataEditorProps {
  instance: ComponentInstance;
}

export const ToggleGroupDataEditor: React.FC<ToggleGroupDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const items: ToggleItem[] = instance.props?.items || [
    { id: '1', value: 'option1', label: 'Option 1' },
    { id: '2', value: 'option2', label: 'Option 2' },
    { id: '3', value: 'option3', label: 'Option 3' },
  ];

  const updateItems = (newItems: ToggleItem[]) => {
    updateInstance(instance.id, {
      props: { ...instance.props, items: newItems }
    });
  };

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  const addItem = () => {
    const newItem: ToggleItem = {
      id: Date.now().toString(),
      value: `option${items.length + 1}`,
      label: `Option ${items.length + 1}`,
    };
    updateItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof ToggleItem, value: string | boolean) => {
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
    <div className="space-y-3">
      {/* Settings */}
      <div className="space-y-2">
        <label className="text-[10px] font-medium text-foreground">Toggle Group Settings</label>
        
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Type</label>
          <select
            className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
            value={instance.props?.type || 'single'}
            onChange={(e) => updateProps({ type: e.target.value })}
          >
            <option value="single">Single (radio-style)</option>
            <option value="multiple">Multiple (checkbox-style)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Variant</label>
          <select
            className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
            value={instance.props?.variant || 'default'}
            onChange={(e) => updateProps({ variant: e.target.value })}
          >
            <option value="default">Default</option>
            <option value="outline">Outline</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Size</label>
          <select
            className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
            value={instance.props?.size || 'default'}
            onChange={(e) => updateProps({ size: e.target.value })}
          >
            <option value="sm">Small</option>
            <option value="default">Default</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium text-foreground">Items</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addItem}
            className="h-5 px-1.5 text-[9px]"
          >
            <Plus className="w-3 h-3 mr-0.5" /> Add
          </Button>
        </div>
        
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-1 p-1.5 border border-border rounded bg-muted/30">
              <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab" />
              <Input
                value={item.label}
                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                className="h-5 text-[9px] flex-1"
                placeholder="Label"
              />
              <Input
                value={item.value}
                onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                className="h-5 text-[9px] w-16"
                placeholder="Value"
              />
              <Checkbox
                checked={item.disabled || false}
                onCheckedChange={(checked) => updateItem(item.id, 'disabled', !!checked)}
                className="h-3 w-3"
                title="Disabled"
              />
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
          ))}
        </div>
      </div>
    </div>
  );
};
