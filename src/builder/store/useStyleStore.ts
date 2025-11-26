import { create } from 'zustand';
import { StyleStore, StyleSource, Breakpoint, StyleDeclaration, PseudoState } from './types';
import { 
  generateAutoClassName, 
  previewNextClassName, 
  normalizeComponentBase,
  initializeCountersFromRegistry,
  AutoClassConfig
} from '../utils/autoClassSystem';

const defaultBreakpoints: Breakpoint[] = [
  { id: 'base', label: 'Base' },
  { id: 'tablet', label: 'Tablet', maxWidth: 991 },
  { id: 'mobile', label: 'Mobile', maxWidth: 767 },
];

// Initialize counters from existing classes on first use
let countersInitialized = false;

export const useStyleStore = create<StyleStore>((set, get) => ({
  styleSources: {},
  styles: {},
  breakpoints: defaultBreakpoints,
  currentBreakpointId: 'base',
  currentPseudoState: 'default',
  nameCounters: {},
  classDependencies: {}, // Track which classes depend on which: { classId: [dependentClassId1, dependentClassId2] }
  autoClassConfig: {
    startIndex: 1,
    padding: 0,
    separator: '-',
    noneFirst: false,
  },

  // Legacy method - kept for backward compatibility
  nextLocalClassName: (componentType: string) => {
    return get().getNextAutoClassName(componentType);
  },

  // Get next auto-class name and persist counter
  getNextAutoClassName: (componentType: string) => {
    // Ensure counters are initialized from existing classes
    if (!countersInitialized) {
      get().initCountersFromRegistry();
    }
    
    const { nameCounters, styleSources, autoClassConfig } = get();
    const base = normalizeComponentBase(componentType);
    const currentCounter = nameCounters[base] || autoClassConfig.startIndex || 1;
    
    // Get all existing class names
    const existingNames = new Set(
      Object.values(styleSources)
        .filter(s => s.type === 'local')
        .map(s => s.name)
    );
    
    const result = generateAutoClassName(
      componentType,
      existingNames,
      currentCounter,
      autoClassConfig
    );
    
    // Update counter
    const newCounter = result.index !== null ? result.index + 1 : currentCounter + 1;
    set((state) => ({ 
      nameCounters: { ...state.nameCounters, [base]: newCounter } 
    }));
    
    return result.name;
  },

  // Preview next auto-class name without persisting
  previewNextAutoClassName: (componentType: string) => {
    const { nameCounters, styleSources, autoClassConfig } = get();
    const base = normalizeComponentBase(componentType);
    const currentCounter = nameCounters[base] || autoClassConfig.startIndex || 1;
    
    const existingNames = new Set(
      Object.values(styleSources)
        .filter(s => s.type === 'local')
        .map(s => s.name)
    );
    
    return previewNextClassName(
      componentType,
      existingNames,
      currentCounter,
      autoClassConfig
    );
  },

  // Update auto-class configuration
  setAutoClassConfig: (config: Partial<AutoClassConfig>) => {
    set((state) => ({
      autoClassConfig: { ...state.autoClassConfig, ...config }
    }));
  },

  // Initialize counters from existing class registry
  initCountersFromRegistry: () => {
    const { styleSources, autoClassConfig } = get();
    const existingNames = Object.values(styleSources)
      .filter(s => s.type === 'local')
      .map(s => s.name);
    
    const initializedCounters = initializeCountersFromRegistry(existingNames, autoClassConfig);
    
    set({ nameCounters: initializedCounters });
    countersInitialized = true;
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
}));
