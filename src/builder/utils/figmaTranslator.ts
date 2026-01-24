/**
 * Figma to Webtir Translator
 * Converts Figma clipboard JSON to Webtir ComponentInstance tree
 * Handles auto-layout, fills, text styles, and intelligent heading detection
 * Uses batch operations for performance
 */

import { ComponentType, ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

// ============================================
// FIGMA TYPE DEFINITIONS
// ============================================

export interface FigmaNode {
  id: string;
  name: string;
  type: 'FRAME' | 'GROUP' | 'COMPONENT' | 'INSTANCE' | 'TEXT' | 'RECTANGLE' | 'ELLIPSE' | 'VECTOR' | 'LINE' | 'POLYGON' | 'STAR' | 'BOOLEAN_OPERATION' | 'SLICE' | 'COMPONENT_SET';
  children?: FigmaNode[];
  
  // Layout properties (Auto-layout)
  layoutMode?: 'NONE' | 'HORIZONTAL' | 'VERTICAL';
  primaryAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
  counterAxisAlignItems?: 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  itemSpacing?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  layoutWrap?: 'NO_WRAP' | 'WRAP';
  itemReverseZIndex?: boolean;
  
  // Sizing
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  layoutGrow?: number;
  layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';
  constraints?: { horizontal: string; vertical: string };
  
  // Fills & effects
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  strokeWeight?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  cornerRadius?: number;
  topLeftRadius?: number;
  topRightRadius?: number;
  bottomLeftRadius?: number;
  bottomRightRadius?: number;
  opacity?: number;
  blendMode?: string;
  effects?: FigmaEffect[];
  
  // Text-specific
  characters?: string;
  style?: FigmaTextStyle;
  
  // Positioning
  x?: number;
  y?: number;
  rotation?: number;
  absoluteBoundingBox?: { x: number; y: number; width: number; height: number };
  relativeTransform?: number[][];
  
  // Component properties
  componentId?: string;
  isAsset?: boolean;
  visible?: boolean;
  locked?: boolean;
  
  // Clipping
  clipsContent?: boolean;
  
  // For images
  imageRef?: string;
}

export interface FigmaPaint {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL' | 'GRADIENT_ANGULAR' | 'GRADIENT_DIAMOND' | 'IMAGE' | 'EMOJI' | 'VIDEO';
  visible?: boolean;
  opacity?: number;
  color?: { r: number; g: number; b: number; a?: number };
  gradientHandlePositions?: { x: number; y: number }[];
  gradientStops?: { position: number; color: { r: number; g: number; b: number; a: number } }[];
  scaleMode?: 'FILL' | 'FIT' | 'CROP' | 'TILE';
  imageRef?: string;
  imageTransform?: number[][];
  rotation?: number;
}

export interface FigmaTextStyle {
  fontFamily?: string;
  fontPostScriptName?: string;
  fontSize?: number;
  fontWeight?: number;
  textAutoResize?: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE';
  textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
  textAlignVertical?: 'TOP' | 'CENTER' | 'BOTTOM';
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  lineHeightPercentFontSize?: number;
  lineHeightUnit?: 'PIXELS' | 'FONT_SIZE_%' | 'INTRINSIC_%';
  paragraphSpacing?: number;
  paragraphIndent?: number;
  textCase?: 'ORIGINAL' | 'UPPER' | 'LOWER' | 'TITLE' | 'SMALL_CAPS' | 'SMALL_CAPS_FORCED';
  textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';
  italic?: boolean;
}

export interface FigmaEffect {
  type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR';
  visible?: boolean;
  radius?: number;
  color?: { r: number; g: number; b: number; a: number };
  offset?: { x: number; y: number };
  spread?: number;
  blendMode?: string;
}

// Clipboard data structure from Figma
export interface FigmaClipboardData {
  // Figma clipboard can have different structures
  nodes?: FigmaNode[];
  meta?: { images?: Record<string, string> };
  // Sometimes nodes are under different keys
  [key: string]: any;
}

// Style collector for batch operations
interface StyleCollector {
  sources: Array<{ name: string }>;
  styleUpdates: Array<{ sourceIndex: number; property: string; value: string }>;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Convert Figma color (0-1 range) to CSS color string
 */
function figmaColorToCSS(color: { r: number; g: number; b: number; a?: number }, opacity?: number): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  const a = opacity ?? color.a ?? 1;
  
  if (a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
  }
  return `rgb(${r}, ${g}, ${b})`;
}

// ============================================
// HEADING DETECTION
// ============================================

/**
 * Font size thresholds for heading detection
 * Anything > 18px is considered a heading
 */
const HEADING_THRESHOLDS = {
  h1: 48,
  h2: 36,
  h3: 28,
  h4: 22,
  h5: 18,
  h6: 16, // Minimum for h6
};

/**
 * Determine heading level based on font size
 */
function getHeadingLevel(fontSize: number): 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
  if (fontSize > HEADING_THRESHOLDS.h1) return 'h1';
  if (fontSize > HEADING_THRESHOLDS.h2) return 'h2';
  if (fontSize > HEADING_THRESHOLDS.h3) return 'h3';
  if (fontSize > HEADING_THRESHOLDS.h4) return 'h4';
  if (fontSize > HEADING_THRESHOLDS.h5) return 'h5';
  return 'h6';
}

