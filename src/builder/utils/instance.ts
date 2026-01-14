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
  
  // RichText can contain many element types for rich content
  if (instanceType === 'RichText') {
    const richTextTypes = ['Heading', 'Text', 'Blockquote', 'OrderedList', 'UnorderedList', 'CodeBlock', 'Link', 'Image', 'Button', 'Div', 'Container'];
    return !draggedType || richTextTypes.includes(draggedType);
  }
  
  // Rich text leaf elements cannot contain other elements
  const leafTypes = ['Blockquote', 'OrderedList', 'UnorderedList', 'CodeBlock', 'Text', 'Heading', 'Image', 'Button', 'Link', 'Separator', 'Divider', 'BreadcrumbItem'];
  if (leafTypes.includes(instanceType)) {
    return false;
  }
  
  // Determine which components can have children
  // All container/composite components can accept any child component
  const containerTypes = [
    // Core layout containers
    'Div', 
    'Container', 
    'Section', 
    'Box', 
    'Navigation', 
    'Form', 
    'RichText',
    
    // Prebuilt component roots that can accept children
    'Accordion',
    'Tabs',
    'Carousel',
    'Breadcrumb',
    'Table',
    'Dropdown',
    
    // Child primitives that can accept nested content
    'AccordionItem',
    'TabPanel',
    'CarouselSlide',
    'TableRow',
    'TableHeaderCell',
    'TableCell',
    'Cell'
  ];
  return containerTypes.includes(instanceType);
}
