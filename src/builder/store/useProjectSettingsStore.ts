import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BuilderTheme = 'default' | 'blue' | 'green' | 'red' | 'purple' | 'orange';

export interface CustomComponent {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

interface ProjectSettingsStore {
  faviconUrl: string;
  builderTheme: BuilderTheme;
  customComponents: CustomComponent[];
  githubLibraryUrl: string;
  
  setFaviconUrl: (url: string) => void;
  setBuilderTheme: (theme: BuilderTheme) => void;
  addCustomComponent: (component: Omit<CustomComponent, 'id' | 'createdAt'>) => void;
  removeCustomComponent: (id: string) => void;
  setGithubLibraryUrl: (url: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const themeColors: Record<BuilderTheme, { primary: string; name: string }> = {
  default: { primary: '0 0% 9%', name: 'Dark' },
  blue: { primary: '217 91% 60%', name: 'Blue' },
  green: { primary: '142 71% 45%', name: 'Green' },
  red: { primary: '0 84% 60%', name: 'Red' },
  purple: { primary: '271 81% 56%', name: 'Purple' },
  orange: { primary: '25 95% 53%', name: 'Orange' },
};

export const useProjectSettingsStore = create<ProjectSettingsStore>()(
  persist(
    (set) => ({
      faviconUrl: '',
      builderTheme: 'default',
      customComponents: [],
      githubLibraryUrl: '',
      
      setFaviconUrl: (url) => set({ faviconUrl: url }),
      
      setBuilderTheme: (theme) => {
        set({ builderTheme: theme });
        // Apply theme to CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary', themeColors[theme].primary);
      },
      
      addCustomComponent: (component) => {
        const id = generateId();
        set((state) => ({
          customComponents: [
            ...state.customComponents,
            { ...component, id, createdAt: new Date().toISOString() },
          ],
        }));
      },
      
      removeCustomComponent: (id) => {
        set((state) => ({
          customComponents: state.customComponents.filter((c) => c.id !== id),
        }));
      },
      
      setGithubLibraryUrl: (url) => set({ githubLibraryUrl: url }),
    }),
    {
      name: 'builder-project-settings',
      onRehydrateStorage: () => (state) => {
        // Apply saved theme on load
        if (state?.builderTheme) {
          const root = document.documentElement;
          root.style.setProperty('--primary', themeColors[state.builderTheme].primary);
        }
      },
    }
  )
);