/**
 * Determine if text should be a heading based on font size
 */
function isHeadingText(fontSize: number): boolean {
  return fontSize > HEADING_THRESHOLDS.h5; // > 18px
}

// ============================================
// TYPE MAPPING
// ============================================

/**
 * Map Figma node type to Webtir ComponentType
 */
function mapFigmaTypeToWebtir(node: FigmaNode): ComponentType {
  // Skip invisible nodes
  if (node.visible === false) {
    return 'Div';
  }
  
  switch (node.type) {
    case 'TEXT':
      const fontSize = node.style?.fontSize || 16;
      return isHeadingText(fontSize) ? 'Heading' : 'Text';
    
    case 'FRAME':
    case 'GROUP':
    case 'COMPONENT':
    case 'INSTANCE':
    case 'COMPONENT_SET':
      return 'Div';
    
    case 'RECTANGLE':
      // Could be a button if it has specific properties
      return 'Div';
    
    case 'ELLIPSE':
      return 'Div';
    
    case 'VECTOR':
    case 'LINE':
    case 'POLYGON':
    case 'STAR':
    case 'BOOLEAN_OPERATION':
      // These are usually icons or decorative elements
      return 'Div';
    
    case 'SLICE':
      // Export slice, skip
      return 'Div';
    
    default:
      return 'Div';
  }
}

// ============================================
// STYLE CONVERSION FUNCTIONS
// ============================================

/**
 * Convert Figma auto-layout properties to CSS flexbox styles
 */
function convertAutoLayoutToStyles(node: FigmaNode): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (!node.layoutMode || node.layoutMode === 'NONE') {
    // No auto-layout - use relative positioning
    styles.position = 'relative';
    return styles;
  }
  
  // Enable flexbox
  styles.display = 'flex';
  styles.flexDirection = node.layoutMode === 'HORIZONTAL' ? 'row' : 'column';
  
  // Flex wrap
  if (node.layoutWrap === 'WRAP') {
    styles.flexWrap = 'wrap';
  }
  
  // Primary axis alignment (justify-content)
  switch (node.primaryAxisAlignItems) {
    case 'MIN':
      styles.justifyContent = 'flex-start';
      break;
    case 'CENTER':
      styles.justifyContent = 'center';
      break;
    case 'MAX':
      styles.justifyContent = 'flex-end';
      break;
    case 'SPACE_BETWEEN':
      styles.justifyContent = 'space-between';
      break;
  }
  
  // Counter axis alignment (align-items)
  switch (node.counterAxisAlignItems) {
    case 'MIN':
      styles.alignItems = 'flex-start';
      break;
    case 'CENTER':
      styles.alignItems = 'center';
      break;
    case 'MAX':
      styles.alignItems = 'flex-end';
      break;
    case 'BASELINE':
      styles.alignItems = 'baseline';
      break;
  }
  
  // Gap (item spacing)
  if (node.itemSpacing && node.itemSpacing > 0) {
    styles.gap = `${node.itemSpacing}px`;
  }
  
  // Padding - use shorthand if all sides are equal
  const pt = node.paddingTop || 0;
  const pr = node.paddingRight || 0;
  const pb = node.paddingBottom || 0;
  const pl = node.paddingLeft || 0;
  
  if (pt === pr && pr === pb && pb === pl && pt > 0) {
    styles.padding = `${pt}px`;
  } else if (pt === pb && pl === pr && (pt > 0 || pl > 0)) {
    styles.padding = `${pt}px ${pr}px`;
  } else if (pt > 0 || pr > 0 || pb > 0 || pl > 0) {
    styles.padding = `${pt}px ${pr}px ${pb}px ${pl}px`;
  }
  
  return styles;
}

