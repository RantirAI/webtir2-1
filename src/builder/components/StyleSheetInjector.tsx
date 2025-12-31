import React, { useEffect } from 'react';
import { useStyleStore } from '../store/useStyleStore';
import { PseudoState } from '../store/types';
import { compileMetadataToCSS } from '../utils/cssCompiler';

// Map custom property names to valid CSS property names
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-image',
};

function toCssProp(prop: string) {
  if (propertyAliases[prop]) {
    return propertyAliases[prop];
  }
  return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Combines background layers: fill color (overlay) on top of image/media
// CSS background-image layers are stacked: first = top, last = bottom
function combineBackgroundLayers(props: Record<string, string>): Record<string, string> {
  const result = { ...props };
  
  const bgColor = props['background-color'];
  const bgImage = props['background-image'];
  const bgGradient = props['background-gradient']; // Custom prop that maps to background-image
  
  // Check if we have a fill color AND media (image or gradient)
  if (bgColor && bgColor !== 'transparent' && (bgImage || bgGradient)) {
    // Create a solid color gradient layer to sit on top
    const colorOverlay = `linear-gradient(${bgColor}, ${bgColor})`;
    
    // Combine layers: overlay first (top), then gradient, then image (bottom)
    const layers: string[] = [colorOverlay];
    if (bgGradient) layers.push(bgGradient);
    if (bgImage) layers.push(bgImage);
    
    result['background-image'] = layers.join(', ');
    
    // Remove background-color since it's now part of background-image layers
    delete result['background-color'];
    
    // Adjust background-size and position to match layer count
    const existingSize = props['background-size'] || 'cover';
    const existingPosition = props['background-position'] || 'center';
    const existingRepeat = props['background-repeat'] || 'no-repeat';
    
    // The overlay layer needs its own size/position/repeat
    const layerCount = layers.length;
    result['background-size'] = Array(layerCount).fill(existingSize).join(', ');
    result['background-position'] = Array(layerCount).fill(existingPosition).join(', ');
    result['background-repeat'] = Array(layerCount).fill(existingRepeat).join(', ');
  }
  
  return result;
}

export const StyleSheetInjector: React.FC = () => {
  const { styleSources, styles, breakpoints } = useStyleStore();

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
              baseProps[toCssProp(prop)] = value;
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
        
        // Combine background layers (fill color overlay on top of image/media)
        const finalProps = combineBackgroundLayers(baseProps);
        
        const baseCss = Object.entries(finalProps)
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
                  bpProps[toCssProp(prop)] = value;
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

    styleEl.textContent = rules.join('\n');
  }, [styleSources, styles, breakpoints]);

  return null;
};
