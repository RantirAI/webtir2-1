/**
 * Navigation Layout Utilities - Slot-Based Architecture
 * 
 * This module handles structural layout of navigation components using
 * a slot-based approach (left, center, right slots) instead of CSS order.
 */

import { ComponentInstance, ComponentType } from '../store/types';
import { useBuilderStore } from '../store/useBuilderStore';
import { useStyleStore } from '../store/useStyleStore';
import { usePageStore } from '../store/usePageStore';
import { generateId } from './instance';
import { 
  NavigationTemplate, 
  getTemplateConfig,
  TemplateConfig 
} from './navigationTemplates';

export type LogoPosition = 'left' | 'center' | 'right';

// Helper to find instance in any tree
function findInstanceInTree(tree: ComponentInstance | null, id: string): ComponentInstance | null {
  if (!tree) return null;
  if (tree.id === id) return tree;
  for (const child of tree.children || []) {
    const found = findInstanceInTree(child, id);
    if (found) return found;
  }
  return null;
}

// Get the navigation instance from either page tree or global components
export function getNavigationInstance(navId: string): ComponentInstance | null {
  const rootInstance = useBuilderStore.getState().rootInstance;
  const pageStore = usePageStore.getState();
  
  // First check page tree
  const foundInTree = findInstanceInTree(rootInstance, navId);
  if (foundInTree) return foundInTree;
  
  // Then check global header
  const header = pageStore.getGlobalComponent('header');
  if (header) {
    const foundInHeader = findInstanceInTree(header, navId);
    if (foundInHeader) return foundInHeader;
  }
  
  return null;
}

// Get the navigation container (the direct child of Section)
export function getNavContainer(navInstance: ComponentInstance): ComponentInstance | null {
  if (!navInstance || navInstance.type !== 'Section') return null;
  const container = navInstance.children?.[0];
  if (container?.type === 'Container') return container;
  return null;
}

// Check if a child is a slot container
function isSlot(child: ComponentInstance): boolean {
  return child.type === 'Div' && (
    child.label?.toLowerCase().includes('slot') || 
    child.props?._isNavSlot === true
  );
}

// Find child elements in navigation by role
export function findNavElements(container: ComponentInstance) {
  const children = container.children || [];
  
  let logo: ComponentInstance | null = null;
  let menu: ComponentInstance | null = null;
  let cta: ComponentInstance | null = null;
  let leftSlot: ComponentInstance | null = null;
  let centerSlot: ComponentInstance | null = null;
  let rightSlot: ComponentInstance | null = null;
  
  // Find slots
  for (const child of children) {
    if (isSlot(child)) {
      const label = child.label?.toLowerCase() || '';
      if (label.includes('left')) leftSlot = child;
      else if (label.includes('center')) centerSlot = child;
      else if (label.includes('right')) rightSlot = child;
    }
  }
  
  // Search for elements in slots or directly in container
  const searchInChildren = (items: ComponentInstance[]) => {
    for (const child of items) {
      // Logo: Text or Image
      if ((child.type === 'Text' || child.type === 'Image') && !logo) {
        logo = child;
      }
      // Menu: Div containing Links
      if (child.type === 'Div' && !isSlot(child) && child.children?.some(c => c.type === 'Link') && !menu) {
        menu = child;
      }
      // CTA: Button
      if (child.type === 'Button' && !cta) {
        cta = child;
      }
    }
  };
  
  // Search in slots first, then container
  if (leftSlot) searchInChildren(leftSlot.children || []);
  if (centerSlot) searchInChildren(centerSlot.children || []);
  if (rightSlot) searchInChildren(rightSlot.children || []);
  
  // Fallback: search directly in container (legacy support)
  if (!logo || !menu) {
    searchInChildren(children.filter(c => !isSlot(c)));
  }
  
  return { logo, menu, cta, leftSlot, centerSlot, rightSlot };
}

// Check if navigation has slot structure
export function hasSlotStructure(container: ComponentInstance): boolean {
  const children = container.children || [];
  return children.some(c => isSlot(c));
}

