/**
 * Clipboard Inspector Utility
 * Detects and parses clipboard content from various design tools
 * Inspired by https://github.com/evercoder/clipboard-inspector
 */

export type ClipboardSource = 'webflow' | 'figma' | 'framer' | 'html' | 'text' | 'unknown';

export interface ClipboardPayload {
  source: ClipboardSource;
  data: any;
  rawText?: string;
  mimeTypes: string[];
}

export interface WebflowXscpData {
  type: '@webflow/XscpData';
  payload: {
    nodes: WebflowNode[];
    styles: WebflowStyle[];
    assets?: WebflowAsset[];
    interactions?: any[];
    events?: any[];
  };
}

export interface WebflowNode {
  _id: string;
  type: string; // 'Block', 'Heading', 'Paragraph', 'Image', 'Link', etc.
  tag: string; // 'div', 'header', 'h1', 'p', 'img', 'a', etc.
  classes: string[]; // Array of class IDs that reference styles
  children: string[]; // Array of child node IDs
  text?: boolean; // Text node indicator
  v?: string; // Text content for text nodes
  data: {
    text?: boolean;
    tag?: string;
    img?: { id: string };
    link?: { url: string; mode: string };
    attr?: {
      src?: string;
      alt?: string;
      href?: string;
      id?: string;
      width?: string;
      height?: string;
    };
    button?: boolean;
    block?: string;
    displayName?: string;
    devlink?: { runtimeProps: Record<string, any>; slot: string };
    xattr?: any[];
    search?: { exclude: boolean };
    visibility?: { conditions: any[] };
  };
}

export interface WebflowStyle {
  _id: string;
  name: string;
  type: string; // 'class'
  fake?: boolean;
  comb?: string; // '&' for combo classes
  styleLess: string; // CSS properties as string "display: flex; gap: 1rem;"
  variants?: Record<string, { styleLess: string }>; // Responsive breakpoints (tiny, small, medium)
  children?: string[]; // Child class IDs
  origin?: string | null;
  selector?: string | null;
  namespace?: string;
}

export interface WebflowAsset {
  _id: string;
  cdnUrl: string;
  fileName: string;
  origFileName: string;
  alt?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  siteId?: string;
}

/**
 * Inspect clipboard content and detect the source
 */
export function inspectClipboard(event: ClipboardEvent): ClipboardPayload {
  const clipboardData = event.clipboardData;
  if (!clipboardData) {
    return { source: 'unknown', data: null, mimeTypes: [] };
  }

  // Get all available MIME types
  const types = Array.from(clipboardData.types);
  const textData = clipboardData.getData('text/plain');
  const htmlData = clipboardData.getData('text/html');

  // Try to detect Webflow XscpData
  if (textData.includes('@webflow/XscpData')) {
    try {
      const parsed = JSON.parse(textData) as WebflowXscpData;
      if (parsed.type === '@webflow/XscpData' && parsed.payload) {
        return {
          source: 'webflow',
          data: parsed,
          rawText: textData,
          mimeTypes: types,
        };
      }
    } catch (e) {
      console.warn('Failed to parse Webflow data:', e);
    }
  }

  // Detect Figma (custom MIME types or JSON structure)
  if (types.includes('application/x-figma-design') || 
      textData.includes('"figma"') || 
      textData.includes('"type":"FRAME"') ||
      textData.includes('"type":"COMPONENT"')) {
    try {
      const parsed = JSON.parse(textData);
      return {
        source: 'figma',
        data: parsed,
        rawText: textData,
        mimeTypes: types,
      };
    } catch {
      return {
        source: 'figma',
        data: textData,
        rawText: textData,
        mimeTypes: types,
      };
    }
  }

  // Detect Framer (JSON with specific structure)
  if (textData.includes('"__class__"') || 
      textData.includes('"framer"') || 
      textData.includes('"componentType"') ||
      types.some(t => t.includes('framer'))) {
    try {
      const parsed = JSON.parse(textData);
      return {
        source: 'framer',
        data: parsed,
        rawText: textData,
        mimeTypes: types,
      };
    } catch {
      return {
        source: 'framer',
        data: textData,
        rawText: textData,
        mimeTypes: types,
      };
    }
  }

  // Fallback to HTML if present
  if (htmlData && htmlData.trim().length > 0) {
    return {
      source: 'html',
      data: htmlData,
      rawText: textData,
      mimeTypes: types,
    };
  }

  // Plain text fallback
  if (textData && textData.trim().length > 0) {
    // Check if it looks like JSON
    if (textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(textData);
        return {
          source: 'unknown',
          data: parsed,
          rawText: textData,
          mimeTypes: types,
        };
      } catch {
        // Not valid JSON, treat as text
      }
    }
    
    return {
      source: 'text',
      data: textData,
      rawText: textData,
      mimeTypes: types,
    };
  }

  return { source: 'unknown', data: null, mimeTypes: types };
}

/**
 * Detect clipboard source from pasted text (for textarea paste)
 */
export function detectPastedSource(text: string): ClipboardSource {
  if (!text || typeof text !== 'string') return 'unknown';
  
  const trimmed = text.trim();
  
  // Webflow
  if (trimmed.includes('@webflow/XscpData')) {
    return 'webflow';
  }
  
  // Figma
  if (trimmed.includes('"figma"') || 
      trimmed.includes('"type":"FRAME"') ||
      trimmed.includes('"type":"COMPONENT"')) {
    return 'figma';
  }
  
  // Framer
  if (trimmed.includes('"__class__"') || 
      trimmed.includes('"framer"') ||
      trimmed.includes('"componentType"')) {
    return 'framer';
  }
  
  // HTML
  if (trimmed.startsWith('<') && (trimmed.includes('</') || trimmed.includes('/>'))) {
    return 'html';
  }
  
  // JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'unknown';
  }
  
  return 'text';
}

/**
 * Parse Webflow data from text
 */
export function parseWebflowData(text: string): WebflowXscpData | null {
  try {
    const parsed = JSON.parse(text);
    if (parsed.type === '@webflow/XscpData' && parsed.payload) {
      return parsed as WebflowXscpData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get source label for display
 */
export function getSourceLabel(source: ClipboardSource): string {
  switch (source) {
    case 'webflow': return 'Webflow';
    case 'figma': return 'Figma';
    case 'framer': return 'Framer';
    case 'html': return 'HTML';
    case 'text': return 'Text';
    default: return 'Unknown';
  }
}
