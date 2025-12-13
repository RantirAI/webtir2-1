import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface TooltipDataEditorProps {
  instance: ComponentInstance;
}

export const TooltipDataEditor: React.FC<TooltipDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Tooltip Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Trigger Content</label>
        <Input
          value={instance.props?.trigger || 'Hover me'}
          onChange={(e) => updateProps({ trigger: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Text or element that triggers tooltip"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Tooltip Text</label>
        <Textarea
          value={instance.props?.content || 'Tooltip content'}
          onChange={(e) => updateProps({ content: e.target.value })}
          className="text-[10px] min-h-[50px] resize-none"
          placeholder="Tooltip content..."
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Position</label>
        <select
          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
          value={instance.props?.side || 'top'}
          onChange={(e) => updateProps({ side: e.target.value })}
        >
          <option value="top">Top</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Delay (ms)</label>
        <Input
          type="number"
          value={instance.props?.delayDuration ?? 200}
          onChange={(e) => updateProps({ delayDuration: parseInt(e.target.value) || 0 })}
          className="h-5 text-[10px] w-20"
          min={0}
          step={100}
        />
      </div>
    </div>
  );
};
