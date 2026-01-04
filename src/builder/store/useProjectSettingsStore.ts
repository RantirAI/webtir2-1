import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BuilderTheme = 'default' | 'blue' | 'green' | 'red' | 'purple' | 'orange';

export type BuilderFont = 
  | 'instrument-sans'
  | 'figtree'
  | 'inter'
  | 'manrope'
  | 'plus-jakarta'
  | 'dm-sans'
  | 'space-grotesk'
  | 'outfit'
  | 'sora'
  | 'nunito'
  | 'poppins'
  | 'rubik'
  | 'work-sans'
  | 'urbanist'
  | 'lexend'
  | 'onest'
  | 'geist'
  | 'albert-sans'
  | 'red-hat'
  | 'satoshi'
  | 'general-sans';

export interface CustomComponent {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

interface ProjectSettingsStore {
  faviconUrl: string;
  builderTheme: BuilderTheme;
  builderFont: BuilderFont;
  customComponents: CustomComponent[];
  githubLibraryUrl: string;
  
  setFaviconUrl: (url: string) => void;
  setBuilderTheme: (theme: BuilderTheme) => void;
  setBuilderFont: (font: BuilderFont) => void;
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

export const builderFonts: Record<BuilderFont, { family: string; name: string }> = {
  'instrument-sans': { family: '"Instrument Sans", sans-serif', name: 'Instrument Sans' },
  'figtree': { family: '"Figtree", sans-serif', name: 'Figtree' },
  'inter': { family: '"Inter", sans-serif', name: 'Inter' },
  'manrope': { family: '"Manrope", sans-serif', name: 'Manrope' },
  'plus-jakarta': { family: '"Plus Jakarta Sans", sans-serif', name: 'Plus Jakarta Sans' },
  'dm-sans': { family: '"DM Sans", sans-serif', name: 'DM Sans' },
  'space-grotesk': { family: '"Space Grotesk", sans-serif', name: 'Space Grotesk' },
  'outfit': { family: '"Outfit", sans-serif', name: 'Outfit' },
  'sora': { family: '"Sora", sans-serif', name: 'Sora' },
  'nunito': { family: '"Nunito", sans-serif', name: 'Nunito' },
  'poppins': { family: '"Poppins", sans-serif', name: 'Poppins' },
  'rubik': { family: '"Rubik", sans-serif', name: 'Rubik' },
  'work-sans': { family: '"Work Sans", sans-serif', name: 'Work Sans' },
  'urbanist': { family: '"Urbanist", sans-serif', name: 'Urbanist' },
  'lexend': { family: '"Lexend", sans-serif', name: 'Lexend' },
  'onest': { family: '"Onest", sans-serif', name: 'Onest' },
  'geist': { family: '"Geist", sans-serif', name: 'Geist' },
  'albert-sans': { family: '"Albert Sans", sans-serif', name: 'Albert Sans' },
  'red-hat': { family: '"Red Hat Display", sans-serif', name: 'Red Hat Display' },
  'satoshi': { family: '"Satoshi", sans-serif', name: 'Satoshi' },
  'general-sans': { family: '"General Sans", sans-serif', name: 'General Sans' },
};

const applyBuilderFont = (font: BuilderFont) => {
  const root = document.documentElement;
  root.style.setProperty('--builder-font', builderFonts[font].family);
};

export const useProjectSettingsStore = create<ProjectSettingsStore>()(
  persist(
    (set) => ({
      faviconUrl: '',
      builderTheme: 'default',
      builderFont: 'instrument-sans',
      customComponents: [],
      githubLibraryUrl: '',
      
      setFaviconUrl: (url) => set({ faviconUrl: url }),
      
      setBuilderTheme: (theme) => {
        set({ builderTheme: theme });
        // Apply theme to CSS variables
        const root = document.documentElement;
        root.style.setProperty('--primary', themeColors[theme].primary);
      },
      
      setBuilderFont: (font) => {
        set({ builderFont: font });
        applyBuilderFont(font);
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
        // Apply saved font on load
        if (state?.builderFont) {
          applyBuilderFont(state.builderFont);
        }
      },
    }
  )
);
