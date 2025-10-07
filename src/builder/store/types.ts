// Core types inspired by Webtir's component system

export type ComponentType = 'Box' | 'Text' | 'Heading' | 'Image' | 'Button' | 'Link';

export type StyleSourceType = 'local' | 'token' | 'preset';

export interface Breakpoint {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
}

export interface StyleSource {
  id: string;
  type: StyleSourceType;
  name: string;
}

export interface StyleValue {
  value: string;
  breakpointId: string;
}

export interface StyleDeclaration {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
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
  fontFamily?: string;
  lineHeight?: string;
  letterSpacing?: string;
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
  styleSourceIds: string[];
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

export interface StyleStore {
  // Style sources (classes)
  styleSources: Record<string, StyleSource>;
  
  // Styles (key: styleSourceId:breakpointId:property)
  styles: Record<string, string>;
  
  // Breakpoints
  breakpoints: Breakpoint[];
  currentBreakpointId: string;
  
  // Actions
  createStyleSource: (type: StyleSourceType, name?: string) => string;
  deleteStyleSource: (id: string) => void;
  setStyle: (styleSourceId: string, property: string, value: string, breakpointId?: string) => void;
  getComputedStyles: (styleSourceIds: string[], breakpointId?: string) => StyleDeclaration;
  setCurrentBreakpoint: (id: string) => void;
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
