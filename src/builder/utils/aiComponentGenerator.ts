import { ComponentInstance, ComponentType } from '../store/types';
import { componentRegistry } from '../primitives/registry';

export interface AIComponentSpec {
  type: string;
  label?: string;
  props?: Record<string, unknown>;
  styles?: Record<string, string>;
  responsiveStyles?: {
    tablet?: Record<string, string>;
    mobile?: Record<string, string>;
  };
  children?: AIComponentSpec[] | AIComponentSpec | string;
}

export interface AIUpdateSpec {
  targetId: string;
  styles?: Record<string, string>;
  responsiveStyles?: {
    tablet?: Record<string, string>;
    mobile?: Record<string, string>;
  };
  props?: Record<string, unknown>;
}

export interface AIImageSpec {
  prompt: string;
  type: 'logo' | 'product' | 'hero' | 'icon' | 'custom';
  style?: 'minimal' | 'modern' | 'vibrant' | 'professional';
  targetComponent?: string;
}

export interface AIResponse {
  action: 'create' | 'update' | 'delete' | 'generate-image';
  components?: AIComponentSpec[];
  updates?: AIUpdateSpec[];
  imageSpec?: AIImageSpec;
  message: string;
  // Truncation info for auto-continue
  wasTruncated?: boolean;
  truncatedCount?: number;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

// Fallback image URLs
const FALLBACK_IMAGES = {
  default: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  profile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  dashboard: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  developer: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
  analytics: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
};

// Sanitize image src - convert placeholders to real URLs
function sanitizeImageSrc(src: string | undefined, alt?: string): string {
  if (!src) return FALLBACK_IMAGES.default;
  
  // If it's a placeholder string, replace with real URL
  const srcLower = src.toLowerCase();
  if (srcLower.includes('placeholder') || src.startsWith('IMAGE_') || srcLower.includes('via.placeholder')) {
    // Try to determine type from the src or alt text
    const context = `${srcLower} ${(alt || '').toLowerCase()}`;
    if (context.includes('profile') || context.includes('headshot') || context.includes('avatar') || context.includes('photo')) {
      return FALLBACK_IMAGES.profile;
    }
    if (context.includes('dashboard') || context.includes('product') || context.includes('screenshot')) {
      return FALLBACK_IMAGES.dashboard;
    }
    if (context.includes('developer') || context.includes('coding') || context.includes('code')) {
      return FALLBACK_IMAGES.developer;
    }
    if (context.includes('analytics') || context.includes('chart') || context.includes('data')) {
      return FALLBACK_IMAGES.analytics;
    }
    return FALLBACK_IMAGES.default;
  }
  
  return src;
}

// Validate and normalize component spec from AI
function normalizeComponentSpec(spec: AIComponentSpec): AIComponentSpec {
  const type = spec.type || 'Div';
  const meta = componentRegistry[type] || componentRegistry['Div'];
  
  // Ensure valid type
  const validType = componentRegistry[type] ? type : 'Div';
  
  // Merge with defaults, AI props take precedence
  let normalizedProps = {
    ...meta.defaultProps,
    ...spec.props,
  };
  
  // Sanitize image src for Image components
  if (validType === 'Image' && normalizedProps.src !== undefined) {
    normalizedProps.src = sanitizeImageSrc(normalizedProps.src as string, normalizedProps.alt as string);
  }
  
  // Normalize styles - ensure CSS variables are properly formatted
  const normalizedStyles = normalizeStyles({
    ...meta.defaultStyles,
    ...spec.styles,
  });
  
  // Normalize responsive styles
  const normalizedResponsiveStyles: AIComponentSpec['responsiveStyles'] = {};
  if (spec.responsiveStyles?.tablet) {
    normalizedResponsiveStyles.tablet = normalizeStyles(spec.responsiveStyles.tablet);
  }
  if (spec.responsiveStyles?.mobile) {
    normalizedResponsiveStyles.mobile = normalizeStyles(spec.responsiveStyles.mobile);
  }
  
  // Recursively normalize children - handle array, single object, or string
  let normalizedChildren: AIComponentSpec[] = [];

  if (spec.children) {
    if (Array.isArray(spec.children)) {
      // Normal case: array of child specs
      normalizedChildren = spec.children.map(normalizeComponentSpec);
    } else if (typeof spec.children === 'object' && spec.children !== null) {
      // Single child object (AI returned object instead of array)
      normalizedChildren = [normalizeComponentSpec(spec.children as AIComponentSpec)];
    } else if (typeof spec.children === 'string') {
      // AI returned a string as children - convert to Text component
      normalizedChildren = [{
        type: 'Text',
        props: { children: spec.children },
        styles: {},
        children: [],
      }];
    }
  }
  
  return {
    type: validType,
    label: spec.label || meta.label,
    props: normalizedProps,
    styles: normalizedStyles,
    responsiveStyles: Object.keys(normalizedResponsiveStyles).length > 0 ? normalizedResponsiveStyles : undefined,
    children: normalizedChildren,
  };
}

// Normalize CSS styles
function normalizeStyles(styles: Record<string, string>): Record<string, string> {
  const normalized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined || value === null) continue;
    