/**
 * Convert Figma fills to CSS background styles
 */
function convertFillsToStyles(fills?: FigmaPaint[]): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (!fills || fills.length === 0) return styles;
  
  // Get first visible fill
  const visibleFill = fills.find(f => f.visible !== false);
  if (!visibleFill) return styles;
  
  switch (visibleFill.type) {
    case 'SOLID':
      if (visibleFill.color) {
        styles.backgroundColor = figmaColorToCSS(visibleFill.color, visibleFill.opacity);
      }
      break;
    
    case 'GRADIENT_LINEAR':
      if (visibleFill.gradientStops && visibleFill.gradientHandlePositions) {
        // Calculate angle from gradient handles
        const handles = visibleFill.gradientHandlePositions;
        let angle = 180; // default
        if (handles.length >= 2) {
          const dx = handles[1].x - handles[0].x;
          const dy = handles[1].y - handles[0].y;
          angle = Math.round(Math.atan2(dy, dx) * (180 / Math.PI) + 90);
        }
        
        const stops = visibleFill.gradientStops.map(s => {
          const color = figmaColorToCSS(s.color);
          return `${color} ${Math.round(s.position * 100)}%`;
        }).join(', ');
        
        styles.backgroundImage = `linear-gradient(${angle}deg, ${stops})`;
      }
      break;
    
    case 'GRADIENT_RADIAL':
      if (visibleFill.gradientStops) {
        const stops = visibleFill.gradientStops.map(s => {
          const color = figmaColorToCSS(s.color);
          return `${color} ${Math.round(s.position * 100)}%`;
        }).join(', ');
        
        styles.backgroundImage = `radial-gradient(circle, ${stops})`;
      }
      break;
    
    case 'IMAGE':
      // Image fills would need the actual image URL from assets
      // For now, set placeholder properties
      styles.backgroundSize = visibleFill.scaleMode === 'FIT' ? 'contain' : 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
      break;
  }
  
  return styles;
}

/**
 * Convert Figma strokes to CSS border styles
 */
function convertStrokesToStyles(node: FigmaNode): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (!node.strokes || node.strokes.length === 0 || !node.strokeWeight) return styles;
  
  const visibleStroke = node.strokes.find(s => s.visible !== false);
  if (!visibleStroke || !visibleStroke.color) return styles;
  
  const color = figmaColorToCSS(visibleStroke.color, visibleStroke.opacity);
  const width = node.strokeWeight;
  
  // Handle stroke alignment
  if (node.strokeAlign === 'INSIDE') {
    styles.boxShadow = `inset 0 0 0 ${width}px ${color}`;
  } else {
    styles.border = `${width}px solid ${color}`;
  }
  
  return styles;
}

/**
 * Convert Figma text styles to CSS
 */
function convertTextStylesToCSS(style: FigmaTextStyle): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (style.fontFamily) {
    // Use fontFamily, fallback to system fonts
    styles.fontFamily = `"${style.fontFamily}", system-ui, sans-serif`;
  }
  
  if (style.fontSize) {
    styles.fontSize = `${style.fontSize}px`;
  }
  
  if (style.fontWeight) {
    styles.fontWeight = String(style.fontWeight);
  }
  
  if (style.italic) {
    styles.fontStyle = 'italic';
  }
  
  // Line height
  if (style.lineHeightPx && style.lineHeightPx > 0) {
    styles.lineHeight = `${style.lineHeightPx}px`;
  } else if (style.lineHeightPercent && style.lineHeightPercent > 0) {
    styles.lineHeight = `${style.lineHeightPercent}%`;
  }
  
  // Letter spacing
  if (style.letterSpacing) {
    styles.letterSpacing = `${style.letterSpacing}px`;
  }
  
  // Text transform
  switch (style.textCase) {
    case 'UPPER':
      styles.textTransform = 'uppercase';
      break;
    case 'LOWER':
      styles.textTransform = 'lowercase';
      break;
    case 'TITLE':
      styles.textTransform = 'capitalize';
      break;
    case 'SMALL_CAPS':
    case 'SMALL_CAPS_FORCED':
      styles.fontVariant = 'small-caps';
      break;
  }
  
  // Text decoration
  switch (style.textDecoration) {
    case 'UNDERLINE':
      styles.textDecoration = 'underline';
      break;
    case 'STRIKETHROUGH':
      styles.textDecoration = 'line-through';
      break;
  }
  
  // Text alignment
  switch (style.textAlignHorizontal) {
    case 'LEFT':
      styles.textAlign = 'left';
      break;
    case 'CENTER':
      styles.textAlign = 'center';
      break;
    case 'RIGHT':
      styles.textAlign = 'right';
      break;
    case 'JUSTIFIED':
      styles.textAlign = 'justify';
      break;
  }
  
  return styles;
}

