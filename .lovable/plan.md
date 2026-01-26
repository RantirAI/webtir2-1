
# Plan: Fix Background Disappearing After Import

## Problem Summary

Background decorative elements appear briefly then disappear in both the code view preview and canvas preview. The backgrounds are visible in the exported code but not rendered correctly in the live views.

## Root Cause

There's a logic error in how background properties are combined in both `StyleSheetInjector.tsx` and `export.ts`:

1. **Property flow**:
   - Styles are stored in camelCase: `backgroundGradient`, `backgroundImage`
   - `toCssProp()` converts them using aliases/camelCase conversion
   - `combineBackgroundLayers()` receives the converted properties

2. **The bug**:
   - In `StyleSheetInjector.tsx`, `propertyAliases` maps `backgroundGradient` → `background-image`
   - But `combineBackgroundLayers` looks for `background-gradient` (which never exists after alias conversion)
   - Similarly, it should look for `background-image` from the `backgroundImage` property

3. **Result**: Gradients and image backgrounds are converted to `background-image` by `toCssProp`, but then `combineBackgroundLayers` can't find them to combine properly because it's looking for the wrong property names.

## Visual Flow of the Bug

```text
CURRENT (BROKEN):
┌──────────────────────────────────────────────────────────────────┐
│ styles store: { backgroundGradient: "linear-gradient(...)" }    │
│                                    ↓                             │
│ toCssProp('backgroundGradient')                                  │
│ → alias lookup: backgroundGradient → 'background-image'         │
│ → returns: 'background-image'                                    │
│                                    ↓                             │
│ baseProps = { 'background-image': 'linear-gradient(...)' }      │
│                                    ↓                             │
│ combineBackgroundLayers(baseProps)                               │
│ → looks for 'background-gradient' → NOT FOUND!                  │
│ → bgGradient = undefined                                         │
│ → no combination happens, gradient info lost in some cases      │
└──────────────────────────────────────────────────────────────────┘

FIXED:
┌──────────────────────────────────────────────────────────────────┐
│ styles store: { backgroundGradient: "linear-gradient(...)" }    │
│                                    ↓                             │
│ toCssProp('backgroundGradient')                                  │
│ → alias lookup: backgroundGradient → 'background-gradient'      │
│ → returns: 'background-gradient' (intermediate form)            │
│                                    ↓                             │
│ baseProps = { 'background-gradient': 'linear-gradient(...)' }   │
│                                    ↓                             │
│ combineBackgroundLayers(baseProps)                               │
│ → looks for 'background-gradient' → FOUND!                      │
│ → combines into 'background-image'                               │
│ → final CSS is correct                                           │
└──────────────────────────────────────────────────────────────────┘
```

## Solution

### Part 1: Fix `StyleSheetInjector.tsx`

Update the `propertyAliases` to use intermediate property names that `combineBackgroundLayers` can find:

**Current (broken)**:
```typescript
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-image',
  backgroundImage: 'background-image',
};
```

**Fixed**:
```typescript
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-gradient', // Keep as intermediate for combineBackgroundLayers
  backgroundImage: 'background-image',       // This one is fine - already named correctly
};
```

The `combineBackgroundLayers` function will then:
1. Find `background-gradient` (from alias conversion)
2. Find `background-image` (from backgroundImage property)
3. Combine them properly into final `background-image` CSS

### Part 2: Fix `export.ts`

Apply the same fix to `export.ts`:

**Current**:
```typescript
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-image',
};
```

**Fixed**:
```typescript
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-gradient', // Intermediate for combineBackgroundLayers
  backgroundImage: 'background-image',       // Explicit mapping
};
```

## Files to Modify

| File | Change |
|------|--------|
| `src/builder/components/StyleSheetInjector.tsx` | Change `backgroundGradient` alias from `'background-image'` to `'background-gradient'` |
| `src/builder/utils/export.ts` | Change `backgroundGradient` alias from `'background-image'` to `'background-gradient'` and add `backgroundImage` alias |

## Technical Details

### StyleSheetInjector.tsx Changes

```typescript
// Line 7-10: Update propertyAliases
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-gradient', // Changed from 'background-image'
  backgroundImage: 'background-image',
};
```

### export.ts Changes

```typescript
// Line 52-54: Update propertyAliases  
const propertyAliases: Record<string, string> = {
  backgroundGradient: 'background-gradient', // Changed from 'background-image'
  backgroundImage: 'background-image',       // Added
};
```

## Expected Outcomes

1. Background gradients and images will be properly combined by `combineBackgroundLayers`
2. Imported Webflow designs with decorative backgrounds will render correctly
3. Both Canvas and Code View preview will show consistent results
4. The CSS export will include proper background-image stacking

## Testing Checklist

- [ ] Import the Webflow JSON with decorative background elements
- [ ] Verify backgrounds appear in Canvas and don't disappear
- [ ] Verify Code View preview shows backgrounds correctly
- [ ] Check exported CSS has correct background-image properties
- [ ] Test gradient-only backgrounds
- [ ] Test image-only backgrounds
- [ ] Test combined color + gradient + image backgrounds
