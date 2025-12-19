import { ComponentInstance } from '../store/types';
import { useComponentInstanceStore, createLinkedInstance } from '../store/useComponentInstanceStore';
import { generateId } from './instance';

interface DuplicationResult {
  instance: ComponentInstance;
  links: Array<{ instanceId: string; prebuiltId: string; styleIdMapping: Record<string, string> }>;
}

/**
 * Recursively duplicates a component instance, preserving linkage for all nested components.
 * - If a node is a linked component, it creates a new linked instance from the same prebuilt
 * - If a node is not linked, it creates a copy with new IDs
 * - Recursively handles all children, preserving their linkage status
 */
export const duplicateInstanceWithLinkage = (instance: ComponentInstance): DuplicationResult => {
  const { getInstanceLink } = useComponentInstanceStore.getState();
  const links: DuplicationResult['links'] = [];

  const duplicateRecursive = (inst: ComponentInstance): ComponentInstance => {
    const existingLink = getInstanceLink(inst.id);

    if (existingLink) {
      // This is a linked component - create a new linked instance from the same prebuilt
      const result = createLinkedInstance(existingLink.prebuiltId);
      if (result) {
        const { instance: newInstance, styleIdMapping } = result;
        // Store link info to be applied after instance is added to the tree
        links.push({
          instanceId: newInstance.id,
          prebuiltId: existingLink.prebuiltId,
          styleIdMapping,
        });
        return newInstance;
      }
    }

    // Not a linked component - duplicate with new ID and recursively handle children
    const newId = generateId();
    return {
      ...inst,
      id: newId,
      styleSourceIds: [...(inst.styleSourceIds || [])],
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
