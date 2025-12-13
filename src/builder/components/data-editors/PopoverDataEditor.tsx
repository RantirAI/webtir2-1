import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface PopoverDataEditorProps {
  instance: ComponentInstance;
}

export const PopoverDataEditor: React.FC<PopoverDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Popover Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Trigger Text</label>
        <Input
          value={instance.props?.trigger || 'Open Popover'}
          onChange={(e) => updateProps({ trigger: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Button text to open popover"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Title</label>
        <Input
          value={instance.props?.title || 'Popover Title'}
          onChange={(e) => updateProps({ title: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Popover title"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Content</label>
        <Textarea
          value={instance.props?.content || 'Popover content goes here.'}
          onChange={(e) => updateProps({ content: e.target.value })}
          className="text-[10px] min-h-[60px] resize-none"
          placeholder="Popover content..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Side</label>
          <select
            className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
            value={instance.props?.side || 'bottom'}
            onChange={(e) => updateProps({ side: e.target.value })}
          >
            <option value="top">Top</option>
            <option value="right">Right</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Align</label>
          <select
            className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
            value={instance.props?.align || 'center'}
            onChange={(e) => updateProps({ align: e.target.value })}
          >
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </div>
      </div>
    </div>
  );
};
