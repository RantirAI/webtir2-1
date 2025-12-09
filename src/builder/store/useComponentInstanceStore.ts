import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComponentInstance, StyleSource } from './types';
import { useStyleStore } from './useStyleStore';
import { useBuilderStore } from './useBuilderStore';
import { generateId } from '../utils/instance';

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
}

export interface InstanceLink {
  instanceId: string;
  prebuiltId: string;
  styleIdMapping: Record<string, string>; // Maps prebuilt style IDs to instance style IDs
  overrides: InstanceOverrides;
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
  
  linkInstance: (instanceId: string, prebuiltId: string, styleIdMapping: Record<string, string>) => void;
  unlinkInstance: (instanceId: string) => void;
  getInstanceLink: (instanceId: string) => InstanceLink | undefined;
  getLinkedInstances: (prebuiltId: string) => InstanceLink[];
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
        const breakpoint = keyParts[0] || 'base';
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
      prebuiltComponents: [],
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

      linkInstance: (instanceId, prebuiltId, styleIdMapping) => {
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
        const { setStyle, styleSources } = useStyleStore.getState();
        const { findInstance, updateInstance } = useBuilderStore.getState();
        
        for (const link of linkedInstances) {
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
          
          // Update props (respecting overrides)
          const updatedProps: Record<string, any> = {};
          for (const [propKey, propValue] of Object.entries(prebuilt.instance.props)) {
            if (!link.overrides.props[propKey]) {
              updatedProps[propKey] = propValue;
            }
          }
          
          if (Object.keys(updatedProps).length > 0) {
            updateInstance(link.instanceId, {
              props: { ...canvasInstance.props, ...updatedProps },
            });
          }
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
        prebuiltComponents: state.prebuiltComponents,
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
        return {
          ...current,
          ...persistedState,
          instanceLinks: (persistedState.instanceLinks || []).map((link: any) => ({
            ...link,
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
