import React from 'react';
import { Input } from '@/components/ui/input';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface BadgeDataEditorProps {
  instance: ComponentInstance;
}

export const BadgeDataEditor: React.FC<BadgeDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const updateProps = (updates: Record<string, any>) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ...updates }
    });
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-medium text-foreground">Badge Settings</label>
      
      <div className="space-y-1">
        <label className="text-[9px] text-muted-foreground">Text</label>
        <Input
          value={instance.props?.text || 'Badge'}
          onChange={(e) => updateProps({ text: e.target.value })}
          className="h-5 text-[10px]"
          placeholder="Badge text"
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
          <option value="secondary">Secondary</option>
          <option value="destructive">Destructive</option>
          <option value="outline">Outline</option>
        </select>
      </div>
    </div>
  );
};
