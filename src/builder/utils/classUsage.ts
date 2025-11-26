import { ComponentInstance } from '../store/types';

// Count how many times a class is used in the component tree
export function countClassUsage(
  rootInstance: ComponentInstance,
  className: string
): number {
  let count = 0;
  
  function traverse(instance: ComponentInstance) {
    // Check if this instance uses the class
    if (instance.styleSourceIds?.some(id => id === className)) {
      count++;
    }
    
    // Recursively check children
    instance.children?.forEach(child => traverse(child));
  }
  
  traverse(rootInstance);
  return count;
}

// Get all instances using a specific class
export function getInstancesUsingClass(
  rootInstance: ComponentInstance,
  className: string
): ComponentInstance[] {
  const instances: ComponentInstance[] = [];
  
  function traverse(instance: ComponentInstance) {
    if (instance.styleSourceIds?.some(id => id === className)) {
      instances.push(instance);
    }
    instance.children?.forEach(child => traverse(child));
  }
  
  traverse(rootInstance);
  return instances;
}
