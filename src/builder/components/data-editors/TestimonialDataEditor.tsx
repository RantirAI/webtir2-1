import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { ImageUpload } from '../ImageUpload';

interface TestimonialDataEditorProps {
  instance: ComponentInstance;
}

export const TestimonialDataEditor: React.FC<TestimonialDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Get child instances based on structure
  // Structure: Card > [AvatarContainer?, QuoteText, AuthorSection > [Name, Role], RatingSection?]
  const children = instance.children || [];
  
  // Find children by their expected positions
  const hasAvatar = instance.props?.showAvatar !== false;
  const avatarContainerIndex = hasAvatar ? 0 : -1;
  const quoteIndex = hasAvatar ? 1 : 0;
  const authorIndex = hasAvatar ? 2 : 1;
  
  const avatarContainer = avatarContainerIndex >= 0 ? children[avatarContainerIndex] : null;
  const avatarImage = avatarContainer?.children?.[0];
  const quoteChild = children[quoteIndex];
  const authorSection = children[authorIndex];
  const nameChild = authorSection?.children?.[0];
  const roleChild = authorSection?.children?.[1];

  // Get current values
  const quoteText = quoteChild?.props?.children || '"This product has completely transformed our workflow."';
  const personName = nameChild?.props?.children || 'John Doe';
  const personRole = roleChild?.props?.children || 'CEO at Company';
  const avatarSrc = instance.props?.avatarSrc || '';
  const avatarFallback = instance.props?.avatarFallback || '';
  const showRating = instance.props?.showRating || false;
  const rating = instance.props?.rating || 5;
  const linkUrl = instance.props?.linkUrl || '';
  const linkTarget = instance.props?.linkTarget || '_self';
  const companyName = instance.props?.companyName || '';

  const updateCardProp = (prop: string, value: any) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [prop]: value }
    });
  };

  const updateQuote = (value: string) => {
    if (!quoteChild) return;
    updateInstance(quoteChild.id, {
      props: { ...quoteChild.props, children: value }
    });
  };

  const updateName = (value: string) => {
    if (!nameChild) return;
    updateInstance(nameChild.id, {
      props: { ...nameChild.props, children: value }
    });
  };

  const updateRole = (value: string) => {
    if (!roleChild) return;
    updateInstance(roleChild.id, {
      props: { ...roleChild.props, children: value }
    });
  };

  const updateAvatarSrc = (value: string) => {
    updateCardProp('avatarSrc', value);
    // Also update the actual image child if it exists
    if (avatarImage) {
      updateInstance(avatarImage.id, {
        props: { ...avatarImage.props, src: value }
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Quote Text */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Quote</Label>
        <Textarea
          value={quoteText}
          onChange={(e) => updateQuote(e.target.value)}
          placeholder="Enter testimonial quote..."
          className="text-[10px] min-h-[80px] resize-none text-foreground bg-background"
          rows={4}
        />
      </div>

      {/* Person Name */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Person Name</Label>
        <Input
          value={personName}
          onChange={(e) => updateName(e.target.value)}
          placeholder="John Doe"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      {/* Person Role/Title */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Role / Title</Label>
        <Input
          value={personRole}
          onChange={(e) => updateRole(e.target.value)}
          placeholder="CEO at Company"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      {/* Company Name (Optional) */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Company Name (Optional)</Label>
        <Input
          value={companyName}
          onChange={(e) => updateCardProp('companyName', e.target.value)}
          placeholder="Acme Inc."
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      {/* Avatar Section */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Label className="text-[10px] font-medium text-foreground">Avatar</Label>
        
        {/* Avatar Image */}
        <div className="space-y-1.5">
          <Label className="text-[9px] text-muted-foreground">Image URL</Label>
          <Input
            value={avatarSrc}
            onChange={(e) => updateAvatarSrc(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="h-7 text-[10px] text-foreground bg-background"
          />
        </div>

        {/* Avatar Fallback */}
        <div className="space-y-1.5">
          <Label className="text-[9px] text-muted-foreground">Fallback (Initials)</Label>
          <Input
            value={avatarFallback}
            onChange={(e) => updateCardProp('avatarFallback', e.target.value)}
            placeholder="JD"
            maxLength={2}
            className="h-7 text-[10px] text-foreground bg-background w-16"
          />
        </div>
      </div>

      {/* Rating Section */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">Rating</Label>
          <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <Checkbox
              checked={showRating}
              onCheckedChange={(checked) => updateCardProp('showRating', !!checked)}
              className="w-3 h-3"
            />
            Show rating
          </label>
        </div>
        
        {showRating && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[9px] text-muted-foreground">Stars</Label>
              <span className="text-[10px] font-medium text-foreground">{rating}/5</span>
            </div>
            <Slider
              value={[rating]}
              onValueChange={(value) => updateCardProp('rating', value[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-sm ${star <= rating ? 'text-yellow-500' : 'text-muted-foreground/30'}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        )}
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
