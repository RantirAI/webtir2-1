/**
 * Webflow to Webtir Translator
 * Converts Webflow @webflow/XscpData JSON to Webtir ComponentInstance tree
 */

import { ComponentType, ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { WebflowXscpData, WebflowNode, WebflowStyle } from './clipboardInspector';

// Generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Map Webflow type + tag to Webtir ComponentType
function mapWebflowTypeToWebtir(type: string, tag: string): ComponentType {
  // Handle based on Webflow type
  switch (type) {
    case 'Heading':
      return 'Heading';
    case 'Paragraph':
      return 'Text';
    case 'Image':
      return 'Image';
    case 'Link':
      return 'Link';
    case 'Video':
      return 'Video';
    case 'Block':
      // Map based on semantic tag
      switch (tag) {
        case 'header':
        case 'footer':
        case 'section':
        case 'article':
        case 'main':
          return 'Section';
        case 'nav':
          return 'Navigation';
        case 'button':
          return 'Button';
        case 'form':
          return 'Form';
        case 'input':
          return 'TextInput';
        case 'textarea':
          return 'TextArea';
        case 'a':
          return 'Link';
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          return 'Heading';
        case 'p':
          return 'Text';
        case 'img':
          return 'Image';
        case 'ul':
          return 'UnorderedList';
        case 'ol':
          return 'OrderedList';
        case 'table':
          return 'Table';
        default:
          return 'Div';
      }
    case 'FormBlock':
      return 'Form';
    case 'FormButton':
      return 'Button';
    case 'FormTextInput':
      return 'TextInput';
    case 'FormTextarea':
      return 'TextArea';
    case 'ListWrapper':
      return 'Div';
    case 'List':
      return tag === 'ol' ? 'OrderedList' : 'UnorderedList';
    case 'ListItem':
      return 'Div';
    default:
      return 'Div';
  }
}

// Parse Webflow styleLess string to CSS properties object
function parseStyleLess(styleLess: string): Record<string, string> {
  if (!styleLess) return {};
  
  const styles: Record<string, string> = {};
  
  // Handle multi-value properties like background-image that may contain colons in URLs
  // Split by semicolons but be careful with url() values
  const declarations: string[] = [];
  let current = '';
  let parenDepth = 0;
  
  for (const char of styleLess) {
    if (char === '(') parenDepth++;
    if (char === ')') parenDepth--;
    if (char === ';' && parenDepth === 0) {
      if (current.trim()) declarations.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) declarations.push(current.trim());
  
  for (const decl of declarations) {
    // Find the first colon that's not inside url() or other functions
    let colonIndex = -1;
    let pDepth = 0;
    for (let i = 0; i < decl.length; i++) {
      if (decl[i] === '(') pDepth++;
      if (decl[i] === ')') pDepth--;
      if (decl[i] === ':' && pDepth === 0) {
        colonIndex = i;
        break;
      }
    }
    
    if (colonIndex > 0) {
      const property = decl.substring(0, colonIndex).trim();
      const value = decl.substring(colonIndex + 1).trim();
      
      // Convert property name to camelCase for React/JS
      const camelCaseProp = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styles[camelCaseProp] = value;
    }
  }
  
  return styles;
}

// Map Webflow breakpoint names to Webtir breakpoint IDs
function mapBreakpoint(wfBreakpoint: string): string {
  switch (wfBreakpoint) {
    case 'tiny': return 'mobile';
    case 'small': return 'tablet';
    case 'medium': return 'laptop';
    case 'large': return 'desktop';
    default: return 'base';
  }
}

// Create a style source from Webflow style and apply styles
function createStyleSourceFromWebflow(wfStyle: WebflowStyle): string {
  const { createStyleSource, setStyle } = useStyleStore.getState();
  
  // Create style source with Webflow class name (prefixed to avoid conflicts)
  const name = `wf-${wfStyle.name}`;
  const sourceId = createStyleSource('local', name);
  
  // Parse and apply base styles
  const baseStyles = parseStyleLess(wfStyle.styleLess);
  Object.entries(baseStyles).forEach(([prop, value]) => {
    setStyle(sourceId, prop, value, 'base', 'default');
  });
  
  // Apply responsive variants
  if (wfStyle.variants) {
    Object.entries(wfStyle.variants).forEach(([breakpoint, variant]) => {
      const webtirBreakpoint = mapBreakpoint(breakpoint);
      const variantStyles = parseStyleLess(variant.styleLess);
      Object.entries(variantStyles).forEach(([prop, value]) => {
        setStyle(sourceId, prop, value, webtirBreakpoint, 'default');
      });
    });
  }
  
  return sourceId;
}

// Extract props from Webflow node based on type
function extractProps(node: WebflowNode, type: ComponentType, nodeMap: Map<string, WebflowNode>): Record<string, any> {
  const props: Record<string, any> = {};
  
  // Get text content from text children
  const textContent = getTextContent(node, nodeMap);
  if (textContent) {
    if (type === 'Heading' || type === 'Text' || type === 'Button' || type === 'Link') {
      props.children = textContent;
    }
  }
  
  // Handle heading level - store as 'h1', 'h2', etc. (string format)
  if (type === 'Heading') {
    const levelMatch = node.tag?.match(/h([1-6])/);
    props.level = levelMatch ? `h${levelMatch[1]}` : 'h1';
  }
  
  // Handle image
  if (type === 'Image' && node.data?.attr) {
    props.src = node.data.attr.src || '';
    props.alt = node.data.attr.alt || '';
  }
  
  // Handle link
  if (type === 'Link' && node.data?.link) {
    props.href = node.data.link.url || '#';
    props.target = node.data.link.mode === 'external' ? '_blank' : '_self';
  }
  
  // Handle button
  if (type === 'Button') {
    props.variant = 'default';
  }
  
  return props;
}

// Get text content from node's text children
function getTextContent(node: WebflowNode, nodeMap: Map<string, WebflowNode>): string {
  if (node.text && node.v) {
    return node.v;
  }
  
  // Look for text children
  const textParts: string[] = [];
  for (const childId of node.children || []) {
    const child = nodeMap.get(childId);
    if (child?.text && child.v) {
      textParts.push(child.v);
    } else if (child?.data?.text) {
      // Check nested text nodes
      for (const grandchildId of child.children || []) {
        const grandchild = nodeMap.get(grandchildId);
        if (grandchild?.text && grandchild.v) {
          textParts.push(grandchild.v);
        }
      }
    }
  }
  
  return textParts.join(' ');
}

// Find root nodes (nodes that are not children of any other node)
function findRootNodes(nodes: WebflowNode[]): WebflowNode[] {
  const childIds = new Set<string>();
  
  for (const node of nodes) {
    for (const childId of node.children || []) {
      childIds.add(childId);
    }
  }
  
  // Root nodes are those not in childIds set and not text nodes
  return nodes.filter(node => !childIds.has(node._id) && !node.text);
}

// Convert Webflow node tree to Webtir ComponentInstance tree
function convertNodeTree(
  node: WebflowNode,
  nodeMap: Map<string, WebflowNode>,
  styleMap: Map<string, WebflowStyle>,
  createdStyles: Map<string, string>, // Cache for already created style sources
): ComponentInstance {
  const type = mapWebflowTypeToWebtir(node.type, node.tag);
  
  // Create style sources for this node's classes
  const styleSourceIds: string[] = [];
  for (const classId of node.classes || []) {
    // Check if we already created this style source
    if (createdStyles.has(classId)) {
      styleSourceIds.push(createdStyles.get(classId)!);
    } else {
      const wfStyle = styleMap.get(classId);
      if (wfStyle) {
        const sourceId = createStyleSourceFromWebflow(wfStyle);
        createdStyles.set(classId, sourceId);
        styleSourceIds.push(sourceId);
      }
    }
  }
  
  // Extract props
  const props = extractProps(node, type, nodeMap);
  
  // Recursively convert children (skip text nodes - they're handled in props)
  const children: ComponentInstance[] = [];
  for (const childId of node.children || []) {
    const childNode = nodeMap.get(childId);
    if (childNode && !childNode.text && !childNode.data?.text) {
      children.push(convertNodeTree(childNode, nodeMap, styleMap, createdStyles));
    }
  }
  
  // Generate label from type or Webflow display name
  const label = node.data?.displayName || type;
  
  return {
    id: generateId(),
    type,
    label,
    props,
    styleSourceIds,
    children,
  };
}

/**
 * Main translation function - converts Webflow XscpData to Webtir ComponentInstance tree
 */
export function translateWebflowToWebtir(webflowData: WebflowXscpData): ComponentInstance | null {
  try {
    const { nodes, styles } = webflowData.payload;
    
    if (!nodes || nodes.length === 0) {
      console.warn('No nodes found in Webflow data');
      return null;
    }
    
    // Build lookup maps
    const nodeMap = new Map(nodes.map(n => [n._id, n]));
    const styleMap = new Map(styles.map(s => [s._id, s]));
    const createdStyles = new Map<string, string>();
    
    // Find root node(s)
    const rootNodes = findRootNodes(nodes);
    
    if (rootNodes.length === 0) {
      console.warn('No root nodes found in Webflow data');
      return null;
    }
    
    // If single root, convert directly
    if (rootNodes.length === 1) {
      return convertNodeTree(rootNodes[0], nodeMap, styleMap, createdStyles);
    }
    
    // Multiple roots - wrap in a container
    const children = rootNodes.map(root => convertNodeTree(root, nodeMap, styleMap, createdStyles));
    
    return {
      id: generateId(),
      type: 'Div',
      label: 'Webflow Import',
      props: {},
      styleSourceIds: [],
      children,
    };
  } catch (error) {
    console.error('Failed to translate Webflow data:', error);
    return null;
  }
}

/**
 * Get asset URLs from Webflow data
 */
export function extractWebflowAssets(webflowData: WebflowXscpData): { url: string; alt: string; name: string }[] {
  const assets: { url: string; alt: string; name: string }[] = [];
  
  if (webflowData.payload.assets) {
    for (const asset of webflowData.payload.assets) {
      assets.push({
        url: asset.cdnUrl,
        alt: asset.alt || '',
        name: asset.origFileName || asset.fileName,
      });
    }
  }
  
  // Also extract images from nodes
  for (const node of webflowData.payload.nodes) {
    if (node.type === 'Image' && node.data?.attr?.src) {
      assets.push({
        url: node.data.attr.src,
        alt: node.data.attr.alt || '',
        name: node.data.attr.src.split('/').pop() || 'image',
      });
    }
  }
  
  return assets;
}

/**
 * Get summary statistics about the Webflow data
 */
export function getWebflowDataSummary(webflowData: WebflowXscpData): {
  nodeCount: number;
  styleCount: number;
  imageCount: number;
  hasInteractions: boolean;
} {
  const nodes = webflowData.payload.nodes || [];
  const styles = webflowData.payload.styles || [];
  const interactions = webflowData.payload.interactions || [];
  
  const imageCount = nodes.filter(n => n.type === 'Image').length;
  
  return {
    nodeCount: nodes.filter(n => !n.text).length,
    styleCount: styles.length,
    imageCount,
    hasInteractions: interactions.length > 0,
  };
}
