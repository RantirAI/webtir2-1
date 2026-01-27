import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComponentInstance, StyleSource } from './types';
import { useStyleStore, setStyleChangeCallback } from './useStyleStore';
import { useBuilderStore } from './useBuilderStore';
import { generateId } from '../utils/instance';
import { createSystemPrebuilts, SystemPrebuiltDefinition } from '../utils/systemPrebuilts';

// ============================================================================
// TYPES
// ============================================================================

export interface PrebuiltComponent {
  id: string;
  name: string;
  instance: ComponentInstance;
  styles: Record<string, { source: StyleSource; styleValues: Record<string, string> }>;
  createdAt: number;
  updatedAt: number;
  isSystem?: boolean;
  category?: string;
}

export interface InstanceLink {
  instanceId: string;
  prebuiltId: string;
  styleIdMapping: Record<string, string>; // Maps prebuilt style IDs to instance style IDs
  overrides: InstanceOverrides;
  isMaster: boolean; // If true, edits to this instance update the prebuilt definition
}

export interface InstanceOverrides {
  // Track which properties have been intentionally overridden
  props: Record<string, boolean>;      // e.g., { 'children': true } for text content
  styles: Record<string, Set<string>>; // styleSourceId -> Set of overridden properties
  structure: boolean;                   // If true, structure changes won't propagate
}

interface ComponentInstanceStore {
  // Prebuilt component definitions
  prebuiltComponents: PrebuiltComponent[];
  
  // Links between canvas instances and their prebuilt sources
  instanceLinks: InstanceLink[];
  
  // ==================== PREBUILT CRUD ====================
  
  addPrebuilt: (name: string, instance: ComponentInstance) => string;
  updatePrebuilt: (id: string, instance: ComponentInstance) => void;
  removePrebuilt: (id: string) => void;
  renamePrebuilt: (id: string, newName: string) => void;
  getPrebuilt: (id: string) => PrebuiltComponent | undefined;
  
  // ==================== INSTANCE LINKING ====================
  
  linkInstance: (instanceId: string, prebuiltId: string, styleIdMapping: Record<string, string>, isMaster?: boolean) => void;
  unlinkInstance: (instanceId: string) => void;
  getInstanceLink: (instanceId: string) => InstanceLink | undefined;
  getLinkedInstances: (prebuiltId: string) => InstanceLink[];
  getMasterInstance: (prebuiltId: string) => InstanceLink | undefined;
  isMasterInstance: (instanceId: string) => boolean;
  syncMasterToPrebuilt: (instanceId: string) => void;
  isLinkedInstance: (instanceId: string) => boolean;
  
  // ==================== OVERRIDE MANAGEMENT ====================
  
  markPropOverride: (instanceId: string, propName: string) => void;
  markStyleOverride: (instanceId: string, styleSourceId: string, property: string) => void;
  markStructureOverride: (instanceId: string) => void;
  clearOverrides: (instanceId: string) => void;
  hasOverride: (instanceId: string, type: 'prop' | 'style' | 'structure', key?: string, property?: string) => boolean;
  
  // ==================== PROPAGATION ====================
  
