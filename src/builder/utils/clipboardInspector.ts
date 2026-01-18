/**
 * Clipboard Inspector Utility
 * Detects and parses clipboard content from various design tools
 * Inspired by https://github.com/evercoder/clipboard-inspector
 */

export type ClipboardSource = 'webflow' | 'figma' | 'framer' | 'html' | 'text' | 'unknown';

/**
 * Extract Figma data from HTML clipboard content
 * Figma embeds data as base64-encoded JSON in a data-metadata attribute
 * Format: <span data-metadata="<!--(figmeta)BASE64DATA(/figmeta)-->">
 */
function extractFigmaFromHtml(html: string): any | null {
  if (!html) return null;
  
  // Look for the figmeta pattern in the HTML
  const figmetaMatch = html.match(/<!--\(figmeta\)([A-Za-z0-9+/=]+)\(\/figmeta\)-->/);
  if (!figmetaMatch || !figmetaMatch[1]) return null;
  
  try {
    // Decode the base64 data
    const decoded = atob(figmetaMatch[1]);
    const parsed = JSON.parse(decoded);
    return parsed;
  } catch (e) {
    console.warn('Failed to decode Figma metadata:', e);
    return null;
  }
}

export interface ClipboardPayload {
  source: ClipboardSource;
  data: any;
  rawText?: string;
  mimeTypes: string[];
}

// Re-export Figma types for external use
export type { FigmaNode, FigmaPaint, FigmaTextStyle, FigmaEffect, FigmaClipboardData } from './figmaTranslator';

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

  const mimeTypes = Array.from(clipboardData.types);

  const safeGet = (type: string): string => {
    try {
      return clipboardData.getData(type) || '';
    } catch {
      return '';
    }
  };

  // Some tools (Webflow/Figma/Framer) store structured data on custom MIME types.
  // We still *prefer* text/plain, but we also scan other available types.
  const textPlain = safeGet('text/plain');
  const htmlData = safeGet('text/html');

  const candidates = [
    { type: 'text/plain', value: textPlain },
    { type: 'application/json', value: safeGet('application/json') },
    ...mimeTypes.map((t) => ({ type: t, value: safeGet(t) })),
  ].filter((c) => c.value && c.value.trim().length > 0);

  const findText = (match: (value: string, type: string) => boolean) =>
    candidates.find((c) => match(c.value, c.type))?.value ?? '';

  // --- Webflow ---
  const webflowText = findText(
    (v, t) => v.includes('@webflow/XscpData') || t.toLowerCase().includes('webflow')
  );

  if (webflowText) {
    try {
      const parsed = JSON.parse(webflowText) as WebflowXscpData;
      if (parsed.type === '@webflow/XscpData' && parsed.payload) {
        return {
          source: 'webflow',
          data: parsed,
          rawText: webflowText,
          mimeTypes,
        };
      }
    } catch (e) {
      console.warn('Failed to parse Webflow data:', e);
    }
  }

  // --- Figma ---
  // Figma copies data as HTML containing base64-encoded figmeta
  // Format: <span data-metadata="<!--(figmeta)BASE64DATA(/figmeta)-->">
  const figmaData = extractFigmaFromHtml(htmlData);
  
  if (figmaData) {
    return {
      source: 'figma',
      data: figmaData,
      rawText: JSON.stringify(figmaData, null, 2),
      mimeTypes,
    };
  }
  
  // Fallback: Check for direct Figma MIME types or JSON patterns
  const isFigma =
    mimeTypes.includes('application/x-figma-design') ||
    mimeTypes.some((t) => t.toLowerCase().includes('figma'));

  const figmaText = findText(
    (v, t) =>
      t.toLowerCase().includes('figma') ||
      v.includes('"figma"') ||
      v.includes('"type":"FRAME"') ||
      v.includes('"type":"COMPONENT"')
  );

  if (isFigma || figmaText) {
    const raw = figmaText || textPlain;
    try {
      const parsed = JSON.parse(raw);
      return {
        source: 'figma',
        data: parsed,
        rawText: raw,
        mimeTypes,
      };
    } catch {
      return {
        source: 'figma',
        data: raw,
        rawText: raw,
        mimeTypes,
      };
    }
  }

  // --- Framer ---
  const isFramer = mimeTypes.some((t) => t.toLowerCase().includes('framer'));

  const framerText = findText(
    (v, t) =>
      t.toLowerCase().includes('framer') ||
      v.includes('"__class__"') ||
      v.includes('"framer"') ||
      v.includes('"componentType"')
  );

  if (isFramer || framerText) {
    const raw = framerText || textPlain;
    try {
      const parsed = JSON.parse(raw);
      return {
        source: 'framer',
        data: parsed,
        rawText: raw,
        mimeTypes,
      };
    } catch {
      return {
        source: 'framer',
        data: raw,
        rawText: raw,
        mimeTypes,
      };
    }
  }

  // --- HTML fallback ---
  if (htmlData && htmlData.trim().length > 0) {
    return {
      source: 'html',
      data: htmlData,
      rawText: textPlain,
      mimeTypes,
    };
  }

  // --- Plain text fallback ---
  if (textPlain && textPlain.trim().length > 0) {
    // Check if it looks like JSON
    if (textPlain.trim().startsWith('{') || textPlain.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(textPlain);
        return {
          source: 'unknown',
          data: parsed,
          rawText: textPlain,
          mimeTypes,
        };
      } catch {
        // Not valid JSON, treat as text
      }
    }

    return {
      source: 'text',
      data: textPlain,
      rawText: textPlain,
      mimeTypes,
    };
  }

  return { source: 'unknown', data: null, mimeTypes };
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
  
  // Figma - check for figmeta pattern in HTML first
  if (trimmed.includes('(figmeta)') && trimmed.includes('(/figmeta)')) {
    return 'figma';
  }
  
  // Figma - check for JSON patterns
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
 * Parse Figma data from pasted text (handles both HTML with figmeta and raw JSON)
 */
export function parseFigmaData(text: string): any | null {
  if (!text) return null;
  
  // Try extracting from HTML figmeta format first
  const figmaFromHtml = extractFigmaFromHtml(text);
  if (figmaFromHtml) return figmaFromHtml;
  
  // Try parsing as JSON directly
  try {
    const parsed = JSON.parse(text.trim());
    return parsed;
  } catch {
    return null;
  }
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
