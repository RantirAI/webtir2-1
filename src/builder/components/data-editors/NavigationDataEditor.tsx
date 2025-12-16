import React from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
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

export const NavigationDataEditor: React.FC<NavigationDataEditorProps> = ({ instance }) => {
  const { updateInstance } = useBuilderStore();

  const menuItems = instance.props?.menuItems || [
    { text: 'Home', url: '#', id: '1' },
    { text: 'About', url: '#', id: '2' },
    { text: 'Contact', url: '#', id: '3' },
  ];

  const template = instance.props?.template || 'logo-left-menu-right';
  const logoText = instance.props?.logo || 'Logo';
  const showCTA = instance.props?.showCTA !== false;
  const ctaText = instance.props?.ctaText || 'Get Started';
  const ctaUrl = instance.props?.ctaUrl || '#';
  const mobileBreakpoint = instance.props?.mobileBreakpoint || 768;

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

      {/* Logo Text */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Logo Text</Label>
        <Input
          value={logoText}
          onChange={(e) => handleLogoChange(e.target.value)}
          placeholder="Your Brand"
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