// Create slot containers for navigation
export function createNavSlots(): {
  leftSlot: ComponentInstance;
  centerSlot: ComponentInstance;
  rightSlot: ComponentInstance;
  styleIds: { left: string; center: string; right: string };
} {
  const { createStyleSource, setStyle, getNextAutoClassName } = useStyleStore.getState();
  
  // Create style sources for slots
  const leftClassName = getNextAutoClassName('div');
  const leftStyleId = createStyleSource('local', leftClassName);
  setStyle(leftStyleId, 'display', 'flex');
  setStyle(leftStyleId, 'alignItems', 'center');
  setStyle(leftStyleId, 'gap', '16px');
  setStyle(leftStyleId, 'flex', '0 0 auto');
  setStyle(leftStyleId, 'justifyContent', 'flex-start');
  
  const centerClassName = getNextAutoClassName('div');
  const centerStyleId = createStyleSource('local', centerClassName);
  setStyle(centerStyleId, 'display', 'none');
  setStyle(centerStyleId, 'alignItems', 'center');
  setStyle(centerStyleId, 'justifyContent', 'center');
  setStyle(centerStyleId, 'flex', '0 0 auto');
  
  const rightClassName = getNextAutoClassName('div');
  const rightStyleId = createStyleSource('local', rightClassName);
  setStyle(rightStyleId, 'display', 'flex');
  setStyle(rightStyleId, 'alignItems', 'center');
  setStyle(rightStyleId, 'gap', '24px');
  setStyle(rightStyleId, 'flex', '1');
  setStyle(rightStyleId, 'justifyContent', 'flex-end');
  
  return {
    leftSlot: {
      id: generateId(),
      type: 'Div' as ComponentType,
      label: 'Left Slot',
      props: { _isNavSlot: true },
      styleSourceIds: [leftStyleId],
      children: [],
    },
    centerSlot: {
      id: generateId(),
      type: 'Div' as ComponentType,
      label: 'Center Slot',
      props: { _isNavSlot: true },
      styleSourceIds: [centerStyleId],
      children: [],
    },
    rightSlot: {
      id: generateId(),
      type: 'Div' as ComponentType,
      label: 'Right Slot',
      props: { _isNavSlot: true },
      styleSourceIds: [rightStyleId],
      children: [],
    },
    styleIds: {
      left: leftStyleId,
      center: centerStyleId,
      right: rightStyleId,
    },
  };
}

// Apply a navigation template to restructure the nav
export function applyNavigationTemplate(
  navSectionId: string,
  templateId: NavigationTemplate
): boolean {
  const config = getTemplateConfig(templateId);
  const navInstance = getNavigationInstance(navSectionId);
  if (!navInstance) return false;
  
  const container = getNavContainer(navInstance);
  if (!container) return false;
  
  const { setStyle } = useStyleStore.getState();
  const updateInstance = useBuilderStore.getState().updateInstance;
  
  // Ensure slot structure exists
  if (!hasSlotStructure(container)) {
    migrateToSlotStructure(navSectionId);
  }
  
  // Re-fetch after potential migration
  const freshNav = getNavigationInstance(navSectionId);
  if (!freshNav) return false;
  const freshContainer = getNavContainer(freshNav);
  if (!freshContainer) return false;
  
  const elements = findNavElements(freshContainer);
  const { logo, menu, cta, leftSlot, centerSlot, rightSlot } = elements;
  
  if (!leftSlot || !centerSlot || !rightSlot) return false;
  
  // Build new children arrays for each slot based on template placement
  const buildSlotChildren = (placement: string[]): ComponentInstance[] => {
    const children: ComponentInstance[] = [];
    for (const item of placement) {
      if (item === 'logo' && logo) children.push(logo);
      if (item === 'menu' && menu) children.push(menu);
      if (item === 'cta' && cta) children.push(cta);
    }
    return children;
  };
  
  const newLeftChildren = buildSlotChildren(config.placement.left);
  const newCenterChildren = buildSlotChildren(config.placement.center);
  const newRightChildren = buildSlotChildren(config.placement.right);
  
  // Update slot children
  updateInstance(leftSlot.id, { children: newLeftChildren });
  updateInstance(centerSlot.id, { children: newCenterChildren });
  updateInstance(rightSlot.id, { children: newRightChildren });
  
  // Apply container styles
  const containerStyleId = freshContainer.styleSourceIds?.[0];
  if (containerStyleId) {
    for (const [prop, value] of Object.entries(config.containerStyles)) {
      setStyle(containerStyleId, prop, value);
    }
  }
  
  // Apply slot styles
  const applySlotStyles = (slot: ComponentInstance, styles: Record<string, string>) => {
    const styleId = slot.styleSourceIds?.[0];
    if (styleId) {
      for (const [prop, value] of Object.entries(styles)) {
        setStyle(styleId, prop, value);
      }
    }
  };
  
  applySlotStyles(leftSlot, config.slotStyles.left);
  applySlotStyles(centerSlot, config.slotStyles.center);
  applySlotStyles(rightSlot, config.slotStyles.right);
  
  // Handle hideMenu for templates like minimal-logo
  if (config.hideMenu && menu) {
    const menuStyleId = menu.styleSourceIds?.[0];
    if (menuStyleId) {
      setStyle(menuStyleId, 'display', 'none');
    }
  } else if (menu) {
    const menuStyleId = menu.styleSourceIds?.[0];
    if (menuStyleId) {
      setStyle(menuStyleId, 'display', 'flex');
    }
  }
  
  // Store template on nav section
  updateInstance(navSectionId, {
    props: { ...freshNav.props, template: templateId }
  });
  
  return true;
}

