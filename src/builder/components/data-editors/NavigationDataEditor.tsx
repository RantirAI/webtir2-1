import React, { useRef, useMemo, useState } from 'react';
import { ComponentInstance, ComponentType } from '../../store/types';
import { useBuilderStore } from '../../store/useBuilderStore';
import { useMediaStore } from '../../store/useMediaStore';
import { usePageStore } from '../../store/usePageStore';
import { useStyleStore } from '../../store/useStyleStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plus, Trash2, Upload, X, ChevronDown, 
  LayoutGrid, Image as ImageIcon, Link as LinkIcon, 
  Palette, Settings
} from 'lucide-react';
import { 
  NavigationTemplate, 
  getAllTemplates, 
  templatePreviews 
} from '../../utils/navigationTemplates';
import { 
  applyNavigationTemplate, 
  applyLogoPosition, 
  getLogoPositionFromSlots,
  getNavigationInstance,
  getNavContainer,
  findNavElements
} from '../../utils/navigationLayout';

interface NavigationDataEditorProps {
  instance: ComponentInstance;
}

// Hover effect presets
const HOVER_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'underline-slide', label: 'Underline Slide' },
  { id: 'background', label: 'Background' },
  { id: 'color-change', label: 'Color Change' },
  { id: 'scale', label: 'Scale' },
  { id: 'glow', label: 'Glow' },
];

// Active state presets
const ACTIVE_PRESETS = [
  { id: 'none', label: 'None' },
  { id: 'bold', label: 'Bold' },
  { id: 'underline', label: 'Underline' },
  { id: 'background', label: 'Background' },
  { id: 'dot', label: 'Dot' },
  { id: 'border-bottom', label: 'Border' },
];