  propagateChangesToInstances: (prebuiltId: string) => void;
  syncInstanceFromPrebuilt: (instanceId: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const collectStyleSourceIds = (instance: ComponentInstance): string[] => {
  const ids: string[] = [...(instance.styleSourceIds || [])];
  for (const child of instance.children || []) {
    ids.push(...collectStyleSourceIds(child));
  }
  return ids;
};

const collectAllInstanceIds = (instance: ComponentInstance): string[] => {
  const ids: string[] = [instance.id];
  for (const child of instance.children || []) {
    ids.push(...collectAllInstanceIds(child));
  }
  return ids;
};

const captureStyles = (instance: ComponentInstance): PrebuiltComponent['styles'] => {
  const styleStore = useStyleStore.getState();
  const allStyleSourceIds = [...new Set(collectStyleSourceIds(instance))];
  
  const styles: PrebuiltComponent['styles'] = {};
  for (const styleId of allStyleSourceIds) {
    const source = styleStore.styleSources[styleId];
    if (source) {
      const styleValues: Record<string, string> = {};
      Object.entries(styleStore.styles).forEach(([key, value]) => {
        if (key.startsWith(`${styleId}:`)) {
          styleValues[key] = value;
        }
      });
      styles[styleId] = {
        source: JSON.parse(JSON.stringify(source)),
        styleValues,
      };
    }
  }
  return styles;
};

// Convert system prebuilt definitions to PrebuiltComponent format
const convertSystemPrebuiltToPrebuilt = (
  systemPrebuilt: SystemPrebuiltDefinition
): PrebuiltComponent => {
  const now = Date.now();
  const styles: PrebuiltComponent['styles'] = {};
  
  // Convert default styles to the PrebuiltComponent styles format (base breakpoint)
  for (const [styleId, styleValues] of Object.entries(systemPrebuilt.defaultStyles)) {
    styles[styleId] = {
      source: {
        id: styleId,
        type: 'local',
        name: styleId.replace('style-', ''),
      },
      styleValues: Object.fromEntries(
        Object.entries(styleValues).map(([prop, value]) => [`${styleId}:desktop:default:${prop}`, value])
      ),
    };
  }
  
  // Add tablet breakpoint styles if defined
  if (systemPrebuilt.tabletStyles) {
    for (const [styleId, styleValues] of Object.entries(systemPrebuilt.tabletStyles)) {
      if (!styles[styleId]) {
        styles[styleId] = {
          source: { id: styleId, type: 'local', name: styleId.replace('style-', '') },
          styleValues: {},
        };
      }
      for (const [prop, value] of Object.entries(styleValues)) {
        styles[styleId].styleValues[`${styleId}:tablet:default:${prop}`] = value;
      }
    }
  }
  
  // Add mobile breakpoint styles if defined
  if (systemPrebuilt.mobileStyles) {
    for (const [styleId, styleValues] of Object.entries(systemPrebuilt.mobileStyles)) {
      if (!styles[styleId]) {
        styles[styleId] = {
          source: { id: styleId, type: 'local', name: styleId.replace('style-', '') },
          styleValues: {},
        };
      }
      for (const [prop, value] of Object.entries(styleValues)) {
        styles[styleId].styleValues[`${styleId}:mobile:default:${prop}`] = value;
      }
    }
  }
  
  return {
    id: systemPrebuilt.id,
    name: systemPrebuilt.name,
    instance: systemPrebuilt.instance,
    styles,
    createdAt: now,
    updatedAt: now,
    isSystem: true,
    category: systemPrebuilt.category,
  };
};

// Get all system prebuilts as PrebuiltComponent[]
const getSystemPrebuilts = (): PrebuiltComponent[] => {
  const definitions = createSystemPrebuilts();
  return definitions.map(convertSystemPrebuiltToPrebuilt);
};

const createInstanceFromPrebuilt = (
  prebuilt: PrebuiltComponent,
  overrides?: InstanceOverrides
): { instance: ComponentInstance; styleIdMapping: Record<string, string> } => {
  const { createStyleSource, setStyle, styleSources } = useStyleStore.getState();
  const styleIdMapping: Record<string, string> = {};
  
  // Recreate styles
  if (prebuilt.styles) {
    for (const [oldStyleId, styleData] of Object.entries(prebuilt.styles)) {
      // Check if style with same name exists
      const existingSource = Object.values(styleSources).find(
        s => s.name === styleData.source.name && s.type === styleData.source.type
      );
      
      let newStyleId: string;
      if (existingSource) {
        newStyleId = existingSource.id;
      } else {
        newStyleId = createStyleSource(styleData.source.type, styleData.source.name);
      }
      
      // Apply style values
      for (const [styleKey, styleValue] of Object.entries(styleData.styleValues)) {
        const keyParts = styleKey.replace(`${oldStyleId}:`, '').split(':');
        const breakpoint = keyParts[0] || 'desktop';
        const state = keyParts[1] || 'default';
        const property = keyParts[2] || '';
        
        if (property) {
          // Check if this property is overridden
          const shouldSkip = overrides?.styles[newStyleId]?.has(property);
          if (!shouldSkip) {
            setStyle(newStyleId, property, styleValue, breakpoint, state as any);
          }
        }
      }
      
      styleIdMapping[oldStyleId] = newStyleId;
    }
  }
  
  // Clone instance with new IDs and remapped styles
  const cloneWithNewIds = (inst: ComponentInstance): ComponentInstance => {
    const newId = generateId();
    const newStyleSourceIds = (inst.styleSourceIds || []).map(
      oldId => styleIdMapping[oldId] || oldId
    );
    
    // Apply prop overrides if any
    let props = { ...inst.props };
    
    return {
      ...inst,
      id: newId,
      styleSourceIds: newStyleSourceIds,
      props,
      children: inst.children.map(cloneWithNewIds),
    };
  };
  
  return {
    instance: cloneWithNewIds(prebuilt.instance),
    styleIdMapping,
  };
};

// ============================================================================
// STORE
// ============================================================================

export const useComponentInstanceStore = create<ComponentInstanceStore>()(
  persist(
    (set, get) => ({
      prebuiltComponents: getSystemPrebuilts(),
      instanceLinks: [],

      // ==================== PREBUILT CRUD ====================

      addPrebuilt: (name, instance) => {
        const styles = captureStyles(instance);
        const id = `prebuilt-${Date.now()}`;
        const now = Date.now();
        
        const newPrebuilt: PrebuiltComponent = {
          id,
          name,
          instance: JSON.parse(JSON.stringify(instance)),
          styles,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          prebuiltComponents: [...state.prebuiltComponents, newPrebuilt],
        }));
        
        return id;
      },

      updatePrebuilt: (id, instance) => {
        const styles = captureStyles(instance);
        
        set((state) => ({
          prebuiltComponents: state.prebuiltComponents.map((p) =>
            p.id === id
              ? { ...p, instance: JSON.parse(JSON.stringify(instance)), styles, updatedAt: Date.now() }
              : p
          ),
        }));
        
        // Propagate changes to all linked instances
        get().propagateChangesToInstances(id);
      },

      removePrebuilt: (id) => {
        set((state) => ({
          prebuiltComponents: state.prebuiltComponents.filter((p) => p.id !== id),
          // Unlink all instances when prebuilt is deleted
          instanceLinks: state.instanceLinks.filter((link) => link.prebuiltId !== id),
        }));
      },

      renamePrebuilt: (id, newName) => {
        set((state) => ({
          prebuiltComponents: state.prebuiltComponents.map((p) =>
            p.id === id ? { ...p, name: newName } : p
          ),
        }));
      },

      getPrebuilt: (id) => {
        return get().prebuiltComponents.find((p) => p.id === id);
      },

      // ==================== INSTANCE LINKING ====================

      linkInstance: (instanceId, prebuiltId, styleIdMapping, isMaster = false) => {
        set((state) => {
          // Remove existing link if any
          const filtered = state.instanceLinks.filter((l) => l.instanceId !== instanceId);
          return {
            instanceLinks: [
              ...filtered,
              {
                instanceId,
                prebuiltId,
                styleIdMapping,
                overrides: { props: {}, styles: {}, structure: false },
                isMaster,
              },
            ],
          };
        });
      },

      unlinkInstance: (instanceId) => {
        set((state) => ({
          instanceLinks: state.instanceLinks.filter((l) => l.instanceId !== instanceId),
        }));
      },

      getInstanceLink: (instanceId) => {
        return get().instanceLinks.find((l) => l.instanceId === instanceId);
      },

      getLinkedInstances: (prebuiltId) => {
        return get().instanceLinks.filter((l) => l.prebuiltId === prebuiltId);
      },

      getMasterInstance: (prebuiltId) => {
        return get().instanceLinks.find((l) => l.prebuiltId === prebuiltId && l.isMaster);
      },

      isMasterInstance: (instanceId) => {
        const link = get().getInstanceLink(instanceId);
        return link?.isMaster ?? false;
      },

      syncMasterToPrebuilt: (instanceId) => {
        const link = get().getInstanceLink(instanceId);
        if (!link || !link.isMaster) return;
        
        const { findInstance } = useBuilderStore.getState();
        const canvasInstance = findInstance(instanceId);
        if (!canvasInstance) return;
        
        // Update the prebuilt with current instance state (this triggers propagation)
        get().updatePrebuilt(link.prebuiltId, canvasInstance);
      },

      isLinkedInstance: (instanceId) => {
        return get().instanceLinks.some((l) => l.instanceId === instanceId);
      },

      // ==================== OVERRIDE MANAGEMENT ====================

      markPropOverride: (instanceId, propName) => {
        set((state) => ({
          instanceLinks: state.instanceLinks.map((link) =>
            link.instanceId === instanceId
              ? { ...link, overrides: { ...link.overrides, props: { ...link.overrides.props, [propName]: true } } }
              : link
          ),
        }));
      },

      markStyleOverride: (instanceId, styleSourceId, property) => {
        set((state) => ({
          instanceLinks: state.instanceLinks.map((link) => {
            if (link.instanceId !== instanceId) return link;
            
            const newStyles = { ...link.overrides.styles };
            if (!newStyles[styleSourceId]) {
              newStyles[styleSourceId] = new Set();
            }
            newStyles[styleSourceId].add(property);
            
            return { ...link, overrides: { ...link.overrides, styles: newStyles } };
          }),
        }));
      },

      markStructureOverride: (instanceId) => {
        set((state) => ({
          instanceLinks: state.instanceLinks.map((link) =>
            link.instanceId === instanceId
              ? { ...link, overrides: { ...link.overrides, structure: true } }
              : link
          ),
        }));
      },

      clearOverrides: (instanceId) => {
        set((state) => ({
          instanceLinks: state.instanceLinks.map((link) =>
            link.instanceId === instanceId
              ? { ...link, overrides: { props: {}, styles: {}, structure: false } }
              : link
          ),
        }));
      },

      hasOverride: (instanceId, type, key, property) => {
        const link = get().getInstanceLink(instanceId);
        if (!link) return false;
        
        switch (type) {
          case 'prop':
            return key ? !!link.overrides.props[key] : false;
          case 'style':
            return key && property ? link.overrides.styles[key]?.has(property) ?? false : false;
          case 'structure':
            return link.overrides.structure;
          default:
            return false;
        }
      },

      // ==================== PROPAGATION ====================

      propagateChangesToInstances: (prebuiltId) => {
        const prebuilt = get().getPrebuilt(prebuiltId);
        if (!prebuilt) return;

        const linkedInstances = get().getLinkedInstances(prebuiltId);
        const { setStyle } = useStyleStore.getState();
        const { findInstance, updateInstance } = useBuilderStore.getState();

        // Guard to prevent internal propagation from re-triggering sync loops
        isInternalPrebuiltPropagation = true;
        try {
          for (const link of linkedInstances) {
            // Master is the source of truth; don't overwrite it from the prebuilt.
            if (link.isMaster) continue;

            const canvasInstance = findInstance(link.instanceId);
            if (!canvasInstance) continue;

            // Skip if structure is overridden
            if (link.overrides.structure) continue;

            // Update styles (respecting overrides)
            for (const [oldStyleId, styleData] of Object.entries(prebuilt.styles)) {
              const newStyleId = link.styleIdMapping[oldStyleId];
              if (!newStyleId) continue;

              for (const [styleKey, styleValue] of Object.entries(styleData.styleValues)) {
                const keyParts = styleKey.replace(`${oldStyleId}:`, '').split(':');
                const breakpoint = keyParts[0] || 'base';
                const state = keyParts[1] || 'default';
                const property = keyParts[2] || '';

                if (property) {
                  // Skip if this property is overridden
                  const isOverridden = link.overrides.styles[newStyleId]?.has(property);
                  if (!isOverridden) {
                    setStyle(newStyleId, property, styleValue, breakpoint, state as any);
                  }
                }
              }
            }

            // Update props recursively (this is what makes nested prebuilt content sync correctly)
            const applyPropsFromPrebuilt = (
              sourceNode: ComponentInstance,
              targetNode: ComponentInstance,
              isRoot: boolean
            ): ComponentInstance => {
              const nextProps: Record<string, any> = { ...targetNode.props };

              for (const [propKey, propValue] of Object.entries(sourceNode.props)) {
                // Only the *root* has override tracking today.
                if (isRoot && link.overrides.props[propKey]) continue;
                nextProps[propKey] = propValue;
              }

              const nextChildren = (targetNode.children || []).map((child, index) => {
                const sourceChild = sourceNode.children?.[index];
                if (!sourceChild) return child;
                if (sourceChild.type !== child.type) return child;
                return applyPropsFromPrebuilt(sourceChild, child, false);
              });

              return {
                ...targetNode,
                props: nextProps,
                children: nextChildren,
              };
            };

            const updatedTree = applyPropsFromPrebuilt(prebuilt.instance, canvasInstance, true);

            updateInstance(
              link.instanceId,
              {
                props: updatedTree.props,
                children: updatedTree.children,
              },
              { skipPrebuiltSync: true }
            );
          }
        } finally {
          isInternalPrebuiltPropagation = false;
        }
      },

      syncInstanceFromPrebuilt: (instanceId) => {
        const link = get().getInstanceLink(instanceId);
        if (!link) return;
        
        const prebuilt = get().getPrebuilt(link.prebuiltId);
        if (!prebuilt) return;
        
        // Clear overrides and re-sync
        get().clearOverrides(instanceId);
        get().propagateChangesToInstances(link.prebuiltId);
      },
    }),
    {
      name: 'component-instance-storage',
      partialize: (state) => ({
        // Only persist user prebuilts, not system ones
        prebuiltComponents: state.prebuiltComponents.filter(p => !p.isSystem),
        instanceLinks: state.instanceLinks.map((link) => ({
          ...link,
          overrides: {
            ...link.overrides,
            styles: Object.fromEntries(
              Object.entries(link.overrides.styles).map(([k, v]) => [k, Array.from(v)])
            ),
          },
        })),
      }),
      merge: (persisted: any, current) => {
        // Convert styles back to Sets after rehydration
        const persistedState = persisted as typeof current;
        const userPrebuilts = (persistedState.prebuiltComponents || []).filter((p: any) => !p.isSystem);
        const systemPrebuilts = getSystemPrebuilts();
        
        return {
          ...current,
          ...persistedState,
          // Combine system prebuilts with user prebuilts
          prebuiltComponents: [...systemPrebuilts, ...userPrebuilts],
          instanceLinks: (persistedState.instanceLinks || []).map((link: any) => ({
            ...link,
            isMaster: link.isMaster ?? false, // Default to false for legacy links
            overrides: {
              ...link.overrides,
              styles: Object.fromEntries(
                Object.entries(link.overrides.styles || {}).map(([k, v]) => [
                  k,
                  new Set(v as string[]),
                ])
              ),
            },
          })),
        };
      },
    }
  )
);

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export const createLinkedInstance = (
  prebuiltId: string
): { instance: ComponentInstance; styleIdMapping: Record<string, string> } | null => {
  const prebuilt = useComponentInstanceStore.getState().getPrebuilt(prebuiltId);
  if (!prebuilt) return null;
  return createInstanceFromPrebuilt(prebuilt);
};

