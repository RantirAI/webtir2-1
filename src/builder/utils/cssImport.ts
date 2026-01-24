import { useStyleStore } from '../store/useStyleStore';
import { PseudoState } from '../store/types';

// Reverse property aliases - map CSS properties back to internal names
const reversePropertyAliases: Record<string, string> = {
  'background-image': 'backgroundGradient',
};

// Convert kebab-case to camelCase
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Parse a single CSS property and value
function parseProperty(property: string, value: string): { prop: string; val: string } {
  // Check for reverse alias first
  const aliasedProp = reversePropertyAliases[property];
  if (aliasedProp) {
    return { prop: aliasedProp, val: value };
  }
  
  // Convert to camelCase
  return { prop: kebabToCamel(property), val: value };
}

// Extract pseudo-state from selector
function extractPseudoState(selector: string): { className: string; state: PseudoState } {
  const pseudoMatch = selector.match(/\.([a-zA-Z0-9_-]+):?(hover|focus|focus-visible|active|visited)?$/);
  
  if (!pseudoMatch) {
    return { className: '', state: 'default' };
  }
  
  const className = pseudoMatch[1];
  let state: PseudoState = 'default';
  
  if (pseudoMatch[2]) {
    // Map focus-visible back to focus
    state = pseudoMatch[2] === 'focus-visible' ? 'focus' : pseudoMatch[2] as PseudoState;
  }
  
  return { className, state };
}

// Parse CSS declarations from a block
function parseDeclarations(block: string): Array<{ property: string; value: string }> {
  const declarations: Array<{ property: string; value: string }> = [];
  
  // Split by semicolons but handle values with semicolons in them (like data URIs)
  const lines = block.split(';');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;
    
    const property = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();
    
    if (property && value) {
      declarations.push({ property, value });
    }
  }
  
  return declarations;
}

// Parse breakpoint from media query
function parseMediaQuery(mediaQuery: string): string | null {
  const { breakpoints } = useStyleStore.getState();
  
  // Extract width value from media query
  const maxWidthMatch = mediaQuery.match(/max-width:\s*(\d+)px/);
  const minWidthMatch = mediaQuery.match(/min-width:\s*(\d+)px/);
  
  if (maxWidthMatch) {
    const maxWidth = parseInt(maxWidthMatch[1], 10);
    const breakpoint = breakpoints.find(bp => bp.maxWidth === maxWidth);
    return breakpoint?.id || null;
  }
  
  if (minWidthMatch) {
    const minWidth = parseInt(minWidthMatch[1], 10);
    const breakpoint = breakpoints.find(bp => bp.minWidth === minWidth);
    return breakpoint?.id || null;
  }
  
  return null;
}

