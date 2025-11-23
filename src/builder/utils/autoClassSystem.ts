/**
 * Auto-class naming system with configurable sequential numbering
 * Supports "none" (no suffix), incremental counting up to 1M+, and custom formatting
 */

export interface AutoClassConfig {
  startIndex?: number; // Default: 1
  padding?: number; // Zero-padding digits (0 = no padding)
  separator?: string; // Default: '-'
  noneFirst?: boolean; // Use no suffix for first class
}

export interface AutoClassResult {
  name: string;
  index: number | null; // null if noneFirst was used
  persisted: boolean;
}

const DEFAULT_CONFIG: Required<AutoClassConfig> = {
  startIndex: 1,
  padding: 0,
  separator: '-',
  noneFirst: false,
};

/**
 * Normalize component type to base class name
 */
export function normalizeComponentBase(componentType: string): string {
  const normalized = componentType.toLowerCase();
  
  // Map common component types to semantic names
  const typeMap: Record<string, string> = {
    box: 'div',
    container: 'container',
    section: 'section',
    button: 'button',
    buttonprimitive: 'button',
    text: 'text',
    heading: 'heading',
    image: 'image',
    imageprimitive: 'image',
    link: 'link',
    linkprimitive: 'link',
    form: 'form',
    formprimitive: 'form',
    input: 'input',
    textinput: 'input',
    textarea: 'textarea',
    select: 'select',
    checkbox: 'checkbox',
    radio: 'radio',
    table: 'table',
    cell: 'cell',
    video: 'video',
    youtube: 'youtube',
    lottie: 'lottie',
    navigation: 'nav',
  };
  
  return typeMap[normalized] || normalized;
}

/**
 * Format index with optional zero-padding
 */
function formatIndex(index: number, padding: number): string {
  if (padding === 0) return index.toString();
  return index.toString().padStart(padding, '0');
}

/**
 * Parse existing class name to extract numeric suffix
 * Returns null if no numeric suffix found
 */
export function parseClassIndex(className: string, base: string, separator: string): number | null {
  // Try with separator first
  const withSepPattern = new RegExp(`^${base}${separator.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}(\\d+)$`);
  const withSepMatch = className.match(withSepPattern);
  if (withSepMatch) {
    return parseInt(withSepMatch[1], 10);
  }
  
  // Try without separator (legacy support)
  const noSepPattern = new RegExp(`^${base}(\\d+)$`);
  const noSepMatch = className.match(noSepPattern);
  if (noSepMatch) {
    return parseInt(noSepMatch[1], 10);
  }
  
  return null;
}

/**
 * Initialize counters from existing class names
 * Returns map of base -> next available index
 */
export function initializeCountersFromRegistry(
  existingClassNames: string[],
  config: AutoClassConfig = {}
): Record<string, number> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const counters: Record<string, number> = {};
  
  // Group class names by potential base
  const baseMap: Record<string, number[]> = {};
  
  existingClassNames.forEach(className => {
    // Try to extract base and index from various patterns
    const parts = className.split(cfg.separator);
    if (parts.length === 2) {
      const [base, indexStr] = parts;
      const index = parseInt(indexStr, 10);
      if (!isNaN(index)) {
        if (!baseMap[base]) baseMap[base] = [];
        baseMap[base].push(index);
      }
    }
    
    // Also check for no-separator pattern (e.g., "button1")
    const noSepMatch = className.match(/^([a-z]+)(\d+)$/);
    if (noSepMatch) {
      const [, base, indexStr] = noSepMatch;
      const index = parseInt(indexStr, 10);
      if (!isNaN(index)) {
        if (!baseMap[base]) baseMap[base] = [];
        baseMap[base].push(index);
      }
    }
  });
  
  // Set counter to max + 1 for each base
  Object.entries(baseMap).forEach(([base, indices]) => {
    const maxIndex = Math.max(...indices);
    counters[base] = maxIndex + 1;
  });
  
  return counters;
}

/**
 * Generate next auto-class name with uniqueness guarantee
 */
export function generateAutoClassName(
  componentType: string,
  existingNames: Set<string>,
  currentCounter: number,
  config: AutoClassConfig = {}
): AutoClassResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const base = normalizeComponentBase(componentType);
  
  // If noneFirst is true and counter is at start, try base name without suffix
  if (cfg.noneFirst && currentCounter === cfg.startIndex) {
    if (!existingNames.has(base)) {
      return {
        name: base,
        index: null,
        persisted: true,
      };
    }
  }
  
  // Find next available numbered name
  let index = Math.max(currentCounter, cfg.startIndex);
  const maxAttempts = 10000; // Safety limit
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const paddedIndex = formatIndex(index, cfg.padding);
    const name = `${base}${cfg.separator}${paddedIndex}`;
    
    if (!existingNames.has(name)) {
      return {
        name,
        index,
        persisted: true,
      };
    }
    
    index++;
    attempts++;
  }
  
  // This should never happen in practice
  throw new Error(
    `Unable to generate unique class name for ${base} after ${maxAttempts} attempts. ` +
    `Consider adjusting naming configuration.`
  );
}

/**
 * Preview the next auto-class name without persisting
 */
export function previewNextClassName(
  componentType: string,
  existingNames: Set<string>,
  currentCounter: number,
  config: AutoClassConfig = {}
): string {
  const result = generateAutoClassName(componentType, existingNames, currentCounter, config);
  return result.name;
}

/**
 * Validate and sanitize custom class name
 */
export function sanitizeClassName(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
}

/**
 * Check if class name matches auto-generated pattern
 */
export function isAutoGeneratedName(className: string, base: string, separator: string = '-'): boolean {
  const pattern = new RegExp(`^${base}(${separator.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})?\\d+$`);
  return pattern.test(className) || className === base;
}