/**
 * Convert Figma effects (shadows, blur) to CSS
 */
function convertEffectsToStyles(effects?: FigmaEffect[]): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (!effects || effects.length === 0) return styles;
  
  const shadows: string[] = [];
  
  for (const effect of effects) {
    if (effect.visible === false) continue;
    
    if (effect.type === 'DROP_SHADOW' && effect.color && effect.offset) {
      const color = figmaColorToCSS(effect.color);
      const x = effect.offset.x || 0;
      const y = effect.offset.y || 0;
      const blur = effect.radius || 0;
      const spread = effect.spread || 0;
      shadows.push(`${x}px ${y}px ${blur}px ${spread}px ${color}`);
    }
    
    if (effect.type === 'INNER_SHADOW' && effect.color && effect.offset) {
      const color = figmaColorToCSS(effect.color);
      const x = effect.offset.x || 0;
      const y = effect.offset.y || 0;
      const blur = effect.radius || 0;
      const spread = effect.spread || 0;
      shadows.push(`inset ${x}px ${y}px ${blur}px ${spread}px ${color}`);
    }
    
    if (effect.type === 'LAYER_BLUR' && effect.radius) {
      styles.filter = `blur(${effect.radius}px)`;
    }
    
    if (effect.type === 'BACKGROUND_BLUR' && effect.radius) {
      styles.backdropFilter = `blur(${effect.radius}px)`;
    }
  }
  
  if (shadows.length > 0) {
    styles.boxShadow = shadows.join(', ');
  }
  
  return styles;
}

/**
 * Convert Figma sizing to CSS
 */
function convertSizingToStyles(node: FigmaNode): Record<string, string> {
  const styles: Record<string, string> = {};
  
  // Width
  if (node.layoutAlign === 'STRETCH') {
    styles.width = '100%';
  } else if (node.primaryAxisSizingMode === 'AUTO' && node.layoutMode === 'HORIZONTAL') {
    styles.width = 'auto';
  } else if (node.width && node.width > 0) {
    styles.width = `${node.width}px`;
  }
  
  // Height
  if (node.counterAxisSizingMode === 'AUTO' || node.primaryAxisSizingMode === 'AUTO' && node.layoutMode === 'VERTICAL') {
    styles.height = 'auto';
  } else if (node.height && node.height > 0) {
    styles.height = `${node.height}px`;
  }
  
  // Min/max constraints
  if (node.minWidth) styles.minWidth = `${node.minWidth}px`;
  if (node.maxWidth) styles.maxWidth = `${node.maxWidth}px`;
  if (node.minHeight) styles.minHeight = `${node.minHeight}px`;
  if (node.maxHeight) styles.maxHeight = `${node.maxHeight}px`;
  
  // Flex grow
  if (node.layoutGrow && node.layoutGrow > 0) {
    styles.flexGrow = String(node.layoutGrow);
  }
  
  return styles;
}

/**
 * Convert Figma corner radius to CSS
 */
function convertCornerRadiusToStyles(node: FigmaNode): Record<string, string> {
  const styles: Record<string, string> = {};
  
  // Ellipse always has 50% border radius
  if (node.type === 'ELLIPSE') {
    styles.borderRadius = '50%';
    return styles;
  }
  
  // Check for individual corner radii
  const tl = node.topLeftRadius || node.cornerRadius || 0;
  const tr = node.topRightRadius || node.cornerRadius || 0;
  const bl = node.bottomLeftRadius || node.cornerRadius || 0;
  const br = node.bottomRightRadius || node.cornerRadius || 0;
  
  if (tl === tr && tr === bl && bl === br && tl > 0) {
    styles.borderRadius = `${tl}px`;
  } else if (tl > 0 || tr > 0 || bl > 0 || br > 0) {
    styles.borderRadius = `${tl}px ${tr}px ${br}px ${bl}px`;
  }
  
  return styles;
}

