/**
 * Default typography styles for heading tags (H1-H6)
 * These are applied when a heading tag is selected
 */

export interface HeadingTypography {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
}

export const headingTypographyMap: Record<string, HeadingTypography> = {
  h1: {
    fontSize: '48px',
    lineHeight: '1.2',
    fontWeight: '700',
  },
  h2: {
    fontSize: '40px',
    lineHeight: '1.3',
    fontWeight: '700',
  },
  h3: {
    fontSize: '32px',
    lineHeight: '1.3',
    fontWeight: '600',
  },
  h4: {
    fontSize: '24px',
    lineHeight: '1.4',
    fontWeight: '600',
  },
  h5: {
    fontSize: '20px',
    lineHeight: '1.5',
    fontWeight: '600',
  },
  h6: {
    fontSize: '16px',
    lineHeight: '1.5',
    fontWeight: '600',
  },
};

/**
 * Get default typography styles for a heading level
 */
export function getHeadingTypography(level: string): HeadingTypography {
  return headingTypographyMap[level] || headingTypographyMap.h1;
}

/**
 * Apply heading typography to a style source
 */
export function applyHeadingTypography(
  styleSourceId: string,
  level: string,
  setStyle: (styleSourceId: string, property: string, value: string) => void
): void {
  const typography = getHeadingTypography(level);
  
  setStyle(styleSourceId, 'fontSize', typography.fontSize);
  setStyle(styleSourceId, 'lineHeight', typography.lineHeight);
  setStyle(styleSourceId, 'fontWeight', typography.fontWeight);
}
