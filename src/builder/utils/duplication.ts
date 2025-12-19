import { ComponentInstance } from '../store/types';
import { useComponentInstanceStore } from '../store/useComponentInstanceStore';
import { useStyleStore } from '../store/useStyleStore';
import { generateId } from './instance';

interface DuplicationResult {
  instance: ComponentInstance;
  links: Array<{ instanceId: string; prebuiltId: string; styleIdMapping: Record<string, string> }>;
}

/**
 * Copies all style values from source style sources to new style sources.
 * This preserves typography and all other style properties during duplication.
 */
const copyStyleValues = (
  oldStyleSourceIds: string[],
  newStyleSourceIds: string[],
  styleIdMapping: Record<string, string>
) => {
  const { styles, setStyle } = useStyleStore.getState();
  
  // Copy all style values from old sources to new sources
  for (let i = 0; i < oldStyleSourceIds.length; i++) {
    const oldId = oldStyleSourceIds[i];
    const newId = newStyleSourceIds[i] || styleIdMapping[oldId];
    
    if (!newId || oldId === newId) continue;
    
    // Find all style entries for the old source and copy to new source
    Object.entries(styles).forEach(([key, value]) => {
      if (key.startsWith(`${oldId}:`)) {
        // Parse the key: oldId:breakpoint:state:property
        const parts = key.replace(`${oldId}:`, '').split(':');
        const breakpoint = parts[0] || 'base';
        const state = parts[1] || 'default';
        const property = parts[2] || '';
        
        if (property && value) {
          setStyle(newId, property, value, breakpoint, state as any);
        }
      }
    });
  }
};

/**
 * Recursively duplicates a component instance, preserving all styles including typography.
 * - Creates new style sources for each instance (so duplicates can be styled independently)
 * - Copies all style values from the original instance to the duplicate
 * - For linked components, preserves the linkage to the prebuilt
 */
export const duplicateInstanceWithLinkage = (instance: ComponentInstance): DuplicationResult => {
  const { getInstanceLink } = useComponentInstanceStore.getState();
  const { createStyleSource, styleSources, getNextAutoClassName } = useStyleStore.getState();
  const links: DuplicationResult['links'] = [];

  const duplicateRecursive = (inst: ComponentInstance): ComponentInstance => {
    const existingLink = getInstanceLink(inst.id);
    const newId = generateId();
    const styleIdMapping: Record<string, string> = {};
    
    // Create new style sources that copy values from the originals
    const newStyleSourceIds = (inst.styleSourceIds || []).map(oldId => {
      const oldSource = styleSources[oldId];
      if (!oldSource) return oldId;
      
      // Create a new style source with the same type but new auto-class name
      const componentType = oldSource.name.replace(/-\d+$/, '').replace(/^\d+-/, '');
      const newClassName = getNextAutoClassName(componentType || 'class');
      const newId = createStyleSource(oldSource.type, newClassName);
      
      styleIdMapping[oldId] = newId;
      return newId;
    });
    
    // Copy all style values from old sources to new sources
    copyStyleValues(inst.styleSourceIds || [], newStyleSourceIds, styleIdMapping);
    
    // If this is a linked component, track the linkage for later
    if (existingLink) {
      links.push({
        instanceId: newId,
        prebuiltId: existingLink.prebuiltId,
        styleIdMapping,
      });
    }
    
    // Create the duplicated instance with new IDs and copied styles
    return {
      ...inst,
      id: newId,
      styleSourceIds: newStyleSourceIds,
      props: { ...inst.props },
      children: inst.children.map(child => duplicateRecursive(child)),
    };
  };

  const duplicatedInstance = duplicateRecursive(instance);

  return {
    instance: duplicatedInstance,
    links,
  };
};

/**
 * Applies linkage to duplicated instances after they've been added to the tree.
 * This must be called after addInstance to ensure the instances exist in the tree.
 */
export const applyDuplicationLinks = (
  links: Array<{ instanceId: string; prebuiltId: string; styleIdMapping: Record<string, string> }>
) => {
  const { linkInstance } = useComponentInstanceStore.getState();
  for (const link of links) {
    linkInstance(link.instanceId, link.prebuiltId, link.styleIdMapping);
  }
};
