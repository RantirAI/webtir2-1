// Utilities for instance tree operations

let instanceCounter = 0;

export function generateId(): string {
  return `instance-${Date.now()}-${instanceCounter++}`;
}

// Check if an instance is inside a Navigation component
export function isInsideNavigation(instanceId: string, rootInstance: any): boolean {
  const path = getInstancePath(rootInstance, instanceId);
  if (!path) return false;
  
  // Traverse the path and check for Navigation-related types
  const checkInstance = (tree: any, targetPath: string[]): boolean => {
    if (targetPath.length === 0) return false;
    
    const [currentId, ...rest] = targetPath;
    
    if (tree.id !== currentId) return false;
    
    // Check if this node is a Navigation component
    if (tree.type === 'Navigation') return true;
    
    // Check if this is a Box with Navigation label (composite navigation)
    if (tree.type === 'Box' && tree.label === 'Navigation') return true;
    
    // Check if this Section has htmlTag='nav'
    if (tree.type === 'Section' && tree.props?.htmlTag === 'nav') return true;
    
    // Continue checking children
    if (rest.length === 0) return false;
    
    for (const child of tree.children || []) {
      if (child.id === rest[0]) {
        return checkInstance(child, rest);
      }
    }
    
    return false;
  };
  
  return checkInstance(rootInstance, path);
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

// Find the Navigation Section from any child instance
export function findNavigationSection(instanceId: string, rootInstance: any): any | null {
  const path = getInstancePath(rootInstance, instanceId);
  if (!path) return null;
  
  // Traverse the path and find the Navigation section
  const findNavInPath = (tree: any, targetPath: string[]): any | null => {
    if (targetPath.length === 0) return null;
    
    const [currentId, ...rest] = targetPath;
    
    if (tree.id !== currentId) return null;
    
    // Check if this node is a Navigation section
    if (tree.type === 'Section' && tree.props?.htmlTag === 'nav') {
      return tree;
    }
    
    // Check if this is a Box with Navigation label
    if (tree.type === 'Box' && tree.label === 'Navigation') {
      return tree;
    }
    
    // Continue to children
    if (rest.length === 0) return null;
    
    for (const child of tree.children || []) {
      if (child.id === rest[0]) {
        return findNavInPath(child, rest);
      }
    }
    
    return null;
  };
  
  return findNavInPath(rootInstance, path);
}

// Find the first Text element (Brand logo) in a Navigation container
// Supports both slot-based and legacy flat structures
export function findBrandTextInNavigation(navInstance: any): any | null {
  if (!navInstance) return null;
  
  // For composition navigation (Section with htmlTag='nav'), look in Container child
  const container = navInstance.children?.[0];
  if (!container) return null;
  
  // Check for slot-based structure first
  for (const child of container.children || []) {
    if (child.type === 'Div' && (child.label?.toLowerCase().includes('slot') || child.props?._isNavSlot)) {
      // Search inside slot
      for (const slotChild of child.children || []) {
        if (slotChild.type === 'Text') return slotChild;
      }
    }
  }
  
  // Legacy: Look for Text component directly in container
  for (const child of container.children || []) {
    if (child.type === 'Text') {
      return child;
    }
    // Also check in Box children (like Logo Container)
    if ((child.type === 'Box' || child.type === 'Div') && child.label?.includes('Logo')) {
      const textInBox = child.children?.find((c: any) => c.type === 'Text');
      if (textInBox) return textInBox;
    }
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
      // Always create 3 TabPanel children, each with a TabTrigger
      return [
        {
          id: generateId(),
          type: 'TabPanel',
          label: 'Tab 1',
          props: { content: 'Account settings and preferences.' },
          children: [
            {
              id: generateId(),
              type: 'TabTrigger',
              label: 'Account',
              props: { text: 'Account' },
              children: [],
              styleSourceIds: [],
            },
          ],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'TabPanel',
          label: 'Tab 2',
          props: { content: 'Change your password here.' },
          children: [
            {
              id: generateId(),
              type: 'TabTrigger',
              label: 'Password',
              props: { text: 'Password' },
              children: [],
              styleSourceIds: [],
            },
          ],
          styleSourceIds: [],
        },
        {
          id: generateId(),
          type: 'TabPanel',
          label: 'Tab 3',
          props: { content: 'Other settings.' },
          children: [
            {
              id: generateId(),
              type: 'TabTrigger',
              label: 'Settings',
              props: { text: 'Settings' },
              children: [],
              styleSourceIds: [],
            },
          ],
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
      // Generate Table children: 1 header row + 2 data rows, each with 3 cells
      const headerRow = {
        id: generateId(),
        type: 'TableRow',
        label: 'Header Row',
        props: { isHeader: true },
        children: [
          { id: generateId(), type: 'TableHeaderCell', label: 'Name', props: { content: 'Name' }, children: [], styleSourceIds: [] },
          { id: generateId(), type: 'TableHeaderCell', label: 'Status', props: { content: 'Status' }, children: [], styleSourceIds: [] },
          { id: generateId(), type: 'TableHeaderCell', label: 'Amount', props: { content: 'Amount' }, children: [], styleSourceIds: [] },
        ],
        styleSourceIds: [],
      };
      const dataRow1 = {
        id: generateId(),
        type: 'TableRow',
        label: 'Row 1',
        props: { isHeader: false },
        children: [
          { id: generateId(), type: 'TableCell', label: 'John Doe', props: { content: 'John Doe' }, children: [], styleSourceIds: [] },
          { id: generateId(), type: 'TableCell', label: 'Active', props: { content: 'Active' }, children: [], styleSourceIds: [] },
          { id: generateId(), type: 'TableCell', label: '$250.00', props: { content: '$250.00' }, children: [], styleSourceIds: [] },
        ],
        styleSourceIds: [],
      };
      const dataRow2 = {
        id: generateId(),
        type: 'TableRow',
        label: 'Row 2',
        props: { isHeader: false },
        children: [
          { id: generateId(), type: 'TableCell', label: 'Jane Smith', props: { content: 'Jane Smith' }, children: [], styleSourceIds: [] },
          { id: generateId(), type: 'TableCell', label: 'Pending', props: { content: 'Pending' }, children: [], styleSourceIds: [] },
          { id: generateId(), type: 'TableCell', label: '$150.00', props: { content: '$150.00' }, children: [], styleSourceIds: [] },
        ],
        styleSourceIds: [],
      };
      return [headerRow, dataRow1, dataRow2];
    }
    
    default:
      return [];
  }
}

// Check if a prebuilt type should auto-convert its data items to children
export function shouldAutoConvertToChildren(instanceType: string): boolean {
  return ['Accordion', 'Tabs', 'Carousel', 'Breadcrumb', 'Table'].includes(instanceType);
}
