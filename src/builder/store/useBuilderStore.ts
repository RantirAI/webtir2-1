import { create } from 'zustand';
import { BuilderState, ComponentInstance } from './types';
import { generateId } from '../utils/instance';

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
      
      setStyle('root-style', 'display', 'flex');
      setStyle('root-style', 'flexDirection', 'column');
      setStyle('root-style', 'minHeight', '100vh');
    }
  });
};

// Call on module load
setTimeout(initRootStyle, 0);

export const useBuilderStore = create<BuilderState>((set, get) => ({
  rootInstance: {
    id: 'root',
    type: 'Box',
    label: 'Body',
    props: {},
    styleSourceIds: ['root-style'],
    children: [],
  },
  
  selectedInstanceId: null,
  hoveredInstanceId: null,
  
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
      
      return { rootInstance: newRoot };
    });
  },
  
  updateInstance: (id, updates) => {
    set((state) => {
      const newRoot = JSON.parse(JSON.stringify(state.rootInstance)) as ComponentInstance;
      const instance = findInstanceInTree(newRoot, id);
      
      if (!instance) return state;
      
      Object.assign(instance, updates);
      
      return { rootInstance: newRoot };
    });
  },
  
  deleteInstance: (id) => {
    set((state) => {
      const newRoot = JSON.parse(JSON.stringify(state.rootInstance)) as ComponentInstance;
      removeInstanceFromTree(newRoot, id);
      
      return {
        rootInstance: newRoot,
        selectedInstanceId: state.selectedInstanceId === id ? null : state.selectedInstanceId,
      };
    });
  },
  
  setSelectedInstanceId: (id) => set({ selectedInstanceId: id }),
  
  setHoveredInstanceId: (id) => set({ hoveredInstanceId: id }),
  
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
      
      return { rootInstance: newRoot };
    });
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
