import React from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Type, Ban } from 'lucide-react';

interface TabTriggerDataEditorProps {
  instance: ComponentInstance;
}

export const TabTriggerDataEditor: React.FC<TabTriggerDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const text = instance.props?.text || '';
  const disabled = instance.props?.disabled || false;

  const updateProp = (key: string, value: string | boolean) => {
    updateInstance(instance.id, {
      props: {
        ...instance.props,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Tab Trigger Text */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Type className="w-3 h-3 text-muted-foreground" />
          <Label className="text-xs font-semibold">Tab Heading</Label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          The text displayed in the tab button/trigger.
        </p>
        <Input
          value={text}
          onChange={(e) => updateProp('text', e.target.value)}
          placeholder="Tab heading..."
          className="h-7 text-xs"
        />
      </div>

      {/* Disabled State */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Ban className="w-3 h-3 text-muted-foreground" />
          <Label className="text-xs font-semibold">State</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="trigger-disabled"
            checked={disabled}
            onCheckedChange={(checked) => updateProp('disabled', checked === true)}
          />
          <label htmlFor="trigger-disabled" className="text-xs text-muted-foreground cursor-pointer">
            Disabled (tab cannot be selected)
          </label>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 rounded bg-muted/50 border border-border">
        <p className="text-[10px] text-muted-foreground">
          <strong>Tip:</strong> This is the clickable tab heading in the tab bar. Style it using the Style tab or via the parent Tabs component settings.
        </p>
      </div>
    </div>
  );
};