    // Convert string values
    let normalizedValue = String(value);
    let normalizedKey = key;
    
    // Handle 'background' shorthand - convert gradient values to 'backgroundGradient'
    // This is the internal property name that StyleSheetInjector maps to 'background-image'
    if (key === 'background' && normalizedValue.includes('gradient')) {
      normalizedKey = 'backgroundGradient';
    }
    // Handle 'background' with solid color - convert to 'backgroundColor'
    else if (key === 'background' && !normalizedValue.includes('gradient') && !normalizedValue.includes('url(')) {
      normalizedKey = 'backgroundColor';
    }
    
    // Ensure color values use proper CSS variable syntax
    if (normalizedValue.includes('var(--') && !normalizedValue.includes('hsl(')) {
      // If it's just var(--something), wrap in hsl() for color properties
      const colorProps = ['color', 'backgroundColor', 'borderColor', 'background'];
      if (colorProps.some(p => normalizedKey.toLowerCase().includes(p.toLowerCase()))) {
        normalizedValue = `hsl(${normalizedValue})`;
      }
    }
    
    normalized[normalizedKey] = normalizedValue;
  }
  
  return normalized;
}

// Extract JSON from text using multiple strategies
function extractJSON(text: string): string | null {
  // Strategy 1: All markdown code blocks - try each in order
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const candidate = match[1].trim();
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object') {
        return candidate;
      }
    } catch {
      // Continue to next block
    }
  }
  
  // Strategy 2: Find balanced JSON object containing "action" or "components"
  const startIdx = text.search(/\{\s*"(?:action|components)/i);
  if (startIdx !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    
    for (let i = startIdx; i < text.length; i++) {
      const char = text[i];
      
      if (escape) {
        escape = false;
        continue;
      }
      
      if (char === '\\' && inString) {
        escape = true;
        continue;
      }
      
      if (char === '"' && !escape) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') depth++;
        if (char === '}') {
          depth--;
          if (depth === 0) {
            const candidate = text.slice(startIdx, i + 1);
            try {
              JSON.parse(candidate);
              return candidate;
            } catch {
              break;
            }
          }
        }
      }
    }
  }
  
  // Strategy 3: Try raw text as JSON
  try {
    JSON.parse(text.trim());
    return text.trim();
  } catch {
    return null;
  }
}

// Normalize parsed object to handle common variations
function normalizeAIObject(obj: Record<string, unknown>): Record<string, unknown> {
  // Unwrap common wrapper keys
  const wrappers = ['result', 'data', 'response', 'output'];
  for (const key of wrappers) {
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      const inner = obj[key] as Record<string, unknown>;
      if (inner.action || inner.components) {
        obj = inner;
        break;
      }
    }
  }
  
  // Normalize action to lowercase
  if (typeof obj.action === 'string') {
    obj.action = obj.action.toLowerCase();
  }
  
  // Infer action from presence of components/updates/imageSpec
  if (!obj.action) {
    if (obj.components) obj.action = 'create';
    else if (obj.updates) obj.action = 'update';
    else if (obj.imageSpec) obj.action = 'generate-image';
  }
  
  // Wrap single component object into array
  if (obj.components && !Array.isArray(obj.components) && typeof obj.components === 'object') {
    obj.components = [obj.components];
  }
  
  // Wrap single update object into array
  if (obj.updates && !Array.isArray(obj.updates) && typeof obj.updates === 'object') {
    obj.updates = [obj.updates];
  }

  // Pre-normalize children in components to handle single objects
  if (Array.isArray(obj.components)) {
    obj.components = (obj.components as AIComponentSpec[]).map(comp => normalizeChildrenDeep(comp));
  }
  
  return obj;
}

