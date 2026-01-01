import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'developer' | 'client';

interface RoleStore {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  isClient: () => boolean;
  isDeveloper: () => boolean;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set, get) => ({
      currentRole: 'developer',
      
      setRole: (role: UserRole) => set({ currentRole: role }),
      
      isClient: () => get().currentRole === 'client',
      
      isDeveloper: () => get().currentRole === 'developer',
    }),
    {
      name: 'builder-role-storage',
    }
  )
);
