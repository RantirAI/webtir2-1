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
  prebuiltInstanceIds: string[]; // Array for better serialization
  
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
      prebuiltInstanceIds: [],

      addPrebuilt: (name, instance) => {
        const newPrebuilt: PrebuiltComponent = {
          id: `prebuilt-${Date.now()}`,
          name,
          instance: JSON.parse(JSON.stringify(instance)), // Deep clone
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
