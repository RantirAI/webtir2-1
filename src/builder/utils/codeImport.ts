import { ComponentInstance, ComponentType } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { generateId } from './instance';

// Parse HTML to component tree
export function parseHTMLToInstance(html: string): ComponentInstance | null {
  // Strip component markers before parsing
  const cleanedHTML = html
    .replace(/<!-- @component:[^>]+ -->/g, '')
    .replace(/<!-- @\/component:[^>]+ -->/g, '');
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanedHTML, 'text/html');
  const body = doc.body;
  
  if (body.children.length === 0) return null;
  
  // Parse the body element as root
  return domNodeToInstance(body);
}

// Parse HTML and preserve existing instance IDs/links where possible
export function parseHTMLPreservingLinks(
  html: string, 
  existingRoot: ComponentInstance | null
): ComponentInstance | null {
  // Strip component markers before parsing
  const cleanedHTML = html
    .replace(/<!-- @component:[^>]+ -->/g, '')
    .replace(/<!-- @\/component:[^>]+ -->/g, '');
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanedHTML, 'text/html');
  const body = doc.body;
  
  if (body.children.length === 0) return null;
  
  // Build a map of existing instances by class name for matching
  const existingMap = new Map<string, ComponentInstance>();
  if (existingRoot) {
    buildInstanceMap(existingRoot, existingMap);
  }
  
  // Parse with existing instance matching
  return domNodeToInstancePreserving(body, existingMap);
}

function buildInstanceMap(instance: ComponentInstance, map: Map<string, ComponentInstance>) {
  // Use class names as key for matching
  const className = instance.styleSourceIds?.join(' ') || '';
  if (className) {
    // Include type in key for better matching
    const key = `${instance.type}:${className}`;
    map.set(key, instance);
  }
  
  // Also store by ID for direct lookup
  map.set(`id:${instance.id}`, instance);
  
  instance.children?.forEach(child => buildInstanceMap(child, map));
}

function domNodeToInstancePreserving(
  node: Element, 
  existingMap: Map<string, ComponentInstance>
): ComponentInstance {
  const { createStyleSource, styleSources } = useStyleStore.getState();
  
  // Get or create style sources for classes
  const classNames = node.className.split(' ').filter(Boolean);
  const styleSourceIds = classNames.map(className => {
    const existing = Object.entries(styleSources).find(
      ([_, source]) => source.name === className
    );
    
    if (existing) {
      return existing[0];
    }
    
    return createStyleSource('local', className);
  });
  
  // Map HTML tags to component types
  let type: ComponentType = 'Div';
  const tagName = node.tagName.toLowerCase();
  
  switch (tagName) {
    case 'body':
      type = 'Div';
      break;
    case 'section':
      type = 'Section';
      break;
    case 'div':
      type = 'Div';
      break;
    case 'p':
      type = 'Text';
      break;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      type = 'Heading';
      break;
    case 'button':
      type = 'Button';
      break;
    case 'a':
      type = 'Link';
      break;
    case 'img':
      type = 'Image';
      break;
    case 'input':
      if (node.getAttribute('type') === 'checkbox') {
        type = 'CheckboxField';
      } else if (node.getAttribute('type') === 'radio') {
        type = 'RadioGroup';
      } else {
        type = 'TextInput';
      }
      break;
    case 'textarea':
      type = 'TextArea';
      break;
    case 'label':
      type = 'InputLabel';
      break;
    case 'select':
      type = 'Select';
      break;
    case 'nav':
      type = 'Navigation';
      break;
    case 'form':
      type = 'Form';
      break;
    case 'header':
      type = 'Section';
      break;
    case 'footer':
      type = 'Section';
      break;
  }
  
  // Try to find existing instance to preserve ID and links
  const classKey = `${type}:${styleSourceIds.join(' ')}`;
  const existingInstance = existingMap.get(classKey);
  
  // Extract props based on type
  const props: Record<string, any> = existingInstance?.props || {};
  
  if (type === 'Heading') {
    props.level = tagName;
  }
  
  if (type === 'Image') {
    props.src = node.getAttribute('src') || '';
    props.alt = node.getAttribute('alt') || '';
  }
  
  if (type === 'Link') {
    props.href = node.getAttribute('href') || '#';
  }
  
  if (type === 'TextInput') {
    props.placeholder = node.getAttribute('placeholder') || '';
  }
  
  if (type === 'TextArea') {
    props.placeholder = node.getAttribute('placeholder') || '';
  }
  
  // Get text content for text-based elements
  if (['Text', 'Heading', 'Button', 'InputLabel'].includes(type)) {
    const textContent = Array.from(node.childNodes)
      .filter(child => child.nodeType === Node.TEXT_NODE)
      .map(child => child.textContent)
      .join('')
      .trim();
    
    if (textContent) {
      props.children = textContent;
    }
  }
  
  // Parse children
  const children: ComponentInstance[] = [];
  Array.from(node.children).forEach(child => {
    const childInstance = domNodeToInstancePreserving(child, existingMap);
    if (childInstance) {
      children.push(childInstance);
    }
  });
  
  // Preserve existing ID if found, otherwise generate new
  const id = existingInstance?.id || generateId();
  const label = existingInstance?.label || type;
  
  return {
    id,
    type,
    label,
    props,
    styleSourceIds,
    children,
    // Preserve linking metadata from existing instance
    ...(existingInstance?.idAttribute && { idAttribute: existingInstance.idAttribute }),
    ...(existingInstance?.visibility && { visibility: existingInstance.visibility }),
    ...(existingInstance?.attributes && { attributes: existingInstance.attributes }),
  };
}

