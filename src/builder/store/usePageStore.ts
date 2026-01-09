import { create } from 'zustand';
import { ComponentInstance } from './types';

interface CustomCode {
  header: string;  // Code injected into <head>
  body: string;    // Code injected at start of <body>
  footer: string;  // Code injected at end of <body>
}

// Alias for backwards compatibility
type PageCustomCode = CustomCode;

interface GlobalComponents {
  header: ComponentInstance | null;
  footer: ComponentInstance | null;
}

interface PageData {
  id: string;
  name: string;
  rootInstance: ComponentInstance;
  customCode: PageCustomCode;
}

interface PageStore {
  pages: Record<string, PageData>;
  currentPageId: string;
  projectCustomCode: CustomCode; // Universal code for all pages
  globalComponents: GlobalComponents; // Shared header/footer across all pages
  
  addPage: (name: string, rootInstance: ComponentInstance) => string;
  updatePage: (id: string, updates: Partial<PageData>) => void;
  deletePage: (id: string) => void;
  setCurrentPage: (id: string) => void;
  getCurrentPage: () => PageData | null;
  getAllPages: () => PageData[];
  updatePageCustomCode: (id: string, section: keyof PageCustomCode, code: string) => void;
  getPageCustomCode: (id: string) => PageCustomCode;
  updateProjectCustomCode: (section: keyof CustomCode, code: string) => void;
  getProjectCustomCode: () => CustomCode;
  setGlobalComponent: (slot: 'header' | 'footer', instance: ComponentInstance | null) => void;
  getGlobalComponent: (slot: 'header' | 'footer') => ComponentInstance | null;
  getGlobalComponents: () => GlobalComponents;
}

// Create initial page
const initialRoot: ComponentInstance = {
  id: 'root',
  type: 'Div',
  label: 'Body',
  props: {},
  styleSourceIds: ['root-style'],
  children: [],
};

const initialPageId = 'page-1';
const defaultCustomCode: PageCustomCode = { header: '', body: '', footer: '' };

export const usePageStore = create<PageStore>((set, get) => ({
  pages: {
    [initialPageId]: {
      id: initialPageId,
      name: 'Page 1',
      rootInstance: initialRoot,
      customCode: { ...defaultCustomCode },
    },
  },
  currentPageId: initialPageId,
  projectCustomCode: { ...defaultCustomCode },
  globalComponents: {
    header: null,
    footer: null,
  },
  
  addPage: (name, rootInstance) => {
    const state = get();
    const existingPageCount = Object.keys(state.pages).length;
    const id = `page-${existingPageCount + 1}`;
    set((state) => ({
      pages: {
        ...state.pages,
        [id]: { id, name, rootInstance, customCode: { ...defaultCustomCode } },
      },
    }));
    return id;
  },
  
  updatePage: (id, updates) => {
    set((state) => ({
      pages: {
        ...state.pages,
        [id]: { ...state.pages[id], ...updates },
      },
    }));
  },
  
  deletePage: (id) => {
    set((state) => {
      const newPages = { ...state.pages };
      delete newPages[id];
      return { pages: newPages };
    });
  },
  
  setCurrentPage: (id) => {
    set({ currentPageId: id });
  },
  
  getCurrentPage: () => {
    const state = get();
    return state.pages[state.currentPageId] || null;
  },
  
  getAllPages: () => {
    const state = get();
    return Object.values(state.pages);
  },
  
  updatePageCustomCode: (id, section, code) => {
    set((state) => {
      const page = state.pages[id];
      if (!page) return state;
      return {
        pages: {
          ...state.pages,
          [id]: {
            ...page,
            customCode: {
              ...page.customCode,
              [section]: code,
            },
          },
        },
      };
    });
  },
  
  getPageCustomCode: (id) => {
    const state = get();
    return state.pages[id]?.customCode || { ...defaultCustomCode };
  },
  
  updateProjectCustomCode: (section, code) => {
    set((state) => ({
      projectCustomCode: {
        ...state.projectCustomCode,
        [section]: code,
      },
    }));
  },
  
  getProjectCustomCode: () => {
    return get().projectCustomCode;
  },
  
  setGlobalComponent: (slot, instance) => {
    set((state) => ({
      globalComponents: {
        ...state.globalComponents,
        [slot]: instance,
      },
    }));
  },
  
  getGlobalComponent: (slot) => {
    return get().globalComponents[slot];
  },
  
  getGlobalComponents: () => {
    return get().globalComponents;
  },
}));
