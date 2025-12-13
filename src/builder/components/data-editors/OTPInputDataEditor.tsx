import React from 'react';
import { Input } from '@/components/ui/input';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface OTPInputDataEditorProps {
  instance: ComponentInstance;
}

export const OTPInputDataEditor: React.FC<OTPInputDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">OTP Input Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Number of Digits</label>
        <select
          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
          value={instance.props?.maxLength ?? 6}
          onChange={(e) => updateProps({ maxLength: parseInt(e.target.value) })}
        >
          <option value={4}>4 digits</option>
          <option value={6}>6 digits</option>
          <option value={8}>8 digits</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Default Value</label>
        <Input
          value={instance.props?.defaultValue || ''}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, instance.props?.maxLength || 6);
            updateProps({ defaultValue: val });
          }}
          className="h-5 text-[10px]"
          placeholder="Pre-filled value"
          maxLength={instance.props?.maxLength || 6}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Input Mode</label>
        <select
          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
          value={instance.props?.inputMode ?? 'numeric'}
          onChange={(e) => updateProps({ inputMode: e.target.value })}
        >
          <option value="numeric">Numeric only</option>
          <option value="text">Alphanumeric</option>
        </select>
      </div>

      <label className="flex items-center gap-1.5 text-[9px]">
        <input
          type="checkbox"
          checked={instance.props?.disabled ?? false}
          onChange={(e) => updateProps({ disabled: e.target.checked })}
          className="w-3 h-3"
        />
        Disabled
      </label>
    </div>
  );
};
