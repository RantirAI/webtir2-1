import { useEffect } from 'react';
import { useBuilderStore } from '../store/useBuilderStore';
import { ComponentInstance } from '../store/types';
import { duplicateInstanceWithLinkage, applyDuplicationLinks } from '../utils/duplication';
import { inspectClipboard, ClipboardPayload } from '../utils/clipboardInspector';
import { translateWebflowToWebtir } from '../utils/webflowTranslator';
import { useToast } from '@/hooks/use-toast';

// Global handler for external clipboard import
let externalClipboardHandler: ((payload: ClipboardPayload) => void) | null = null;

export const setExternalClipboardHandler = (handler: ((payload: ClipboardPayload) => void) | null) => {
  externalClipboardHandler = handler;
};

export const useKeyboardShortcuts = () => {
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Ctrl/Cmd + Z (only when not in input)
      if (modifier && e.key === 'z' && !e.shiftKey && !isInput) {
        e.preventDefault();
        useBuilderStore.getState().undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y (only when not in input)
      if (((modifier && e.shiftKey && e.key === 'z') || (modifier && e.key === 'y')) && !isInput) {
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

      // Note: Paste (Ctrl+V) is now handled by the paste event listener below
      // to properly access clipboardData for external content detection

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

    // Handle paste event to intercept clipboard data from external sources
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || 
                     target.tagName === 'TEXTAREA' || 
                     target.isContentEditable;
      
      // Don't intercept if user is in an input field
      if (isInput) return;

      // Inspect the clipboard content
      const payload = inspectClipboard(e);
      
      console.log('[Clipboard Inspector] Detected source:', payload.source, payload);

      // Handle external design tool content
      if (payload.source === 'webflow' || payload.source === 'figma' || payload.source === 'framer') {
        e.preventDefault();
        
        // If there's an external handler registered (e.g., from AIChat), use it
        if (externalClipboardHandler) {
          externalClipboardHandler(payload);
          return;
        }

        // Otherwise, handle directly
        if (payload.source === 'webflow' && payload.data) {
          const instance = translateWebflowToWebtir(payload.data);
          if (instance) {
            const { addInstance, rootInstance, selectedInstanceId } = useBuilderStore.getState();
            const parentId = selectedInstanceId || 'root';
            addInstance(instance, parentId);
            toast({
              title: 'Webflow Import',
              description: `Successfully imported ${countNodes(instance)} components from Webflow.`,
            });
          } else {
            toast({
              title: 'Import Failed',
              description: 'Could not parse Webflow data.',
              variant: 'destructive',
            });
          }
          return;
        }

        // Figma and Framer - show notification that translator is needed
        if (payload.source === 'figma') {
          toast({
            title: 'Figma Content Detected',
            description: 'Figma translation coming soon. Use the Import modal for now.',
          });
          return;
        }

        if (payload.source === 'framer') {
          toast({
            title: 'Framer Content Detected',
            description: 'Framer translation coming soon. Use the Import modal for now.',
          });
          return;
        }
      }

      // For internal clipboard or unknown content, use standard paste
      if (payload.source === 'unknown' || payload.source === 'text') {
        e.preventDefault();
        useBuilderStore.getState().pasteClipboard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [toast]);
};

// Helper to count nodes in an instance tree
function countNodes(instance: ComponentInstance): number {
  let count = 1;
  for (const child of instance.children) {
    count += countNodes(child);
  }
  return count;
}