// Migrate old navigation structure to slot-based
export function migrateToSlotStructure(navSectionId: string): void {
  const navInstance = getNavigationInstance(navSectionId);
  if (!navInstance) return;
  
  const container = getNavContainer(navInstance);
  if (!container) return;
  
  // Already has slots
  if (hasSlotStructure(container)) return;
  
  const updateInstance = useBuilderStore.getState().updateInstance;
  const { logo, menu, cta } = findNavElements(container);
  
  // Create slots
  const { leftSlot, centerSlot, rightSlot } = createNavSlots();
  
  // Move logo to left slot (default position)
  if (logo) {
    leftSlot.children = [{ ...logo }];
  }
  
  // Move menu and cta to right slot (default position)
  if (menu) {
    rightSlot.children = [{ ...menu }];
  }
  if (cta) {
    rightSlot.children = [...(rightSlot.children || []), { ...cta }];
  }
  
  // Update container with new slot structure
  updateInstance(container.id, {
    children: [leftSlot, centerSlot, rightSlot],
  });
}

// Apply logo position by moving elements between slots
export function applyLogoPosition(navSectionId: string, position: LogoPosition): void {
  const navInstance = getNavigationInstance(navSectionId);
  if (!navInstance) return;
  
  const container = getNavContainer(navInstance);
  if (!container) return;
  
  // Ensure we have slot structure
  if (!hasSlotStructure(container)) {
    migrateToSlotStructure(navSectionId);
    // Re-fetch after migration
    const freshNav = getNavigationInstance(navSectionId);
    if (!freshNav) return;
    const freshContainer = getNavContainer(freshNav);
    if (!freshContainer) return;
    applyLogoPositionToSlots(freshContainer, position);
  } else {
    applyLogoPositionToSlots(container, position);
  }
}

function applyLogoPositionToSlots(container: ComponentInstance, position: LogoPosition): void {
  const updateInstance = useBuilderStore.getState().updateInstance;
  const { setStyle } = useStyleStore.getState();
  const children = container.children || [];
  
  // Find slots
  const leftSlot = children.find(c => c.label?.toLowerCase().includes('left'));
  const centerSlot = children.find(c => c.label?.toLowerCase().includes('center'));
  const rightSlot = children.find(c => c.label?.toLowerCase().includes('right'));
  
  if (!leftSlot || !centerSlot || !rightSlot) return;
  
  // Collect all elements from all slots
  const allLogoElements: ComponentInstance[] = [];
  const allMenuElements: ComponentInstance[] = [];
  const allCtaElements: ComponentInstance[] = [];
  
  for (const slot of [leftSlot, centerSlot, rightSlot]) {
    for (const child of slot.children || []) {
      if (child.type === 'Text' || child.type === 'Image') {
        allLogoElements.push(child);
      } else if (child.type === 'Button') {
        allCtaElements.push(child);
      } else if (child.type === 'Div') {
        allMenuElements.push(child);
      }
    }
  }
  
  const logo = allLogoElements[0] || null;
  const menu = allMenuElements[0] || null;
  const cta = allCtaElements[0] || null;
  
  // Create new slot children based on position
  let newLeftChildren: ComponentInstance[] = [];
  let newCenterChildren: ComponentInstance[] = [];
  let newRightChildren: ComponentInstance[] = [];
  
  switch (position) {
    case 'left':
      if (logo) newLeftChildren.push(logo);
      if (menu) newRightChildren.push(menu);
      if (cta) newRightChildren.push(cta);
      break;
      
    case 'center':
      if (menu) newLeftChildren.push(menu);
      if (logo) newCenterChildren.push(logo);
      if (cta) newRightChildren.push(cta);
      break;
      
    case 'right':
      if (menu) newLeftChildren.push(menu);
      if (cta) newLeftChildren.push(cta);
      if (logo) newRightChildren.push(logo);
      break;
  }
  
  // Update all slots
  updateInstance(leftSlot.id, { children: newLeftChildren });
  updateInstance(centerSlot.id, { children: newCenterChildren });
  updateInstance(rightSlot.id, { children: newRightChildren });
  
  // Update slot visibility based on content
  const updateSlotVisibility = (slot: ComponentInstance, hasContent: boolean) => {
    const styleId = slot.styleSourceIds?.[0];
    if (styleId) {
      setStyle(styleId, 'display', hasContent ? 'flex' : 'none');
    }
  };
  
  updateSlotVisibility(leftSlot, newLeftChildren.length > 0);
  updateSlotVisibility(centerSlot, newCenterChildren.length > 0);
  updateSlotVisibility(rightSlot, newRightChildren.length > 0);
}

