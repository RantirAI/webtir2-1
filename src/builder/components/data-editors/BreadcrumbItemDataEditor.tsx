import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface BreadcrumbItemDataEditorProps {
  instance: ComponentInstance;
}

export const BreadcrumbItemDataEditor: React.FC<BreadcrumbItemDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  
  const label = instance.props?.label || 'Page';
  const href = instance.props?.href || '#';
  const isCurrentPage = instance.props?.isCurrentPage || false;

  const updateProp = (key: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [key]: value },
      label: key === 'label' ? value : instance.label, // Also update the instance label for Navigator
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Label</Label>
        <Input
          value={label}
          onChange={(e) => updateProp('label', e.target.value)}
          className="h-7 text-[11px]"
          placeholder="Page name"
        />
      </div>
      
      {!isCurrentPage && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">URL</Label>
          <Input
            value={href}
            onChange={(e) => updateProp('href', e.target.value)}
            className="h-7 text-[11px]"
            placeholder="/page-path"
          />
        </div>
      )}
      
      <label className="flex items-center gap-2 text-[10px]">
        <Checkbox
          checked={isCurrentPage}
          onCheckedChange={(checked) => updateProp('isCurrentPage', !!checked)}
          className="h-3.5 w-3.5"
        />
        Current page (no link)
      </label>
      
      {isCurrentPage && (
        <p className="text-[9px] text-muted-foreground pl-5">
          Current page items are displayed as text without a link
        </p>
      )}
    </div>
  );
};
