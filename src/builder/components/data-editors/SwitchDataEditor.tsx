import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface SwitchDataEditorProps {
  instance: ComponentInstance;
}

export const SwitchDataEditor: React.FC<SwitchDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Switch Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Label</label>
        <Input
          value={instance.props?.label || 'Enable feature'}
          onChange={(e) => updateProps({ label: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Switch label"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Description</label>
        <Input
          value={instance.props?.description || ''}
          onChange={(e) => updateProps({ description: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Optional description"
        />
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[9px]">
          <Checkbox
            checked={instance.props?.defaultChecked ?? false}
            onCheckedChange={(checked) => updateProps({ defaultChecked: !!checked })}
            className="h-3 w-3"
          />
          Default checked
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
