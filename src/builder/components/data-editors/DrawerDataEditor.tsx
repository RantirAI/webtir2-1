import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface DrawerDataEditorProps {
  instance: ComponentInstance;
}

export const DrawerDataEditor: React.FC<DrawerDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Drawer Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Trigger Text</label>
        <Input
          value={instance.props?.trigger || 'Open Drawer'}
          onChange={(e) => updateProps({ trigger: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Button text to open drawer"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Title</label>
        <Input
          value={instance.props?.title || 'Drawer Title'}
          onChange={(e) => updateProps({ title: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Drawer title"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Description</label>
        <Textarea
          value={instance.props?.description || 'Drawer description goes here.'}
          onChange={(e) => updateProps({ description: e.target.value })}
          className="text-[10px] min-h-[50px] resize-none"
          placeholder="Drawer description..."
        />
      </div>

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
    </div>
  );
};