function domNodeToInstance(node: Element): ComponentInstance {
  const { createStyleSource } = useStyleStore.getState();
  
  // Get or create style sources for classes
  const classNames = node.className.split(' ').filter(Boolean);
  const styleSourceIds = classNames.map(className => {
    // Check if style source already exists
    const { styleSources } = useStyleStore.getState();
    const existing = Object.entries(styleSources).find(
      ([_, source]) => source.name === className
    );
    
    if (existing) {
      return existing[0];
    }
    
    // Create new style source
    return createStyleSource('local', className);
  });
  
  // Map HTML tags to component types
  let type: ComponentType = 'Div';
  const tagName = node.tagName.toLowerCase();
  
  switch (tagName) {
    case 'body':
      type = 'Div';
      break;
    case 'section':
      type = 'Section';
      break;
    case 'div':
      type = 'Div';
      break;
    case 'p':
      type = 'Text';
      break;
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      type = 'Heading';
      break;
    case 'button':
      type = 'Button';
      break;
    case 'a':
      type = 'Link';
      break;
    case 'img':
      type = 'Image';
      break;
    case 'input':
      if (node.getAttribute('type') === 'checkbox') {
        type = 'CheckboxField';
      } else if (node.getAttribute('type') === 'radio') {
        type = 'RadioGroup';
      } else {
        type = 'TextInput';
      }
      break;
    case 'textarea':
      type = 'TextArea';
      break;
    case 'label':
      type = 'InputLabel';
      break;
    case 'select':
      type = 'Select';
      break;
    case 'nav':
      type = 'Navigation';
      break;
  }
  
  // Extract props based on type
  const props: Record<string, any> = {};
  
  if (type === 'Heading') {
    props.level = tagName;
  }
  
  if (type === 'Image') {
    props.src = node.getAttribute('src') || '';
    props.alt = node.getAttribute('alt') || '';
  }
  
  if (type === 'Link') {
    props.href = node.getAttribute('href') || '#';
  }
  
  if (type === 'TextInput') {
    props.placeholder = node.getAttribute('placeholder') || '';
  }
  
  if (type === 'TextArea') {
    props.placeholder = node.getAttribute('placeholder') || '';
  }
  
  // Get text content for text-based elements
  if (['Text', 'Heading', 'Button', 'InputLabel'].includes(type)) {
    // Only get direct text nodes, not nested elements
    const textContent = Array.from(node.childNodes)
      .filter(child => child.nodeType === Node.TEXT_NODE)
      .map(child => child.textContent)
      .join('')
      .trim();
    
    if (textContent) {
      props.children = textContent;
    }
  }
  
  // Parse children
  const children: ComponentInstance[] = [];
  Array.from(node.children).forEach(child => {
    const childInstance = domNodeToInstance(child);
    if (childInstance) {
      children.push(childInstance);
    }
  });
  
  return {
    id: generateId(),
    type,
    label: type,
    props,
    styleSourceIds,
    children,
  };
}

// Update instance from HTML while preserving IDs
export function updateInstanceFromHTML(
  html: string,
  existingInstance: ComponentInstance
): ComponentInstance {
  const newInstance = parseHTMLPreservingLinks(html, existingInstance);
  
  if (!newInstance) return existingInstance;
  
  // Preserve the root ID
  return {
    ...newInstance,
    id: existingInstance.id,
  };
}

function mergeInstances(
  existing: ComponentInstance,
  updated: ComponentInstance
): ComponentInstance {
  // If types match, preserve the ID
  if (existing.type === updated.type) {
    return {
      ...updated,
      id: existing.id,
      children: updated.children.map((updatedChild, index) => {
        const existingChild = existing.children[index];
        if (existingChild) {
          return mergeInstances(existingChild, updatedChild);
        }
        return updatedChild;
      }),
    };
  }
  
  // Types don't match, use new instance
  return updated;
}
