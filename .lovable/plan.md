
# Plan: Fix Typography Breakpoint Cascade and Implement Responsive Scaling

## Problem Summary

Typography and other styles behave inconsistently across breakpoints due to two distinct issues:

1. **Hardcoded `'base'` breakpoint identifiers**: Several files use `'base'` instead of `'desktop'` as the base breakpoint ID, causing styles to not be recognized by the CSS generator
2. **No responsive typography scaling**: The system lacks default typography scaling for tablet and mobile breakpoints

## Root Cause Analysis

### Issue 1: `'base'` vs `'desktop'` Mismatch

The style store uses `'desktop'` as the base breakpoint (line 17 in `useStyleStore.ts`), but several files still reference `'base'`:

| File | Line | Issue |
|------|------|-------|
| `AIChat.tsx` | 659 | `setStyle(..., 'base', 'default')` for AI update actions |
| `useComponentInstanceStore.ts` | 480 | Falls back to `'base'` when parsing prebuilt style keys |
| `SpacingControl.tsx` | 167, 195 | Falls back to `'base'` in color indicator logic |

This causes styles applied through AI updates and prebuilt synchronization to be stored under an unrecognized breakpoint ID, making them invisible to the `StyleSheetInjector`.

### Issue 2: Missing Responsive Typography Defaults

The `headingTypography.ts` only defines desktop sizes. When users view tablet or mobile breakpoints, headings appear unchanged unless manually adjusted. A proper design system should provide sensible typography scaling by default.

## Solution

### Part 1: Replace All `'base'` References with `'desktop'`

Update the following files to use the correct breakpoint ID:

**File 1: `src/builder/components/AIChat.tsx` (line 659)**
```typescript
// Before:
setStyle(styleSourceId, property, value, 'base', 'default');

// After:
setStyle(styleSourceId, property, value, 'desktop', 'default');
```

**File 2: `src/builder/store/useComponentInstanceStore.ts` (line 480)**
```typescript
// Before:
const breakpoint = keyParts[0] || 'base';

// After:
const breakpoint = keyParts[0] || 'desktop';
```

**File 3: `src/builder/components/SpacingControl.tsx` (lines 167, 195)**
```typescript
// Before (line 167):
const breakpoint = currentBreakpointId || 'base';

// After:
const breakpoint = currentBreakpointId || 'desktop';

// Before (line 195):
const breakpoint = currentBreakpointId || 'base';

// After:
const breakpoint = currentBreakpointId || 'desktop';
```

### Part 2: Add Responsive Typography Scaling Defaults

Extend `headingTypography.ts` with recommended tablet and mobile sizes:

```typescript
export interface ResponsiveTypography {
  desktop: HeadingTypography;
  tablet: HeadingTypography;
  mobile: HeadingTypography;
}

export const responsiveHeadingMap: Record<string, ResponsiveTypography> = {
  h1: {
    desktop: { fontSize: '48px', lineHeight: '1.2', fontWeight: '700' },
    tablet: { fontSize: '40px', lineHeight: '1.2', fontWeight: '700' },
    mobile: { fontSize: '32px', lineHeight: '1.2', fontWeight: '700' },
  },
  h2: {
    desktop: { fontSize: '40px', lineHeight: '1.3', fontWeight: '700' },
    tablet: { fontSize: '32px', lineHeight: '1.3', fontWeight: '700' },
    mobile: { fontSize: '28px', lineHeight: '1.3', fontWeight: '700' },
  },
  h3: {
    desktop: { fontSize: '32px', lineHeight: '1.3', fontWeight: '600' },
    tablet: { fontSize: '28px', lineHeight: '1.3', fontWeight: '600' },
    mobile: { fontSize: '24px', lineHeight: '1.3', fontWeight: '600' },
  },
  h4: {
    desktop: { fontSize: '24px', lineHeight: '1.4', fontWeight: '600' },
    tablet: { fontSize: '22px', lineHeight: '1.4', fontWeight: '600' },
    mobile: { fontSize: '20px', lineHeight: '1.4', fontWeight: '600' },
  },
  h5: {
    desktop: { fontSize: '20px', lineHeight: '1.5', fontWeight: '600' },
    tablet: { fontSize: '18px', lineHeight: '1.5', fontWeight: '600' },
    mobile: { fontSize: '16px', lineHeight: '1.5', fontWeight: '600' },
  },
  h6: {
    desktop: { fontSize: '16px', lineHeight: '1.5', fontWeight: '600' },
    tablet: { fontSize: '15px', lineHeight: '1.5', fontWeight: '600' },
    mobile: { fontSize: '14px', lineHeight: '1.5', fontWeight: '600' },
  },
};
```

Add a new function to apply responsive typography:

