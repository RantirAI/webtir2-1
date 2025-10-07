// Core types inspired by Webtir's component system

export type ComponentType = 'Box' | 'Text' | 'Heading' | 'Image' | 'Button' | 'Link';

export interface StyleDeclaration {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  maxWidth?: string;
  maxHeight?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: string;
  borderRadius?: string;
  border?: string;
  [key: string]: string | undefined;
}

export interface ComponentInstance {
  id: string;
  type: ComponentType;
  label?: string;
  props: Record<string, any>;
  styles: StyleDeclaration;
  children: ComponentInstance[];
}

export interface ComponentMeta {
  type: ComponentType;
  label: string;
  icon: string;
  defaultProps: Record<string, any>;
  defaultStyles: StyleDeclaration;
  propsDefinition: Record<string, PropDefinition>;
}

export interface PropDefinition {
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  control: 'text' | 'textarea' | 'select' | 'number' | 'checkbox';
  options?: string[];
  defaultValue?: any;
}

export interface BuilderState {
  // Component tree
  rootInstance: ComponentInstance | null;
  
  // Selection
  selectedInstanceId: string | null;
  hoveredInstanceId: string | null;
  
  // Actions
  addInstance: (instance: ComponentInstance, parentId?: string, index?: number) => void;
  updateInstance: (id: string, updates: Partial<ComponentInstance>) => void;
  deleteInstance: (id: string) => void;
  setSelectedInstanceId: (id: string | null) => void;
  setHoveredInstanceId: (id: string | null) => void;
  moveInstance: (instanceId: string, newParentId: string, index: number) => void;
  
  // Utilities
  findInstance: (id: string) => ComponentInstance | null;
  getSelectedInstance: () => ComponentInstance | null;
}
