import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface AlertDataEditorProps {
  instance: ComponentInstance;
}

export const AlertDataEditor: React.FC<AlertDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Alert Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Title</label>
        <Input
          value={instance.props?.title || 'Alert Title'}
          onChange={(e) => updateProps({ title: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Alert title"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Description</label>
        <Textarea
          value={instance.props?.description || 'Alert description goes here.'}
          onChange={(e) => updateProps({ description: e.target.value })}
          className="text-[10px] min-h-[50px] resize-none"
          placeholder="Alert description..."
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
          <option value="destructive">Destructive</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Icon</label>
        <select
          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
          value={instance.props?.icon || 'info'}
          onChange={(e) => updateProps({ icon: e.target.value })}
        >
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
          <option value="success">Success</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
  );
};
