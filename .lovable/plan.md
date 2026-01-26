
# Plan: Fix Missing Background Patterns and Decorative Elements During Webflow Import

## Problem Summary

Background decorative elements (patterns, vectors, shapes) visible in the original Webflow design are missing after import into the Canvas. This is caused by:

1. **Property aliasing conflict**: CSS `background-image` is aliased to `backgroundGradient`, causing URL-based backgrounds to be stored incorrectly
2. **Missing differentiation between gradients and images**: The system treats all `background-image` values as gradients
3. **External assets not downloaded**: Webflow CDN URLs are preserved but not downloaded locally

## Root Cause Analysis

### Issue 1: Incorrect Property Aliasing in cssImport.ts

```typescript
// Current (lines 5-7 of cssImport.ts)
const reversePropertyAliases: Record<string, string> = {
  'background-image': 'backgroundGradient',  // <-- ALL background-image values become gradients!
};
```

This causes `background-image: url(https://example.com/pattern.svg)` to be stored as `backgroundGradient`, which is incorrect.

### Issue 2: StyleSheetInjector Alias Mapping

```typescript
// Current (lines 7-9 of StyleSheetInjector.tsx)
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-image',  // Maps back to CSS background-image
};
```

The problem is that BOTH image URLs and gradient functions are flowing through `backgroundGradient`, so the system can't distinguish between them.

### Issue 3: Missing Asset Download

The `extractWebflowAssets()` function identifies CDN URLs but they're never downloaded to the local media folder.

---

## Solution

### Part 1: Fix Property Aliasing - Distinguish Images from Gradients

**File: `src/builder/utils/cssImport.ts`**

Update the `parseProperty` function to intelligently map `background-image` based on its value:
- If the value contains `url(`, map to `backgroundImage` (for actual images)
- If the value contains `linear-gradient(`, `radial-gradient(`, etc., map to `backgroundGradient`

```text
Changes to cssImport.ts:
1. Remove the blanket 'background-image': 'backgroundGradient' alias
2. Add value-aware logic in parseProperty() to distinguish url() from gradient()
```

### Part 2: Update StyleSheetInjector to Handle Both Properties

**File: `src/builder/components/StyleSheetInjector.tsx`**

Update the alias map and `combineBackgroundLayers` function to handle both:
- `backgroundImage` → URL-based backgrounds
- `backgroundGradient` → CSS gradient functions

Both should be combined into the final `background-image` CSS property for rendering.

### Part 3: Add Asset Download During Import

**File: `src/builder/utils/webflowTranslator.ts`**

After extracting assets, also extract background image URLs from styles and:
1. Detect `url()` patterns in `styleLess` strings
2. Return these URLs in the asset extraction function
3. The import modal can then offer to download these assets

---

## Technical Implementation

### cssImport.ts Changes

```typescript
// Remove blanket alias
const reversePropertyAliases: Record<string, string> = {
  // 'background-image': 'backgroundGradient', // REMOVED
};

// Update parseProperty to detect gradients vs images
function parseProperty(property: string, value: string): { prop: string; val: string } {
  // Special handling for background-image
  if (property === 'background-image') {
    // Check if it's a gradient function
    if (value.includes('linear-gradient(') || 
        value.includes('radial-gradient(') ||
        value.includes('conic-gradient(') ||
        value.includes('repeating-linear-gradient(') ||
        value.includes('repeating-radial-gradient(')) {
      return { prop: 'backgroundGradient', val: value };
    }
    // Otherwise it's an image URL
    return { prop: 'backgroundImage', val: value };
  }
  
  // Check for reverse alias first
  const aliasedProp = reversePropertyAliases[property];
  if (aliasedProp) {
    return { prop: aliasedProp, val: value };
  }
  
  // Convert to camelCase
  return { prop: kebabToCamel(property), val: value };
}
```

### StyleSheetInjector.tsx Changes

```typescript
// Updated property aliases - map both gradient and image
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-image',
  backgroundImage: 'background-image', // Explicit mapping for images
};

// combineBackgroundLayers already handles bgImage and bgGradient separately
// No changes needed there - just ensure both flow through correctly
```

### webflowTranslator.ts Changes

Add URL extraction from background-image styles:

```typescript
// Enhanced asset extraction to include background images from styles
export function extractWebflowAssets(webflowData: WebflowXscpData): { url: string; alt: string; name: string }[] {
  const assets: { url: string; alt: string; name: string }[] = [];
  
  // Existing asset extraction...
  
  // Also extract background images from styles
  for (const style of webflowData.payload.styles) {
    if (style.styleLess) {
      const urlMatches = style.styleLess.matchAll(/url\(['"]?([^'")\s]+)['"]?\)/g);
      for (const match of urlMatches) {
        const url = match[1];
        if (url && url.startsWith('http')) {
          assets.push({
            url,
            alt: '',
            name: url.split('/').pop() || 'background-image',
          });
        }
      }
    }
  }
  
  return assets;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/builder/utils/cssImport.ts` | Remove blanket alias, add value-aware gradient vs image detection |
| `src/builder/components/StyleSheetInjector.tsx` | Add `backgroundImage` to property alias map |
| `src/builder/utils/webflowTranslator.ts` | Extract background image URLs from style `styleLess` properties |

---

## Expected Outcomes

1. Background patterns and decorative SVGs/images from Webflow import will render correctly
2. CSS gradients continue to work as before
3. Image URLs (`url()`) are properly stored as `backgroundImage`
4. Gradient functions are properly stored as `backgroundGradient`
5. Both are correctly combined in the canvas CSS output
6. External asset URLs are extracted for potential download

---

## Testing Checklist

- [ ] Import Webflow design with background patterns - verify patterns appear in Canvas
- [ ] Import Webflow design with gradient backgrounds - verify gradients render correctly
- [ ] Import combined gradient + image backgrounds - verify layering works
- [ ] Check Code View exports correct CSS for backgrounds
- [ ] Verify background sizing/positioning is preserved
- [ ] Test with external CDN URLs to verify they load correctly
