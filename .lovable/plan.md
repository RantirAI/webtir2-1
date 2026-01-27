

# Plan: Fix System Prebuilt Styles Not Being Applied

## Problem Summary

System prebuilt components (Hero Section, Navigation, CTA Section, Footer, Feature Card, Testimonial Card, Pricing Card) appear unstyled - rendering as basic HTML structure without any CSS applied.

## Root Cause

There is a **breakpoint identifier mismatch** between the system prebuilt style definitions and the style system:

### The Bug

1. **System prebuilts use `base` as the breakpoint identifier** (in `useComponentInstanceStore.ts` line 138):
   ```typescript
   Object.entries(styleValues).map(([prop, value]) => [`${styleId}:base:default:${prop}`, value])
   ```

2. **The style store expects `desktop` as the base breakpoint** (in `useStyleStore.ts` lines 16-21):
   ```typescript
   const defaultBreakpoints: Breakpoint[] = [
     { id: 'desktop', label: 'Desktop' },
     { id: 'tablet', label: 'Tablet', maxWidth: 991 },
     ...
   ];
   ```

3. **When `createInstanceFromPrebuilt` applies styles**, it parses the key `style-hero-section:base:default:display` and extracts `base` as the breakpoint. It then calls `setStyle(newStyleId, 'display', 'flex', 'base', 'default')`.

4. **The StyleSheetInjector only generates CSS for valid breakpoint IDs** (`desktop`, `tablet`, `mobile-landscape`, `mobile`). Since `base` is not a valid breakpoint ID, these styles are never included in the generated CSS.

### Console Log Evidence
```
[StyleSheetInjector] Injected 1 CSS rules for 30 style sources
```
With 30 style sources, there should be dozens of CSS rules, not just 1. This confirms styles are being registered but not compiled to CSS.

## Solution

Change the breakpoint identifier from `base` to `desktop` in the `convertSystemPrebuiltToPrebuilt` function.

## Files to Modify

### 1. `src/builder/store/useComponentInstanceStore.ts`

**Location**: Line 138

**Current Code**:
```typescript
styleValues: Object.fromEntries(
  Object.entries(styleValues).map(([prop, value]) => [`${styleId}:base:default:${prop}`, value])
),
```

**Fixed Code**:
```typescript
styleValues: Object.fromEntries(
  Object.entries(styleValues).map(([prop, value]) => [`${styleId}:desktop:default:${prop}`, value])
),
```

## Additional Consideration: Existing Persisted Data

Since user-saved prebuilts are persisted to localStorage, there may be existing prebuilts with `base` breakpoint keys. These would also fail to render.

### Option A: Fix Only New Prebuilts (Minimal Change)
- Just change the definition - new drops will work correctly
- Old persisted prebuilts would remain broken until re-saved

### Option B: Add Migration/Normalization (Recommended)
- Add a normalization step when loading prebuilts from localStorage
- Convert any `base` breakpoint keys to `desktop`

I recommend **Option A** for now since:
- System prebuilts reload fresh on every startup (not persisted)
- User-saved prebuilts are less likely to have this issue since they use `captureStyles()` which correctly uses the current breakpoint IDs
- We can add migration later if needed

## Expected Outcome

After this fix:
- System prebuilts will correctly render with all their defined styles
- The console will show proper CSS rule counts (e.g., "Injected 150 CSS rules for 30 style sources")
- Hero sections will display centered with flex layout, proper typography, and button styling
- Feature cards will show proper card styling with padding, borders, and layout
- All other prebuilt components will render as designed

## Testing Plan

1. Open the builder
2. Drag a "Hero Section" prebuilt to the canvas
3. Verify it renders with:
   - Centered layout (flex, align-items: center)
   - Proper heading size (56px font-size)
   - Button styling (background colors, padding, border-radius)
   - Proper spacing (padding: 80px 24px, gap: 24px)
4. Repeat for other prebuilts: Feature Card, CTA Section, Footer, Testimonial Card, Pricing Card
5. Check console logs confirm many CSS rules are being injected

## Risk Assessment

**Very Low Risk**:
- Single line change
- Fixes a clear bug with no behavioral side effects
- System prebuilts are reloaded fresh on startup, so no migration needed
- Does not affect user-saved prebuilts (they use different code path)