/**
 * Convert Figma opacity and blend mode to CSS
 */
function convertOpacityToStyles(node: FigmaNode): Record<string, string> {
  const styles: Record<string, string> = {};
  
  if (node.opacity !== undefined && node.opacity < 1) {
    styles.opacity = node.opacity.toFixed(2);
  }
  
  // Handle clip content
  if (node.clipsContent) {
    styles.overflow = 'hidden';
  }
  
  return styles;
}

// ============================================
// MAIN TRANSLATION FUNCTIONS
// ============================================

/**
 * Extract Figma nodes from clipboard data
 * Handles different clipboard formats
 */
function extractFigmaNodes(data: any): FigmaNode[] {
  // Direct nodes array
  if (Array.isArray(data)) {
    return data;
  }
  
  // Nodes under 'nodes' key
  if (data.nodes && Array.isArray(data.nodes)) {
    return data.nodes;
  }
  
  // Single node object
  if (data.id && data.type) {
    return [data as FigmaNode];
  }
  
  // Try to find nodes in nested structure
  for (const key of Object.keys(data)) {
    const value = data[key];
    if (Array.isArray(value) && value.length > 0 && value[0].id && value[0].type) {
      return value;
    }
    if (value && typeof value === 'object' && value.id && value.type) {
      return [value];
    }
  }
  
  return [];
}

/**
 * Convert a single Figma node to intermediate representation with placeholder style index
 */
function convertFigmaNodeTree(
  node: FigmaNode,
  collector: StyleCollector
): ComponentInstance {
  const type = mapFigmaTypeToWebtir(node);
  const props: Record<string, any> = {};
  
  // Extract text content for text nodes
  if (node.type === 'TEXT' && node.characters) {
    props.children = node.characters;
    
    // Set heading level if it's a heading
    if (type === 'Heading' && node.style?.fontSize) {
      props.level = getHeadingLevel(node.style.fontSize);
    }
  }
  
  // Collect all styles from different sources
  const allStyles: Record<string, string> = {
    ...convertAutoLayoutToStyles(node),
    ...convertFillsToStyles(node.fills),
    ...convertStrokesToStyles(node),
    ...convertEffectsToStyles(node.effects),
    ...convertSizingToStyles(node),
    ...convertCornerRadiusToStyles(node),
    ...convertOpacityToStyles(node),
    ...(node.style ? convertTextStylesToCSS(node.style) : {}),
  };
  
  // Add text color from fills for text nodes
  if (node.type === 'TEXT' && node.fills && node.fills.length > 0) {
    const textFill = node.fills.find(f => f.visible !== false && f.type === 'SOLID');
    if (textFill?.color) {
      allStyles.color = figmaColorToCSS(textFill.color, textFill.opacity);
    }
  }
  
  // Add to collector instead of immediately creating style source
  const sanitizedName = (node.name || 'figma').replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
  const name = `figma-${sanitizedName}-${generateId().slice(0, 4)}`;
  const sourceIndex = collector.sources.length;
  collector.sources.push({ name });
  
  // Collect style updates for this source
  Object.entries(allStyles).forEach(([prop, value]) => {
    if (value) {
      collector.styleUpdates.push({
        sourceIndex,
        property: prop,
        value,
      });
    }
  });
  
  // Recursively convert children
  const children: ComponentInstance[] = [];
  if (node.children && Array.isArray(node.children)) {
    for (const child of node.children) {
      // Skip invisible or locked nodes
      if (child.visible === false) continue;
      children.push(convertFigmaNodeTree(child, collector));
    }
  }
  
  // Generate label from node name
  const label = node.name || type;
  
  return {
    id: generateId(),
    type,
    label,
    props,
    // Store placeholder index - will be resolved after batch creation
    styleSourceIds: [sourceIndex as any],
    children,
  };
}

// Resolve placeholder source indexes to actual style source IDs
function resolveStyleSourceIds(
  instance: ComponentInstance,
  createdSourceIds: string[]
): ComponentInstance {
  const resolvedInstance = { ...instance };
  
  // Resolve style source IDs from indexes
  if (Array.isArray(instance.styleSourceIds)) {
    resolvedInstance.styleSourceIds = (instance.styleSourceIds as any[]).map(idx => {
      if (typeof idx === 'number' && idx < createdSourceIds.length) {
        return createdSourceIds[idx];
      }
      return idx; // Already a string ID
    });
  }
  
  // Recursively resolve children
  if (instance.children && instance.children.length > 0) {
    resolvedInstance.children = instance.children.map(child => 
      resolveStyleSourceIds(child, createdSourceIds)
    );
  }
  
  return resolvedInstance;
}

