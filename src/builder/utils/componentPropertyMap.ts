/**
 * Component Property Map
 * 
 * Defines which style properties are available for each component type.
 * This enables the StylePanel to show only relevant controls per component.
 * 
 * Property groups:
 * - layout: display, flexDirection, justifyContent, alignItems, gap, flexWrap, order
 * - space: marginTop, marginRight, marginBottom, marginLeft, paddingTop, paddingRight, paddingBottom, paddingLeft
 * - size: width, height, minWidth, minHeight, maxWidth, maxHeight, overflow
 * - position: position, top, right, bottom, left, zIndex, transform
 * - typography: fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textAlign, color, textDecoration, textTransform, whiteSpace
 * - backgrounds: backgroundColor, backgroundImage, backgroundSize, backgroundPosition, backgroundRepeat, backgroundGradient
 * - borders: borderWidth, borderColor, borderStyle, borderRadius
 * - effects: boxShadow, opacity, cursor
 */

import { ComponentType } from '../store/types';

// Style property groups
export type StylePropertyGroup = 
  | 'layout'
  | 'space'
  | 'size'
  | 'position'
  | 'typography'
  | 'backgrounds'
  | 'borders'
  | 'effects';

// Component category definitions
export type ComponentCategory = 
  | 'layout'
  | 'typography'
  | 'media'
  | 'forms'
  | 'data'
  | 'presentation'
  | 'other';

// Default properties for unspecified components (all properties enabled)
const defaultPropertyGroups: StylePropertyGroup[] = ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'];

// Map component types to their categories (partial - uses 'other' as default)
const componentCategoriesPartial: Partial<Record<ComponentType, ComponentCategory>> = {
  // Layout
  Section: 'layout',
  Container: 'layout',
  Div: 'layout',
  Box: 'layout',
  Navigation: 'layout',
  Dropdown: 'layout',
  
  // Typography
  Heading: 'typography',
  Text: 'typography',
  RichText: 'typography',
  Button: 'typography',
  Link: 'typography',
  Blockquote: 'typography',
  CodeBlock: 'typography',
  
  // Media
  Image: 'media',
  Video: 'media',
  Youtube: 'media',
  Lottie: 'media',
  CircularImage: 'media',
  PDF: 'media',
  
  // Forms
  Form: 'forms',
  FormButton: 'forms',
  InputLabel: 'forms',
  TextInput: 'forms',
  TextArea: 'forms',
  Select: 'forms',
  RadioGroup: 'forms',
  CheckboxField: 'forms',
  EditableText: 'forms',
  EditableTextArea: 'forms',
  Email: 'forms',
  Password: 'forms',
  URL: 'forms',
  NumberInput: 'forms',
  JSONEditor: 'forms',
  RichTextEditor: 'forms',
  
  // Data
  Table: 'data',
  Cell: 'data',
  KeyValue: 'data',
  
  // Presentation
  Alert: 'presentation',
  Avatar: 'presentation',
  AvatarGroup: 'presentation',
  Calendar: 'presentation',
  Divider: 'presentation',
  Icon: 'presentation',
  IconText: 'presentation',
  ImageGrid: 'presentation',
  ProgressBar: 'presentation',
  ProgressCircle: 'presentation',
  QRCode: 'presentation',
  Spacer: 'presentation',
  Statistic: 'presentation',
  Status: 'presentation',
  Tags: 'presentation',
  Timeline: 'presentation',
  EventList: 'presentation',
};

// Get component category with fallback
export function getComponentCategory(componentType: ComponentType): ComponentCategory {
  return componentCategoriesPartial[componentType] || 'other';
}

