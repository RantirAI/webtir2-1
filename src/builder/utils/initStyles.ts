import { useStyleStore } from '../store/useStyleStore';

// Migrate legacy 'base:' breakpoint styles to 'desktop:'
export const migrateBaseToDesktop = () => {
  const { styles } = useStyleStore.getState();
  
  const updates: Record<string, string> = {};
  const keysToDelete: string[] = [];
  
  Object.entries(styles).forEach(([key, value]) => {
    // Match pattern: sourceId:base:state:property
    const parts = key.split(':');
    if (parts.length === 4 && parts[1] === 'base') {
      const [sourceId, , state, property] = parts;
      const newKey = `${sourceId}:desktop:${state}:${property}`;
      
      // Only migrate if the desktop key doesn't already exist
      if (!styles[newKey]) {
        updates[newKey] = value;
      }
      keysToDelete.push(key);
    }
  });
  
  // Apply migrations if any exist
  if (Object.keys(updates).length > 0 || keysToDelete.length > 0) {
    useStyleStore.setState((state) => {
      const newStyles = { ...state.styles, ...updates };
      keysToDelete.forEach(key => delete newStyles[key]);
      return { styles: newStyles };
    });
    console.log(`[Style Migration] Migrated ${Object.keys(updates).length} styles from 'base' to 'desktop' breakpoint`);
  }
};

// Initialize the root style source with default styles
export const initializeRootStyles = () => {
  const { createStyleSource, setStyle, styleSources } = useStyleStore.getState();
  
  // Run migration first
  migrateBaseToDesktop();
  
  // Check if root-style already exists
  if (!styleSources['root-style']) {
    createStyleSource('local', 'root-style');
    
    // Set root styles - white background, no flex
    setStyle('root-style', 'backgroundColor', '#ffffff');
  }
};