/**
 * Main translation function - converts Figma clipboard data to Webtir ComponentInstance tree
 * Uses batch operations for better performance
 */
export function translateFigmaToWebtir(figmaData: any): ComponentInstance | null {
  try {
    // Handle different Figma data formats
    const nodes = extractFigmaNodes(figmaData);
    
    if (!nodes || nodes.length === 0) {
      console.warn('No nodes found in Figma data');
      return null;
    }
    
    console.log(`[Figma Translator] Converting ${nodes.length} root node(s)`);
    
    // Initialize collector for batch operations
    const collector: StyleCollector = {
      sources: [],
      styleUpdates: [],
    };
    
    // Convert each root node (collecting styles without applying them)
    let resultInstance: ComponentInstance;
    if (nodes.length === 1) {
      resultInstance = convertFigmaNodeTree(nodes[0], collector);
    } else {
      // Multiple nodes - wrap in container
      const children = nodes.map(node => convertFigmaNodeTree(node, collector));
      resultInstance = {
        id: generateId(),
        type: 'Div',
        label: 'Figma Import',
        props: {},
        styleSourceIds: [],
        children,
      };
    }
    
    // Now batch create all style sources at once
    const { batchCreateStyleSources, batchSetStyles } = useStyleStore.getState();
    
    console.log(`[Figma Translator] Batch creating ${collector.sources.length} style sources, ${collector.styleUpdates.length} style rules`);
    
    const createdSourceIds = batchCreateStyleSources(
      collector.sources.map(s => ({ type: 'local', name: s.name }))
    );
    
    // Batch apply all styles at once
    if (collector.styleUpdates.length > 0) {
      batchSetStyles(
        collector.styleUpdates.map(u => ({
          styleSourceId: createdSourceIds[u.sourceIndex],
          property: u.property,
          value: u.value,
          breakpointId: 'desktop',
          state: 'default' as any,
        }))
      );
    }
    
    // Resolve placeholder indexes to actual IDs in the instance tree
    const resolvedInstance = resolveStyleSourceIds(resultInstance, createdSourceIds);
    
    console.log(`[Figma Translator] Import complete`);
    
    return resolvedInstance;
  } catch (error) {
    console.error('Failed to translate Figma data:', error);
    return null;
  }
}

/**
 * Get summary statistics about the Figma data
 */
export function getFigmaDataSummary(figmaData: any): {
  nodeCount: number;
  textCount: number;
  frameCount: number;
  imageCount: number;
} {
  const nodes = extractFigmaNodes(figmaData);
  
  let nodeCount = 0;
  let textCount = 0;
  let frameCount = 0;
  let imageCount = 0;
  
  function countNodes(node: FigmaNode) {
    nodeCount++;
    
    if (node.type === 'TEXT') textCount++;
    if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') frameCount++;
    if (node.fills?.some(f => f.type === 'IMAGE')) imageCount++;
    
    if (node.children) {
      for (const child of node.children) {
        countNodes(child);
      }
    }
  }
  
  for (const node of nodes) {
    countNodes(node);
  }
  
  return { nodeCount, textCount, frameCount, imageCount };
}

/**
 * Detect if data looks like Figma clipboard data
 */
export function isFigmaData(data: any): boolean {
  if (!data || typeof data !== 'object') return false;
  
  // Check for Figma-specific node types
  const figmaTypes = ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE', 'TEXT', 'RECTANGLE', 'ELLIPSE', 'VECTOR'];
  
  const checkNode = (node: any): boolean => {
    if (node.type && figmaTypes.includes(node.type)) return true;
    if (node.layoutMode) return true; // Auto-layout is Figma-specific
    if (node.primaryAxisAlignItems) return true;
    return false;
  };
  
  // Check direct data
  if (checkNode(data)) return true;
  
  // Check nodes array
  if (Array.isArray(data) && data.length > 0 && checkNode(data[0])) return true;
  if (data.nodes && Array.isArray(data.nodes) && data.nodes.length > 0 && checkNode(data.nodes[0])) return true;
  
  return false;
}