// Define which property groups are available for each component type (partial)
const componentPropertyGroupsPartial: Partial<Record<ComponentType, StylePropertyGroup[]>> = {
  // Layout components - full style control (no typography)
  Section: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Container: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Div: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Box: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Navigation: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Dropdown: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  
  // Typography components - typography focused, no background-image
  Heading: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  Text: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  RichText: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  Blockquote: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  CodeBlock: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  
  // Interactive typography - includes backgrounds for button/link styling
  Button: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Link: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  
  // Media components - size and positioning focused
  Image: ['layout', 'space', 'size', 'position', 'borders', 'effects'],
  Video: ['layout', 'space', 'size', 'position', 'borders', 'effects'],
  Youtube: ['layout', 'space', 'size', 'position', 'borders', 'effects'],
  Lottie: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  CircularImage: ['layout', 'space', 'size', 'position', 'borders', 'effects'],
  PDF: ['layout', 'space', 'size', 'position', 'borders', 'effects'],
  
  // Form components
  Form: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  FormButton: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  InputLabel: ['layout', 'space', 'size', 'position', 'typography', 'effects'],
  TextInput: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  TextArea: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Select: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  RadioGroup: ['layout', 'space', 'size', 'position', 'typography', 'effects'],
  CheckboxField: ['layout', 'space', 'size', 'position', 'typography', 'effects'],
  EditableText: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  EditableTextArea: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Email: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Password: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  URL: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  NumberInput: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  
  // Data components
  Table: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Cell: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  KeyValue: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  
  // Presentation - most have full control
  Alert: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Avatar: ['layout', 'space', 'size', 'position', 'borders', 'effects'],
  AvatarGroup: ['layout', 'space', 'size', 'position', 'effects'],
  Calendar: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Divider: ['layout', 'space', 'size', 'position', 'backgrounds', 'effects'],
  Icon: ['layout', 'space', 'size', 'position', 'effects'],
  IconText: ['layout', 'space', 'size', 'position', 'typography', 'effects'],
  ProgressBar: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  ProgressCircle: ['layout', 'space', 'size', 'position', 'effects'],
  Spacer: ['layout', 'space', 'size', 'position'],
  Statistic: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Tags: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Timeline: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  EventList: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Status: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  QRCode: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  ImageGrid: ['layout', 'space', 'size', 'position', 'borders', 'effects'],
  
  // Charts - limited styling (mostly sizing and positioning)
  BarChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  LineChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  PieChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  MixedChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  ScatterChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  BubbleChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  FunnelChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  HeatMap: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  SankeyChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  StackedBarChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  SunburstChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Treemap: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  WaterfallChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Sparkline: ['layout', 'space', 'size', 'position', 'effects'],
  PlotlyJSONChart: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  
  // Radix UI components
  Sheet: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  NavigationMenu: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Tabs: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  TabbedContainer: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Accordion: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Dialog: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Collapsible: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Popover: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Tooltip: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  Switch: ['layout', 'space', 'size', 'position', 'backgrounds', 'borders', 'effects'],
  Label: ['layout', 'space', 'size', 'position', 'typography', 'effects'],
  
  // Lists
  OrderedList: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  UnorderedList: ['layout', 'space', 'size', 'position', 'typography', 'borders', 'effects'],
  
  // Time/Localization
  Time: ['layout', 'space', 'size', 'position', 'typography', 'effects'],
  
  // JSON Editor
  JSONEditor: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
  RichTextEditor: ['layout', 'space', 'size', 'position', 'typography', 'backgrounds', 'borders', 'effects'],
};

// Helper function to check if a component type supports a specific property group
export function componentSupportsPropertyGroup(componentType: ComponentType, group: StylePropertyGroup): boolean {
  const groups = componentPropertyGroupsPartial[componentType] || defaultPropertyGroups;
  return groups.includes(group);
}

// Helper function to get all supported property groups for a component type
export function getComponentPropertyGroups(componentType: ComponentType): StylePropertyGroup[] {
  return componentPropertyGroupsPartial[componentType] || defaultPropertyGroups;
}

// Property group to properties mapping for section visibility
export const propertyGroupProperties: Record<StylePropertyGroup, string[]> = {
  layout: ['display', 'flexDirection', 'justifyContent', 'alignItems', 'gap', 'flexWrap', 'order'],
  space: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  size: ['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'overflow', 'objectFit', 'objectPosition'],
  position: ['position', 'top', 'right', 'bottom', 'left', 'zIndex', 'transform'],
  typography: ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign', 'color', 'textDecoration', 'textTransform', 'whiteSpace'],
  backgrounds: ['backgroundColor', 'backgroundGradient', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat'],
  borders: ['borderWidth', 'borderColor', 'borderStyle', 'borderRadius', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'],
  effects: ['boxShadow', 'opacity', 'cursor'],
};

// Get tooltip text describing where the property will be saved
export function getPropertyTooltip(
  property: string, 
  className: string, 
  isActive: boolean, 
  pseudoState: string = 'default'
): string {
  const stateText = pseudoState !== 'default' ? ` — ${pseudoState.charAt(0).toUpperCase() + pseudoState.slice(1)} state` : '';
  const classType = isActive ? 'Active Class' : 'Inherited';
  return `Will save to: .${className} (${classType})${stateText}`;
}

// Check if a component should show the typography section
export function showTypographySection(componentType: ComponentType): boolean {
  return componentSupportsPropertyGroup(componentType, 'typography');
}

// Check if a component should show the backgrounds section (with background-image)
export function showBackgroundsSection(componentType: ComponentType): boolean {
  return componentSupportsPropertyGroup(componentType, 'backgrounds');
}

// Check if a component should show background-image control specifically
export function showBackgroundImageControl(componentType: ComponentType): boolean {
  // Typography components don't get background-image (except Button and CodeBlock)
  const typographyWithoutBgImage: ComponentType[] = ['Heading', 'Text', 'RichText', 'Link', 'Blockquote', 'InputLabel', 'EditableText', 'Label'];
  return !typographyWithoutBgImage.includes(componentType);
}
