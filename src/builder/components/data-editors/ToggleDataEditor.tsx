import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface ToggleDataEditorProps {
  instance: ComponentInstance;
}

export const ToggleDataEditor: React.FC<ToggleDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Toggle Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Label</label>
        <Input
          value={instance.props?.label || 'Toggle'}
          onChange={(e) => updateProps({ label: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Toggle label"
        />
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

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[9px]">
          <Checkbox
            checked={instance.props?.defaultPressed ?? false}
            onCheckedChange={(checked) => updateProps({ defaultPressed: !!checked })}
            className="h-3 w-3"
          />
          Default pressed
        </label>
        <label className="flex items-center gap-1.5 text-[9px]">
          <Checkbox
            checked={instance.props?.disabled ?? false}
            onCheckedChange={(checked) => updateProps({ disabled: !!checked })}
            className="h-3 w-3"
          />
          Disabled
        </label>
      </div>
    </div>
  );
};
