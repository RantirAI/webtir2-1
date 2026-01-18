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
      // Always create 3 AccordionItem children with Heading children for the title
      return [
        {
          id: generateId(),
          type: 'AccordionItem',
          label: 'Section 1',
          props: { defaultOpen: true },
          children: [
            {
              id: generateId(),
              type: 'Heading',
              label: 'Section Title',
              props: { children: 'Section 1', level: 'h3' },
              children: [],
              styleSourceIds: [],
            },
          ],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'AccordionItem',
          label: 'Section 2',
          props: { defaultOpen: false },
          children: [
            {
              id: generateId(),
              type: 'Heading',
              label: 'Section Title',
              props: { children: 'Section 2', level: 'h3' },
              children: [],
              styleSourceIds: [],
            },
          ],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'AccordionItem',
          label: 'Section 3',
          props: { defaultOpen: false },
          children: [
            {
              id: generateId(),
              type: 'Heading',
              label: 'Section Title',
              props: { children: 'Section 3', level: 'h3' },
              children: [],
              styleSourceIds: [],
            },
          ],
          styleSourceIds: [],
        },
      ];
    }
    
    case 'Tabs': {
      // Always create 3 TabPanel children
      return [
        {
          id: generateId(),
          type: 'TabPanel',
          label: 'Tab 1',
          props: { label: 'Account', content: 'Account settings and preferences.' },
          children: [],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'TabPanel',
          label: 'Tab 2',
          props: { label: 'Password', content: 'Change your password here.' },
          children: [],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'TabPanel',
          label: 'Tab 3',
          props: { label: 'Settings', content: 'Other settings.' },
          children: [],
          styleSourceIds: [],
        },
      ];
    }
    
    case 'Carousel': {
      // Always create 3 CarouselSlide children
      return [
        {
          id: generateId(),
          type: 'CarouselSlide',
          label: 'Slide 1',
          props: { title: 'Slide 1', description: 'First slide content' },
          children: [],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'CarouselSlide',
          label: 'Slide 2',
          props: { title: 'Slide 2', description: 'Second slide content' },
          children: [],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'CarouselSlide',
          label: 'Slide 3',
          props: { title: 'Slide 3', description: 'Third slide content' },
          children: [],
          styleSourceIds: [],
        },
      ];
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
