import React from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Type, FileText, Ban } from 'lucide-react';

interface TabPanelDataEditorProps {
  instance: ComponentInstance;
}

export const TabPanelDataEditor: React.FC<TabPanelDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const label = instance.props?.label || '';
  const content = instance.props?.content || '';
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
      {/* Tab Label */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Type className="w-3 h-3 text-muted-foreground" />
          <Label className="text-xs font-semibold">Tab Label</Label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          The text displayed in the tab trigger button.
        </p>
        <Input
          value={label}
          onChange={(e) => updateProp('label', e.target.value)}
          placeholder="Tab label..."
          className="h-7 text-xs"
        />
      </div>

      {/* Fallback Content */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-muted-foreground" />
          <Label className="text-xs font-semibold">Fallback Content</Label>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Text content shown when no child elements are present in this tab panel.
        </p>
        <Textarea
          value={content}
          onChange={(e) => updateProp('content', e.target.value)}
          placeholder="Tab panel content..."
          className="text-xs min-h-[80px] resize-none"
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
            id="tab-disabled"
            checked={disabled}
            onCheckedChange={(checked) => updateProp('disabled', checked === true)}
          />
          <label htmlFor="tab-disabled" className="text-xs text-muted-foreground cursor-pointer">
            Disabled (tab cannot be selected)
          </label>
        </div>
      </div>

      {/* Info about dropping elements */}
      <div className="p-2 rounded bg-muted/50 border border-border">
        <p className="text-[10px] text-muted-foreground">
          <strong>Tip:</strong> Drop elements directly into this tab panel from the Elements panel to create custom content. The fallback text is hidden when child elements are present.
        </p>
      </div>
    </div>
  );
};
