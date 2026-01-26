import React, { useEffect } from 'react';
import { useStyleStore } from '../store/useStyleStore';
import { PseudoState } from '../store/types';
import { compileMetadataToCSS } from '../utils/cssCompiler';

// Map custom property names to valid CSS property names
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-gradient', // Keep as intermediate for combineBackgroundLayers
  backgroundImage: 'background-image',
};

function toCssProp(prop: string) {
  if (propertyAliases[prop]) {
    return propertyAliases[prop];
  }
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Combine background layers: color + gradient + image into proper CSS
// CSS background-image layers are stacked: first = top, last = bottom
// For Webflow imports: use standard CSS behavior (color behind image)
// For Webtir-native: allow color overlay on top of image
function combineBackgroundLayers(props: Record<string, string>, isImported: boolean = false): Record<string, string> {
  const result = { ...props };
  
  const bgColor = props['background-color'];
  const bgImage = props['background-image'];
  const bgGradient = props['background-gradient']; // Handle gradient property
  
  // Case 1: Color + media (gradient and/or image)
  if (bgColor && bgColor !== 'transparent' && (bgImage || bgGradient)) {
    // For imported styles (Webflow), keep standard CSS behavior:
    // background-color sits BEHIND background-image (no overlay)
    if (isImported) {
      // Just combine gradient and image if both exist
      if (bgGradient && bgImage) {
        result['background-image'] = `${bgGradient}, ${bgImage}`;
        
        const existingSize = props['background-size'] || 'cover';
        const existingPosition = props['background-position'] || 'center';
        const existingRepeat = props['background-repeat'] || 'no-repeat';
        result['background-size'] = `${existingSize}, ${existingSize}`;
        result['background-position'] = `${existingPosition}, ${existingPosition}`;
        result['background-repeat'] = `${existingRepeat}, ${existingRepeat}`;
      } else if (bgGradient) {
        result['background-image'] = bgGradient;
      }
      // Keep background-color as-is (renders behind background-image per CSS spec)
      delete result['background-gradient'];
    } else {
      // Webtir-native behavior: color overlay on top
      const colorOverlay = `linear-gradient(${bgColor}, ${bgColor})`;
      
      // Combine layers: overlay first (top), then gradient, then image (bottom)
      const layers: string[] = [colorOverlay];
      if (bgGradient) layers.push(bgGradient);
      if (bgImage) layers.push(bgImage);
      
      result['background-image'] = layers.join(', ');
      
      // Remove background-color since it's now part of background-image layers
      delete result['background-color'];
      // Remove background-gradient since it's now combined into background-image
      delete result['background-gradient'];
      
      // Adjust background-size/position/repeat to match layer count
      const existingSize = props['background-size'] || 'cover';
      const existingPosition = props['background-position'] || 'center';
      const existingRepeat = props['background-repeat'] || 'no-repeat';
      
      const layerCount = layers.length;
      result['background-size'] = Array(layerCount).fill(existingSize).join(', ');
      result['background-position'] = Array(layerCount).fill(existingPosition).join(', ');
      result['background-repeat'] = Array(layerCount).fill(existingRepeat).join(', ');
    }
  }
  // Case 2: Gradient + Image (no color overlay needed)
  else if (bgGradient && bgImage) {
    result['background-image'] = `${bgGradient}, ${bgImage}`;
    delete result['background-gradient'];
    
    const existingSize = props['background-size'] || 'cover';
    const existingPosition = props['background-position'] || 'center';
    const existingRepeat = props['background-repeat'] || 'no-repeat';
    result['background-size'] = `${existingSize}, ${existingSize}`;
    result['background-position'] = `${existingPosition}, ${existingPosition}`;
    result['background-repeat'] = `${existingRepeat}, ${existingRepeat}`;
  }
  // Case 3: Gradient only (no image, no color)
  else if (bgGradient && !bgImage) {
    result['background-image'] = bgGradient;
    delete result['background-gradient'];
  }
  // Case 4: Image only - just clean up stray gradient property if present
  else if (bgImage) {
    delete result['background-gradient'];
  }
  
  return result;
}

// Base CSS variables and resets for canvas rendering
const BASE_CSS = `
/* Canvas Base CSS Variables */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

/* Stacking context for negative z-index elements (critical for Webflow imports) */
html, body {
  isolation: isolate;
  position: relative;
  margin: 0;
  padding: 0;
}

/* Root style container stacking context */
.root-style, [class*="root-style"] {
  position: relative;
  isolation: isolate;
}

/* Builder page container - ensures z-index:-1 elements stay within page */
.builder-page {
  position: relative;
  isolation: isolate;
}

/* Canvas Base Resets */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Ensure primitives render correctly */
.builder-canvas * {
  margin: 0;
  padding: 0;
}

/* Default heading typography - low specificity, easily overridden by classes */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: bold;
}

h1 { font-size: 2.5rem; line-height: 1.2; }
h2 { font-size: 2rem; line-height: 1.3; }
h3 { font-size: 1.75rem; line-height: 1.3; }
h4 { font-size: 1.5rem; line-height: 1.4; }
h5 { font-size: 1.25rem; line-height: 1.4; }
h6 { font-size: 1rem; line-height: 1.5; }

/* Default image sizing */
img {
  max-width: 100%;
  height: auto;
  display: block;
}
`;

export const StyleSheetInjector: React.FC = () => {
  const { styleSources, styles, breakpoints, rawCssOverrides } = useStyleStore();

  useEffect(() => {
    const styleElId = 'builder-styles';
    let styleEl = document.getElementById(styleElId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleElId;
      document.head.appendChild(styleEl);
    }

    // Build CSS per style source, breakpoint, and state
    const rules: string[] = [];
    const states: PseudoState[] = ['default', 'hover', 'focus', 'active', 'visited'];

    Object.values(styleSources).forEach((source) => {
      const baseSelector = `.${source.name}`;
      
      states.forEach((state) => {
        const stateSelector = state === 'default' 
          ? baseSelector 
          : state === 'focus'
          ? `${baseSelector}:focus-visible`
          : `${baseSelector}:${state}`;
        
        // Desktop (base) styles for this state
        const baseProps: Record<string, string> = {};
        Object.entries(styles).forEach(([key, value]) => {
          const parts = key.split(':');
          if (parts.length === 4) {
            const [id, bp, st, prop] = parts;
            if (id === source.id && bp === 'desktop' && st === state && value) {
              const cssProp = toCssProp(prop);
              if (cssProp) {
                baseProps[cssProp] = value;
              }
            }
          }
        });
        
        // Compile metadata to CSS (only for default state)
        if (state === 'default' && source.metadata) {
          const metadataCSS = compileMetadataToCSS(source.metadata);
          Object.entries(metadataCSS).forEach(([prop, value]) => {
            baseProps[prop] = value;
          });
        }
        
        // Combine background layers before generating CSS
        // Check if this is a Webflow import by looking at source name prefix
        const isWebflowImport = source.name.startsWith('wf-');
        const finalBaseProps = combineBackgroundLayers(baseProps, isWebflowImport);
        
        const baseCss = Object.entries(finalBaseProps)
          .map(([k, v]) => `${k}: ${v};`)
          .join(' ');
        if (baseCss) rules.push(`${stateSelector} { ${baseCss} }`);

        // Responsive breakpoints for this state (tablet, mobile-landscape, mobile)
        breakpoints
          .filter((bp) => bp.id !== 'desktop')
          .forEach((bp) => {
            const bpProps: Record<string, string> = {};
            Object.entries(styles).forEach(([key, value]) => {
              const parts = key.split(':');
              if (parts.length === 4) {
                const [id, bid, st, prop] = parts;
                if (id === source.id && bid === bp.id && st === state && value) {
                  const cssProp = toCssProp(prop);
                  if (cssProp) {
                    bpProps[cssProp] = value;
                  }
                }
              }
            });
            
            // Combine background layers for breakpoint styles too
            const finalBpProps = combineBackgroundLayers(bpProps, isWebflowImport);
            
            const bpCss = Object.entries(finalBpProps)
              .map(([k, v]) => `${k}: ${v};`)
              .join(' ');
            if (bpCss) {
              if (bp.maxWidth) {
                rules.push(`@media (max-width: ${bp.maxWidth}px) { ${stateSelector} { ${bpCss} } }`);
              } else if (bp.minWidth) {
                rules.push(`@media (min-width: ${bp.minWidth}px) { ${stateSelector} { ${bpCss} } }`);
              }
            }
          });
      });
    });

    // Start with base CSS, then add generated rules
    let finalCSS = BASE_CSS + '\n' + rules.join('\n');
    
    // Append raw CSS overrides (element selectors, complex selectors, etc.)
    if (rawCssOverrides && rawCssOverrides.trim()) {
      finalCSS += '\n\n/* Raw CSS Overrides */\n' + rawCssOverrides;
    }

    styleEl.textContent = finalCSS;
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[StyleSheetInjector] Injected', rules.length, 'CSS rules for', Object.keys(styleSources).length, 'style sources');
    }
  }, [styleSources, styles, breakpoints, rawCssOverrides]);

  return null;
};
