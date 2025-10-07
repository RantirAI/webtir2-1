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
  return Object.entries(styles).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as any] = value;
    }
    return acc;
  }, {} as React.CSSProperties);
}
