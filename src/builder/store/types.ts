// Core types inspired by Webtir's component system

export type ComponentType = 
  // Core/Layout
  | 'Div' | 'Container' | 'Section' | 'Text' | 'Heading' | 'Image' | 'Button' | 'Link'
  // Rich Text
  | 'RichText' | 'Blockquote' | 'OrderedList' | 'UnorderedList' | 'CodeBlock'
  // Commonly Used
  | 'Table' | 'Cell' | 'NumberInput' | 'TabbedContainer' | 'MixedChart' | 'KeyValue' | 'Navigation' | 'Dropdown'
  // Text Inputs
  | 'EditableText' | 'EditableTextArea' | 'Email' | 'JSONEditor' | 'Password' | 'RichTextEditor' | 'TextArea' | 'TextInput' | 'URL'
  // Charts
  | 'BarChart' | 'BubbleChart' | 'FunnelChart' | 'HeatMap' | 'LineChart' | 'PieChart' | 'PlotlyJSONChart' | 'SankeyChart' | 'ScatterChart' | 'Sparkline' | 'StackedBarChart' | 'SunburstChart' | 'Treemap' | 'WaterfallChart'
  // Presentation
  | 'Alert' | 'Avatar' | 'AvatarGroup' | 'Calendar' | 'CircularImage' | 'Divider' | 'EventList' | 'Icon' | 'IconText' | 'ImageGrid' | 'PDF' | 'ProgressBar' | 'ProgressCircle' | 'QRCode' | 'Spacer' | 'Statistic' | 'Status' | 'Tags' | 'Timeline' | 'Video' | 'Youtube' | 'Lottie'
  // Forms
  | 'Form' | 'FormButton' | 'InputLabel' | 'Select' | 'RadioGroup' | 'CheckboxField'
  // Localization
  | 'Time'
  // Radix
  | 'Sheet' | 'NavigationMenu' | 'Tabs' | 'Accordion' | 'Dialog' | 'Collapsible' | 'Popover' | 'Tooltip' | 'Switch' | 'Label';

export type StyleSourceType = 'local' | 'token' | 'preset';

export type PseudoState = 'default' | 'hover' | 'focus' | 'active' | 'visited';

export interface Breakpoint {
  id: string;
  label: string;
  minWidth?: number;
  maxWidth?: number;
}

// Color value with token support
export interface ColorValue {
  type: 'token' | 'hex' | 'rgb' | 'hsl';
  value: string;
  alpha?: number;
  token?: string;
}

// Shadow item
export interface ShadowItem {
  id: string;
  enabled: boolean;
  inset: boolean;
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
}

// Transform item
export interface TransformItem {
  id: string;
  enabled: boolean;
  type: 'translateX' | 'translateY' | 'translateZ' | 'scaleX' | 'scaleY' | 'scaleZ' | 'rotate' | 'rotateX' | 'rotateY' | 'rotateZ' | 'skewX' | 'skewY' | 'perspective';
  value: string;
  unit: string;
}

// Filter item
export interface FilterItem {
  id: string;
  enabled: boolean;
  type: 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'hue-rotate' | 'invert' | 'saturate' | 'sepia';
  value: string;
  unit: string;
}

// Transition item
export interface TransitionItem {
  id: string;
  enabled: boolean;
  property: string;
  duration: string;
  easing: string;
  delay: string;
}

// Gradient stop
export interface GradientStop {
  id: string;
  position: number;
  color: string;
}

// Gradient item
export interface GradientItem {
  id: string;
  enabled: boolean;
  type: 'linear' | 'radial';
  angle?: string;
  shape?: string;
  stops: GradientStop[];
}

// Background layer
export interface BackgroundLayer {
  id: string;
  enabled: boolean;
  type: 'image' | 'gradient';
  url?: string;
  size?: string;
  position?: string;
  repeat?: string;
  attachment?: string;
  gradient?: GradientItem;
}

// Style metadata for complex properties
export interface StyleMetadata {
  shadows?: ShadowItem[];
  transforms?: TransformItem[];
  filters?: FilterItem[];
  backdropFilters?: FilterItem[];
  transitions?: TransitionItem[];
  backgrounds?: BackgroundLayer[];
}

export interface StyleSource {
  id: string;
  type: StyleSourceType;
  name: string;
  metadata?: StyleMetadata;
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
  
  // Styles (key: styleSourceId:breakpointId:state:property)
  styles: Record<string, string>;
  
  // Breakpoints
  breakpoints: Breakpoint[];
  currentBreakpointId: string;
  
  // Current state (for UI)
  currentPseudoState: PseudoState;

  // Naming helpers
  nameCounters: Record<string, number>;
  nextLocalClassName: (componentType: string) => string;
  getNextAutoClassName: (componentType: string, startFrom?: 'none' | number) => string;
  initCountersFromRegistry: () => void;
  
  // Actions
  createStyleSource: (type: StyleSourceType, name?: string) => string;
  renameStyleSource: (id: string, newName: string) => void;
  deleteStyleSource: (id: string) => void;
  setStyle: (styleSourceId: string, property: string, value: string, breakpointId?: string, state?: PseudoState) => void;
  getComputedStyles: (styleSourceIds: string[], breakpointId?: string, state?: PseudoState) => StyleDeclaration;
  setCurrentBreakpoint: (id: string) => void;
  setCurrentPseudoState: (state: PseudoState) => void;
  resetStyles: (styleSourceId: string, breakpointId?: string, state?: PseudoState) => void;
  
  // Metadata actions
  setStyleMetadata: (styleSourceId: string, metadata: Partial<StyleMetadata>) => void;
  getStyleMetadata: (styleSourceId: string) => StyleMetadata | undefined;
  
  // Class dependency tracking
  classDependencies: Record<string, string[]>;
  setClassDependency: (baseClassId: string, dependentClassId: string) => void;
  removeClassDependency: (baseClassId: string, dependentClassId: string) => void;
  isClassEditable: (classId: string) => boolean;
  getClassDependents: (classId: string) => string[];
  getPropertyState: (styleSourceId: string, property: string, breakpointId?: string, state?: PseudoState) => any;
}

export interface BuilderState {
  // Component tree
  rootInstance: ComponentInstance | null;
  
  // Selection
  selectedInstanceId: string | null;
  hoveredInstanceId: string | null;
  
  // History
  history: ComponentInstance[];
  historyIndex: number;
  
  // Clipboard
  clipboard: ComponentInstance | null;
  
  // Actions
  addInstance: (instance: ComponentInstance, parentId?: string, index?: number) => void;
  updateInstance: (id: string, updates: Partial<ComponentInstance>) => void;
  deleteInstance: (id: string) => void;
  setSelectedInstanceId: (id: string | null) => void;
  setHoveredInstanceId: (id: string | null) => void;
  moveInstance: (instanceId: string, newParentId: string, index: number) => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  
  // Clipboard actions
  copySelected: () => void;
  cutSelected: () => void;
  pasteClipboard: () => void;
  
  // Utilities
  findInstance: (id: string) => ComponentInstance | null;
  getSelectedInstance: () => ComponentInstance | null;
}
