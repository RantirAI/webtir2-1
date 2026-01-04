import React, { useRef } from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { useMediaStore } from '../../store/useMediaStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, GripVertical, Upload, X, ChevronDown } from 'lucide-react';
import { NavigationTemplate } from '../../utils/navigationTemplates';

interface NavigationDataEditorProps {
  instance: ComponentInstance;
}

const NAVIGATION_TEMPLATES: { id: NavigationTemplate; label: string; description: string }[] = [
  { id: 'logo-left-menu-right', label: 'Logo Left + Menu Right', description: 'Standard horizontal navbar' },
  { id: 'logo-right-menu-left', label: 'Logo Right + Menu Left', description: 'Mirrored layout' },
  { id: 'logo-center-split', label: 'Logo Center + Split Menu', description: 'Menu items on both sides' },
  { id: 'stacked-center', label: 'Stacked (Logo Top)', description: 'Logo centered, menu below' },
  { id: 'center-hamburger', label: 'Center Logo + Hamburger', description: 'Clean minimal with hamburger' },
  { id: 'logo-left-menu-center', label: 'Logo Left + Menu Center', description: 'Logo docked, menu centered' },
  { id: 'minimal-logo', label: 'Minimal (Logo Only)', description: 'No menu, just logo' },
  { id: 'mega-menu', label: 'Mega Menu Layout', description: 'Full-width dropdown support' },
];

const HOVER_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'underline-slide', label: 'Underline Slide' },
  { id: 'background', label: 'Background Highlight' },
  { id: 'color-change', label: 'Color Change' },
  { id: 'scale', label: 'Scale Up' },
  { id: 'glow', label: 'Glow Effect' },
];

const ACTIVE_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'bold', label: 'Bold Text' },
  { id: 'underline', label: 'Underline' },
  { id: 'background', label: 'Background' },
  { id: 'dot', label: 'Dot Indicator' },
  { id: 'border-bottom', label: 'Border Bottom' },
];

