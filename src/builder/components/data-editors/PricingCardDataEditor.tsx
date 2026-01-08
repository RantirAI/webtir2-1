import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface PricingCardDataEditorProps {
  instance: ComponentInstance;
}

export const PricingCardDataEditor: React.FC<PricingCardDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Structure: Div > [Header(Div > [Title, Price, Desc]), Features(Div > [Text...]), Button]
  const headerDiv = instance.children?.[0];
  const titleChild = headerDiv?.children?.[0];
  const priceChild = headerDiv?.children?.[1];
  const descChild = headerDiv?.children?.[2];
  const featuresDiv = instance.children?.[1];
  const buttonChild = instance.children?.[2];

  // Get current values
  const planTitle = titleChild?.props?.children || 'Pro Plan';
  const priceText = priceChild?.props?.children || '$29/month';
  const descriptionText = descChild?.props?.children || 'Perfect for growing teams';
  const buttonText = buttonChild?.props?.children || 'Get Started';
  const buttonLink = instance.props?.buttonLink || '';
  const buttonLinkTarget = instance.props?.buttonLinkTarget || '_self';
  const isHighlighted = instance.props?.isHighlighted || false;
  const showBadge = instance.props?.showBadge || false;
  const badgeText = instance.props?.badgeText || 'Popular';

  // Get features from children
  const features = featuresDiv?.children?.map((child: ComponentInstance) => ({
    id: child.id,
    text: child.props?.children || ''
  })) || [];

  const updateCardProp = (prop: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const updateTitle = (value: string) => {
    if (!titleChild) return;
    updateInstance(titleChild.id, {
      props: { ...titleChild.props, children: value }
    });
  };

  const updatePrice = (value: string) => {
    if (!priceChild) return;
    updateInstance(priceChild.id, {
      props: { ...priceChild.props, children: value }
    });
  };

  const updateDescription = (value: string) => {
    if (!descChild) return;
    updateInstance(descChild.id, {
      props: { ...descChild.props, children: value }
    });
  };

  const updateButtonText = (value: string) => {
    if (!buttonChild) return;
    updateInstance(buttonChild.id, {
      props: { ...buttonChild.props, children: value }
    });
  };

  const updateFeature = (featureId: string, value: string) => {
    updateInstance(featureId, {
      props: { children: value }
    });
  };

  return (
    <div className="space-y-3">
      {/* Plan Details */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Plan Name</Label>
        <Input
          value={planTitle}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Pro Plan"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Price</Label>
        <Input
          value={priceText}
          onChange={(e) => updatePrice(e.target.value)}
          placeholder="$29/month"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Description</Label>
        <Input
          value={descriptionText}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="Perfect for growing teams"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      <Separator />

      {/* Features */}
      <div className="space-y-2 pt-1">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
          Features ({features.length})
        </Label>

        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {features.map((feature: { id: string; text: string }, index: number) => (
            <div key={feature.id} className="flex items-center gap-2">
              <span className="text-[9px] text-muted-foreground w-4">{index + 1}.</span>
              <Input
                value={feature.text}
                onChange={(e) => updateFeature(feature.id, e.target.value)}
                placeholder="Feature..."
                className="h-6 text-[10px] text-foreground bg-background flex-1"
              />
            </div>
          ))}
        </div>

        <p className="text-[9px] text-muted-foreground italic">
          To add/remove features, edit the component children in the navigator.
        </p>
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
            placeholder="Get Started"
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[9px] text-muted-foreground">Link URL</Label>
          <Input
            value={buttonLink}
            onChange={(e) => updateCardProp('buttonLink', e.target.value)}
            placeholder="https://..."
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>

        <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Checkbox
            checked={buttonLinkTarget === '_blank'}
            onCheckedChange={(checked) => updateCardProp('buttonLinkTarget', checked ? '_blank' : '_self')}
            className="w-3 h-3"
          />
          Open in new tab
        </label>
      </div>

      <Separator />

      {/* Card Settings */}
      <div className="space-y-2 pt-1">
        <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Card Settings</Label>
        
        <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Checkbox
            checked={isHighlighted}
            onCheckedChange={(checked) => updateCardProp('isHighlighted', !!checked)}
            className="w-3 h-3"
          />
          Highlight this card (featured)
        </label>

        <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
          <Checkbox
            checked={showBadge}
            onCheckedChange={(checked) => updateCardProp('showBadge', !!checked)}
            className="w-3 h-3"
          />
          Show badge
        </label>

        {showBadge && (
          <div className="space-y-1.5 pl-5">
            <Label className="text-[9px] text-muted-foreground">Badge Text</Label>
            <Input
              value={badgeText}
              onChange={(e) => updateCardProp('badgeText', e.target.value)}
              placeholder="Popular"
              className="h-6 text-[10px] text-foreground bg-background"
            />
          </div>
        )}
      </div>
    </div>
  );
};
