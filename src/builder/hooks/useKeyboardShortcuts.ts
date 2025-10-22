import { useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';

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
      if (modifier && e.key === 'd' && !isInput) {
        e.preventDefault();
        const { selectedInstanceId, findInstance, addInstance, rootInstance } = useBuilderStore.getState();
        if (selectedInstanceId && selectedInstanceId !== 'root') {
          const instance = findInstance(selectedInstanceId);
          if (instance) {
            // Find parent
            const findParent = (root: any, childId: string): any => {
              if (root.children?.some((c: any) => c.id === childId)) return root;
              for (const child of root.children || []) {
                const result = findParent(child, childId);
                if (result) return result;
              }
              return null;
            };
            
            const parent = findParent(rootInstance, selectedInstanceId);
            if (parent) {
              const index = parent.children.findIndex((c: any) => c.id === selectedInstanceId);
              const duplicate = JSON.parse(JSON.stringify(instance));
              duplicate.id = `${instance.type.toLowerCase()}-${Date.now()}`;
              addInstance(duplicate, parent.id, index + 1);
            }
          }
        }
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