export const NavigationDataEditor: React.FC<NavigationDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();
  const { addAsset } = useMediaStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = instance.props?.menuItems || [
    { text: 'Home', url: '#', id: '1' },
    { text: 'About', url: '#', id: '2' },
    { text: 'Contact', url: '#', id: '3' },
  ];

  const template = instance.props?.template || 'logo-left-menu-right';
  const logoText = instance.props?.logo || 'Logo';
  const logoImage = instance.props?.logoImage || '';
  const showCTA = instance.props?.showCTA !== false;
  const ctaText = instance.props?.ctaText || 'Get Started';
  const ctaUrl = instance.props?.ctaUrl || '#';
  const mobileBreakpoint = instance.props?.mobileBreakpoint || 768;
  
  // Hover & Active styles
  const hoverPreset = instance.props?.hoverPreset || 'underline-slide';
  const activePreset = instance.props?.activePreset || 'underline';
  const hoverColor = instance.props?.hoverColor || '';
  const hoverBgColor = instance.props?.hoverBgColor || '';
  const activeColor = instance.props?.activeColor || '';
  const activeBgColor = instance.props?.activeBgColor || '';
  const animationDuration = instance.props?.animationDuration || 200;

  const handleTemplateChange = (value: NavigationTemplate) => {
    updateInstance(instance.id, {
      props: { ...instance.props, template: value }
    });
  };

  const handleLogoChange = (value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, logo: value }
    });
  };

  const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        // Add to media store
        addAsset({
          name: file.name,
          type: 'image',
          url: dataUrl,
          size: file.size,
          mimeType: file.type || 'image/png',
          altText: '',
        });
        // Update instance
        updateInstance(instance.id, {
          props: { ...instance.props, logoImage: dataUrl }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogoImage = () => {
    updateInstance(instance.id, {
      props: { ...instance.props, logoImage: '' }
    });
  };

  const handleMenuItemChange = (index: number, field: 'text' | 'url', value: string) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    updateInstance(instance.id, {
      props: { ...instance.props, menuItems: newItems }
    });
  };

  const handleAddMenuItem = () => {
    const newItems = [...menuItems, { text: 'New Link', url: '#', id: Date.now().toString() }];
    updateInstance(instance.id, {
      props: { ...instance.props, menuItems: newItems }
    });
  };

  const handleRemoveMenuItem = (index: number) => {
    const newItems = menuItems.filter((_: any, i: number) => i !== index);
    updateInstance(instance.id, {
      props: { ...instance.props, menuItems: newItems }
    });
  };

  const handleShowCTAChange = (checked: boolean) => {
    updateInstance(instance.id, {
      props: { ...instance.props, showCTA: checked }
    });
  };

  const handleCTATextChange = (value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ctaText: value }
    });
  };

  const handleCTAUrlChange = (value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, ctaUrl: value }
    });
  };

  const handleMobileBreakpointChange = (value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, mobileBreakpoint: parseInt(value) }
    });
  };

  const handleHoverPresetChange = (value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, hoverPreset: value }
    });
  };

  const handleActivePresetChange = (value: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, activePreset: value }
    });
  };

  const handleStyleChange = (key: string, value: string | number) => {
    updateInstance(instance.id, {
      props: { ...instance.props, [key]: value }
    });
  };

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Layout Template</Label>
        <Select value={template} onValueChange={handleTemplateChange}>
          <SelectTrigger className="bg-muted text-foreground">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border z-50">
            {NAVIGATION_TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logo Section */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Logo</Label>
        
        {/* Logo Image Upload */}
        <div className="space-y-2">
          {logoImage ? (
            <div className="relative inline-block">
              <img 
                src={logoImage} 
                alt="Logo preview" 
                className="h-10 w-auto max-w-[160px] object-contain rounded border border-border"
              />
              <button
                onClick={handleRemoveLogoImage}
                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Logo Image
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoImageUpload}
            className="hidden"
          />
          <p className="text-[10px] text-muted-foreground">Max height: 40px. Image will be auto-fitted.</p>
        </div>

        {/* Logo Text (fallback) */}
        <Input
          value={logoText}
          onChange={(e) => handleLogoChange(e.target.value)}
          placeholder="Logo text (if no image)"
          className="bg-muted text-foreground"
        />
      </div>

      {/* Menu Items */}
      {template !== 'minimal-logo' && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Menu Items</Label>
          <div className="space-y-2">
            {menuItems.map((item: any, index: number) => (
              <div key={item.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                <div className="flex-1 space-y-1">
                  <Input
                    value={item.text}
                    onChange={(e) => handleMenuItemChange(index, 'text', e.target.value)}
                    placeholder="Label"
                    className="bg-muted text-foreground h-8 text-sm"
                  />
                  <Input
                    value={item.url}
                    onChange={(e) => handleMenuItemChange(index, 'url', e.target.value)}
                    placeholder="URL"
                    className="bg-muted text-foreground h-8 text-sm"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveMenuItem(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddMenuItem}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Menu Item
            </Button>
          </div>
        </div>
      )}

      {/* Hover & Active Styles */}
      {template !== 'minimal-logo' && (
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
            <span>Link Hover & Active Styles</span>
            <ChevronDown className="w-4 h-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            {/* Hover Preset */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Hover Effect</Label>
              <Select value={hoverPreset} onValueChange={handleHoverPresetChange}>
                <SelectTrigger className="bg-muted text-foreground h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {HOVER_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Preset */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Active Page Style</Label>
              <Select value={activePreset} onValueChange={handleActivePresetChange}>
                <SelectTrigger className="bg-muted text-foreground h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {ACTIVE_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Colors */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                <ChevronDown className="w-3 h-3" />
                Custom Colors
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2 pl-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Hover Color</Label>
                    <Input
                      type="color"
                      value={hoverColor || '#3b82f6'}
                      onChange={(e) => handleStyleChange('hoverColor', e.target.value)}
                      className="h-8 p-1 bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Hover BG</Label>
                    <Input
                      type="color"
                      value={hoverBgColor || '#f3f4f6'}
                      onChange={(e) => handleStyleChange('hoverBgColor', e.target.value)}
                      className="h-8 p-1 bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Active Color</Label>
                    <Input
                      type="color"
                      value={activeColor || '#3b82f6'}
                      onChange={(e) => handleStyleChange('activeColor', e.target.value)}
                      className="h-8 p-1 bg-muted"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Active BG</Label>
                    <Input
                      type="color"
                      value={activeBgColor || '#eff6ff'}
                      onChange={(e) => handleStyleChange('activeBgColor', e.target.value)}
                      className="h-8 p-1 bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Animation Duration (ms)</Label>
                  <Input
                    type="number"
                    value={animationDuration}
                    onChange={(e) => handleStyleChange('animationDuration', parseInt(e.target.value) || 200)}
                    className="h-8 bg-muted text-foreground"
                    min={0}
                    max={1000}
                    step={50}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* CTA Button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Show CTA Button</Label>
          <Switch checked={showCTA} onCheckedChange={handleShowCTAChange} />
        </div>
        {showCTA && (
          <div className="space-y-2 pl-4 border-l-2 border-border">
            <Input
              value={ctaText}
              onChange={(e) => handleCTATextChange(e.target.value)}
              placeholder="Button text"
              className="bg-muted text-foreground"
            />
            <Input
              value={ctaUrl}
              onChange={(e) => handleCTAUrlChange(e.target.value)}
              placeholder="Button URL"
              className="bg-muted text-foreground"
            />
          </div>
        )}
      </div>

      {/* Mobile Breakpoint */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Mobile Breakpoint (px)</Label>
        <Select value={mobileBreakpoint.toString()} onValueChange={handleMobileBreakpointChange}>
          <SelectTrigger className="bg-muted text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border z-50">
            <SelectItem value="640">640px (Mobile Landscape)</SelectItem>
            <SelectItem value="768">768px (Tablet)</SelectItem>
            <SelectItem value="1024">1024px (Desktop)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