// Parse CSS text and apply to style store
export function parseCSSToStyleStore(cssText: string): { 
  classesUpdated: number; 
  classesCreated: number;
  propertiesSet: number;
} {
  const { styleSources, createStyleSource, setStyle } = useStyleStore.getState();
  
  let classesUpdated = 0;
  let classesCreated = 0;
  let propertiesSet = 0;
  
  // Track which classes we've seen
  const updatedClasses = new Set<string>();
  const createdClasses = new Set<string>();
  
  // Remove comments
  let cleanCSS = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Parse media queries first
  const mediaQueryPattern = /@media\s*\([^)]+\)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let mediaMatch;
  
  while ((mediaMatch = mediaQueryPattern.exec(cleanCSS)) !== null) {
    const fullMatch = mediaMatch[0];
    const mediaQuery = fullMatch.match(/@media\s*\(([^)]+)\)/)?.[1] || '';
    const breakpointId = parseMediaQuery(mediaQuery);
    
    if (!breakpointId) continue;
    
    // Extract rules from inside media query
    const innerContent = mediaMatch[1];
    const rulePattern = /([.#]?[a-zA-Z0-9_-]+(?::[a-zA-Z-]+)?)\s*\{([^}]*)\}/g;
    let ruleMatch;
    
    while ((ruleMatch = rulePattern.exec(innerContent)) !== null) {
      const selector = ruleMatch[1].trim();
      const declarationsBlock = ruleMatch[2];
      
      if (!selector.startsWith('.')) continue;
      
      const { className, state } = extractPseudoState(selector);
      if (!className) continue;
      
      // Find or create style source
      let sourceId = Object.entries(styleSources).find(
        ([_, source]) => source.name === className
      )?.[0];
      
      if (!sourceId) {
        sourceId = createStyleSource('local', className);
        createdClasses.add(className);
      } else {
        updatedClasses.add(className);
      }
      
      // Parse and apply declarations
      const declarations = parseDeclarations(declarationsBlock);
      for (const { property, value } of declarations) {
        const { prop, val } = parseProperty(property, value);
        setStyle(sourceId, prop, val, breakpointId, state);
        propertiesSet++;
      }
    }
    
    // Remove processed media query from cleanCSS to avoid double processing
    cleanCSS = cleanCSS.replace(fullMatch, '');
  }
  
  // Parse base rules (outside media queries)
  const baseRulePattern = /([.#][a-zA-Z0-9_-]+(?::[a-zA-Z-]+)?)\s*\{([^}]*)\}/g;
  let baseMatch;
  
  while ((baseMatch = baseRulePattern.exec(cleanCSS)) !== null) {
    const selector = baseMatch[1].trim();
    const declarationsBlock = baseMatch[2];
    
    if (!selector.startsWith('.')) continue;
    
    const { className, state } = extractPseudoState(selector);
    if (!className) continue;
    
    // Skip auto-generated selectors like body, *, etc.
    if (['body', '*'].includes(className)) continue;
    
    // Find or create style source
    let sourceId = Object.entries(styleSources).find(
      ([_, source]) => source.name === className
    )?.[0];
    
    if (!sourceId) {
      sourceId = createStyleSource('local', className);
      createdClasses.add(className);
    } else {
      updatedClasses.add(className);
    }
    
    // Parse and apply declarations
    const declarations = parseDeclarations(declarationsBlock);
    for (const { property, value } of declarations) {
      const { prop, val } = parseProperty(property, value);
      setStyle(sourceId, prop, val, 'desktop', state);
      propertiesSet++;
    }
  }
  
  return {
    classesUpdated: updatedClasses.size,
    classesCreated: createdClasses.size,
    propertiesSet,
  };
}

// Extract supported (class-only) and unsupported (element/id/complex) CSS rules
export function extractCSSRules(cssText: string): { supportedCSS: string; unsupportedCSS: string } {
  // Remove comments first
  let cleanCSS = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
  
  const supportedRules: string[] = [];
  const unsupportedRules: string[] = [];
  
  // Pattern for simple class selectors: .className or .className:pseudo
  const simpleClassPattern = /^\.[a-zA-Z_-][a-zA-Z0-9_-]*(?::[a-zA-Z-]+)?$/;
  
  // Parse all rules (including media queries)
  // First handle media queries
  const mediaQueryPattern = /@media\s*\([^)]+\)\s*\{([\s\S]*?)\}/g;
  const processedMediaQueries = new Set<string>();
  
  let mediaMatch;
  while ((mediaMatch = mediaQueryPattern.exec(cleanCSS)) !== null) {
    const fullMatch = mediaMatch[0];
    const mediaCondition = fullMatch.match(/@media\s*\([^)]+\)/)?.[0] || '@media';
    const innerContent = mediaMatch[1];
    
    processedMediaQueries.add(fullMatch);
    
    // Parse rules inside media query
    const innerRulePattern = /([^{}]+)\s*\{([^}]*)\}/g;
    let innerMatch;
    const supportedInner: string[] = [];
    const unsupportedInner: string[] = [];
    
    while ((innerMatch = innerRulePattern.exec(innerContent)) !== null) {
      const selector = innerMatch[1].trim();
      const declarations = innerMatch[2];
      
      if (simpleClassPattern.test(selector)) {
        supportedInner.push(`  ${selector} { ${declarations.trim()} }`);
      } else {
        unsupportedInner.push(`  ${selector} { ${declarations.trim()} }`);
      }
    }
    
    if (supportedInner.length > 0) {
      supportedRules.push(`${mediaCondition} {\n${supportedInner.join('\n')}\n}`);
    }
    if (unsupportedInner.length > 0) {
      unsupportedRules.push(`${mediaCondition} {\n${unsupportedInner.join('\n')}\n}`);
    }
  }
  
  // Remove processed media queries from cleanCSS
  for (const mq of processedMediaQueries) {
    cleanCSS = cleanCSS.replace(mq, '');
  }
  
  // Parse base rules (outside media queries)
  const baseRulePattern = /([^{}@]+)\s*\{([^}]*)\}/g;
  let baseMatch;
  
  while ((baseMatch = baseRulePattern.exec(cleanCSS)) !== null) {
    const selector = baseMatch[1].trim();
    const declarations = baseMatch[2];
    
    // Skip :root, *, and other global selectors
    if (selector === ':root' || selector === '*' || selector.startsWith('@')) {
      unsupportedRules.push(`${selector} { ${declarations.trim()} }`);
      continue;
    }
    
    if (simpleClassPattern.test(selector)) {
      supportedRules.push(`${selector} { ${declarations.trim()} }`);
    } else {
      unsupportedRules.push(`${selector} { ${declarations.trim()} }`);
    }
  }
  
  return {
    supportedCSS: supportedRules.join('\n\n'),
    unsupportedCSS: unsupportedRules.join('\n\n'),
  };
}

// Validate CSS syntax (basic validation)
export function validateCSS(cssText: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for balanced braces
  const openBraces = (cssText.match(/\{/g) || []).length;
  const closeBraces = (cssText.match(/\}/g) || []).length;
  
  if (openBraces !== closeBraces) {
    errors.push(`Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing`);
  }
  
  // Check for basic rule structure
  const lines = cssText.split('\n');
  let inBlock = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip comments and empty lines
    if (!line || line.startsWith('/*') || line.startsWith('//')) continue;
    
    if (line.includes('{')) {
      inBlock = true;
    }
    
    if (line.includes('}')) {
      inBlock = false;
    }
    
    // Check for property declarations inside blocks
    if (inBlock && line.includes(':') && !line.includes('{') && !line.includes('}')) {
      const colonIndex = line.indexOf(':');
      const property = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).replace(';', '').trim();
      
      if (!property) {
        errors.push(`Line ${i + 1}: Empty property name`);
      }
      if (!value) {
        errors.push(`Line ${i + 1}: Empty value for property "${property}"`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
