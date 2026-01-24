import React, { useEffect } from 'react';
import { useStyleStore } from '../store/useStyleStore';
import { PseudoState } from '../store/types';
import { compileMetadataToCSS } from '../utils/cssCompiler';

// Map custom property names to valid CSS property names
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-image', // Map gradient to background-image
};

function toCssProp(prop: string) {
  if (propertyAliases[prop]) {
    return propertyAliases[prop];
  }
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Combine background layers: color + gradient + image into proper CSS
function combineBackgroundLayers(props: Record<string, string>): Record<string, string> {
  const result = { ...props };
  
  const bgColor = props['background-color'];
  const bgImage = props['background-image'];
  
  // If we have both a fill color AND an image/gradient, layer them
  if (bgColor && bgColor !== 'transparent' && bgImage) {
    // Create a solid color gradient layer to sit on top
    const colorOverlay = `linear-gradient(${bgColor}, ${bgColor})`;
    
    // Combine layers: overlay first (top), then image (bottom)
    result['background-image'] = `${colorOverlay}, ${bgImage}`;
    
    // Remove background-color since it's now part of background-image layers
    delete result['background-color'];
    
    // Adjust background-size/position/repeat for multiple layers
    const existingSize = props['background-size'] || 'cover';
    const existingPosition = props['background-position'] || 'center';
    const existingRepeat = props['background-repeat'] || 'no-repeat';
    
    result['background-size'] = `${existingSize}, ${existingSize}`;
    result['background-position'] = `${existingPosition}, ${existingPosition}`;
    result['background-repeat'] = `${existingRepeat}, ${existingRepeat}`;
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

/* Canvas Base Resets */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Ensure primitives render correctly */
.builder-canvas * {
  margin: 0;
  padding: 0;
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
        const finalBaseProps = combineBackgroundLayers(baseProps);
        
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
            const finalBpProps = combineBackgroundLayers(bpProps);
            
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
