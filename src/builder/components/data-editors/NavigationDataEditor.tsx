import React, { useRef } from 'react';
import { ComponentInstance } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { useMediaStore } from '../../store/useMediaStore';
import { usePageStore } from '../../store/usePageStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, GripVertical, Upload, X, ChevronDown, Globe } from 'lucide-react';
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
  const { getAllPages, getGlobalComponent, setGlobalComponent } = usePageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all pages for the page picker
  const allPages = getAllPages();

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
  
  // Check if this navigation is the global header
  const currentGlobalHeader = getGlobalComponent('header');
  const isGlobalHeader = currentGlobalHeader?.id === instance.id;
  
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

  const handleGlobalHeaderToggle = (checked: boolean) => {
    if (checked) {
      // Make a deep copy of the instance for global storage
      const instanceCopy = JSON.parse(JSON.stringify(instance));
      setGlobalComponent('header', instanceCopy);
    } else {
      setGlobalComponent('header', null);
    }
  };

  // Generate page URL from page name
  const getPageUrl = (pageName: string) => {
    return `/pages/${pageName.toLowerCase().replace(/\s+/g, '-')}.html`;
  };

  return (
    <div className="space-y-3">
      {/* Global Header Toggle */}
      <div className="space-y-1.5 p-2 bg-primary/5 rounded-md border border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-primary" />
            <Label className="text-[10px] font-medium text-foreground">Global Header</Label>
          </div>
          <Switch 
            checked={isGlobalHeader}
            onCheckedChange={handleGlobalHeaderToggle}
            className="scale-75 origin-right"
          />
        </div>
        <p className="text-[9px] text-muted-foreground">
          {isGlobalHeader 
            ? "This navigation appears on all pages." 
            : "Enable to show this navigation on all pages automatically."}
        </p>
      </div>

      {/* Layout Template */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Layout Template</Label>
        <Select value={template} onValueChange={handleTemplateChange}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            {NAVIGATION_TEMPLATES.map((t) => (
              <SelectItem key={t.id} value={t.id} className="text-[10px]">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{t.label}</span>
                  <span className="text-muted-foreground">{t.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Logo Section */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Logo</Label>
        
        {logoImage ? (
          <div className="relative inline-block">
            <img 
              src={logoImage} 
              alt="Logo preview" 
              className="h-8 w-auto max-w-[120px] object-contain rounded border border-border"
            />
            <button
              onClick={handleRemoveLogoImage}
              className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive text-destructive-foreground rounded-full hover:opacity-90"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-[10px] bg-background"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3 mr-1.5" /> Upload Logo Image
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoImageUpload}
          className="hidden"
        />
        <p className="text-[9px] text-muted-foreground">Max height: 40px. Auto-fitted.</p>

        <Input
          value={logoText}
          onChange={(e) => handleLogoChange(e.target.value)}
          placeholder="Logo text (fallback)"
          className="h-7 text-[10px] text-foreground bg-background"
        />
      </div>

      {/* Menu Items */}
      {template !== 'minimal-logo' && (
        <div className="space-y-1.5">
          <Label className="text-[10px] font-medium text-foreground">Menu Items</Label>
          <div className="space-y-1.5">
            {menuItems.map((item: any, index: number) => (
              <div key={item.id} className="flex items-start gap-1.5 p-1.5 bg-muted/30 rounded border border-border/50">
                <GripVertical className="w-3 h-3 text-muted-foreground cursor-move mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Input
                    value={item.text}
                    onChange={(e) => handleMenuItemChange(index, 'text', e.target.value)}
                    placeholder="Label"
                    className="h-6 text-[10px] text-foreground bg-background"
                  />
                  {/* Page picker or custom URL */}
                  <Select 
                    value={item.url} 
                    onValueChange={(value) => {
                      if (value === '__custom__') {
                        // Keep current value, user will type manually
                      } else {
                        handleMenuItemChange(index, 'url', value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-6 text-[10px] text-foreground bg-background font-mono">
                      <SelectValue placeholder="Select page or URL" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="#" className="text-[10px]"># (Same page anchor)</SelectItem>
                      {allPages.map((page) => (
                        <SelectItem 
                          key={page.id} 
                          value={getPageUrl(page.name)} 
                          className="text-[10px]"
                        >
                          📄 {page.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__" className="text-[10px] text-muted-foreground">
                        Custom URL...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Show input for custom URLs */}
                  {item.url && !item.url.startsWith('/pages/') && item.url !== '#' && (
                    <Input
                      value={item.url}
                      onChange={(e) => handleMenuItemChange(index, 'url', e.target.value)}
                      placeholder="https://example.com or #section"
                      className="h-6 text-[10px] text-foreground bg-background font-mono"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => handleRemoveMenuItem(index)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-[10px] bg-background"
              onClick={handleAddMenuItem}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Item
            </Button>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-medium text-foreground">CTA Button</Label>
          <Switch 
            checked={showCTA} 
            onCheckedChange={handleShowCTAChange}
            className="scale-75 origin-right"
          />
        </div>
        {showCTA && (
          <div className="space-y-1.5 pl-2 border-l border-border">
            <Input
              value={ctaText}
              onChange={(e) => handleCTATextChange(e.target.value)}
              placeholder="Button text"
              className="h-7 text-[10px] text-foreground bg-background"
            />
            <Input
              value={ctaUrl}
              onChange={(e) => handleCTAUrlChange(e.target.value)}
              placeholder="URL"
              className="h-7 text-[10px] text-foreground bg-background font-mono"
            />
          </div>
        )}
      </div>

      {/* Link Styles */}
      {template !== 'minimal-logo' && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-[10px] font-medium text-foreground hover:text-foreground/80">
            <span>Link Hover & Active Styles</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-foreground">Hover Effect</Label>
              <Select value={hoverPreset} onValueChange={handleHoverPresetChange}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {HOVER_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-[10px]">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-foreground">Active Style</Label>
              <Select value={activePreset} onValueChange={handleActivePresetChange}>
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {ACTIVE_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-[10px]">{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Colors */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                <ChevronDown className="w-2.5 h-2.5" />
                Custom Colors
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2 pl-2 border-l border-border/50">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground">Hover Color</Label>
                    <Input
                      type="color"
                      value={hoverColor || '#3b82f6'}
                      onChange={(e) => handleStyleChange('hoverColor', e.target.value)}
                      className="h-6 p-0.5 bg-background cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground">Hover BG</Label>
                    <Input
                      type="color"
                      value={hoverBgColor || '#f3f4f6'}
                      onChange={(e) => handleStyleChange('hoverBgColor', e.target.value)}
                      className="h-6 p-0.5 bg-background cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground">Active Color</Label>
                    <Input
                      type="color"
                      value={activeColor || '#3b82f6'}
                      onChange={(e) => handleStyleChange('activeColor', e.target.value)}
                      className="h-6 p-0.5 bg-background cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] text-muted-foreground">Active BG</Label>
                    <Input
                      type="color"
                      value={activeBgColor || '#eff6ff'}
                      onChange={(e) => handleStyleChange('activeBgColor', e.target.value)}
                      className="h-6 p-0.5 bg-background cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] text-muted-foreground">Animation (ms)</Label>
                  <Input
                    type="number"
                    value={animationDuration}
                    onChange={(e) => handleStyleChange('animationDuration', parseInt(e.target.value) || 200)}
                    className="h-6 text-[10px] bg-background text-foreground"
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

      {/* Mobile Breakpoint */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-medium text-foreground">Mobile Breakpoint</Label>
        <Select value={mobileBreakpoint.toString()} onValueChange={handleMobileBreakpointChange}>
          <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="640" className="text-[10px]">640px (Mobile)</SelectItem>
            <SelectItem value="768" className="text-[10px]">768px (Tablet)</SelectItem>
            <SelectItem value="1024" className="text-[10px]">1024px (Desktop)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
