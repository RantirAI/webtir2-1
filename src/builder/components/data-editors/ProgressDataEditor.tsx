import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface ProgressDataEditorProps {
  instance: ComponentInstance;
}

export const ProgressDataEditor: React.FC<ProgressDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  const value = instance.props?.value ?? 50;

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Progress Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Value ({value}%)</label>
        <Input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => updateProps({ value: parseInt(e.target.value) })}
          className="h-5"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => updateProps({ value: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
            className="h-5 text-[10px] w-16"
          />
          <span className="text-[9px] text-muted-foreground">%</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[9px]">
          <Checkbox
            checked={instance.props?.showLabel ?? false}
            onCheckedChange={(checked) => updateProps({ showLabel: !!checked })}
            className="h-3 w-3"
          />
          Show percentage label
        </label>
        <label className="flex items-center gap-1.5 text-[9px]">
          <Checkbox
            checked={instance.props?.animated ?? false}
            onCheckedChange={(checked) => updateProps({ animated: !!checked })}
            className="h-3 w-3"
          />
          Animate on load
        </label>
        <label className="flex items-center gap-1.5 text-[9px]">
          <Checkbox
            checked={instance.props?.striped ?? false}
            onCheckedChange={(checked) => updateProps({ striped: !!checked })}
            className="h-3 w-3"
          />
          Striped style
        </label>
      </div>
    </div>
  );
};