// Create a linked instance by cloning from an existing master on canvas
// This ensures all copies share the same style source IDs for instant sync
export const createLinkedInstanceFromMaster = (
  prebuiltId: string,
  masterInstanceId: string
): { instance: ComponentInstance; styleIdMapping: Record<string, string> } | null => {
  const { findInstance } = useBuilderStore.getState();
  const masterInstance = findInstance(masterInstanceId);
  if (!masterInstance) return null;
  
  const { getInstanceLink } = useComponentInstanceStore.getState();
  const masterLink = getInstanceLink(masterInstanceId);
  if (!masterLink) return null;
  
  // Clone instance with new IDs but REUSE the same style source IDs
  const styleIdMapping: Record<string, string> = {};
  
  const cloneWithNewIds = (inst: ComponentInstance): ComponentInstance => {
    const newId = generateId();
    
    // Reuse the same style source IDs (no mapping needed, they share styles)
    const styleSourceIds = [...(inst.styleSourceIds || [])];
    
    // Build the identity mapping for the link
    styleSourceIds.forEach(id => {
      styleIdMapping[id] = id;
    });
    
    return {
      ...inst,
      id: newId,
      styleSourceIds,
      props: { ...inst.props },
      children: (inst.children || []).map(cloneWithNewIds),
    };
  };
  
  return {
    instance: cloneWithNewIds(masterInstance),
    styleIdMapping,
  };
};

