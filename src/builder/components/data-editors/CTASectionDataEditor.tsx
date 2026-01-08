import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface CTASectionDataEditorProps {
  instance: ComponentInstance;
}

export const CTASectionDataEditor: React.FC<CTASectionDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Structure: Section > Container > [Heading, Text, Button]
  const container = instance.children?.[0];
  const headingChild = container?.children?.[0];
  const textChild = container?.children?.[1];
  const buttonChild = container?.children?.[2];

  // Get current values
  const headingText = headingChild?.props?.children || 'Ready to Get Started?';
  const descriptionText = textChild?.props?.children || 'Join thousands of users already building amazing websites.';
  const buttonText = buttonChild?.props?.children || 'Start Free Trial';
  const buttonLink = instance.props?.buttonLink || '';
  const buttonLinkTarget = instance.props?.buttonLinkTarget || '_self';

  const updateCTAProp = (prop: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const updateHeading = (value: string) => {
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

  const updateButtonText = (value: string) => {
    if (!buttonChild) return;
    updateInstance(buttonChild.id, {
      props: { ...buttonChild.props, children: value }
    });
  };

  return (
    <div className="space-y-3">
      {/* Content Section */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Heading</Label>
        <Input
          value={headingText}
          onChange={(e) => updateHeading(e.target.value)}
          placeholder="Ready to Get Started?"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Description</Label>
        <Textarea
          value={descriptionText}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="Enter your call-to-action description..."
          className="text-[10px] min-h-[60px] resize-none text-foreground bg-background"
          rows={3}
        />
      </div>

      <Separator />

      {/* Button Settings */}
      <div className="space-y-2 pt-1">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Button</Label>
        
        <div className="space-y-1.5">
          <Label className="text-[9px] text-muted-foreground">Button Text</Label>
          <Input
            value={buttonText}
            onChange={(e) => updateButtonText(e.target.value)}
            placeholder="Start Free Trial"
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[9px] text-muted-foreground">Link URL</Label>
          <Input
            value={buttonLink}
            onChange={(e) => updateCTAProp('buttonLink', e.target.value)}
            placeholder="https://..."
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>

        <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Checkbox
            checked={buttonLinkTarget === '_blank'}
            onCheckedChange={(checked) => updateCTAProp('buttonLinkTarget', checked ? '_blank' : '_self')}
            className="w-3 h-3"
          />
          Open in new tab
        </label>
      </div>
    </div>
  );
};
