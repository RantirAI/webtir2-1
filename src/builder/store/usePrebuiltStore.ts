import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComponentInstance, StyleSource } from './types';
import { useStyleStore } from './useStyleStore';

export interface PrebuiltComponent {
  id: string;
  name: string;
  instance: ComponentInstance;
  // Store the styles associated with this prebuilt component
  styles: Record<string, { source: StyleSource; styleValues: Record<string, string> }>;
  createdAt: number;
}

interface PrebuiltStore {
  prebuiltComponents: PrebuiltComponent[];
  prebuiltInstanceIds: string[]; // Array for better serialization
  
  addPrebuilt: (name: string, instance: ComponentInstance) => void;
  removePrebuilt: (id: string) => void;
  renamePrebuilt: (id: string, newName: string) => void;
  isPrebuiltInstance: (instanceId: string) => boolean;
  markAsPrebuilt: (instanceId: string) => void;
  unmarkAsPrebuilt: (instanceId: string) => void;
}

// Helper to collect all styleSourceIds from an instance and its children
const collectStyleSourceIds = (instance: ComponentInstance): string[] => {
  const ids: string[] = [...(instance.styleSourceIds || [])];
  for (const child of instance.children || []) {
    ids.push(...collectStyleSourceIds(child));
  }
  return ids;
};

export const usePrebuiltStore = create<PrebuiltStore>()(
  persist(
    (set, get) => ({
      prebuiltComponents: [],
      prebuiltInstanceIds: [],

      addPrebuilt: (name, instance) => {
        const styleStore = useStyleStore.getState();
        
        // Collect all styleSourceIds from the instance tree
        const allStyleSourceIds = collectStyleSourceIds(instance);
        const uniqueStyleSourceIds = [...new Set(allStyleSourceIds)];
        
        // Capture the styles for each styleSourceId
        const styles: PrebuiltComponent['styles'] = {};
        for (const styleId of uniqueStyleSourceIds) {
          const source = styleStore.styleSources[styleId];
          if (source) {
            // Get all style values for this source
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
        
        const newPrebuilt: PrebuiltComponent = {
          id: `prebuilt-${Date.now()}`,
          name,
          instance: JSON.parse(JSON.stringify(instance)), // Deep clone
          styles,
          createdAt: Date.now(),
        };
        
        set((state) => ({
          prebuiltComponents: [...state.prebuiltComponents, newPrebuilt],
          prebuiltInstanceIds: [...state.prebuiltInstanceIds, instance.id],
        }));
      },

      removePrebuilt: (id) => {
        set((state) => {
          const prebuilt = state.prebuiltComponents.find(p => p.id === id);
          let newInstanceIds = [...state.prebuiltInstanceIds];
          if (prebuilt) {
            newInstanceIds = newInstanceIds.filter(iid => iid !== prebuilt.instance.id);
          }
          return {
            prebuiltComponents: state.prebuiltComponents.filter(p => p.id !== id),
            prebuiltInstanceIds: newInstanceIds,
          };
        });
      },

      renamePrebuilt: (id, newName) => {
        set((state) => ({
          prebuiltComponents: state.prebuiltComponents.map(p =>
            p.id === id ? { ...p, name: newName } : p
          ),
        }));
      },

      isPrebuiltInstance: (instanceId) => {
        return get().prebuiltInstanceIds.includes(instanceId);
      },

      markAsPrebuilt: (instanceId) => {
        set((state) => {
          if (state.prebuiltInstanceIds.includes(instanceId)) {
            return state;
          }
          return {
            prebuiltInstanceIds: [...state.prebuiltInstanceIds, instanceId],
          };
        });
      },

      unmarkAsPrebuilt: (instanceId) => {
        set((state) => ({
          prebuiltInstanceIds: state.prebuiltInstanceIds.filter(id => id !== instanceId),
        }));
      },
    }),
    {
      name: 'prebuilt-components-storage',
    }
  )
);
