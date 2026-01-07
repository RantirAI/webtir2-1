import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface FeatureCardDataEditorProps {
  instance: ComponentInstance;
}

export const FeatureCardDataEditor: React.FC<FeatureCardDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Get child instances
  const headingChild = instance.children?.[1];
  const textChild = instance.children?.[2];

  // Get current values
  const title = headingChild?.props?.children || 'Feature Title';
  const description = textChild?.props?.children || 'Describe your feature here.';
  const linkUrl = instance.props?.linkUrl || '';
  const linkTarget = instance.props?.linkTarget || '_self';

  const updateCardProp = (prop: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const updateTitle = (value: string) => {
    if (!headingChild) return;
    updateInstance(headingChild.id, {
      props: { ...headingChild.props, children: value }
    });
  };

  const updateDescription = (value: string) => {
    if (!textChild) return;
    updateInstance(textChild.id, {
      props: { ...textChild.props, children: value }
    });
  };

  return (
    <div className="space-y-3">
      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Title</Label>
        <Input
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Feature title..."
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="Describe your feature..."
          className="text-[10px] min-h-[60px] resize-none text-foreground bg-background"
          rows={3}
        />
      </div>

      {/* Link Settings */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Label className="text-[10px] font-medium text-foreground">Link (Optional)</Label>
        <Input
          value={linkUrl}
          onChange={(e) => updateCardProp('linkUrl', e.target.value)}
          placeholder="https://..."
          className="h-7 text-[10px] text-foreground bg-background"
        />
        <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Checkbox
            checked={linkTarget === '_blank'}
            onCheckedChange={(checked) => updateCardProp('linkTarget', checked ? '_blank' : '_self')}
            className="w-3 h-3"
          />
          Open in new tab
        </label>
      </div>
    </div>
  );
};
