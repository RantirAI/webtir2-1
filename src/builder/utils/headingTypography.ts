/**
 * Default typography styles for heading tags (H1-H6)
 * These are applied when a heading tag is selected
 */

export interface HeadingTypography {
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
}

export interface ResponsiveTypography {
  desktop: HeadingTypography;
  tablet: HeadingTypography;
  mobileLandscape: HeadingTypography;
  mobile: HeadingTypography;
}

// Single breakpoint typography map (legacy, for reference)
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

// Responsive typography map with tablet, mobile-landscape, and mobile scaling
export const responsiveHeadingMap: Record<string, ResponsiveTypography> = {
  h1: {
    desktop: { fontSize: '48px', lineHeight: '1.2', fontWeight: '700' },
    tablet: { fontSize: '40px', lineHeight: '1.2', fontWeight: '700' },
    mobileLandscape: { fontSize: '36px', lineHeight: '1.2', fontWeight: '700' },
    mobile: { fontSize: '32px', lineHeight: '1.2', fontWeight: '700' },
  },
  h2: {
    desktop: { fontSize: '40px', lineHeight: '1.3', fontWeight: '700' },
    tablet: { fontSize: '32px', lineHeight: '1.3', fontWeight: '700' },
    mobileLandscape: { fontSize: '28px', lineHeight: '1.3', fontWeight: '700' },
    mobile: { fontSize: '24px', lineHeight: '1.3', fontWeight: '700' },
  },
  h3: {
    desktop: { fontSize: '32px', lineHeight: '1.3', fontWeight: '600' },
    tablet: { fontSize: '28px', lineHeight: '1.3', fontWeight: '600' },
    mobileLandscape: { fontSize: '24px', lineHeight: '1.3', fontWeight: '600' },
    mobile: { fontSize: '22px', lineHeight: '1.3', fontWeight: '600' },
  },
  h4: {
    desktop: { fontSize: '24px', lineHeight: '1.4', fontWeight: '600' },
    tablet: { fontSize: '22px', lineHeight: '1.4', fontWeight: '600' },
    mobileLandscape: { fontSize: '20px', lineHeight: '1.4', fontWeight: '600' },
    mobile: { fontSize: '18px', lineHeight: '1.4', fontWeight: '600' },
  },
  h5: {
    desktop: { fontSize: '20px', lineHeight: '1.5', fontWeight: '600' },
    tablet: { fontSize: '18px', lineHeight: '1.5', fontWeight: '600' },
    mobileLandscape: { fontSize: '17px', lineHeight: '1.5', fontWeight: '600' },
    mobile: { fontSize: '16px', lineHeight: '1.5', fontWeight: '600' },
  },
  h6: {
    desktop: { fontSize: '16px', lineHeight: '1.5', fontWeight: '600' },
    tablet: { fontSize: '15px', lineHeight: '1.5', fontWeight: '600' },
    mobileLandscape: { fontSize: '14px', lineHeight: '1.5', fontWeight: '600' },
    mobile: { fontSize: '14px', lineHeight: '1.5', fontWeight: '600' },
  },
};

/**
 * Get default typography styles for a heading level (desktop only - legacy)
 */
export function getHeadingTypography(level: string): HeadingTypography {
  return headingTypographyMap[level] || headingTypographyMap.h1;
}

/**
 * Get responsive typography styles for a heading level
 */
export function getResponsiveHeadingTypography(level: string): ResponsiveTypography {
  return responsiveHeadingMap[level] || responsiveHeadingMap.h1;
}

/**
 * Apply heading typography to a style source (desktop only - legacy)
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

/**
 * Apply responsive heading typography across all breakpoints.
 * Desktop gets full typography, tablet, mobile-landscape, and mobile get scaled font-sizes.
 */
export function applyResponsiveHeadingTypography(
  styleSourceId: string,
  level: string,
  setStyle: (styleSourceId: string, property: string, value: string, breakpoint?: string, state?: string) => void
): void {
  const responsive = getResponsiveHeadingTypography(level);
  
  // Apply desktop styles (all properties)
  setStyle(styleSourceId, 'fontSize', responsive.desktop.fontSize, 'desktop', 'default');
  setStyle(styleSourceId, 'lineHeight', responsive.desktop.lineHeight, 'desktop', 'default');
  setStyle(styleSourceId, 'fontWeight', responsive.desktop.fontWeight, 'desktop', 'default');
  
  // Apply tablet styles (only font-size, other properties cascade from desktop)
  setStyle(styleSourceId, 'fontSize', responsive.tablet.fontSize, 'tablet', 'default');
  
  // Apply mobile-landscape styles (only font-size, other properties cascade from desktop)
  setStyle(styleSourceId, 'fontSize', responsive.mobileLandscape.fontSize, 'mobile-landscape', 'default');
  
  // Apply mobile styles (only font-size, other properties cascade from desktop)
  setStyle(styleSourceId, 'fontSize', responsive.mobile.fontSize, 'mobile', 'default');
}