// Recursively normalize children throughout the component tree
function normalizeChildrenDeep(comp: AIComponentSpec): AIComponentSpec {
  if (!comp.children) return comp;
  
  // Convert single object children to array
  if (!Array.isArray(comp.children) && typeof comp.children === 'object' && comp.children !== null) {
    comp.children = [comp.children as AIComponentSpec];
  }
  
  // Recursively process array children
  if (Array.isArray(comp.children)) {
    comp.children = comp.children.map(child => normalizeChildrenDeep(child));
  }
  
  return comp;
}

// Validate that a component spec is complete (not truncated)
function isCompleteComponentSpec(spec: AIComponentSpec): boolean {
  // Must have a type
  if (!spec.type || typeof spec.type !== 'string') return false;
  
  // If it has children, validate they're complete too
  if (spec.children && Array.isArray(spec.children)) {
    for (const child of spec.children) {
      if (typeof child === 'object' && child !== null) {
        if (!isCompleteComponentSpec(child as AIComponentSpec)) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// Detect if text looks like truncated JSON (cut mid-stream)
export function detectTruncatedJSON(text: string): boolean {
  // Must contain some JSON-like content
  if (!text.includes('"action"') && !text.includes('"components"')) {
    return false;
  }
  
  // Check for unbalanced braces/brackets
  let braceDepth = 0;
  let bracketDepth = 0;
  let inString = false;
  let escape = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      escape = true;
      continue;
    }
    
    if (char === '"' && !escape) {
      inString = !inString;
      continue;
    }
    
    if (!inString) {
      if (char === '{') braceDepth++;
      if (char === '}') braceDepth--;
      if (char === '[') bracketDepth++;
      if (char === ']') bracketDepth--;
    }
  }
  
  // If braces/brackets are unbalanced, JSON was truncated
  return braceDepth !== 0 || bracketDepth !== 0;
}

export function parseAIResponse(text: string): AIResponse | null {
  // First check if this looks like truncated JSON
  const isTruncatedJSON = detectTruncatedJSON(text);
  
  const jsonStr = extractJSON(text);
  
  if (!jsonStr) {
    console.log('No valid JSON found in AI response');
    // If it looked like JSON but failed to extract, it was likely truncated
    if (isTruncatedJSON) {
      console.warn('AI response appears to be truncated mid-JSON');
      return {
        action: 'create',
        components: [],
        message: 'Response was truncated. Continuing...',
        wasTruncated: true,
        truncatedCount: 1, // At least one component was truncated
      };
    }
    return null;
  }

  // Clean up common issues
  const cleanedJson = jsonStr
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']');

  try {
    let parsed = JSON.parse(cleanedJson) as Record<string, unknown>;
    parsed = normalizeAIObject(parsed);
    
    const action = parsed.action as string;
    
    if (!action) {
      console.warn('AI response missing action field after normalization');
      return null;
    }

    // Handle CREATE action
    if (action === 'create') {
      const components = parsed.components as AIComponentSpec[] | undefined;
      if (components && Array.isArray(components) && components.length > 0) {
        // Filter out incomplete/truncated components and warn
        const validComponents = components.filter(comp => {
          const isComplete = isCompleteComponentSpec(comp);
          if (!isComplete) {
            console.warn('Filtering out incomplete component:', comp.type || 'unknown');
          }
          return isComplete;
        });
        
        if (validComponents.length < components.length) {
          console.warn(`${components.length - validComponents.length} components were truncated and filtered out`);
        }
        
        // Check if message indicates more sections needed
        const messageIndicatesMore = ((parsed.message as string) || '').toLowerCase().includes('remaining') ||
          ((parsed.message as string) || '').toLowerCase().includes('continue') ||
          ((parsed.message as string) || '').toLowerCase().includes('more sections');
        
        const truncatedCount = components.length - validComponents.length;
        const wasTruncated = truncatedCount > 0 || messageIndicatesMore || isTruncatedJSON;
        
        // Even if all components were truncated, return with wasTruncated flag
        // so auto-continue can kick in
        if (validComponents.length === 0 && wasTruncated) {
          console.warn('All components were truncated, triggering auto-continue');
          return {
            action: 'create',
            components: [],
            message: (parsed.message as string) || 'Response was truncated. Continuing...',
            wasTruncated: true,
            truncatedCount: truncatedCount || 1,
          };
        }
        
        if (validComponents.length === 0) {
          console.error('All components were invalid');
          return null;
        }
        
        const normalizedComponents = validComponents.map(normalizeComponentSpec);
        return {
          action: 'create',
          components: normalizedComponents,
          message: (parsed.message as string) || 'Components created successfully!',
          wasTruncated,
          truncatedCount: wasTruncated ? Math.max(truncatedCount, 1) : 0,
        };
      }
    }

    // Handle UPDATE action
    if (action === 'update') {
      const updates = parsed.updates as AIUpdateSpec[] | undefined;
      if (updates && Array.isArray(updates)) {
        return {
          action: 'update',
          updates,
          message: (parsed.message as string) || 'Styles updated successfully!',
        };
      }
    }

    // Handle IMAGE GENERATION action
    if (action === 'generate-image') {
      const imageSpec = parsed.imageSpec as AIImageSpec | undefined;
      if (imageSpec) {
        return {
          action: 'generate-image',
          imageSpec,
          message: (parsed.message as string) || 'Generating image...',
        };
      }
    }

    // Handle DELETE action
    if (action === 'delete') {
      return {
        action: 'delete',
        message: (parsed.message as string) || 'Components deleted!',
      };
    }

    console.warn('AI response has unhandled action or missing data:', action);
    return null;
  } catch (error) {
    console.error('Failed to parse AI JSON:', error);
    // If parsing failed but we detected truncation, signal for auto-continue
    if (isTruncatedJSON) {
      return {
        action: 'create',
        components: [],
        message: 'Response was truncated. Continuing...',
        wasTruncated: true,
        truncatedCount: 1,
      };
    }
    return null;
  }
}

export interface BreakpointStyles {
  base: Record<string, string>;
  tablet?: Record<string, string>;
  mobile?: Record<string, string>;
}

export function flattenInstances(
  spec: AIComponentSpec,
  parentId: string = 'root',
  getClassName?: (componentType: string, label?: string) => string
): {
  instances: ComponentInstance[];
  styleSources: Record<string, BreakpointStyles>;
  rootInstanceId: string;
} {
  const instances: ComponentInstance[] = [];
  const styleSources: Record<string, BreakpointStyles> = {};

  function processSpec(spec: AIComponentSpec): ComponentInstance {
    const type = spec.type as ComponentType;
    const meta = componentRegistry[type] || componentRegistry['Div'];

    const instanceId = generateId();
    // Use semantic class name if callback provided, otherwise fallback to random id
    const styleSourceId = getClassName ? getClassName(type, spec.label) : `style_${instanceId}`;

    // Props and styles are already normalized from parseAIResponse
    const props = spec.props || meta.defaultProps;
    const styles = spec.styles || meta.defaultStyles;

    // Process children recursively - returns ComponentInstance[]
    const childInstances: ComponentInstance[] = [];
    if (spec.children && Array.isArray(spec.children)) {
      for (const childSpec of spec.children) {
        const childInstance = processSpec(childSpec);
        childInstances.push(childInstance);
      }
    }

    const instance: ComponentInstance = {
      id: instanceId,
      type: meta ? type : 'Div',
      label: spec.label || meta.label,
      props,
      styleSourceIds: [styleSourceId],
      children: childInstances,
    };

    instances.push(instance);
    
    // Store styles with breakpoint info
    styleSources[styleSourceId] = {
      base: styles as Record<string, string>,
      tablet: spec.responsiveStyles?.tablet,
      mobile: spec.responsiveStyles?.mobile,
    };

    return instance;
  }

  const rootInstance = processSpec(spec);

  return { instances, styleSources, rootInstanceId: rootInstance.id };
}

export function isValidComponentType(type: string): boolean {
  return type in componentRegistry;
}

export function getAvailableComponentTypes(): string[] {
  return Object.keys(componentRegistry);
}
