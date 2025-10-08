import React, { useEffect } from 'react';
import { useStyleStore } from '../store/useStyleStore';
import { compileMetadataToCSS } from '../utils/cssCompiler';

function toCssProp(prop: string) {
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

    // Build CSS per style source and breakpoint
    const rules: string[] = [];

    Object.values(styleSources).forEach((source) => {
      const baseSelector = `.${source.name}`;
      // Base
      const baseProps: Record<string, string> = {};
      Object.entries(styles).forEach(([key, value]) => {
        const [id, bp, prop] = key.split(':');
        if (id === source.id && bp === 'base' && value) {
          baseProps[toCssProp(prop)] = value;
        }
      });
      
      // Compile metadata to CSS
      if (source.metadata) {
        const metadataCSS = compileMetadataToCSS(source.metadata);
        Object.entries(metadataCSS).forEach(([prop, value]) => {
          baseProps[prop] = value;
        });
      }
      
      const baseCss = Object.entries(baseProps)
        .map(([k, v]) => `${k}: ${v};`)
        .join(' ');
      if (baseCss) rules.push(`${baseSelector} { ${baseCss} }`);

      // Other breakpoints
      breakpoints
        .filter((bp) => bp.id !== 'base')
        .forEach((bp) => {
          const bpProps: Record<string, string> = {};
          Object.entries(styles).forEach(([key, value]) => {
            const [id, bid, prop] = key.split(':');
            if (id === source.id && bid === bp.id && value) {
              bpProps[toCssProp(prop)] = value;
            }
          });
          const bpCss = Object.entries(bpProps)
            .map(([k, v]) => `${k}: ${v};`)
            .join(' ');
          if (bpCss) {
            if (bp.maxWidth) {
              rules.push(`@media (max-width: ${bp.maxWidth}px) { ${baseSelector} { ${bpCss} } }`);
            } else if (bp.minWidth) {
              rules.push(`@media (min-width: ${bp.minWidth}px) { ${baseSelector} { ${bpCss} } }`);
            }
          }
        });
    });

    styleEl.textContent = rules.join('\n');
  }, [styleSources, styles, breakpoints]);

  return null;
};
