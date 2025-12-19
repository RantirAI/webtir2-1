import { useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { duplicateInstanceWithLinkage, applyDuplicationLinks } from '../utils/duplication';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd + Z
      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useBuilderStore.getState().undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((modifier && e.shiftKey && e.key === 'z') || (modifier && e.key === 'y')) {
        e.preventDefault();
        useBuilderStore.getState().redo();
        return;
      }

      // Don't handle copy/cut/paste if typing in input
      if (isInput) return;

      // Copy: Ctrl/Cmd + C
      if (modifier && e.key === 'c') {
        e.preventDefault();
        useBuilderStore.getState().copySelected();
        return;
      }

      // Cut: Ctrl/Cmd + X
      if (modifier && e.key === 'x') {
        e.preventDefault();
        useBuilderStore.getState().cutSelected();
        return;
      }

      // Paste: Ctrl/Cmd + V
      if (modifier && e.key === 'v') {
        e.preventDefault();
        useBuilderStore.getState().pasteClipboard();
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if (modifier && e.key === 'd') {
        e.preventDefault();
        const { selectedInstanceId, rootInstance, addInstance } = useBuilderStore.getState();
        if (!selectedInstanceId || selectedInstanceId === 'root' || !rootInstance) return;
        
        const findInstance = (tree: ComponentInstance, id: string): ComponentInstance | null => {
          if (tree.id === id) return tree;
          for (const child of tree.children) {
            const found = findInstance(child, id);
            if (found) return found;
          }
          return null;
        };
        
        const findParent = (tree: ComponentInstance, childId: string): ComponentInstance | null => {
          for (const child of tree.children) {
            if (child.id === childId) return tree;
            const found = findParent(child, childId);
            if (found) return found;
          }
          return null;
        };
        
        const instance = findInstance(rootInstance, selectedInstanceId);
        const parent = findParent(rootInstance, selectedInstanceId);
        if (!instance || !parent) return;
        
        const index = parent.children.findIndex(c => c.id === selectedInstanceId);
        
        // Use unified duplication that preserves all nested component linkages
        const { instance: duplicate, links } = duplicateInstanceWithLinkage(instance);
        addInstance(duplicate, parent.id, index + 1);
        // Apply linkage to all nested linked components
        applyDuplicationLinks(links);
        return;
      }

      // Delete: Delete or Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && !isInput) {
        e.preventDefault();
        const selectedId = useBuilderStore.getState().selectedInstanceId;
        if (selectedId && selectedId !== 'root') {
          useBuilderStore.getState().deleteInstance(selectedId);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
