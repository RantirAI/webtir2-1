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

// Helper to create child instances from prebuilt component data items
// This ensures prebuilt components have their structure visible in the Navigator tree
export function createPrebuiltChildren(instanceType: string, props: Record<string, any> = {}): any[] {
  switch (instanceType) {
    case 'Accordion': {
      // Always create 3 AccordionItem children with empty children arrays for dropping
      return [
        {
          id: generateId(),
          type: 'AccordionItem',
          label: 'Section 1',
          props: { title: 'Section 1', defaultOpen: true },
          children: [],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'AccordionItem',
          label: 'Section 2',
          props: { title: 'Section 2', defaultOpen: false },
          children: [],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'AccordionItem',
          label: 'Section 3',
          props: { title: 'Section 3', defaultOpen: false },
          children: [],
          styleSourceIds: [],
        },
      ];
    }
    
    case 'Tabs': {
      const tabs = props.tabs || [];
      return tabs.map((tab: any, index: number) => ({
        id: generateId(),
        type: 'TabPanel',
        name: `tab-${index + 1}`,
        props: {
          label: tab.label || `Tab ${index + 1}`,
          content: tab.content || '',
        },
        children: [],
        styleSourceIds: [],
      }));
    }
    
    case 'Carousel': {
      const slides = props.slides || [];
      return slides.map((slide: any, index: number) => ({
        id: generateId(),
        type: 'CarouselSlide',
        name: `slide-${index + 1}`,
        props: {
          imageUrl: slide.imageUrl || '',
          alt: slide.alt || `Slide ${index + 1}`,
          title: slide.title || '',
          description: slide.description || '',
          buttonText: slide.buttonText || '',
          buttonLink: slide.buttonLink || '',
        },
        children: [],
        styleSourceIds: [],
      }));
    }
    
    case 'Breadcrumb': {
      const items = props.items || [];
      return items.map((item: any, index: number) => ({
        id: generateId(),
        type: 'BreadcrumbItem',
        name: `crumb-${index + 1}`,
        props: {
          label: item.label || `Page ${index + 1}`,
          href: item.href || '#',
          isCurrentPage: item.isCurrentPage || false,
        },
        children: [],
        styleSourceIds: [],
      }));
    }
    
    case 'Table': {
      // For Table, we don't auto-convert since the data structure is more complex
      // Users should use the data editor or manually add TableRow/TableCell
      return [];
    }
    
    default:
      return [];
  }
}

// Check if a prebuilt type should auto-convert its data items to children
export function shouldAutoConvertToChildren(instanceType: string): boolean {
  return ['Accordion', 'Tabs', 'Carousel', 'Breadcrumb'].includes(instanceType);
}
