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
        
        const baseCss = Object.entries(baseProps)
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
            const bpCss = Object.entries(bpProps)
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
