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
  children?: AIComponentSpec[];
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
}

const generateId = () => Math.random().toString(36).substring(2, 11);

// Validate and normalize component spec from AI
function normalizeComponentSpec(spec: AIComponentSpec): AIComponentSpec {
  const type = spec.type || 'Div';
  const meta = componentRegistry[type] || componentRegistry['Div'];
  
  // Ensure valid type
  const validType = componentRegistry[type] ? type : 'Div';
  
  // Merge with defaults, AI props take precedence
  const normalizedProps = {
    ...meta.defaultProps,
    ...spec.props,
  };
  
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
  
  // Recursively normalize children
  const normalizedChildren = (spec.children || []).map(normalizeComponentSpec);
  
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
    
    // Ensure color values use proper CSS variable syntax
    if (normalizedValue.includes('var(--') && !normalizedValue.includes('hsl(')) {
      // If it's just var(--something), wrap in hsl() for color properties
      const colorProps = ['color', 'backgroundColor', 'borderColor', 'background'];
      if (colorProps.some(p => key.toLowerCase().includes(p.toLowerCase()))) {
        normalizedValue = `hsl(${normalizedValue})`;
      }
    }
    
    normalized[key] = normalizedValue;
  }
  
  return normalized;
}

export function parseAIResponse(text: string): AIResponse | null {
  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonBlockMatch ? jsonBlockMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.action) {
      return null;
    }

    // Handle different action types
    if (parsed.action === 'create' && Array.isArray(parsed.components)) {
      const normalizedComponents = parsed.components.map(normalizeComponentSpec);
      return {
        action: parsed.action,
        components: normalizedComponents,
        message: parsed.message || '',
      };
    }

    if (parsed.action === 'update' && Array.isArray(parsed.updates)) {
      return {
        action: 'update',
        updates: parsed.updates,
        message: parsed.message || '',
      };
    }

    if (parsed.action === 'generate-image' && parsed.imageSpec) {
      return {
        action: 'generate-image',
        imageSpec: parsed.imageSpec,
        message: parsed.message || '',
      };
    }

    if (parsed.action === 'delete') {
      return {
        action: 'delete',
        message: parsed.message || '',
      };
    }

    return null;
  } catch {
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
  parentId: string = 'root'
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
    const styleSourceId = `style_${instanceId}`;

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