// Helper to generate unique IDs
const generateId = () => `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Check if a child is a slot container
const isSlot = (child: ComponentInstance): boolean => {
  return child.type === 'Div' && (
    child.label?.toLowerCase().includes('slot') || 
    child.props?._isNavSlot === true
  );
};

// Helper to find children by role in the composition-based navigation
const findNavChildren = (instance: ComponentInstance) => {
  const container = instance.children?.[0];
  if (!container || container.type !== 'Container') {
    return { logoText: null, logoImage: null, menu: null, cta: null, container: null, leftSlot: null, centerSlot: null, rightSlot: null };
  }
  
  let logoText: ComponentInstance | null = null;
  let logoImage: ComponentInstance | null = null;
  let menu: ComponentInstance | null = null;
  let cta: ComponentInstance | null = null;
  let leftSlot: ComponentInstance | null = null;
  let centerSlot: ComponentInstance | null = null;
  let rightSlot: ComponentInstance | null = null;
  
  // Check for slot-based structure
  for (const child of container.children || []) {
    if (isSlot(child)) {
      const label = child.label?.toLowerCase() || '';
      if (label.includes('left')) leftSlot = child;
      else if (label.includes('center')) centerSlot = child;
      else if (label.includes('right')) rightSlot = child;
    }
  }
  
  // If we have slots, look for elements inside them
  if (leftSlot || centerSlot || rightSlot) {
    const allSlots = [leftSlot, centerSlot, rightSlot].filter(Boolean) as ComponentInstance[];
    for (const slot of allSlots) {
      for (const child of slot.children || []) {
        if (child.type === 'Text' && !logoText) logoText = child;
        if (child.type === 'Image' && !logoImage) logoImage = child;
        if (child.type === 'Div' && child.children?.some(l => l.type === 'Link') && !menu) menu = child;
        if (child.type === 'Button' && !cta) cta = child;
      }
    }
  } else {
    // Legacy flat structure
    logoText = container.children?.find(c => c.type === 'Text') || null;
    logoImage = container.children?.find(c => c.type === 'Image') || null;
    menu = container.children?.find(c => c.type === 'Div' && c.children?.some(l => l.type === 'Link')) || null;
    cta = container.children?.find(c => c.type === 'Button') || null;
  }
  
  return { logoText, logoImage, menu, cta, container, leftSlot, centerSlot, rightSlot };
};

// Check if this is a composition-based navigation
const isCompositionNavigation = (instance: ComponentInstance): boolean => {
  return instance.type === 'Section' && instance.props?.htmlTag === 'nav';
};

export const NavigationDataEditor: React.FC<NavigationDataEditorProps> = ({ instance }) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const deleteInstance = useBuilderStore((state) => state.deleteInstance);
  const addInstance = useBuilderStore((state) => state.addInstance);
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  const { addAsset } = useMediaStore();
  const { getGlobalComponent, setGlobalComponent, currentPageId, setPageGlobalOverride, getPageGlobalOverrides } = usePageStore();
  const { setStyle, createStyleSource, getNextAutoClassName } = useStyleStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section collapse states
  const [layoutOpen, setLayoutOpen] = useState(true);
  const [brandingOpen, setBrandingOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(true);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Helper to find instance in tree
  const findInstanceInTree = (tree: ComponentInstance | null, id: string): ComponentInstance | null => {
    if (!tree) return null;
    if (tree.id === id) return tree;
    for (const child of tree.children || []) {
      const found = findInstanceInTree(child, id);
      if (found) return found;
    }
    return null;
  };

  // Helper to find instance anywhere (page tree or global components)
  const findInstanceAnywhere = (id: string): ComponentInstance | null => {
    const currentRoot = useBuilderStore.getState().rootInstance;
    const pageStoreState = usePageStore.getState();
    
    const foundInTree = findInstanceInTree(currentRoot, id);
    if (foundInTree) return foundInTree;
    
    const freshGlobalHeader = pageStoreState.globalComponents?.header;
    if (freshGlobalHeader) {
      const foundInHeader = findInstanceInTree(freshGlobalHeader, id);
      if (foundInHeader) return foundInHeader;
    }
    
    return null;
  };

  // Helper to get fresh navigation children
  const getFreshNavChildren = () => {
    const currentInstance = findInstanceAnywhere(instance.id) || instance;
    if (isCompositionNavigation(currentInstance)) {
      return findNavChildren(currentInstance);
    }
    return { logoText: null, logoImage: null, menu: null, cta: null, container: null, leftSlot: null, centerSlot: null, rightSlot: null };
  };

  // Get global header for reactivity
  const globalHeader = getGlobalComponent('header');
  const globalFooter = usePageStore((state) => state.globalComponents?.footer);

  // Re-read instance from store to get fresh data
  const freshInstance = useMemo(() => {
    const foundInTree = findInstanceInTree(rootInstance, instance.id);
    if (foundInTree) return foundInTree;
    
    if (globalHeader) {
      const foundInHeader = findInstanceInTree(globalHeader, instance.id);
      if (foundInHeader) return foundInHeader;
    }
    
    if (globalFooter) {
      const foundInFooter = findInstanceInTree(globalFooter, instance.id);
      if (foundInFooter) return foundInFooter;
    }
    
    return instance;
  }, [rootInstance, globalHeader, globalFooter, instance.id]);

  const isComposition = isCompositionNavigation(freshInstance);
  
  const navChildren = useMemo(() => {
    if (isComposition) {
      return findNavChildren(freshInstance);
    }
    return { logoText: null, logoImage: null, menu: null, cta: null, container: null, leftSlot: null, centerSlot: null, rightSlot: null };
  }, [freshInstance, isComposition]);

  // Extract data
  const menuItems = useMemo(() => {
    if (isComposition && navChildren.menu) {
      return navChildren.menu.children
        ?.filter(c => c.type === 'Link')
        .map(link => ({
          id: link.id,
          text: (link.props?.children as string) || '',
          url: (link.props?.href as string) || '#'
        })) || [];
    }
    return freshInstance.props?.menuItems || [];
  }, [freshInstance, isComposition, navChildren.menu]);

  const logoTextValue = useMemo(() => {
    if (isComposition && navChildren.logoText) {
      return (navChildren.logoText.props?.children as string) || 'Brand';
    }
    return freshInstance.props?.logo || 'Brand';
  }, [freshInstance, isComposition, navChildren.logoText]);

  const currentTemplate = (freshInstance.props?.template as NavigationTemplate) || 'logo-left-menu-right';
  const logoImageUrl = isComposition 
    ? (navChildren.logoImage?.props?.src as string) || '' 
    : freshInstance.props?.logoImage || '';
  const hasImageLogo = !!logoImageUrl;
  
  // Get logo position from slots
  const logoPosition = useMemo(() => {
    return getLogoPositionFromSlots(freshInstance.id);
  }, [freshInstance, navChildren]);

  // Check if this navigation is the global header
  const currentGlobalHeader = getGlobalComponent('header');
  const isGlobalHeader = currentGlobalHeader?.id === freshInstance.id;
  
  // Hover & Active styles
  const hoverPreset = freshInstance.props?.hoverPreset || 'none';
  const activePreset = freshInstance.props?.activePreset || 'none';

  // === Handlers ===
  
  const handleTemplateChange = (value: NavigationTemplate) => {
    applyNavigationTemplate(freshInstance.id, value);
  };

  const handleLogoPositionChange = (position: 'left' | 'center' | 'right') => {
    applyLogoPosition(freshInstance.id, position);
  };

  const handleLogoChange = (value: string) => {
    if (isComposition && navChildren.logoText) {
      updateInstance(navChildren.logoText.id, {
        props: { ...navChildren.logoText.props, children: value }
      });
    } else {
      updateInstance(freshInstance.id, {
        props: { ...freshInstance.props, logo: value }
      });
    }
  };

  const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      addAsset({
        name: file.name,
        type: 'image',
        url: dataUrl,
        size: file.size,
        mimeType: file.type || 'image/png',
        altText: '',
      });
      
      const fresh = getFreshNavChildren();
      
      if (isComposition && fresh.container) {
        if (fresh.logoImage) {
          updateInstance(fresh.logoImage.id, {
            props: { ...fresh.logoImage.props, src: dataUrl }
          });
        } else if (fresh.logoText) {
          const existingStyleIds = fresh.logoText.styleSourceIds || [];
          
          // Find which slot contains the logo
          let containerId = fresh.container.id;
          let logoIndex = 0;
          
          if (fresh.leftSlot?.children?.some(c => c.id === fresh.logoText?.id)) {
            containerId = fresh.leftSlot.id;
            logoIndex = fresh.leftSlot.children?.findIndex(c => c.id === fresh.logoText?.id) ?? 0;
          } else if (fresh.centerSlot?.children?.some(c => c.id === fresh.logoText?.id)) {
            containerId = fresh.centerSlot.id;
            logoIndex = fresh.centerSlot.children?.findIndex(c => c.id === fresh.logoText?.id) ?? 0;
          } else if (fresh.rightSlot?.children?.some(c => c.id === fresh.logoText?.id)) {
            containerId = fresh.rightSlot.id;
            logoIndex = fresh.rightSlot.children?.findIndex(c => c.id === fresh.logoText?.id) ?? 0;
          }
          
          deleteInstance(fresh.logoText.id);
          
          const newImageLogo: ComponentInstance = {
            id: generateId(),
            type: 'Image' as ComponentType,
            label: 'Logo',
            props: { src: dataUrl, alt: logoTextValue || 'Logo' },
            styleSourceIds: existingStyleIds,
            children: [],
          };
          addInstance(newImageLogo, containerId, logoIndex);
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogoImage = () => {
    const fresh = getFreshNavChildren();
    
    if (isComposition && fresh.container && fresh.logoImage) {
      const existingStyleIds = fresh.logoImage.styleSourceIds || [];
      
      let containerId = fresh.container.id;
      let logoIndex = 0;
      
      if (fresh.leftSlot?.children?.some(c => c.id === fresh.logoImage?.id)) {
        containerId = fresh.leftSlot.id;
        logoIndex = fresh.leftSlot.children?.findIndex(c => c.id === fresh.logoImage?.id) ?? 0;
      } else if (fresh.centerSlot?.children?.some(c => c.id === fresh.logoImage?.id)) {
        containerId = fresh.centerSlot.id;
        logoIndex = fresh.centerSlot.children?.findIndex(c => c.id === fresh.logoImage?.id) ?? 0;
      } else if (fresh.rightSlot?.children?.some(c => c.id === fresh.logoImage?.id)) {
        containerId = fresh.rightSlot.id;
        logoIndex = fresh.rightSlot.children?.findIndex(c => c.id === fresh.logoImage?.id) ?? 0;
      }
      
      deleteInstance(fresh.logoImage.id);
      
      const newTextLogo: ComponentInstance = {
        id: generateId(),
        type: 'Text' as ComponentType,
        label: 'Brand',
        props: { children: 'Brand' },
        styleSourceIds: existingStyleIds,
        children: [],
      };
      addInstance(newTextLogo, containerId, logoIndex);
    }
  };

  const handleAddMenuItem = () => {
    if (!isComposition || !navChildren.menu) return;
    
    const className = getNextAutoClassName('link');
    const styleId = createStyleSource('local', className);
    setStyle(styleId, 'color', 'inherit');
    setStyle(styleId, 'textDecoration', 'none');
    
    const newLink: ComponentInstance = {
      id: generateId(),
      type: 'Link' as ComponentType,
      label: 'Link',
      props: { children: 'New Link', href: '#' },
      styleSourceIds: [styleId],
      children: [],
    };
    
    addInstance(newLink, navChildren.menu.id);
  };

  const handleUpdateMenuItem = (linkId: string, field: 'text' | 'url', value: string) => {
    const link = findInstanceAnywhere(linkId);
    if (!link) return;
    
    if (field === 'text') {
      updateInstance(linkId, { props: { ...link.props, children: value } });
    } else {
      updateInstance(linkId, { props: { ...link.props, href: value } });
    }
  };

  const handleDeleteMenuItem = (linkId: string) => {
    deleteInstance(linkId);
  };

  const handleGlobalHeaderToggle = (checked: boolean) => {
    if (checked) {
      setGlobalComponent('header', freshInstance);
    } else {
      setGlobalComponent('header', null);
    }
  };

  const handleHoverPresetChange = (preset: string) => {
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, hoverPreset: preset }
    });
  };

  const handleActivePresetChange = (preset: string) => {
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, activePreset: preset }
    });
  };

  const templates = getAllTemplates();

  return (
    <div className="space-y-2">
      {/* Layout Template Section */}
      <Collapsible open={layoutOpen} onOpenChange={setLayoutOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium bg-muted/50 rounded-md hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Layout</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${layoutOpen ? '' : '-rotate-90'}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 px-1">
          <Select value={currentTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id} className="text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-14 h-4 bg-muted rounded text-[9px] font-mono gap-0.5">
                      <span className="opacity-60">{templatePreviews[template.id].left}</span>
                      <span>{templatePreviews[template.id].center}</span>
                      <span className="opacity-60">{templatePreviews[template.id].right}</span>
                    </div>
                    <span>{template.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground mt-1.5 px-0.5">
            {templates.find(t => t.id === currentTemplate)?.description}
          </p>
        </CollapsibleContent>
      </Collapsible>

      {/* Branding Section */}
      <Collapsible open={brandingOpen} onOpenChange={setBrandingOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium bg-muted/50 rounded-md hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Branding</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${brandingOpen ? '' : '-rotate-90'}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 px-1 space-y-3">
          {/* Logo Position */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Position</Label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((pos) => (
                <Button
                  key={pos}
                  variant={logoPosition === pos ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 h-7 text-xs capitalize"
                  onClick={() => handleLogoPositionChange(pos)}
                >
                  {pos}
                </Button>
              ))}
            </div>
          </div>

          {/* Logo Upload or Brand Text */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Logo</Label>
            {hasImageLogo ? (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <img 
                  src={logoImageUrl} 
                  alt="Logo" 
                  className="h-8 w-auto object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 ml-auto"
                  onClick={handleRemoveLogoImage}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  value={logoTextValue}
                  onChange={(e) => handleLogoChange(e.target.value)}
                  placeholder="Brand name"
                  className="h-8 text-xs"
                />
                <label className="flex items-center justify-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload logo</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoImageUpload}
                  />
                </label>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Menu Items Section */}
      <Collapsible open={menuOpen} onOpenChange={setMenuOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium bg-muted/50 rounded-md hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Menu</span>
            <span className="text-[10px] text-muted-foreground">({menuItems.length})</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${menuOpen ? '' : '-rotate-90'}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 px-1 space-y-1.5">
          {menuItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1 group">
              <Input
                value={item.text}
                onChange={(e) => handleUpdateMenuItem(item.id, 'text', e.target.value)}
                placeholder="Label"
                className="h-7 text-xs flex-1"
              />
              <Input
                value={item.url}
                onChange={(e) => handleUpdateMenuItem(item.id, 'url', e.target.value)}
                placeholder="URL"
                className="h-7 text-xs w-20"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteMenuItem(item.id)}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs"
            onClick={handleAddMenuItem}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Link
          </Button>
        </CollapsibleContent>
      </Collapsible>

      {/* Link Styles Section */}
      <Collapsible open={stylesOpen} onOpenChange={setStylesOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium bg-muted/50 rounded-md hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Link Styles</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${stylesOpen ? '' : '-rotate-90'}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 px-1 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Hover</Label>
              <Select value={hoverPreset} onValueChange={handleHoverPresetChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOVER_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id} className="text-xs">
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Active</Label>
              <Select value={activePreset} onValueChange={handleActivePresetChange}>
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVE_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id} className="text-xs">
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Settings Section */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium bg-muted/50 rounded-md hover:bg-muted transition-colors">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Settings</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsOpen ? '' : '-rotate-90'}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 px-1 space-y-2">
          <div className="flex items-center justify-between py-1">
            <Label className="text-xs">Global Header</Label>
            <Switch
              checked={isGlobalHeader}
              onCheckedChange={handleGlobalHeaderToggle}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Show this navigation on all pages.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default NavigationDataEditor;