```typescript
export function applyResponsiveHeadingTypography(
  styleSourceId: string,
  level: string,
  setStyle: (styleSourceId: string, property: string, value: string, breakpoint?: string, state?: string) => void
): void {
  const responsive = responsiveHeadingMap[level] || responsiveHeadingMap.h1;
  
  // Apply desktop styles
  setStyle(styleSourceId, 'fontSize', responsive.desktop.fontSize, 'desktop', 'default');
  setStyle(styleSourceId, 'lineHeight', responsive.desktop.lineHeight, 'desktop', 'default');
  setStyle(styleSourceId, 'fontWeight', responsive.desktop.fontWeight, 'desktop', 'default');
  
  // Apply tablet styles (only font-size, inheriting other properties)
  setStyle(styleSourceId, 'fontSize', responsive.tablet.fontSize, 'tablet', 'default');
  
  // Apply mobile styles (only font-size, inheriting other properties)
  setStyle(styleSourceId, 'fontSize', responsive.mobile.fontSize, 'mobile', 'default');
}
```

### Part 3: Update HeadingSettingsPopover to Use Responsive Typography

When a user changes the heading tag, apply responsive defaults:

**File: `src/builder/components/HeadingSettingsPopover.tsx` (lines 127-131)**

```typescript
// Before:
applyHeadingTypography(styleSourceId, newTag, setStyle);

// After (import the new function):
import { applyResponsiveHeadingTypography } from '../utils/headingTypography';
// ...
applyResponsiveHeadingTypography(styleSourceId, newTag, setStyle);
```

### Part 4: Update System Prebuilts with Responsive Typography

Extend the `SystemPrebuiltDefinition` interface to include `mobileStyles` for typography scaling, then update heading definitions in system prebuilts:

**File: `src/builder/utils/systemPrebuilts.ts`**

Add tablet and mobile styles for headings in Hero Section, CTA Section, etc.:

```typescript
tabletStyles: {
  'style-hero-heading': createStyleEntry({
    fontSize: '44px',
  }),
  'style-hero-text': createStyleEntry({
    fontSize: '18px',
  }),
},
mobileStyles: {
  'style-hero-heading': createStyleEntry({
    fontSize: '32px',
  }),
  'style-hero-text': createStyleEntry({
    fontSize: '16px',
  }),
},
```

### Part 5: Apply Responsive Prebuilt Styles

Update `useComponentInstanceStore.ts` to apply `tabletStyles` and `mobileStyles` when creating instances from system prebuilts:

In the `convertSystemPrebuiltToPrebuilt` function, include tablet and mobile style entries:

```typescript
// After desktop styles, add tablet styles
if (definition.tabletStyles) {
  for (const [styleId, props] of Object.entries(definition.tabletStyles)) {
    for (const [prop, value] of Object.entries(props)) {
      styleValues[`${styleId}:tablet:default:${prop}`] = value;
    }
  }
}

// Add mobile styles
if (definition.mobileStyles) {
  for (const [styleId, props] of Object.entries(definition.mobileStyles)) {
    for (const [prop, value] of Object.entries(props)) {
      styleValues[`${styleId}:mobile:default:${prop}`] = value;
    }
  }
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/builder/components/AIChat.tsx` | Line 659: `'base'` → `'desktop'` |
| `src/builder/store/useComponentInstanceStore.ts` | Line 480: `'base'` → `'desktop'`; Add tablet/mobile style application |
| `src/builder/components/SpacingControl.tsx` | Lines 167, 195: `'base'` → `'desktop'` |
| `src/builder/utils/headingTypography.ts` | Add responsive typography map and `applyResponsiveHeadingTypography` |
| `src/builder/components/HeadingSettingsPopover.tsx` | Use `applyResponsiveHeadingTypography` |
| `src/builder/utils/systemPrebuilts.ts` | Add `tabletStyles` and `mobileStyles` for typography scaling |

## Expected Behavior After Implementation

1. **Desktop styles remain intact**: Editing at tablet/mobile never affects desktop values
2. **Proper cascade**: Tablet/mobile inherit from desktop unless explicitly overridden
3. **Visual indicators work correctly**: Blue dot shows explicit override, green shows breakpoint inheritance
4. **Responsive typography out-of-the-box**: Headings automatically scale down on smaller viewports
5. **System prebuilts look polished**: Hero sections, CTA sections, etc. have appropriate mobile typography

## Testing Plan

1. Create a new Heading element and verify it has responsive font sizes at all breakpoints
2. Switch breakpoints and confirm desktop styles cascade correctly (green indicator)
3. Override a property at tablet and verify it shows blue indicator
4. Clear the tablet override and verify it returns to green (inherited)
5. Drop a Hero Section prebuilt and check typography scales on mobile preview
6. Use AI to update a component and verify styles are applied correctly

## Risk Assessment

**Low Risk**:
- `'base'` → `'desktop'` changes are straightforward find-and-replace
- Migration utility already exists in `initStyles.ts` to handle any legacy `'base'` keys
- New responsive typography is additive and doesn't break existing manual overrides
