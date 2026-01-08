import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface HeroSectionDataEditorProps {
  instance: ComponentInstance;
}

export const HeroSectionDataEditor: React.FC<HeroSectionDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Structure: Section > Container > [Heading, Text, ButtonsDiv > [Button1, Button2]]
  const container = instance.children?.[0];
  const headingChild = container?.children?.[0];
  const textChild = container?.children?.[1];
  const buttonsDiv = container?.children?.[2];
  const primaryButton = buttonsDiv?.children?.[0];
  const secondaryButton = buttonsDiv?.children?.[1];

  // Get current values
  const headingText = headingChild?.props?.children || 'Build Something Amazing';
  const descriptionText = textChild?.props?.children || 'Create beautiful, responsive websites with our visual builder.';
  const primaryButtonText = primaryButton?.props?.children || 'Get Started';
  const secondaryButtonText = secondaryButton?.props?.children || 'Learn More';
  const primaryButtonLink = instance.props?.primaryButtonLink || '';
  const secondaryButtonLink = instance.props?.secondaryButtonLink || '';
  const primaryLinkTarget = instance.props?.primaryLinkTarget || '_self';
  const secondaryLinkTarget = instance.props?.secondaryLinkTarget || '_self';
  const showSecondaryButton = instance.props?.showSecondaryButton !== false;

  const updateHeroProp = (prop: string, value: any) => {
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

  const updatePrimaryButtonText = (value: string) => {
    if (!primaryButton) return;
    updateInstance(primaryButton.id, {
      props: { ...primaryButton.props, children: value }
    });
  };

  const updateSecondaryButtonText = (value: string) => {
    if (!secondaryButton) return;
    updateInstance(secondaryButton.id, {
      props: { ...secondaryButton.props, children: value }
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
          placeholder="Enter heading..."
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Description</Label>
        <Textarea
          value={descriptionText}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="Enter description..."
          className="text-[10px] min-h-[60px] resize-none text-foreground bg-background"
          rows={3}
        />
      </div>

      <Separator />

      {/* Primary Button */}
      <div className="space-y-2 pt-1">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Primary Button</Label>
        
        <div className="space-y-1.5">
          <Label className="text-[9px] text-muted-foreground">Button Text</Label>
          <Input
            value={primaryButtonText}
            onChange={(e) => updatePrimaryButtonText(e.target.value)}
            placeholder="Get Started"
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[9px] text-muted-foreground">Link URL</Label>
          <Input
            value={primaryButtonLink}
            onChange={(e) => updateHeroProp('primaryButtonLink', e.target.value)}
            placeholder="https://..."
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>

        <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Checkbox
            checked={primaryLinkTarget === '_blank'}
            onCheckedChange={(checked) => updateHeroProp('primaryLinkTarget', checked ? '_blank' : '_self')}
            className="w-3 h-3"
          />
          Open in new tab
        </label>
      </div>

      <Separator />

      {/* Secondary Button */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Secondary Button</Label>
          <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <Checkbox
              checked={showSecondaryButton}
              onCheckedChange={(checked) => updateHeroProp('showSecondaryButton', !!checked)}
              className="w-3 h-3"
            />
            Show
          </label>
        </div>

        {showSecondaryButton && (
          <>
            <div className="space-y-1.5">
              <Label className="text-[9px] text-muted-foreground">Button Text</Label>
              <Input
                value={secondaryButtonText}
                onChange={(e) => updateSecondaryButtonText(e.target.value)}
                placeholder="Learn More"
                className="h-7 text-[10px] text-foreground bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] text-muted-foreground">Link URL</Label>
              <Input
                value={secondaryButtonLink}
                onChange={(e) => updateHeroProp('secondaryButtonLink', e.target.value)}
                placeholder="https://..."
                className="h-7 text-[10px] text-foreground bg-background"
              />
            </div>

            <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <Checkbox
                checked={secondaryLinkTarget === '_blank'}
                onCheckedChange={(checked) => updateHeroProp('secondaryLinkTarget', checked ? '_blank' : '_self')}
                className="w-3 h-3"
              />
              Open in new tab
            </label>
          </>
        )}
      </div>
    </div>
  );
};
