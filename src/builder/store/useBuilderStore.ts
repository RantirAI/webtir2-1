import { create } from 'zustand';
import { BuilderState, ComponentInstance } from './types';
import { generateId } from '../utils/instance';
import { useComponentInstanceStore } from './useComponentInstanceStore';
import { duplicateInstanceWithLinkage, applyDuplicationLinks } from '../utils/duplication';

// Initialize root style source
const initRootStyle = () => {
  // Lazy import to avoid circular dependency
  import('./useStyleStore').then(({ useStyleStore }) => {
    const { createStyleSource, setStyle, styleSources } = useStyleStore.getState();
    
    if (!styleSources['root-style']) {
      const id = createStyleSource('local', 'root-style');
      // Ensure the ID is 'root-style'
      if (id !== 'root-style') {
        // Update to use the correct ID
        const store = useStyleStore.getState();
        store.styleSources['root-style'] = store.styleSources[id];
        delete store.styleSources[id];
      }
      
      setStyle('root-style', 'backgroundColor', '#ffffff');
    }
  });
};

// Call on module load
setTimeout(initRootStyle, 0);

// Initialize history after a brief delay to capture initial state
setTimeout(() => {
  const state = useBuilderStore.getState();
  if (state.history.length === 0 && state.rootInstance) {
    useBuilderStore.setState({
      history: [JSON.parse(JSON.stringify(state.rootInstance))],
      historyIndex: 0,
    });
  }
}, 100);

const MAX_HISTORY = 50;

