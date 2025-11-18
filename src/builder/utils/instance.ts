// Utilities for instance tree operations

let instanceCounter = 0;

export function generateId(): string {
  return `instance-${Date.now()}-${instanceCounter++}`;
}

export function getInstancePath(tree: any, targetId: string, path: string[] = []): string[] | null {
  if (tree.id === targetId) {
    return [...path, tree.id];
  }
  
  for (const child of tree.children || []) {
    const result = getInstancePath(child, targetId, [...path, tree.id]);
    if (result) return result;
  }
  
  return null;
}

export function canDropInside(instanceType: string, draggedType?: string): boolean {
  // Sections cannot contain other sections
  if (instanceType === 'Section' && draggedType === 'Section') {
    return false;
  }
  
  // RichText can only contain rich text elements
  if (instanceType === 'RichText') {
    const richTextTypes = ['Heading', 'Text', 'Blockquote', 'OrderedList', 'UnorderedList', 'CodeBlock', 'Link', 'Image'];
    return !draggedType || richTextTypes.includes(draggedType);
  }
  
  // Rich text elements cannot contain other elements
  const richTextTypes = ['Blockquote', 'OrderedList', 'UnorderedList', 'CodeBlock'];
  if (richTextTypes.includes(instanceType)) {
    return false;
  }
  
  // Determine which components can have children
  const containerTypes = ['Box', 'Container', 'Section', 'Navigation', 'Form'];
  return containerTypes.includes(instanceType);
}
