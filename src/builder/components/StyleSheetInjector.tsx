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
        
        // Base styles for this state
        const baseProps: Record<string, string> = {};
        Object.entries(styles).forEach(([key, value]) => {
          const parts = key.split(':');
          if (parts.length === 4) {
            const [id, bp, st, prop] = parts;
            if (id === source.id && bp === 'base' && st === state && value) {
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

        // Other breakpoints for this state
        breakpoints
          .filter((bp) => bp.id !== 'base')
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

    // Append raw CSS overrides (element selectors, complex selectors, etc.)
    let finalCSS = rules.join('\n');
    if (rawCssOverrides && rawCssOverrides.trim()) {
      finalCSS += '\n\n/* Raw CSS Overrides */\n' + rawCssOverrides;
    }

    styleEl.textContent = finalCSS;
  }, [styleSources, styles, breakpoints, rawCssOverrides]);

  return null;
};
