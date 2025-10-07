import { StyleDeclaration } from '../store/types';

export function stylesToString(styles: StyleDeclaration): string {
  return Object.entries(styles)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
}

export function stylesToObject(styles: StyleDeclaration): React.CSSProperties {
  const result: any = {};
  
  Object.entries(styles).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      // Convert camelCase to CSS property names for React
      result[key] = value;
    }
  });
  
  return result as React.CSSProperties;
}
