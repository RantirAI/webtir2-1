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
 * Must be called after new style sources are created.
 */
const copyStyleValues = (
  oldStyleSourceIds: string[],
  styleIdMapping: Record<string, string>
) => {
  // Get fresh state reference to ensure we have access to the latest styles
  const { styles, setStyle } = useStyleStore.getState();
  
  // Copy all style values from old sources to new sources
  for (const oldId of oldStyleSourceIds) {
    const newId = styleIdMapping[oldId];
    
    if (!newId || oldId === newId) continue;
    
    // Find all style entries for the old source and copy to new source
    // Style key format: styleSourceId:breakpoint:state:property
    Object.entries(styles).forEach(([key, value]) => {
      if (key.startsWith(`${oldId}:`)) {
        // Parse the key: oldId:breakpoint:state:property
        const remainder = key.slice(oldId.length + 1); // Remove "oldId:"
        const colonIndex1 = remainder.indexOf(':');
        const colonIndex2 = remainder.indexOf(':', colonIndex1 + 1);
        
        if (colonIndex1 === -1 || colonIndex2 === -1) return;
        
        const breakpoint = remainder.slice(0, colonIndex1);
        const state = remainder.slice(colonIndex1 + 1, colonIndex2);
        const property = remainder.slice(colonIndex2 + 1);
        
        if (property && value) {
          setStyle(newId, property, value, breakpoint, state as any);
        }
      }
    });
  }
};

/**
 * Recursively duplicates a component instance, preserving all styles including typography.
 * - Reuses the SAME style source IDs (sharing styles) to prevent style loss
 * - For linked components, preserves the linkage to the prebuilt
 * - Props and children are deep-copied with new IDs
 */
export const duplicateInstanceWithLinkage = (instance: ComponentInstance): DuplicationResult => {
  const { getInstanceLink } = useComponentInstanceStore.getState();
  const links: DuplicationResult['links'] = [];

  const duplicateRecursive = (inst: ComponentInstance): ComponentInstance => {
    const existingLink = getInstanceLink(inst.id);
    const newId = generateId();
    
    // IMPORTANT: Reuse the same styleSourceIds to preserve all styles exactly
    // This ensures duplicated components look identical to the original
    const newStyleSourceIds = [...(inst.styleSourceIds || [])];
    
    // Create style ID mapping (identity mapping since we're reusing)
    const styleIdMapping: Record<string, string> = {};
    for (const id of newStyleSourceIds) {
      styleIdMapping[id] = id;
    }
    
    // If this is a linked component, track the linkage for later
    if (existingLink) {
      links.push({
        instanceId: newId,
        prebuiltId: existingLink.prebuiltId,
        styleIdMapping,
      });
    }
    
    // Create the duplicated instance with new instance ID but same style sources
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
