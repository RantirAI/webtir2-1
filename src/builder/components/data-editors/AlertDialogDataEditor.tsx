import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface AlertDialogDataEditorProps {
  instance: ComponentInstance;
}

export const AlertDialogDataEditor: React.FC<AlertDialogDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Alert Dialog Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Trigger Text</label>
        <Input
          value={instance.props?.triggerText || 'Open Dialog'}
          onChange={(e) => updateProps({ triggerText: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Button text to open dialog"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Title</label>
        <Input
          value={instance.props?.title || 'Are you sure?'}
          onChange={(e) => updateProps({ title: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Dialog title"
        />
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Description</label>
        <Textarea
          value={instance.props?.description || 'This action cannot be undone.'}
          onChange={(e) => updateProps({ description: e.target.value })}
          className="text-[10px] min-h-[60px] resize-none"
          placeholder="Dialog description..."
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Cancel Text</label>
          <Input
            value={instance.props?.cancelText || 'Cancel'}
            onChange={(e) => updateProps({ cancelText: e.target.value })}
            className="h-5 text-[10px]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] text-muted-foreground">Action Text</label>
          <Input
            value={instance.props?.actionText || 'Continue'}
            onChange={(e) => updateProps({ actionText: e.target.value })}
            className="h-5 text-[10px]"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Action Variant</label>
        <select
          className="w-full h-5 px-1 text-[10px] rounded border border-border bg-background"
          value={instance.props?.actionVariant || 'default'}
          onChange={(e) => updateProps({ actionVariant: e.target.value })}
        >
          <option value="default">Default</option>
          <option value="destructive">Destructive</option>
          <option value="outline">Outline</option>
        </select>
      </div>
    </div>
  );
};
