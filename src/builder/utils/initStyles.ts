import { useStyleStore } from '../store/useStyleStore';

// Initialize the root style source with default styles
export const initializeRootStyles = () => {
  const { createStyleSource, setStyle, styleSources } = useStyleStore.getState();
  
  // Check if root-style already exists
  if (!styleSources['root-style']) {
    createStyleSource('local', 'root-style');
    
    // Set root styles
    setStyle('root-style', 'display', 'flex');
    setStyle('root-style', 'flexDirection', 'column');
    setStyle('root-style', 'minHeight', '100vh');
    setStyle('root-style', 'backgroundColor', 'hsl(var(--background))');
  }
};
