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
  
  // Isolation mode for editing components
  isolatedInstanceId: null,
  
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
  
  updateInstance: (id, updates, options) => {
    set((state) => {
      const newRoot = JSON.parse(JSON.stringify(state.rootInstance)) as ComponentInstance;
      const instance = findInstanceInTree(newRoot, id);

      if (!instance) return state;

      Object.assign(instance, updates);

      return { rootInstance: newRoot, ...saveToHistory({ ...state, rootInstance: newRoot }) };
    });

    // Internal updates (e.g. prebuilt propagation) should not trigger auto-sync.
    if (options?.skipPrebuiltSync) return;

    // Auto-sync: if the edited instance is inside any linked prebuilt subtree, promote that to master and sync
    setTimeout(() => {
      const { instanceLinks, syncMasterToPrebuilt, getInstanceLink } = useComponentInstanceStore.getState();
      const root = useBuilderStore.getState().rootInstance;
      if (!root) return;

      // Helper to find the linked root that contains the edited instance
      const findLinkedRootContaining = (editedId: string): string | null => {
        for (const link of instanceLinks) {
          const linkedRoot = findInstanceInTree(root, link.instanceId);
          if (!linkedRoot) continue;
          // Check if editedId is the linked root or is inside it
          if (link.instanceId === editedId || findInstanceInTree(linkedRoot, editedId)) {
            return link.instanceId;
          }
        }
        return null;
      };

      const linkedRootId = findLinkedRootContaining(id);
      if (!linkedRootId) return;

      const link = getInstanceLink(linkedRootId);
      if (!link) return;

      // If this linked instance is not already the master, promote it to master
      if (!link.isMaster) {
        // Demote the current master (if any)
        const currentMasterLink = instanceLinks.find((l) => l.prebuiltId === link.prebuiltId && l.isMaster);
        if (currentMasterLink) {
          useComponentInstanceStore.setState((state) => ({
            instanceLinks: state.instanceLinks.map((l) =>
              l.instanceId === currentMasterLink.instanceId ? { ...l, isMaster: false } : l
            ),
          }));
        }
        // Promote this one
        useComponentInstanceStore.setState((state) => ({
          instanceLinks: state.instanceLinks.map((l) => (l.instanceId === linkedRootId ? { ...l, isMaster: true } : l)),
        }));
      }

      // Now sync the master to prebuilt
      syncMasterToPrebuilt(linkedRootId);
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
  
  // Isolation mode actions
  enterIsolationMode: (instanceId) => {
    set({ isolatedInstanceId: instanceId, selectedInstanceId: instanceId });
  },
  
  exitIsolationMode: () => {
    set({ isolatedInstanceId: null });
  },
  
  getIsolatedInstance: () => {
    const state = get();
    if (!state.isolatedInstanceId) return null;
    return state.findInstance(state.isolatedInstanceId);
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
