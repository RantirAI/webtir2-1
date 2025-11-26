import { create } from 'zustand';
import { ComponentInstance } from './types';

interface PageData {
  id: string;
  name: string;
  rootInstance: ComponentInstance;
}

interface PageStore {
  pages: Record<string, PageData>;
  currentPageId: string;
  
  addPage: (name: string, rootInstance: ComponentInstance) => string;
  updatePage: (id: string, updates: Partial<PageData>) => void;
  deletePage: (id: string) => void;
  setCurrentPage: (id: string) => void;
  getCurrentPage: () => PageData | null;
  getAllPages: () => PageData[];
}

export const usePageStore = create<PageStore>((set, get) => ({
  pages: {},
  currentPageId: '',
  
  addPage: (name, rootInstance) => {
    const id = `page-${Date.now()}`;
    set((state) => ({
      pages: {
        ...state.pages,
        [id]: { id, name, rootInstance },
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
}));
