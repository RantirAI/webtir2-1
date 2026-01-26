
# Plan: Fix Background Elements Rendering in Canvas and Full Preview

## Problem Summary

Background elements with `z-index: -1` (common in Webflow imports like decorative dots, patterns, shapes) appear correctly in the Code View side panel preview but disappear in:
- Canvas edit mode
- Canvas preview mode
- Code View full preview button

The Code View side panel works because it uses an iframe with isolated stacking context, while the Canvas renders React components directly in the main document without proper stacking context isolation.

## Root Cause

The Canvas renders imported components **directly within the main document's DOM**, not inside an iframe. When components have `z-index: -1`, they need a parent element with a proper stacking context (`isolation: isolate`) to prevent them from falling behind the document root.

Currently:
- **Code View iframe**: Has `html, body { isolation: isolate; }` injected → Works
- **Canvas**: Only sets `isolation: isolate` on `.builder-page` container, but the **main document's `html` and `body`** do not have this property → Backgrounds escape behind and disappear

Additionally, the `StyleSheetInjector`'s BASE_CSS does NOT include stacking context rules for the main document.

## Solution

Add stacking context rules to the main document via `StyleSheetInjector` and ensure the Canvas wrapper chain creates proper isolation.

---

## Technical Changes

### Part 1: Add Stacking Context to StyleSheetInjector's BASE_CSS

**File: `src/builder/components/StyleSheetInjector.tsx`**

Update the `BASE_CSS` constant to include stacking context rules for the main document, ensuring negative z-index elements stay visible in the Canvas.

Add after line 130 (after box-sizing reset):

```css
/* Stacking context for z-index:-1 elements (Webflow imports) */
html, body {
  isolation: isolate;
  position: relative;
}

/* Ensure root-style container creates stacking context */
.root-style, [class*="root-style"] {
  position: relative;
  isolation: isolate;
}

/* Builder page container stacking context */
.builder-page {
  position: relative;
  isolation: isolate;
}
```

### Part 2: Ensure Canvas Wrapper Has Proper Stacking Context

**File: `src/builder/components/Canvas.tsx`**

The `.builder-page` div already has `isolation: 'isolate'` and `position: 'relative'` set inline (line 2467-2468). However, we should also ensure the outer canvas wrapper (`builder-canvas` class) has stacking context.

Add to the parent canvas wrapper div (around line 2407-2410):

```typescript
style={{
  position: 'relative',
  isolation: 'isolate',
  // ... existing styles
}}
```

### Part 3: Fix Code View Full Preview

**File: `src/builder/components/CodeView.tsx`**

The issue with the "full preview button" is that when the preview re-renders, the same iframe content is being written but something causes a brief flash. The current implementation already has correct CSS injection.

The likely issue is that when switching viewport sizes or triggering a re-render, the `doc.write()` operation clears the old content briefly. We should ensure the stacking context CSS is stable.

Add additional CSS specificity to ensure `.wf-` prefixed classes maintain their backgrounds:

```css
/* Ensure Webflow imported elements with backgrounds maintain visibility */
[class*="wf-"] {
  position: relative;
  z-index: auto;
}

/* Explicitly handle background wrapper divs common in Webflow patterns */
.wf-background-video-wrapper,
[class*="wf-"][style*="z-index: -1"],
[class*="wf-"][style*="z-index:-1"] {
  z-index: -1 !important;
}
```

Wait - actually the better fix is to ensure the **parent** of z-index:-1 elements has stacking context. The current issue is that while we set isolation on body, specific Webflow wrapper divs may not have the right positioning.

### Part 4: Add Debug Logging (Temporary)

Add console logging to track when styles are being regenerated, which will help diagnose the "flash" behavior:

**File: `src/builder/components/StyleSheetInjector.tsx`** (around line 266)

```typescript
// Existing log
if (process.env.NODE_ENV === 'development') {
  console.log('[StyleSheetInjector] Injected', rules.length, 'CSS rules');
  // Add: Log when background-image rules are generated
  const bgRules = rules.filter(r => r.includes('background-image'));
  if (bgRules.length > 0) {
    console.log('[StyleSheetInjector] Background rules:', bgRules.length);
  }
}
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/builder/components/StyleSheetInjector.tsx` | Add stacking context CSS to BASE_CSS |
| `src/builder/components/Canvas.tsx` | Ensure outer canvas wrapper has isolation |
| `src/builder/components/CodeView.tsx` | Add additional CSS rules for Webflow elements |

---

## Implementation Details

### StyleSheetInjector.tsx Changes

The BASE_CSS constant (lines 103-158) will be updated to:

```typescript
const BASE_CSS = `
/* Canvas Base CSS Variables */
:root {
  --background: 0 0% 100%;
  /* ... existing variables ... */
}

/* Stacking context for negative z-index elements (critical for Webflow imports) */
html, body {
  isolation: isolate;
  position: relative;
  margin: 0;
  padding: 0;
}

/* Root style container stacking context */
.root-style, [class*="root-style"] {
  position: relative;
  isolation: isolate;
}

/* Builder page container - ensures z-index:-1 elements stay within page */
.builder-page {
  position: relative;
  isolation: isolate;
}

/* Canvas Base Resets */
*, *::before, *::after {
  box-sizing: border-box;
}

/* ... rest of existing BASE_CSS ... */
`;
```

### Canvas.tsx Changes

Find the outer container div (around line 2395-2410) and ensure it has stacking context:

```typescript
<div 
  ref={canvasRef}
  className="builder-canvas relative"
  style={{
    isolation: 'isolate', // ADD THIS
    // ... existing styles
  }}
>
```

---

## Why This Will Work

1. **Main document isolation**: By adding `html, body { isolation: isolate; }` to StyleSheetInjector's BASE_CSS, we ensure the main document creates a stacking context, matching what the Code View iframe does.

2. **Consistent stacking context chain**: From `html` → `body` → `.builder-canvas` → `.builder-page` → `.root-style` → imported content, every level now has proper stacking context.

3. **No more escaping z-index**: Elements with `z-index: -1` will stay within their parent's stacking context instead of falling behind the document root.

---

## Testing Checklist

After implementation:
- [ ] Import Webflow design with decorative background elements
- [ ] Canvas edit mode: backgrounds visible and persistent
- [ ] Canvas preview mode: backgrounds remain visible
- [ ] Code View side panel preview: backgrounds visible (already works)
- [ ] Code View full preview button: backgrounds remain visible
- [ ] Switching between edit/preview modes: no flash/disappear
- [ ] Exported project renders backgrounds correctly in external browser

---

## Risk Assessment

**Low risk** - These changes only add CSS rules that create stacking contexts. They don't modify:
- Component rendering logic
- Style store operations
- Import/export functionality
- Existing styling behavior for non-imported components

The `isolation: isolate` property is specifically designed to create stacking contexts without side effects.