// ============================================================================
// STYLE CHANGE LISTENER (for master instance auto-sync)
// ============================================================================

// When we propagate changes programmatically, we must not re-trigger sync.
let isInternalPrebuiltPropagation = false;

// Debounce map to prevent excessive syncs
const styleSyncDebounce: Map<string, ReturnType<typeof setTimeout>> = new Map();

// Find which linked instance owns a given styleSourceId and return the linked root
const findLinkedRootForStyle = (styleSourceId: string): { instanceId: string; link: InstanceLink } | null => {
  const { instanceLinks } = useComponentInstanceStore.getState();
  const { findInstance } = useBuilderStore.getState();

  for (const link of instanceLinks) {
    const instance = findInstance(link.instanceId);
    if (!instance) continue;

    // Check if this style belongs to this linked instance
    const collectStyleIds = (inst: ComponentInstance): string[] => {
      const ids = [...(inst.styleSourceIds || [])];
      for (const child of inst.children || []) {
        ids.push(...collectStyleIds(child));
      }
      return ids;
    };

    const allStyleIds = collectStyleIds(instance);
    if (allStyleIds.includes(styleSourceId)) {
      return { instanceId: link.instanceId, link };
    }
  }

  return null;
};

// Handle style changes without causing propagation loops.
// NOTE: Styles may be shared across linked instances; we always sync from the current master.
const handleStyleChange = (styleSourceId: string) => {
  if (isInternalPrebuiltPropagation) return;

  const result = findLinkedRootForStyle(styleSourceId);
  if (!result) return;

  const { instanceId, link } = result;
  const { getMasterInstance, linkInstance, syncMasterToPrebuilt } = useComponentInstanceStore.getState();

  const master = getMasterInstance(link.prebuiltId);
  const syncFromInstanceId = master?.instanceId ?? instanceId;

  // Ensure there is a master so syncMasterToPrebuilt actually runs.
  if (!master) {
    linkInstance(instanceId, link.prebuiltId, link.styleIdMapping, true);
  }

  // Debounce per prebuilt to batch rapid style changes
  const debounceKey = link.prebuiltId;
  const existing = styleSyncDebounce.get(debounceKey);
  if (existing) clearTimeout(existing);

  styleSyncDebounce.set(
    debounceKey,
    setTimeout(() => {
      styleSyncDebounce.delete(debounceKey);
      syncMasterToPrebuilt(syncFromInstanceId);
    }, 150)
  );
};

// Register the callback
setStyleChangeCallback(handleStyleChange);
