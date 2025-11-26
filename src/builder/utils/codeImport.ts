import { ComponentInstance, ComponentType } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { generateId } from './instance';

// Parse HTML to component tree
export function parseHTMLToInstance(html: string): ComponentInstance | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  
  if (body.children.length === 0) return null;
  
  // Parse the body element as root
  return domNodeToInstance(body);
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
  const newInstance = parseHTMLToInstance(html);
  
  if (!newInstance) return existingInstance;
  
  // Try to preserve IDs by matching structure
  return mergeInstances(existingInstance, newInstance);
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