const saveToHistory = (state: BuilderState) => {
  if (!state.rootInstance) return state;
  
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.rootInstance)));
  
  // Limit history size
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
  } else {
    return {
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  }
  
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  rootInstance: {
    id: 'root',
    type: 'Div',
    label: 'Body',
    props: {},
    styleSourceIds: ['root-style'],
    children: [],
  },
  
  selectedInstanceId: null,
  hoveredInstanceId: null,
  
  history: [],
  historyIndex: -1,
  clipboard: null,
  
  addInstance: (instance, parentId, index) => {
    set((state) => {
      const newRoot = JSON.parse(JSON.stringify(state.rootInstance)) as ComponentInstance;
      const parent = parentId ? findInstanceInTree(newRoot, parentId) : newRoot;
      
      if (!parent) return state;
      
      const newInstance = {
        ...instance,
        id: instance.id || generateId(),
      };
      
      if (index !== undefined) {
        parent.children.splice(index, 0, newInstance);
      } else {
        parent.children.push(newInstance);
      }
      
      return { rootInstance: newRoot, ...saveToHistory({ ...state, rootInstance: newRoot }) };
    });
  },
  
  updateInstance: (id, updates) => {
    set((state) => {
      const newRoot = JSON.parse(JSON.stringify(state.rootInstance)) as ComponentInstance;
      const instance = findInstanceInTree(newRoot, id);
      
      if (!instance) return state;
      
      Object.assign(instance, updates);
      
      return { rootInstance: newRoot, ...saveToHistory({ ...state, rootInstance: newRoot }) };
    });
    
    // Auto-sync if this is a master instance
    setTimeout(() => {
      const { isMasterInstance, syncMasterToPrebuilt } = useComponentInstanceStore.getState();
      if (isMasterInstance(id)) {
        syncMasterToPrebuilt(id);
      }
    }, 0);
  },
  
  deleteInstance: (id) => {
    set((state) => {
      const newRoot = JSON.parse(JSON.stringify(state.rootInstance)) as ComponentInstance;
      removeInstanceFromTree(newRoot, id);
      
      return {
        rootInstance: newRoot,
        selectedInstanceId: state.selectedInstanceId === id ? null : state.selectedInstanceId,
        ...saveToHistory({ ...state, rootInstance: newRoot }),
      };
    });
  },
  
  setSelectedInstanceId: (id) => set({ selectedInstanceId: id }),
  
  setHoveredInstanceId: (id) => set({ hoveredInstanceId: id }),
  
  setRootInstance: (instance) => {
    set({ 
      rootInstance: instance,
      selectedInstanceId: null,
    });
  },
  
  moveInstance: (instanceId, newParentId, index) => {
    set((state) => {
      const newRoot = JSON.parse(JSON.stringify(state.rootInstance)) as ComponentInstance;
      
      // Find and remove instance from its current parent
      const instance = findInstanceInTree(newRoot, instanceId);
      if (!instance) return state;
      
      const instanceCopy = JSON.parse(JSON.stringify(instance));
      removeInstanceFromTree(newRoot, instanceId);
      
      // Add to new parent at specified index
      const newParent = findInstanceInTree(newRoot, newParentId);
      if (!newParent) return state;
      
      newParent.children.splice(index, 0, instanceCopy);
      
      return { rootInstance: newRoot, ...saveToHistory({ ...state, rootInstance: newRoot }) };
    });
  },
  
  undo: () => {
    set((state) => {
      if (state.historyIndex <= 0) return state;
      
      const newIndex = state.historyIndex - 1;
      const rootInstance = JSON.parse(JSON.stringify(state.history[newIndex])) as ComponentInstance;
      
      return {
        rootInstance,
        historyIndex: newIndex,
        selectedInstanceId: null,
      };
    });
  },
  
  redo: () => {
    set((state) => {
      if (state.historyIndex >= state.history.length - 1) return state;
      
      const newIndex = state.historyIndex + 1;
      const rootInstance = JSON.parse(JSON.stringify(state.history[newIndex])) as ComponentInstance;
      
      return {
        rootInstance,
        historyIndex: newIndex,
        selectedInstanceId: null,
      };
    });
  },
  
  copySelected: () => {
    const state = get();
    const selected = state.getSelectedInstance();
    if (selected && selected.id !== 'root') {
      set({ 
        clipboard: {
          instance: JSON.parse(JSON.stringify(selected)),
        }
      });
    }
  },
  
  cutSelected: () => {
    const state = get();
    const selected = state.getSelectedInstance();
    if (selected && selected.id !== 'root') {
      set({ 
        clipboard: {
          instance: JSON.parse(JSON.stringify(selected)),
        }
      });
      state.deleteInstance(selected.id);
    }
  },
  
  pasteClipboard: () => {
    const state = get();
    if (!state.clipboard) return;
    
    // Paste into selected container or root
    const selectedInstance = state.getSelectedInstance();
    const parentId = selectedInstance && 
                     (selectedInstance.type === 'Div' || 
                      selectedInstance.type === 'Container' || 
                      selectedInstance.type === 'Section')
      ? selectedInstance.id
      : 'root';
    
    // Use unified duplication that preserves all nested component linkages
    const { instance: newInstance, links } = duplicateInstanceWithLinkage(state.clipboard.instance);
    state.addInstance(newInstance, parentId);
    // Apply linkage to all nested linked components
    applyDuplicationLinks(links);
  },
  
  findInstance: (id) => {
    const state = get();
    if (!state.rootInstance) return null;
    return findInstanceInTree(state.rootInstance, id);
  },
  
  getSelectedInstance: () => {
    const state = get();
    if (!state.selectedInstanceId) return null;
    return state.findInstance(state.selectedInstanceId);
  },
}));

// Helper functions
function findInstanceInTree(tree: ComponentInstance, id: string): ComponentInstance | null {
  if (tree.id === id) return tree;
  
  for (const child of tree.children) {
    const found = findInstanceInTree(child, id);
    if (found) return found;
  }
  
  return null;
}

function removeInstanceFromTree(tree: ComponentInstance, id: string): boolean {
  const index = tree.children.findIndex((child) => child.id === id);
  
  if (index !== -1) {
    tree.children.splice(index, 1);
    return true;
  }
  
  for (const child of tree.children) {
    if (removeInstanceFromTree(child, id)) {
      return true;
    }
  }
  
  return false;
}
