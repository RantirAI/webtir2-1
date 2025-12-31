import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { useComponentInstanceStore } from '../store/useComponentInstanceStore';

export interface ComponentCodeEntry {
  id: string;
  name: string;
  path: string;
  instanceId: string;
  isLinked: boolean;
  prebuiltId?: string;
  htmlCode: string;
  cssCode: string;
  children: ComponentCodeEntry[];
}

// Discover ONLY linked/prebuilt component instances from the canvas
// Static sections, containers, text, etc. are NOT components
export function discoverComponents(rootInstance: ComponentInstance): ComponentCodeEntry[] {
  const { prebuiltComponents, isLinkedInstance, getInstanceLink } = useComponentInstanceStore.getState();
  const components: ComponentCodeEntry[] = [];
  
  function traverse(instance: ComponentInstance, parentPath: string = '/components'): ComponentCodeEntry | null {
    const isLinked = isLinkedInstance(instance.id);
    const link = getInstanceLink(instance.id);
    
    // ONLY include linked/prebuilt components - not static elements
    if (!isLinked || !link) {
      // Still check children for linked components
      for (const child of instance.children || []) {
        const childEntry = traverse(child, parentPath);
        if (childEntry) {
          components.push(childEntry);
        }
      }
      return null;
    }
    
    // This is a linked prebuilt component
    const linkedPrebuilt = prebuiltComponents.find(p => p.id === link.prebuiltId);
    
    // Determine component name
    const name = linkedPrebuilt?.name || 
                 instance.label || 
                 `${instance.type}-${instance.id.slice(-4)}`;
    
    const safeName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const path = `${parentPath}/${safeName}.html`;
    
    // Generate HTML for this component
    const htmlCode = generateComponentHTML(instance);
    const cssCode = generateComponentCSS(instance);
    
    // Process children for nested linked components
    const childComponents: ComponentCodeEntry[] = [];
    for (const child of instance.children || []) {
      const childEntry = traverse(child, `${parentPath}/${safeName}`);
      if (childEntry) {
        childComponents.push(childEntry);
      }
    }
    
    const entry: ComponentCodeEntry = {
      id: `comp-${instance.id}`,
      name,
      path,
      instanceId: instance.id,
      isLinked: true,
      prebuiltId: linkedPrebuilt?.id,
      htmlCode,
      cssCode,
      children: childComponents,
    };
    
    return entry;
  }
  
  // Start from root children (don't include root itself as a component)
  for (const child of rootInstance.children || []) {
    traverse(child);
  }
  
  return components;
}

// Flatten component tree for file listing
export function flattenComponents(components: ComponentCodeEntry[]): ComponentCodeEntry[] {
  const flat: ComponentCodeEntry[] = [];
  
  function traverse(entries: ComponentCodeEntry[]) {
    for (const entry of entries) {
      flat.push(entry);
      if (entry.children.length > 0) {
        traverse(entry.children);
      }
    }
  }
  
  traverse(components);
  return flat;
}

