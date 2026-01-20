import React, { useRef, useMemo } from 'react';
import { ComponentInstance, ComponentType } from '../../store/types';
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
import { NavigationTemplate, applyTemplateToStyles, getTemplateConfig } from '../../utils/navigationTemplates';
import { useStyleStore } from '../../store/useStyleStore';

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
// Supports both slot-based and legacy flat structures
const findNavChildren = (instance: ComponentInstance) => {
  const container = instance.children?.[0]; // Container
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
    // Legacy flat structure - search directly in container
    logoText = container.children?.find(c => c.type === 'Text') || null;
    logoImage = container.children?.find(c => c.type === 'Image') || null;
    menu = container.children?.find(c => c.type === 'Div' && c.children?.some(l => l.type === 'Link')) || null;
    cta = container.children?.find(c => c.type === 'Button') || null;
  }
  
  return { logoText, logoImage, menu, cta, container, leftSlot, centerSlot, rightSlot };
};

// Check if this is a composition-based navigation (Section with htmlTag='nav')
const isCompositionNavigation = (instance: ComponentInstance): boolean => {
  return instance.type === 'Section' && instance.props?.htmlTag === 'nav';
};

export const NavigationDataEditor: React.FC<NavigationDataEditorProps> = ({ instance }) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);
  const deleteInstance = useBuilderStore((state) => state.deleteInstance);
  const addInstance = useBuilderStore((state) => state.addInstance);
  const rootInstance = useBuilderStore((state) => state.rootInstance);
  
  const { addAsset } = useMediaStore();
  const { getAllPages, getGlobalComponent, setGlobalComponent, currentPageId, setPageGlobalOverride, getPageGlobalOverrides } = usePageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Helper to find instance in either rootInstance OR global components
  // Uses fresh state from stores to avoid stale closures
  const findInstanceAnywhere = (id: string): ComponentInstance | null => {
    // Get fresh state directly from stores at execution time
    const currentRoot = useBuilderStore.getState().rootInstance;
    const pageStoreState = usePageStore.getState();
    
    // First search in page tree
    const foundInTree = findInstanceInTree(currentRoot, id);
    if (foundInTree) return foundInTree;
    
    // Then search in global components (header/footer) - get fresh from store
    const freshGlobalHeader = pageStoreState.globalComponents?.header;
    if (freshGlobalHeader) {
      const foundInHeader = findInstanceInTree(freshGlobalHeader, id);
      if (foundInHeader) return foundInHeader;
    }
    
    const freshGlobalFooter = pageStoreState.globalComponents?.footer;
    if (freshGlobalFooter) {
      const foundInFooter = findInstanceInTree(freshGlobalFooter, id);
      if (foundInFooter) return foundInFooter;
    }
    
    return null;
  };

  // Helper to get fresh navigation children from current store state
  // Uses findInstanceAnywhere which gets fresh state from stores
  const getFreshNavChildren = () => {
    const currentInstance = findInstanceAnywhere(instance.id) || instance;
    if (isCompositionNavigation(currentInstance)) {
      return findNavChildren(currentInstance);
    }
    return { logoText: null, logoImage: null, menu: null, cta: null, container: null, leftSlot: null, centerSlot: null, rightSlot: null };
  };

  // Get the global header to include in dependencies for reactivity
  const globalHeader = getGlobalComponent('header');
  const globalFooter = getGlobalComponent('footer');

  // Re-read the instance from the store to get fresh data after updates
  // This ensures we react to changes in the tree AND global components
  const freshInstance = useMemo(() => {
    // Search in page tree first
    const foundInTree = findInstanceInTree(rootInstance, instance.id);
    if (foundInTree) return foundInTree;
    
    // Then search in global components
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

  // Determine if this is the new composition-based navigation or the old monolithic one
  const isComposition = isCompositionNavigation(freshInstance);
  
  // For composition-based navigation, find the child components
  // Use freshInstance to ensure we get the latest children
  const navChildren = useMemo(() => {
    if (isComposition) {
      return findNavChildren(freshInstance);
    }
    return { logoText: null, logoImage: null, menu: null, cta: null, container: null };
  }, [freshInstance, isComposition]);

  // Get all pages for the page picker
  const allPages = getAllPages();

  // Extract data from composition or props
  const menuItems = useMemo(() => {
    if (isComposition && navChildren.menu) {
      // Extract menu items from Link children
      return navChildren.menu.children
        ?.filter(c => c.type === 'Link')
        .map(link => ({
          id: link.id,
          text: (link.props?.children as string) || '',
          url: (link.props?.href as string) || '#'
        })) || [];
    }
    // Fall back to props for old Navigation component
    return freshInstance.props?.menuItems || [
      { text: 'Home', url: '#', id: '1' },
      { text: 'About', url: '#', id: '2' },
      { text: 'Contact', url: '#', id: '3' },
    ];
  }, [freshInstance, isComposition, navChildren.menu]);

  const logoTextValue = useMemo(() => {
    if (isComposition && navChildren.logoText) {
      return (navChildren.logoText.props?.children as string) || 'Logo';
    }
    return freshInstance.props?.logo || 'Logo';
  }, [freshInstance, isComposition, navChildren.logoText]);


  const template = freshInstance.props?.template || 'logo-left-menu-right';
  // For composition navigation, check if there's an Image logo child
  const logoImageUrl = isComposition 
    ? (navChildren.logoImage?.props?.src as string) || '' 
    : freshInstance.props?.logoImage || '';
  const mobileBreakpoint = freshInstance.props?.mobileBreakpoint || 768;
  
  // Check if this navigation is the global header
  const currentGlobalHeader = getGlobalComponent('header');
  const isGlobalHeader = currentGlobalHeader?.id === freshInstance.id;
  
  // Per-page visibility for global header
  const pageOverrides = getPageGlobalOverrides(currentPageId);
  const isHiddenOnCurrentPage = pageOverrides.hideHeader ?? false;
  
  // Hover & Active styles (stored on the instance props)
  const hoverPreset = freshInstance.props?.hoverPreset || 'underline-slide';
  const activePreset = freshInstance.props?.activePreset || 'underline';
  const hoverColor = freshInstance.props?.hoverColor || '';
  const hoverBgColor = freshInstance.props?.hoverBgColor || '';
  const activeColor = freshInstance.props?.activeColor || '';
  const activeBgColor = freshInstance.props?.activeBgColor || '';
  const animationDuration = freshInstance.props?.animationDuration || 200;

  const handleTemplateChange = (value: NavigationTemplate) => {
    // 1. Save the template to props
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, template: value }
    });

    // 2. For composition navigation, apply template styles
    if (isComposition) {
      const fresh = getFreshNavChildren();
      if (!fresh.container) return;

      // Get the actual style source IDs from the current instances
      const navContainerStyleId = fresh.container.styleSourceIds?.[0];
      const logoStyleId = (fresh.logoImage || fresh.logoText)?.styleSourceIds?.[0];
      const linksStyleId = fresh.menu?.styleSourceIds?.[0];
      const ctaStyleId = fresh.cta?.styleSourceIds?.[0];

      // Apply template styles if we have the required style IDs
      if (navContainerStyleId && logoStyleId && linksStyleId) {
        const setStyle = useStyleStore.getState().setStyle;
        applyTemplateToStyles(
          value,
          navContainerStyleId,
          logoStyleId,
          linksStyleId,
          ctaStyleId,
          setStyle
        );
      }

      // Handle special templates like 'minimal-logo' that hide menu/CTA
      const setStyle = useStyleStore.getState().setStyle;
      if (value === 'minimal-logo') {
        if (linksStyleId) setStyle(linksStyleId, 'display', 'none');
        if (ctaStyleId) setStyle(ctaStyleId, 'display', 'none');
      } else {
        if (linksStyleId) setStyle(linksStyleId, 'display', 'flex');
        if (ctaStyleId) setStyle(ctaStyleId, 'display', 'flex');
      }
    }
  };

  const handleLogoChange = (value: string) => {
    if (isComposition && navChildren.logoText) {
      // Update the Text child directly
      updateInstance(navChildren.logoText.id, {
        props: { ...navChildren.logoText.props, children: value }
      });
    } else if (isComposition && navChildren.logoImage) {
      // If there's an image logo, update its alt text instead
      updateInstance(navChildren.logoImage.id, {
        props: { ...navChildren.logoImage.props, alt: value }
      });
    } else {
      updateInstance(freshInstance.id, {
        props: { ...freshInstance.props, logo: value }
      });
    }
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
        
        // Get fresh nav children at the time of execution (not from closure)
        const fresh = getFreshNavChildren();
        
        if (isComposition && fresh.container) {
          // For composition navigation, replace the Text logo with an Image
          // or update the existing Image logo
          if (fresh.logoImage) {
            // Update existing image logo
            updateInstance(fresh.logoImage.id, {
              props: { ...fresh.logoImage.props, src: dataUrl }
            });
          } else if (fresh.logoText) {
            // Replace Text with Image - REUSE the existing styleSourceIds
            const existingStyleIds = fresh.logoText.styleSourceIds || [];
            
            // Find which slot contains the logo
            let containerId = fresh.container.id;
            let logoIndex = 0;
            
            // Check slots first
            if (fresh.leftSlot?.children?.some(c => c.id === fresh.logoText?.id)) {
              containerId = fresh.leftSlot.id;
              logoIndex = fresh.leftSlot.children?.findIndex(c => c.id === fresh.logoText?.id) ?? 0;
            } else if (fresh.centerSlot?.children?.some(c => c.id === fresh.logoText?.id)) {
              containerId = fresh.centerSlot.id;
              logoIndex = fresh.centerSlot.children?.findIndex(c => c.id === fresh.logoText?.id) ?? 0;
            } else if (fresh.rightSlot?.children?.some(c => c.id === fresh.logoText?.id)) {
              containerId = fresh.rightSlot.id;
              logoIndex = fresh.rightSlot.children?.findIndex(c => c.id === fresh.logoText?.id) ?? 0;
            } else {
              // Legacy: direct child of container
              logoIndex = fresh.container.children?.findIndex(c => c.id === fresh.logoText?.id) ?? 0;
            }
            
            // Delete the old Text logo
            deleteInstance(fresh.logoText.id);
            
            // Add a new Image logo at the same position with the SAME styleSourceIds
            const newImageLogo: ComponentInstance = {
              id: generateId(),
              type: 'Image' as ComponentType,
              label: 'Image',
              props: { src: dataUrl, alt: logoTextValue || 'Logo' },
              styleSourceIds: existingStyleIds,
              children: [],
            };
            addInstance(newImageLogo, containerId, logoIndex);
          }
        } else {
          // Store on nav wrapper props for old navigation
          const currentRoot = useBuilderStore.getState().rootInstance;
          const currentInstance = findInstanceInTree(currentRoot, instance.id);
          updateInstance(instance.id, {
            props: { ...(currentInstance?.props || {}), logoImage: dataUrl }
          });
        }
      };
      reader.readAsDataURL(file);
      
      // Clear input so re-uploading the same file triggers onChange
      e.target.value = '';
    }
  };

  const handleRemoveLogoImage = () => {
    // Get fresh nav children at the time of execution
    const fresh = getFreshNavChildren();
    
    if (isComposition && fresh.container) {
      // Find the Image logo and replace with Text
      if (fresh.logoImage) {
        // REUSE the existing styleSourceIds from the Image
        const existingStyleIds = fresh.logoImage.styleSourceIds || [];
        
        // Find which slot contains the logo
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
        
        // Add back a Text logo with the SAME styleSourceIds
        const newTextLogo: ComponentInstance = {
          id: generateId(),
          type: 'Text' as ComponentType,
          label: 'Text',
          props: { children: 'Brand' },
          styleSourceIds: existingStyleIds,
          children: [],
        };
        addInstance(newTextLogo, containerId, logoIndex);
      }
    } else {
      updateInstance(freshInstance.id, {
        props: { ...freshInstance.props, logoImage: '' }
      });
    }
  };

  const handleMenuItemChange = (itemId: string, field: 'text' | 'url', value: string) => {
    if (isComposition && navChildren.menu) {
      // Update the Link child directly
      const linkInstance = navChildren.menu.children?.find(c => c.id === itemId);
      if (linkInstance) {
        updateInstance(itemId, {
          props: { 
            ...linkInstance.props, 
            [field === 'text' ? 'children' : 'href']: value 
          }
        });
      }
    } else {
      // Old method: update props array
      const newItems = [...menuItems];
      const index = newItems.findIndex((item: any) => item.id === itemId);
      if (index !== -1) {
        newItems[index] = { ...newItems[index], [field]: value };
        updateInstance(freshInstance.id, {
          props: { ...freshInstance.props, menuItems: newItems }
        });
      }
    }
  };

  const handleAddMenuItem = () => {
    if (isComposition && navChildren.menu) {
      // Add a new Link child to the menu Div
      const newLink: ComponentInstance = {
        id: generateId(),
        type: 'Link' as ComponentType,
        label: 'Link',
        props: { children: 'New Link', href: '#' },
        styleSourceIds: ['style-nav-link'],
        children: [],
      };
      addInstance(newLink, navChildren.menu.id);
    } else {
      // Old method: update props array
      const newItems = [...menuItems, { text: 'New Link', url: '#', id: Date.now().toString() }];
      updateInstance(freshInstance.id, {
        props: { ...freshInstance.props, menuItems: newItems }
      });
    }
  };

  const handleRemoveMenuItem = (itemId: string) => {
    if (isComposition) {
      // Delete the Link child directly
      deleteInstance(itemId);
    } else {
      // Old method: update props array
      const newItems = menuItems.filter((item: any) => item.id !== itemId);
      updateInstance(freshInstance.id, {
        props: { ...freshInstance.props, menuItems: newItems }
      });
    }
  };


  const handleMobileBreakpointChange = (value: string) => {
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, mobileBreakpoint: parseInt(value) }
    });
  };

  const handleMobileAnimationChange = (value: string) => {
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, mobileAnimation: value }
    });
  };

  const handleHoverPresetChange = (value: string) => {
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, hoverPreset: value }
    });
  };

  const handleActivePresetChange = (value: string) => {
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, activePreset: value }
    });
  };

  const handleStyleChange = (key: string, value: string | number) => {
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, [key]: value }
    });
  };

  const handleGlobalHeaderToggle = (checked: boolean) => {
    if (checked) {
      // Make a deep copy of the instance for global storage
      const instanceCopy = JSON.parse(JSON.stringify(freshInstance));
      setGlobalComponent('header', instanceCopy);
      // Remove the original instance from the page to prevent duplication
      deleteInstance(freshInstance.id);
    } else {
      // When disabling global, add the component back to the current page
      const globalInstance = getGlobalComponent('header');
      if (globalInstance) {
        const instanceCopy = JSON.parse(JSON.stringify(globalInstance));
        addInstance(instanceCopy, 'root', 0);
      }
      setGlobalComponent('header', null);
    }
  };

  const handleHideOnPageToggle = (hide: boolean) => {
    setPageGlobalOverride(currentPageId, 'header', hide);
  };

  // Get logo position from slot structure
  const getLogoPosition = (): 'left' | 'center' | 'right' => {
    const fresh = getFreshNavChildren();
    const logoInstance = fresh.logoImage || fresh.logoText;
    if (!logoInstance) return 'left';
    
    // Check which slot contains the logo
    if (fresh.leftSlot?.children?.some(c => c.id === logoInstance.id)) return 'left';
    if (fresh.centerSlot?.children?.some(c => c.id === logoInstance.id)) return 'center';
    if (fresh.rightSlot?.children?.some(c => c.id === logoInstance.id)) return 'right';
    
    // Also check for nested logo in slots
    for (const slot of [fresh.leftSlot, fresh.centerSlot, fresh.rightSlot]) {
      if (!slot) continue;
      for (const child of slot.children || []) {
        if (child.type === 'Text' || child.type === 'Image') {
          if (slot === fresh.leftSlot) return 'left';
          if (slot === fresh.centerSlot) return 'center';
          if (slot === fresh.rightSlot) return 'right';
        }
      }
    }
    
    // Default to 'left' or use props
    return (freshInstance.props?.logoPosition as 'left' | 'center' | 'right') || 'left';
  };

  // Handle logo position change by moving elements between slots
  const handleLogoPositionChange = (position: 'left' | 'center' | 'right') => {
    const fresh = getFreshNavChildren();
    
    // If we don't have slots, we can't do structural positioning
    if (!fresh.leftSlot || !fresh.centerSlot || !fresh.rightSlot) {
      console.warn('Navigation does not have slot structure');
      return;
    }
    
    const logoInstance = fresh.logoImage || fresh.logoText;
    const menuInstance = fresh.menu;
    
    if (!logoInstance) return;
    
    // Update the nav section's logoPosition prop
    updateInstance(freshInstance.id, {
      props: { ...freshInstance.props, logoPosition: position }
    });
    
    // Collect all elements from all slots (excluding the logo and menu we'll move)
    const getOtherChildren = (slot: ComponentInstance | null, exclude: ComponentInstance[]): ComponentInstance[] => {
      if (!slot) return [];
      const excludeIds = exclude.filter(Boolean).map(e => e.id);
      return (slot.children || []).filter(c => !excludeIds.includes(c.id));
    };
    
    // Build new slot children based on position
    let newLeftChildren: ComponentInstance[] = [];
    let newCenterChildren: ComponentInstance[] = [];
    let newRightChildren: ComponentInstance[] = [];
    
    // Get other elements that should stay in their slots
    const allOther = [
      ...getOtherChildren(fresh.leftSlot, [logoInstance, menuInstance].filter(Boolean) as ComponentInstance[]),
      ...getOtherChildren(fresh.centerSlot, [logoInstance, menuInstance].filter(Boolean) as ComponentInstance[]),
      ...getOtherChildren(fresh.rightSlot, [logoInstance, menuInstance].filter(Boolean) as ComponentInstance[]),
    ];
    
    switch (position) {
      case 'left':
        // Logo left, menu right
        newLeftChildren = [logoInstance, ...allOther];
        newCenterChildren = [];
        if (menuInstance) newRightChildren = [menuInstance];
        break;
        
      case 'center':
        // Logo center, menu left (or split - simplified for now)
        if (menuInstance) newLeftChildren = [menuInstance];
        newCenterChildren = [logoInstance];
        newRightChildren = [...allOther];
        break;
        
      case 'right':
        // Menu left, logo right
        if (menuInstance) newLeftChildren = [menuInstance];
        newCenterChildren = [];
        newRightChildren = [logoInstance, ...allOther];
        break;
    }
    
    // Update all slots
    updateInstance(fresh.leftSlot.id, { children: newLeftChildren });
    updateInstance(fresh.centerSlot.id, { children: newCenterChildren });
    updateInstance(fresh.rightSlot.id, { children: newRightChildren });
  };

  // Generate page URL from page name
  const getPageUrl = (pageName: string) => {
    return `/pages/${pageName.toLowerCase().replace(/\s+/g, '-')}.html`;
  };

  // Get current page name for display
  const currentPageName = allPages.find(p => p.id === currentPageId)?.name || 'this page';

  return (
    <div className="space-y-3">
      {/* Global Header Toggle */}
      <div className="space-y-2 p-2 bg-primary/5 rounded-md border border-primary/20">
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
            ? "This navigation appears on all pages by default." 
            : "Enable to show this navigation on all pages automatically."}
        </p>
        
        {/* Per-page visibility toggle - only show when it's a global header */}
        {isGlobalHeader && (
          <div className="pt-2 mt-2 border-t border-primary/10">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground">Hide on "{currentPageName}"</Label>
              <Switch 
                checked={isHiddenOnCurrentPage}
                onCheckedChange={handleHideOnPageToggle}
                className="scale-75 origin-right"
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-1">
              {isHiddenOnCurrentPage 
                ? "Hidden on this page only. Other pages still show it." 
                : "Toggle to hide this header on the current page only."}
            </p>
          </div>
        )}
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
        
        {logoImageUrl ? (
          <>
            <div className="relative inline-block">
              <img 
                src={logoImageUrl} 
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
            
            {/* Logo Position Selector - only shown when image logo exists */}
            <div className="space-y-1">
              <Label className="text-[9px] text-muted-foreground">Logo Position</Label>
              <Select 
                value={getLogoPosition()} 
                onValueChange={handleLogoPositionChange}
              >
                <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="left" className="text-[10px]">Left</SelectItem>
                  <SelectItem value="center" className="text-[10px]">Center (Split Menu)</SelectItem>
                  <SelectItem value="right" className="text-[10px]">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
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
          value={logoTextValue}
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
            {menuItems.map((item: any) => (
              <div key={item.id} className="flex items-start gap-1.5 p-1.5 bg-muted/30 rounded border border-border/50">
                <GripVertical className="w-3 h-3 text-muted-foreground cursor-move mt-1.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Input
                    value={item.text}
                    onChange={(e) => handleMenuItemChange(item.id, 'text', e.target.value)}
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
                        handleMenuItemChange(item.id, 'url', value);
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
                      onChange={(e) => handleMenuItemChange(item.id, 'url', e.target.value)}
                      placeholder="https://example.com or #section"
                      className="h-6 text-[10px] text-foreground bg-background font-mono"
                    />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => handleRemoveMenuItem(item.id)}
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

      {/* Mobile Settings */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-1 text-[10px] font-medium text-foreground hover:text-foreground/80">
          <span>Mobile Settings</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
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

          <div className="space-y-1.5">
            <Label className="text-[10px] font-medium text-foreground">Menu Animation</Label>
            <Select value={freshInstance.props?.mobileAnimation || 'slide'} onValueChange={handleMobileAnimationChange}>
              <SelectTrigger className="h-7 text-[10px] text-foreground bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="slide" className="text-[10px]">Slide Down</SelectItem>
                <SelectItem value="fade" className="text-[10px]">Fade In</SelectItem>
                <SelectItem value="scale" className="text-[10px]">Scale</SelectItem>
                <SelectItem value="none" className="text-[10px]">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
