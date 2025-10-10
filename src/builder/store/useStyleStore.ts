import { create } from 'zustand';
import { StyleStore, StyleSource, Breakpoint, StyleDeclaration } from './types';

const defaultBreakpoints: Breakpoint[] = [
  { id: 'base', label: 'Base' },
  { id: 'tablet', label: 'Tablet', maxWidth: 991 },
  { id: 'mobile', label: 'Mobile', maxWidth: 767 },
];

export const useStyleStore = create<StyleStore>((set, get) => ({
  styleSources: {},
  styles: {},
  breakpoints: defaultBreakpoints,
  currentBreakpointId: 'base',
  nameCounters: {},

  nextLocalClassName: (componentType: string) => {
    // Generate Webflow-style class names: div-block-1, button-base-1, text-block-1, etc.
    const typeMap: Record<string, string> = {
      'Box': 'div-block',
      'Container': 'container',
      'Section': 'section',
      'Text': 'text-block',
      'Heading': 'heading',
      'Button': 'button',
      'Image': 'image',
      'Link': 'link',
    };
    
    const base = typeMap[componentType] || componentType.toLowerCase();
    const count = (get().nameCounters[base] || 0) + 1;
    set((state) => ({ nameCounters: { ...state.nameCounters, [base]: count } }));
    return `${base}-${count}`;
  },

  createStyleSource: (type, name) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const styleSource: StyleSource = {
      id,
      type,
      name: name || `${type}-class`,
    };
    
    set((state) => ({
      styleSources: {
        ...state.styleSources,
        [id]: styleSource,
      },
    }));
    
    return id;
  },

  renameStyleSource: (id, newName) => {
    set((state) => ({
      styleSources: {
        ...state.styleSources,
        [id]: {
          ...state.styleSources[id],
          name: newName,
        },
      },
    }));
  },

  deleteStyleSource: (id) => {
    set((state) => {
      const { [id]: _, ...remainingStyleSources } = state.styleSources;
      
      // Remove all styles associated with this style source
      const remainingStyles = Object.fromEntries(
        Object.entries(state.styles).filter(([key]) => !key.startsWith(`${id}:`))
      );
      
      return {
        styleSources: remainingStyleSources,
        styles: remainingStyles,
      };
    });
  },

  setStyle: (styleSourceId, property, value, breakpointId) => {
    const currentBreakpoint = breakpointId || get().currentBreakpointId;
    const key = `${styleSourceId}:${currentBreakpoint}:${property}`;
    
    set((state) => ({
      styles: {
        ...state.styles,
        [key]: value,
      },
    }));
  },

  getComputedStyles: (styleSourceIds, breakpointId) => {
    const { styles, breakpoints, currentBreakpointId } = get();
    const targetBreakpoint = breakpointId || currentBreakpointId;
    const computed: StyleDeclaration = {} as any;
    
    // Get breakpoint cascade (base -> tablet -> mobile)
    const breakpointIndex = breakpoints.findIndex(bp => bp.id === targetBreakpoint);
    const cascadeBreakpoints = breakpoints.slice(0, breakpointIndex + 1).map(bp => bp.id);
    
    // Apply styles from each style source in order
    styleSourceIds.forEach(sourceId => {
      // Apply styles from base to current breakpoint
      cascadeBreakpoints.forEach(bpId => {
        const prefix = `${sourceId}:${bpId}:`;
        Object.entries(styles).forEach(([key, value]) => {
          if (key.startsWith(prefix)) {
            const property = key.replace(prefix, '');
            if (value) {
              (computed as any)[property] = value;
            }
          }
        });
      });
    });
    
    return computed;
  },

  setCurrentBreakpoint: (id) => {
    set({ currentBreakpointId: id });
  },

  setStyleMetadata: (styleSourceId, metadata) => {
    set((state) => ({
      styleSources: {
        ...state.styleSources,
        [styleSourceId]: {
          ...state.styleSources[styleSourceId],
          metadata: {
            ...state.styleSources[styleSourceId]?.metadata,
            ...metadata,
          },
        },
      },
    }));
  },

  getStyleMetadata: (styleSourceId) => {
    return get().styleSources[styleSourceId]?.metadata;
  },
}));
