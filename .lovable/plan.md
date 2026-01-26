
# Plan: Fix Background Rendering Consistency Between Canvas and Code View

## Problem Summary

Backgrounds (colors, images, gradients) render correctly in Code View but are missing or invisible in the Canvas. This occurs because the Canvas's `StyleSheetInjector` has incomplete background layer combination logic compared to the export utility used by Code View.

## Root Cause

The `combineBackgroundLayers()` function in `StyleSheetInjector.tsx` is missing support for the `background-gradient` property that the export utility correctly handles. When a component has both a background color AND a gradient, the canvas fails to combine them properly, resulting in missing backgrounds.

**StyleSheetInjector (Canvas) - Current:**
```typescript
const bgColor = props['background-color'];
const bgImage = props['background-image'];
// Missing: const bgGradient = props['background-gradient'];
```

**Export Utility (Code View) - Correct:**
```typescript
const bgColor = props['background-color'];
const bgImage = props['background-image'];
const bgGradient = props['background-gradient']; // Handles all three!
```

---

## Solution

### Part 1: Update StyleSheetInjector Background Logic

**File: `src/builder/components/StyleSheetInjector.tsx`**

Update the `combineBackgroundLayers()` function to match the export utility's implementation. This ensures background colors, images, and gradients are properly stacked as CSS background-image layers.

**Changes:**
1. Add detection for `background-gradient` property
2. Combine all three layers: color overlay (top) + gradient + image (bottom)
3. Adjust `background-size`, `background-position`, and `background-repeat` for the correct number of layers

```text
Current logic (lines 18-47):
- Checks: background-color + background-image
- Missing: background-gradient

Updated logic:
- Checks: background-color + background-image + background-gradient
- Creates layered background-image with all three combined
```

---

## Technical Implementation

### StyleSheetInjector.tsx Changes

Replace lines 18-47 with the corrected `combineBackgroundLayers` function:

```typescript
// Combine background layers: color + gradient + image into proper CSS
// CSS background-image layers are stacked: first = top, last = bottom
function combineBackgroundLayers(props: Record<string, string>): Record<string, string> {
  const result = { ...props };

  const bgColor = props['background-color'];
  const bgImage = props['background-image'];
  const bgGradient = props['background-gradient']; // NEW: Handle gradient property

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

    // Adjust background-size/position/repeat to match layer count
    const existingSize = props['background-size'] || 'cover';
    const existingPosition = props['background-position'] || 'center';
    const existingRepeat = props['background-repeat'] || 'no-repeat';

    const layerCount = layers.length;
    result['background-size'] = Array(layerCount).fill(existingSize).join(', ');
    result['background-position'] = Array(layerCount).fill(existingPosition).join(', ');
    result['background-repeat'] = Array(layerCount).fill(existingRepeat).join(', ');
  }

  return result;
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/builder/components/StyleSheetInjector.tsx` | Update `combineBackgroundLayers()` to include `background-gradient` property handling |

---

## Visual Diagram

```text
BEFORE (Canvas - broken):
+---------------------------+
| background-color: blue    |  --> Applied as solid color
| background-image: url()   |  --> Applied separately
| background-gradient: ...  |  --> IGNORED! Not combined
+---------------------------+
Result: Gradient invisible, color may cover image

AFTER (Canvas - fixed):
+---------------------------+
| background-color: blue    |
| background-image: url()   |  --> All combined into single
| background-gradient: ...  |      background-image stack
+---------------------------+
Result: linear-gradient(blue,blue), gradient, url(...)
        Color overlay on top, then gradient, then image
```

---

## Expected Outcomes

1. Background colors render correctly on canvas when combined with images/gradients
2. Background gradients are visible on canvas (currently invisible in some cases)
3. Background images layer correctly with color overlays
4. Canvas rendering matches Code View preview exactly
5. All breakpoints (desktop, tablet, mobile) render backgrounds consistently
6. Stacking context and z-index work correctly with layered backgrounds

---

## Testing Checklist

- [ ] Create a Section with solid background color - verify it appears on canvas
- [ ] Create a Section with background gradient - verify it appears on canvas
- [ ] Create a Section with background image - verify it appears on canvas
- [ ] Create a Section with color + gradient - verify both layer correctly
- [ ] Create a Section with color + image - verify color overlay works
- [ ] Switch breakpoints and verify backgrounds persist
- [ ] Compare canvas rendering with Code View preview - should match
- [ ] Export code and verify generated CSS is correct
