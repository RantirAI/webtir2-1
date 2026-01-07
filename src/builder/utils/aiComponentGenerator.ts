import { ComponentInstance, ComponentType } from '../store/types';
import { componentRegistry } from '../primitives/registry';

export interface AIComponentSpec {
  type: string;
  label?: string;
  props?: Record<string, unknown>;
  styles?: Record<string, string>;
  children?: AIComponentSpec[];
}

export interface AIResponse {
  action: 'create' | 'update' | 'delete';
  components: AIComponentSpec[];
  message: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export function parseAIResponse(text: string): AIResponse | null {
  // Try to extract JSON from markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonBlockMatch ? jsonBlockMatch[1].trim() : text.trim();

  try {
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.action || !Array.isArray(parsed.components)) {
      return null;
    }

    return {
      action: parsed.action,
      components: parsed.components,
      message: parsed.message || '',
    };
  } catch {
    return null;
  }
}

export function flattenInstances(
  spec: AIComponentSpec,
  parentId: string = 'root'
): {
  instances: ComponentInstance[];
  styleSources: Record<string, Record<string, string>>;
  rootInstanceId: string;
} {
  const instances: ComponentInstance[] = [];
  const styleSources: Record<string, Record<string, string>> = {};

  function processSpec(spec: AIComponentSpec): ComponentInstance {
    const type = spec.type as ComponentType;
    const meta = componentRegistry[type] || componentRegistry['Div'];

    const instanceId = generateId();
    const styleSourceId = `style_${instanceId}`;

    const props = { ...meta.defaultProps, ...spec.props };
    const styles = { ...meta.defaultStyles, ...spec.styles };

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
    styleSources[styleSourceId] = styles;

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
