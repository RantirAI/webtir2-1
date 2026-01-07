import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company?: string;
  avatarSrc?: string;
  avatarFallback?: string;
  rating?: number;
}

interface TestimonialDataEditorProps {
  instance: ComponentInstance;
}

const generateTestimonialId = () => `testimonial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const TestimonialDataEditor: React.FC<TestimonialDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  // Get display mode
  const displayMode = instance.props?.displayMode || 'single';

  // Get child instances based on structure for single mode
  const children = instance.children || [];
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

  // Single mode values
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

  // Carousel mode values
  const testimonials: Testimonial[] = instance.props?.testimonials || [
    { id: generateTestimonialId(), quote: '"This product has completely transformed our workflow."', name: 'John Doe', role: 'CEO at Company', rating: 5 }
  ];
  const autoPlay = instance.props?.autoPlay !== false;
  const autoPlayInterval = instance.props?.autoPlayInterval || 5000;
  const loop = instance.props?.loop !== false;

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
    if (avatarImage) {
      updateInstance(avatarImage.id, {
        props: { ...avatarImage.props, src: value }
      });
    }
  };

  // Carousel mode functions
  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: generateTestimonialId(),
      quote: '"Add your testimonial quote here..."',
      name: 'New Person',
      role: 'Role at Company',
      rating: 5,
    };
    updateCardProp('testimonials', [...testimonials, newTestimonial]);
  };

  const removeTestimonial = (id: string) => {
    if (testimonials.length <= 1) return;
    updateCardProp('testimonials', testimonials.filter(t => t.id !== id));
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: any) => {
    updateCardProp('testimonials', testimonials.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  return (
    <div className="space-y-3">
      {/* Display Mode Toggle */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Display Mode</Label>
        <Select value={displayMode} onValueChange={(val) => updateCardProp('displayMode', val)}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single" className="text-[10px]">Single Testimonial</SelectItem>
            <SelectItem value="carousel" className="text-[10px]">Carousel (Multiple)</SelectItem>
          </SelectContent>
        </Select>
        {displayMode === 'single' && (
          <p className="text-[9px] text-muted-foreground bg-muted/50 p-2 rounded mt-2">
            💡 Switch to Carousel mode to add multiple testimonials with auto-play, navigation, and carousel styling options.
          </p>
        )}
      </div>

      {displayMode === 'single' ? (
        <>
          {/* Single Mode - Quote Text */}
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
            
            <div className="space-y-1.5">
              <Label className="text-[9px] text-muted-foreground">Image URL</Label>
              <Input
                value={avatarSrc}
                onChange={(e) => updateAvatarSrc(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="h-7 text-[10px] text-foreground bg-background"
              />
            </div>

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
        </>
      ) : (
        <>
          {/* Carousel Mode */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">
                Testimonials ({testimonials.length})
              </Label>
              <Button
                size="sm"
                variant="outline"
                onClick={addTestimonial}
                className="h-6 text-[9px] px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="space-y-2 p-2 bg-muted/50 rounded-md border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-medium text-muted-foreground">#{index + 1}</span>
                    {testimonials.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTestimonial(testimonial.id)}
                        className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <Textarea
                    value={testimonial.quote}
                    onChange={(e) => updateTestimonial(testimonial.id, 'quote', e.target.value)}
                    placeholder="Quote..."
                    className="text-[10px] min-h-[60px] resize-none text-foreground bg-background"
                    rows={3}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                      placeholder="Name"
                      className="h-6 text-[10px] text-foreground bg-background"
                    />
                    <Input
                      value={testimonial.role}
                      onChange={(e) => updateTestimonial(testimonial.id, 'role', e.target.value)}
                      placeholder="Role"
                      className="h-6 text-[10px] text-foreground bg-background"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={testimonial.avatarSrc || ''}
                      onChange={(e) => updateTestimonial(testimonial.id, 'avatarSrc', e.target.value)}
                      placeholder="Avatar URL"
                      className="h-6 text-[10px] text-foreground bg-background"
                    />
                    <div className="flex items-center gap-1">
                      <Label className="text-[9px] text-muted-foreground">Rating:</Label>
                      <Select 
                        value={String(testimonial.rating || 5)} 
                        onValueChange={(val) => updateTestimonial(testimonial.id, 'rating', parseInt(val))}
                      >
                        <SelectTrigger className="h-6 text-[10px] text-foreground bg-background flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((r) => (
                            <SelectItem key={r} value={String(r)} className="text-[10px]">
                              {r} ★
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carousel Settings */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Label className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Carousel Settings</Label>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
                <Checkbox
                  checked={autoPlay}
                  onCheckedChange={(checked) => updateCardProp('autoPlay', !!checked)}
                  className="w-3 h-3"
                />
                Auto-play {testimonials.length > 3 && <span className="text-[8px] text-primary">(recommended)</span>}
              </label>
            </div>

            {autoPlay && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[9px] text-muted-foreground">Interval</Label>
                  <span className="text-[10px] font-medium text-foreground">{autoPlayInterval / 1000}s</span>
                </div>
                <Slider
                  value={[autoPlayInterval]}
                  onValueChange={(value) => updateCardProp('autoPlayInterval', value[0])}
                  min={2000}
                  max={10000}
                  step={500}
                  className="w-full"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-[9px] text-muted-foreground">
              <Checkbox
                checked={loop}
                onCheckedChange={(checked) => updateCardProp('loop', !!checked)}
                className="w-3 h-3"
              />
              Loop continuously
            </label>

            {testimonials.length > 3 && (
              <p className="text-[9px] text-muted-foreground bg-primary/10 p-2 rounded">
                With {testimonials.length} testimonials, the carousel will auto-animate when enabled.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
