/**
 * Platform-specific HTML and CSS cleaners for import
 */

export type ImportSource = 'webflow' | 'figma' | 'framer' | 'github' | 'wordpress' | 'shopify' | 'zip' | 'code';

/**
 * Clean HTML based on the import source
 */
export function cleanSourceHTML(source: ImportSource, html: string): string {
  let cleaned = html;
  
  switch (source) {
    case 'webflow':
      cleaned = cleanWebflowHTML(cleaned);
      break;
    case 'figma':
      cleaned = cleanFigmaHTML(cleaned);
      break;
    case 'framer':
      cleaned = cleanFramerHTML(cleaned);
      break;
    case 'wordpress':
      cleaned = cleanWordPressHTML(cleaned);
      break;
    case 'shopify':
      cleaned = cleanShopifyHTML(cleaned);
      break;
    default:
      cleaned = cleanGenericHTML(cleaned);
  }
  
  return cleaned;
}

/**
 * Clean CSS based on the import source
 */
export function cleanSourceCSS(source: ImportSource, css: string): string {
  let cleaned = css;
  
  switch (source) {
    case 'webflow':
      cleaned = cleanWebflowCSS(cleaned);
      break;
    case 'figma':
      cleaned = cleanFigmaCSS(cleaned);
      break;
    default:
      cleaned = cleanGenericCSS(cleaned);
  }
  
  return cleaned;
}

// ========== Webflow ==========

function cleanWebflowHTML(html: string): string {
  let cleaned = html;
  
  // Remove Webflow script tags
  cleaned = cleaned.replace(/<script[^>]*webflow[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove Webflow-specific data attributes
  cleaned = cleaned.replace(/\sdata-wf-[a-z-]+="[^"]*"/gi, '');
  cleaned = cleaned.replace(/\sdata-w-id="[^"]*"/gi, '');
  
  // Keep w- classes but convert common ones
  // w-button -> button, w-nav -> nav, etc.
  cleaned = cleaned.replace(/class="([^"]*)w-button([^"]*)"/gi, 'class="$1button$2"');
  cleaned = cleaned.replace(/class="([^"]*)w-nav([^"]*)"/gi, 'class="$1nav$2"');
  
  return cleanGenericHTML(cleaned);
}

function cleanWebflowCSS(css: string): string {
  let cleaned = css;
  
  // Remove Webflow-specific selectors
  cleaned = cleaned.replace(/\.w-webflow-badge[\s\S]*?\}/g, '');
  
  return cleanGenericCSS(cleaned);
}

// ========== Figma ==========

function cleanFigmaHTML(html: string): string {
  let cleaned = html;
  
  // Figma exports often have auto-generated class names like "frame-123"
  // Convert absolute positioning to more flexible alternatives where possible
  cleaned = cleaned.replace(/style="position:\s*absolute;([^"]*)"/gi, (match, rest) => {
    // Keep the style but mark for review
    return `style="position: relative;${rest}" data-was-absolute="true"`;
  });
  
  return cleanGenericHTML(cleaned);
}

function cleanFigmaCSS(css: string): string {
  let cleaned = css;
  
  // Normalize auto-generated class names
  // Remove overly specific selectors
  cleaned = cleaned.replace(/\[data-figma[^\]]*\]/g, '');
  
  return cleanGenericCSS(cleaned);
}

// ========== Framer ==========

function cleanFramerHTML(html: string): string {
  let cleaned = html;
  
  // Remove Framer-specific attributes
  cleaned = cleaned.replace(/\sdata-framer-[a-z-]+="[^"]*"/gi, '');
  
  // Convert Framer motion components to regular divs
  cleaned = cleaned.replace(/<motion\.div/gi, '<div');
  cleaned = cleaned.replace(/<\/motion\.div>/gi, '</div>');
  
  return cleanGenericHTML(cleaned);
}

// ========== WordPress ==========

function cleanWordPressHTML(html: string): string {
  let cleaned = html;
  
  // Remove WordPress-specific classes
  cleaned = cleaned.replace(/\swp-block-[a-z-]+/gi, '');
  cleaned = cleaned.replace(/\swp-[a-z-]+/gi, '');
  
  // Remove WordPress admin bar
  cleaned = cleaned.replace(/<div[^>]*id="wpadminbar"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  return cleanGenericHTML(cleaned);
}

// ========== Shopify ==========

function cleanShopifyHTML(html: string): string {
  let cleaned = html;
  
  // Remove Shopify Liquid template tags
  cleaned = cleaned.replace(/\{\{[^}]+\}\}/g, '');
  cleaned = cleaned.replace(/\{%[^%]+%\}/g, '');
  
  // Remove Shopify-specific data attributes
  cleaned = cleaned.replace(/\sdata-shopify[^=]*="[^"]*"/gi, '');
  
  return cleanGenericHTML(cleaned);
}

// ========== Generic ==========

function cleanGenericHTML(html: string): string {
  let cleaned = html;
  
  // Remove script tags
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove noscript tags
  cleaned = cleaned.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '');
  
  // Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove meta and link tags (we handle CSS separately)
  cleaned = cleaned.replace(/<meta[^>]*>/gi, '');
  cleaned = cleaned.replace(/<link[^>]*>/gi, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.replace(/>\s+</g, '><');
  
  // Trim
  cleaned = cleaned.trim();
  
  return cleaned;
}

function cleanGenericCSS(css: string): string {
  let cleaned = css;
  
  // Remove @charset declarations
  cleaned = cleaned.replace(/@charset[^;]+;/gi, '');
  
  // Remove @import statements (we can't resolve them)
  cleaned = cleaned.replace(/@import[^;]+;/gi, '');
  
  // Remove @font-face blocks (fonts need separate handling)
  cleaned = cleaned.replace(/@font-face\s*\{[^}]*\}/gi, '');
  
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  return cleaned.trim();
}
