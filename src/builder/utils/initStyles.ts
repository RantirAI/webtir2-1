import { useStyleStore } from '../store/useStyleStore';

// Initialize the root style source with default styles
export const initializeRootStyles = () => {
  const { createStyleSource, setStyle, styleSources } = useStyleStore.getState();
  
  // Check if root-style already exists
  if (!styleSources['root-style']) {
    createStyleSource('local', 'root-style');
    
    // Set root styles - white background, no flex
    setStyle('root-style', 'backgroundColor', '#ffffff');
  }
};
