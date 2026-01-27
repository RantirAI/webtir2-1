import { create } from 'zustand';
import { StyleStore, StyleSource, Breakpoint, StyleDeclaration, PseudoState } from './types';
import { 
  generateAutoClassName, 
  previewNextClassName, 
  AutoClassConfig
} from '../utils/autoClassSystem';

// Callback for notifying about style changes (set by useComponentInstanceStore)
let styleChangeCallback: ((styleSourceId: string) => void) | null = null;

export const setStyleChangeCallback = (callback: ((styleSourceId: string) => void) | null) => {
  styleChangeCallback = callback;
};

const defaultBreakpoints: Breakpoint[] = [
  { id: 'desktop', label: 'Desktop' },
  { id: 'tablet', label: 'Tablet', maxWidth: 991 },
  { id: 'mobile-landscape', label: 'Mobile L', maxWidth: 767 },
  { id: 'mobile', label: 'Mobile', maxWidth: 479 },
];

export const useStyleStore = create<StyleStore>((set, get) => ({
  styleSources: {},
  styles: {},
  breakpoints: defaultBreakpoints,
  currentBreakpointId: 'desktop',
  currentPseudoState: 'default',
  nameCounters: {}, // Kept for backwards compatibility but not used for index calculation
  classDependencies: {}, // Track which classes depend on which: { classId: [dependentClassId1, dependentClassId2] }
  autoClassConfig: {
    startIndex: 1,
    padding: 0,
    separator: '-',
    noneFirst: false,
  },
  rawCssOverrides: '', // CSS rules that can't be parsed into style sources (element selectors, complex selectors, etc.)

  // Set raw CSS overrides (element selectors, complex selectors, etc.)
  setRawCssOverrides: (css: string) => {
    set({ rawCssOverrides: css });
  },

  // Clear raw CSS overrides
  clearRawCssOverrides: () => {
    set({ rawCssOverrides: '' });
  },

  // Legacy method - kept for backward compatibility
  nextLocalClassName: (componentType: string) => {
    return get().getNextAutoClassName(componentType);
  },

  // Get next auto-class name - always scans existing classes to find max+1
  getNextAutoClassName: (componentType: string) => {
    const { styleSources, autoClassConfig } = get();
    
    // Get all existing class names - this is the source of truth
    const existingNames = new Set(
      Object.values(styleSources)
        .filter(s => s.type === 'local')
        .map(s => s.name)
    );
    
    // Generate name by scanning existing classes (maxIndex + 1)
    const result = generateAutoClassName(
      componentType,
      existingNames,
      autoClassConfig
    );
    
    return result.name;
  },

  // Preview next auto-class name without side effects - always scans existing classes
  previewNextAutoClassName: (componentType: string) => {
    const { styleSources, autoClassConfig } = get();
    
    const existingNames = new Set(
      Object.values(styleSources)
        .filter(s => s.type === 'local')
        .map(s => s.name)
    );
    
    // Always compute by scanning - never rely on counter
    return previewNextClassName(
      componentType,
      existingNames,
      autoClassConfig
    );
  },

  // Update auto-class configuration
  setAutoClassConfig: (config: Partial<AutoClassConfig>) => {
    set((state) => ({
      autoClassConfig: { ...state.autoClassConfig, ...config }
    }));
  },

  // Initialize counters from existing class registry (kept for backwards compatibility)
  initCountersFromRegistry: () => {
    // No-op - we now always scan existing classes instead of relying on counters
  },

  createStyleSource: (type, name) => {
    const className = name || `${type}-class`;
    // Use the class name as the ID for easier debugging and consistency
    // If the name already exists, add a unique suffix
    let id = className;
    let counter = 1;
    const state = get();
    while (state.styleSources[id]) {
      id = `${className}-${counter}`;
      counter++;
    }
    
    const styleSource: StyleSource = {
      id,
      type,
      name: className,
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
    // Validate and sanitize class name to be framework-safe
    const safeName = newName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    
    // Only rename the specified class - no gap-filling or renumbering of other classes
    // The "next" counter automatically adjusts by scanning existing classes
    set((state) => ({
      styleSources: {
        ...state.styleSources,
        [id]: {
          ...state.styleSources[id],
          name: safeName,
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

  setStyle: (styleSourceId, property, value, breakpointId, state) => {
    const currentBreakpoint = breakpointId || get().currentBreakpointId;
    const currentState = state || get().currentPseudoState;
    const key = `${styleSourceId}:${currentBreakpoint}:${currentState}:${property}`;
    
    set((prevState) => ({
      styles: {
        ...prevState.styles,
        [key]: value,
      },
    }));
    
    // Notify about style change for master instance propagation
    if (styleChangeCallback) {
      styleChangeCallback(styleSourceId);
    }
  },

  getComputedStyles: (styleSourceIds, breakpointId, state) => {
    const { styles, breakpoints, currentBreakpointId, currentPseudoState } = get();
    const targetBreakpoint = breakpointId || currentBreakpointId;
    const targetState = state || currentPseudoState;
    const computed: StyleDeclaration = {} as any;
    
    // Get breakpoint cascade (base -> tablet -> mobile)
    const breakpointIndex = breakpoints.findIndex(bp => bp.id === targetBreakpoint);
    const cascadeBreakpoints = breakpoints.slice(0, breakpointIndex + 1).map(bp => bp.id);
    
    // State cascade: default -> hover/focus/active/visited
    const stateCascade: PseudoState[] = targetState === 'default' ? ['default'] : ['default', targetState];
    
    // Apply styles from each style source in order
    styleSourceIds.forEach(sourceId => {
      // Apply styles from base to current breakpoint
      cascadeBreakpoints.forEach(bpId => {
        // Apply default state first, then target state (cascade)
        stateCascade.forEach(stateId => {
          const prefix = `${sourceId}:${bpId}:${stateId}:`;
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
    });
    
    return computed;
  },

  setCurrentBreakpoint: (id) => {
    set({ currentBreakpointId: id });
  },

  setCurrentPseudoState: (state) => {
    set({ currentPseudoState: state });
  },

  resetStyles: (styleSourceId, breakpointId, state) => {
    const currentBreakpoint = breakpointId || get().currentBreakpointId;
    const currentState = state || get().currentPseudoState;
    const prefix = `${styleSourceId}:${currentBreakpoint}:${currentState}:`;
    
    set((prevState) => {
      const newStyles = { ...prevState.styles };
      Object.keys(newStyles).forEach(key => {
        if (key.startsWith(prefix)) {
          delete newStyles[key];
        }
      });
      return { styles: newStyles };
    });
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

  // Dependency tracking for class inheritance
  setClassDependency: (baseClassId: string, dependentClassId: string) => {
    set((state) => {
      const currentDependents = state.classDependencies[baseClassId] || [];
      if (!currentDependents.includes(dependentClassId)) {
        return {
          classDependencies: {
            ...state.classDependencies,
            [baseClassId]: [...currentDependents, dependentClassId],
          },
        };
      }
      return state;
    });
  },

  removeClassDependency: (baseClassId: string, dependentClassId: string) => {
    set((state) => {
      const currentDependents = state.classDependencies[baseClassId] || [];
      const filtered = currentDependents.filter(id => id !== dependentClassId);
      
      if (filtered.length === 0) {
        const { [baseClassId]: _, ...remaining } = state.classDependencies;
        return { classDependencies: remaining };
      }
      
      return {
        classDependencies: {
          ...state.classDependencies,
          [baseClassId]: filtered,
        },
      };
    });
  },

  isClassEditable: (classId: string) => {
    const { classDependencies } = get();
    const dependents = classDependencies[classId] || [];
    return dependents.length === 0;
  },

  getClassDependents: (classId: string) => {
    return get().classDependencies[classId] || [];
  },

  // Get property state for a specific class (not cascaded)
  getPropertyState: (styleSourceId: string, property: string, breakpointId?: string, state?: PseudoState) => {
    const { styles, currentBreakpointId, currentPseudoState } = get();
    const targetBreakpoint = breakpointId || currentBreakpointId;
    const targetState = state || currentPseudoState;
    const key = `${styleSourceId}:${targetBreakpoint}:${targetState}:${property}`;
    
    return styles[key];
  },

  // Get property source with breakpoint awareness - distinguishes explicit vs inherited from larger breakpoint
  getPropertySourceForBreakpoint: (
    styleSourceId: string, 
    property: string, 
    targetBreakpoint?: string,
    targetState?: PseudoState
  ): { 
    source: 'explicit' | 'breakpoint-inherited' | 'none';
    inheritedFrom?: string; // breakpoint ID if inherited
    value?: string;
  } => {
    const { styles, breakpoints, currentBreakpointId, currentPseudoState } = get();
    const bp = targetBreakpoint || currentBreakpointId;
    const ps = targetState || currentPseudoState;
    
    // Check if explicitly set at this breakpoint
    const key = `${styleSourceId}:${bp}:${ps}:${property}`;
    if (styles[key] !== undefined && styles[key] !== '') {
      return { source: 'explicit', value: styles[key] };
    }
    
    // Check if inherited from a larger breakpoint (cascade up)
    const bpIndex = breakpoints.findIndex(b => b.id === bp);
    for (let i = bpIndex - 1; i >= 0; i--) {
      const parentBp = breakpoints[i].id;
      const parentKey = `${styleSourceId}:${parentBp}:${ps}:${property}`;
      if (styles[parentKey] !== undefined && styles[parentKey] !== '') {
        return { source: 'breakpoint-inherited', inheritedFrom: parentBp, value: styles[parentKey] };
      }
    }
    
    return { source: 'none' };
  },

  // Clear a breakpoint-specific override (restore inheritance from larger breakpoint)
  clearBreakpointOverride: (styleSourceId: string, property: string, breakpointId?: string, state?: PseudoState) => {
    const bp = breakpointId || get().currentBreakpointId;
    const ps = state || get().currentPseudoState;
    
    // Can't clear desktop - it's the base
    if (bp === 'desktop') return;
    
    const key = `${styleSourceId}:${bp}:${ps}:${property}`;
    set((prevState) => {
      const newStyles = { ...prevState.styles };
      delete newStyles[key];
      return { styles: newStyles };
    });
  },

  // Count breakpoint overrides for a style source at current breakpoint
  countBreakpointOverrides: (styleSourceId: string, breakpointId?: string, state?: PseudoState): number => {
    const { styles, currentBreakpointId, currentPseudoState } = get();
    const bp = breakpointId || currentBreakpointId;
    const ps = state || currentPseudoState;
    
    if (bp === 'desktop') return 0; // Desktop is base, no overrides
    
    const prefix = `${styleSourceId}:${bp}:${ps}:`;
    return Object.keys(styles).filter(key => key.startsWith(prefix) && styles[key] !== '').length;
  },

  // Clear all breakpoint overrides for a style source
  clearAllBreakpointOverrides: (styleSourceId: string, breakpointId?: string, state?: PseudoState) => {
    const bp = breakpointId || get().currentBreakpointId;
    const ps = state || get().currentPseudoState;
    
    if (bp === 'desktop') return; // Can't clear desktop
    
    const prefix = `${styleSourceId}:${bp}:${ps}:`;
    set((prevState) => {
      const newStyles = { ...prevState.styles };
      Object.keys(newStyles).forEach(key => {
        if (key.startsWith(prefix)) {
          delete newStyles[key];
        }
      });
      return { styles: newStyles };
    });
  },

  // Batch create multiple style sources at once (for import performance)
  batchCreateStyleSources: (sources: Array<{ type: string; name: string }>): string[] => {
    const ids: string[] = [];
    set((state) => {
      const newSources = { ...state.styleSources };
      for (const { type, name } of sources) {
        const className = name || `${type}-class`;
        let id = className;
        let counter = 1;
        while (newSources[id]) {
          id = `${className}-${counter}`;
          counter++;
        }
        newSources[id] = { id, type: type as any, name: className };
        ids.push(id);
      }
      return { styleSources: newSources };
    });
    return ids;
  },

  // Batch set multiple styles at once (for import performance)
  batchSetStyles: (updates: Array<{
    styleSourceId: string;
    property: string;
    value: string;
    breakpointId?: string;
    state?: PseudoState;
  }>) => {
    set((prevState) => {
      const newStyles = { ...prevState.styles };
      const currentBreakpoint = get().currentBreakpointId;
      const currentPseudo = get().currentPseudoState;
      
      for (const { styleSourceId, property, value, breakpointId, state } of updates) {
        const bp = breakpointId || currentBreakpoint;
        const ps = state || currentPseudo;
        const key = `${styleSourceId}:${bp}:${ps}:${property}`;
        newStyles[key] = value;
      }
      return { styles: newStyles };
    });
  },
}));
