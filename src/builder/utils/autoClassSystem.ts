/**
 * Auto-class naming system with stable sequential numbering
 * Never re-indexes existing classes - always finds next available index by scanning
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
    // Layout components
    div: 'div',
    box: 'div',
    container: 'container',
    section: 'section',
    
    // Typography
    heading: 'heading',
    text: 'text',
    richtext: 'richtext',
    blockquote: 'blockquote',
    orderedlist: 'list',
    unorderedlist: 'list',
    codeblock: 'code',
    
    // Interactive
    button: 'button',
    buttonprimitive: 'button',
    formbutton: 'button',
    link: 'link',
    linkprimitive: 'link',
    
    // Media
    image: 'image',
    imageprimitive: 'image',
    video: 'video',
    videoprimitive: 'video',
    youtube: 'youtube',
    youtubeprimitive: 'youtube',
    lottie: 'lottie',
    lottieprimitive: 'lottie',
    
    // Forms
    form: 'form',
    formprimitive: 'form',
    inputlabel: 'label',
    input: 'input',
    textinput: 'input',
    textinputprimitive: 'input',
    textarea: 'textarea',
    textareaprimitive: 'textarea',
    select: 'select',
    selectprimitive: 'select',
    checkbox: 'checkbox',
    checkboxprimitive: 'checkbox',
    checkboxfield: 'checkbox',
    radio: 'radio',
    radioprimitive: 'radio',
    radiogroup: 'radio',
    
    // Data
    table: 'table',
    tableprimitive: 'table',
    cell: 'cell',
    cellprimitive: 'cell',
    keyvalue: 'keyvalue',
    
    // Navigation & Interactive
    navigation: 'nav',
    navigationprimitive: 'nav',
    dropdown: 'dropdown',
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
 * Parse class name to extract base and numeric index
 * Returns null if no numeric suffix found
 */
export function parseClassNameParts(
  className: string, 
  separator: string = '-'
): { base: string; index: number } | null {
  // Escape separator for regex
  const escapedSep = separator.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  
  // Try with separator first (e.g., "heading-1")
  const withSepPattern = new RegExp(`^([a-z][a-z0-9-_]*)${escapedSep}(\\d+)$`);
  const withSepMatch = className.match(withSepPattern);
  if (withSepMatch) {
    return {
      base: withSepMatch[1],
      index: parseInt(withSepMatch[2], 10),
    };
  }
  
  // Try without separator for legacy support (e.g., "heading1")
  const noSepPattern = /^([a-z]+)(\d+)$/;
  const noSepMatch = className.match(noSepPattern);
  if (noSepMatch) {
    return {
      base: noSepMatch[1],
      index: parseInt(noSepMatch[2], 10),
    };
  }
  
  return null;
}

/**
 * Find the maximum index used for a given base name by scanning all existing class names
 * This is the source of truth - never relies on counters
 */
export function findMaxIndexForBase(
  base: string,
  existingNames: Set<string> | string[],
  separator: string = '-'
): number {
  const names = existingNames instanceof Set ? Array.from(existingNames) : existingNames;
  let maxIndex = 0;
  
  for (const name of names) {
    const parsed = parseClassNameParts(name, separator);
    if (parsed && parsed.base === base) {
      maxIndex = Math.max(maxIndex, parsed.index);
    }
  }
  
  return maxIndex;
}

/**
 * Check if a class name exists (case-insensitive)
 */
export function classNameExists(
  name: string,
  existingNames: Set<string> | string[]
): boolean {
  const normalizedName = name.toLowerCase();
  if (existingNames instanceof Set) {
    // Check both exact and case-insensitive
    if (existingNames.has(name)) return true;
    for (const existing of existingNames) {
      if (existing.toLowerCase() === normalizedName) return true;
    }
    return false;
  }
  return existingNames.some(n => n.toLowerCase() === normalizedName);
}

/**
 * Generate next auto-class name by scanning existing classes
 * Always finds maxIndex + 1 to guarantee uniqueness without renumbering
 */
export function generateAutoClassName(
  componentType: string,
  existingNames: Set<string>,
  config: AutoClassConfig = {}
): AutoClassResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const base = normalizeComponentBase(componentType);
  
  // If noneFirst is true and base name isn't taken, use it
  if (cfg.noneFirst && !existingNames.has(base)) {
    return {
      name: base,
      index: null,
    };
  }
  
  // Find max existing index by scanning all class names
  const maxIndex = findMaxIndexForBase(base, existingNames, cfg.separator);
  
  // Next index is max + 1, or startIndex if no existing classes
  const nextIndex = maxIndex > 0 ? maxIndex + 1 : (cfg.startIndex || 1);
  
  const paddedIndex = formatIndex(nextIndex, cfg.padding);
  const name = `${base}${cfg.separator}${paddedIndex}`;
  
  return {
    name,
    index: nextIndex,
  };
}

/**
 * Preview the next auto-class name without side effects
 */
export function previewNextClassName(
  componentType: string,
  existingNames: Set<string>,
  config: AutoClassConfig = {}
): string {
  const result = generateAutoClassName(componentType, existingNames, config);
  return result.name;
}

/**
 * Validate a new class name for rename operation
 * Returns error message if invalid, null if valid
 */
export function validateRename(
  newName: string,
  currentClassId: string,
  existingNames: Map<string, string> // Map of className -> classId
): { valid: boolean; error?: string; suggestion?: string } {
  const safeName = newName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
  
  if (!safeName) {
    return { valid: false, error: 'Class name cannot be empty' };
  }
  
  // Check if name collides with another class (not itself)
  for (const [existingName, existingId] of existingNames) {
    if (existingName === safeName && existingId !== currentClassId) {
      // Generate a unique suggestion
      let counter = 2;
      let suggestion = `${safeName}-${counter}`;
      while (existingNames.has(suggestion)) {
        counter++;
        suggestion = `${safeName}-${counter}`;
      }
      return { 
        valid: false, 
        error: `Class "${safeName}" already exists`,
        suggestion 
      };
    }
  }
  
  return { valid: true };
}

/**
 * Sanitize and validate custom class name
 */
export function sanitizeClassName(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
}

/**
 * Check if class name matches auto-generated pattern for any base type
 */
export function isAutoGeneratedName(className: string, separator: string = '-'): boolean {
  const parsed = parseClassNameParts(className, separator);
  return parsed !== null;
}

/**
 * Check if a specific class name matches the pattern for a given base type
 */
export function matchesAutoPattern(
  className: string, 
  base: string, 
  separator: string = '-'
): boolean {
  const parsed = parseClassNameParts(className, separator);
  return parsed !== null && parsed.base === base;
}
