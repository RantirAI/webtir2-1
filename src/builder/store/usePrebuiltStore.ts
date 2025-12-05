import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ComponentInstance } from './types';

export interface PrebuiltComponent {
  id: string;
  name: string;
  instance: ComponentInstance;
  createdAt: number;
}

interface PrebuiltStore {
  prebuiltComponents: PrebuiltComponent[];
  prebuiltInstanceIds: Set<string>; // Track which instance IDs are prebuilt
  
  addPrebuilt: (name: string, instance: ComponentInstance) => void;
  removePrebuilt: (id: string) => void;
  renamePrebuilt: (id: string, newName: string) => void;
  isPrebuiltInstance: (instanceId: string) => boolean;
  markAsPrebuilt: (instanceId: string) => void;
  unmarkAsPrebuilt: (instanceId: string) => void;
}

export const usePrebuiltStore = create<PrebuiltStore>()(
  persist(
    (set, get) => ({
      prebuiltComponents: [],
      prebuiltInstanceIds: new Set<string>(),

      addPrebuilt: (name, instance) => {
        const newPrebuilt: PrebuiltComponent = {
          id: `prebuilt-${Date.now()}`,
          name,
          instance: JSON.parse(JSON.stringify(instance)), // Deep clone
          createdAt: Date.now(),
        };
        
        set((state) => ({
          prebuiltComponents: [...state.prebuiltComponents, newPrebuilt],
          prebuiltInstanceIds: new Set([...state.prebuiltInstanceIds, instance.id]),
        }));
      },

      removePrebuilt: (id) => {
        set((state) => {
          const prebuilt = state.prebuiltComponents.find(p => p.id === id);
          const newInstanceIds = new Set(state.prebuiltInstanceIds);
          if (prebuilt) {
            newInstanceIds.delete(prebuilt.instance.id);
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
        return get().prebuiltInstanceIds.has(instanceId);
      },

      markAsPrebuilt: (instanceId) => {
        set((state) => ({
          prebuiltInstanceIds: new Set([...state.prebuiltInstanceIds, instanceId]),
        }));
      },

      unmarkAsPrebuilt: (instanceId) => {
        set((state) => {
          const newSet = new Set(state.prebuiltInstanceIds);
          newSet.delete(instanceId);
          return { prebuiltInstanceIds: newSet };
        });
      },
    }),
    {
      name: 'prebuilt-components-storage',
      partialize: (state) => ({
        prebuiltComponents: state.prebuiltComponents,
        prebuiltInstanceIds: Array.from(state.prebuiltInstanceIds),
      }),
      merge: (persisted: any, current) => ({
        ...current,
        ...persisted,
        prebuiltInstanceIds: new Set(persisted?.prebuiltInstanceIds || []),
      }),
    }
  )
);
