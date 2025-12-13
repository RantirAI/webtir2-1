import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface SliderDataEditorProps {
  instance: ComponentInstance;
}

export const SliderDataEditor: React.FC<SliderDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  
  const min = instance.props?.min ?? 0;
  const max = instance.props?.max ?? 100;
  const step = instance.props?.step ?? 1;
  const defaultValue = instance.props?.defaultValue ?? 50;
  const showValue = instance.props?.showValue ?? true;
  const orientation = instance.props?.orientation ?? 'horizontal';

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Slider Settings</label>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Min</label>
          <Input
            type="number"
            value={min}
            onChange={(e) => updateProps({ min: parseFloat(e.target.value) || 0 })}
            className="h-5 text-[10px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Max</label>
          <Input
            type="number"
            value={max}
            onChange={(e) => updateProps({ max: parseFloat(e.target.value) || 100 })}
            className="h-5 text-[10px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Step</label>
          <Input
            type="number"
            value={step}
            onChange={(e) => updateProps({ step: parseFloat(e.target.value) || 1 })}
            className="h-5 text-[10px]"
            min={0.01}
            step={0.1}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Default Value</label>
          <Input
            type="number"
            value={defaultValue}
            onChange={(e) => updateProps({ defaultValue: parseFloat(e.target.value) || 0 })}
            className="h-5 text-[10px]"
            min={min}
            max={max}
            step={step}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Orientation</label>
        <select
          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
          value={orientation}
          onChange={(e) => updateProps({ orientation: e.target.value })}
        >
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-[9px]">
          <Checkbox
            checked={showValue}
            onCheckedChange={(checked) => updateProps({ showValue: !!checked })}
            className="h-3 w-3"
          />
          Show current value
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