// Generate HTML for a single component instance
function generateComponentHTML(instance: ComponentInstance, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  const { styleSources } = useStyleStore.getState();
  
  // Get class names
  const classNames = instance.styleSourceIds
    ?.map(id => styleSources[id]?.name)
    .filter(Boolean)
    .join(' ') || '';
  
  const classAttr = classNames ? ` class="${classNames}"` : '';
  const idAttr = instance.idAttribute ? ` id="${instance.idAttribute}"` : '';
  
  // Build custom attributes
  let customAttrs = '';
  if (instance.attributes && Object.keys(instance.attributes).length > 0) {
    customAttrs = Object.entries(instance.attributes)
      .filter(([name]) => !['id', 'class', 'style', 'className'].includes(name.toLowerCase()))
      .map(([name, value]) => ` ${name}="${value}"`)
      .join('');
  }
  
  // Generate tag based on component type
  let tag = 'div';
  let selfClosing = false;
  let attrs = '';
  
  switch (instance.type) {
    case 'Text':
    case 'Cell':
      tag = 'p';
      break;
    case 'Heading':
      tag = instance.props.level || 'h2';
      break;
    case 'Button':
    case 'FormButton':
      tag = 'button';
      break;
    case 'Image':
      tag = 'img';
      selfClosing = true;
      attrs = ` src="${instance.props.src || ''}" alt="${instance.props.alt || ''}"`;
      break;
    case 'Video':
      tag = 'video';
      attrs = ` src="${instance.props.src || ''}"`;
      if (instance.props.autoplay) attrs += ' autoplay';
      if (instance.props.loop) attrs += ' loop';
      if (instance.props.muted) attrs += ' muted';
      if (instance.props.controls) attrs += ' controls';
      break;
    case 'Link':
      tag = 'a';
      attrs = ` href="${instance.props.href || '#'}"`;
      break;
    case 'Section':
      tag = instance.props.htmlTag || 'section';
      break;
    case 'Container':
      tag = 'div';
      break;
    case 'Navigation':
      tag = 'nav';
      break;
    case 'TextInput':
      tag = 'input';
      selfClosing = true;
      attrs = ` type="text" placeholder="${instance.props.placeholder || ''}"`;
      break;
    case 'TextArea':
      tag = 'textarea';
      attrs = ` placeholder="${instance.props.placeholder || ''}"`;
      break;
    case 'Form':
      tag = 'form';
      break;
  }
  
  const allAttrs = `${idAttr}${classAttr}${attrs}${customAttrs}`;
  const textContent = instance.props.children || instance.props.text || '';
  
  if (selfClosing) {
    return `${spaces}<${tag}${allAttrs} />`;
  }
  
  if (instance.children && instance.children.length > 0) {
    const childrenHTML = instance.children
      .map(child => generateComponentHTML(child, indent + 1))
      .join('\n');
    return `${spaces}<${tag}${allAttrs}>\n${childrenHTML}\n${spaces}</${tag}>`;
  }
  
  if (textContent) {
    return `${spaces}<${tag}${allAttrs}>${textContent}</${tag}>`;
  }
  
  return `${spaces}<${tag}${allAttrs}></${tag}>`;
}

// Generate CSS for a component instance
function generateComponentCSS(instance: ComponentInstance): string {
  const { styleSources, styles, breakpoints } = useStyleStore.getState();
  const cssRules: string[] = [];
  
  // Collect all styleSourceIds from this instance and its children
  const allStyleIds = collectStyleSourceIds(instance);
  const uniqueIds = [...new Set(allStyleIds)];
  
  for (const styleId of uniqueIds) {
    const source = styleSources[styleId];
    if (!source) continue;
    
    const selector = `.${source.name}`;
    const properties: string[] = [];
    
    // Get base styles (no breakpoint prefix)
    Object.entries(styles).forEach(([key, value]) => {
      if (key.startsWith(`${styleId}:`) && !key.includes('@')) {
        const prop = key.split(':')[1];
        if (prop && value) {
          properties.push(`  ${camelToKebab(prop)}: ${value};`);
        }
      }
    });
    
    if (properties.length > 0) {
      cssRules.push(`${selector} {\n${properties.join('\n')}\n}`);
    }
  }
  
  return cssRules.join('\n\n');
}

function collectStyleSourceIds(instance: ComponentInstance): string[] {
  const ids: string[] = [...(instance.styleSourceIds || [])];
  for (const child of instance.children || []) {
    ids.push(...collectStyleSourceIds(child));
  }
  return ids;
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

// Get code for a specific component by path
export function getComponentCode(
  components: ComponentCodeEntry[], 
  path: string
): { html: string; css: string } | null {
  const flat = flattenComponents(components);
  const entry = flat.find(c => c.path === path);
  
  if (!entry) return null;
  
  return {
    html: `<!-- Component: ${entry.name} -->\n<!-- Instance ID: ${entry.instanceId} -->\n${entry.isLinked ? `<!-- Linked to: ${entry.prebuiltId} -->\n` : ''}\n${entry.htmlCode}`,
    css: `/* Styles for: ${entry.name} */\n\n${entry.cssCode}`,
  };
}