// Get current logo position from slot structure
export function getLogoPositionFromSlots(navSectionId: string): LogoPosition {
  const navInstance = getNavigationInstance(navSectionId);
  if (!navInstance) return 'left';
  
  const container = getNavContainer(navInstance);
  if (!container) return 'left';
  
  if (!hasSlotStructure(container)) return 'left';
  
  const children = container.children || [];
  const leftSlot = children.find(c => c.label?.toLowerCase().includes('left'));
  const centerSlot = children.find(c => c.label?.toLowerCase().includes('center'));
  const rightSlot = children.find(c => c.label?.toLowerCase().includes('right'));
  
  // Check where the logo is
  const hasLogoInLeft = leftSlot?.children?.some(c => c.type === 'Text' || c.type === 'Image');
  const hasLogoInCenter = centerSlot?.children?.some(c => c.type === 'Text' || c.type === 'Image');
  const hasLogoInRight = rightSlot?.children?.some(c => c.type === 'Text' || c.type === 'Image');
  
  if (hasLogoInRight) return 'right';
  if (hasLogoInCenter) return 'center';
  return 'left';
}

// Replace the logo element (e.g., when dropping an image)
export function replaceLogoInSlots(
  navSectionId: string, 
  newLogoInstance: ComponentInstance
): boolean {
  const navInstance = getNavigationInstance(navSectionId);
  if (!navInstance) return false;
  
  const container = getNavContainer(navInstance);
  if (!container) return false;
  
  const updateInstance = useBuilderStore.getState().updateInstance;
  
  // For slot-based navigation
  if (hasSlotStructure(container)) {
    const children = container.children || [];
    
    for (const slot of children) {
      if (slot.type !== 'Div') continue;
      
      const slotChildren = slot.children || [];
      const logoIndex = slotChildren.findIndex(c => c.type === 'Text' || c.type === 'Image');
      
      if (logoIndex !== -1) {
        // Found the logo - replace it
        const newChildren = [...slotChildren];
        newChildren[logoIndex] = newLogoInstance;
        updateInstance(slot.id, { children: newChildren });
        return true;
      }
    }
    
    // No logo found - add to left slot by default
    const leftSlot = children.find(c => c.label?.toLowerCase().includes('left'));
    if (leftSlot) {
      updateInstance(leftSlot.id, { 
        children: [newLogoInstance, ...(leftSlot.children || [])] 
      });
      return true;
    }
  } else {
    // Old flat structure - find and replace logo directly
    const containerChildren = container.children || [];
    const logoIndex = containerChildren.findIndex(c => c.type === 'Text' || c.type === 'Image');
    
    if (logoIndex !== -1) {
      const newChildren = [...containerChildren];
      newChildren[logoIndex] = newLogoInstance;
      updateInstance(container.id, { children: newChildren });
      return true;
    }
  }
  
  return false;
}

// Get the target slot for logo based on current position setting
export function getLogoSlotId(navSectionId: string): string | null {
  const navInstance = getNavigationInstance(navSectionId);
  if (!navInstance) return null;
  
  const container = getNavContainer(navInstance);
  if (!container) return null;
  
  if (!hasSlotStructure(container)) {
    return container.id; // Return container id for flat structure
  }
  
  const position = getLogoPositionFromSlots(navSectionId);
  const children = container.children || [];
  
  switch (position) {
    case 'left':
      return children.find(c => c.label?.toLowerCase().includes('left'))?.id || null;
    case 'center':
      return children.find(c => c.label?.toLowerCase().includes('center'))?.id || null;
    case 'right':
      return children.find(c => c.label?.toLowerCase().includes('right'))?.id || null;
  }
  
  return null;
}
