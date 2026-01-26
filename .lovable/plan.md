
# Plan: Fix Background Elements Disappearing (z-index: -1 Stacking Context)

## Problem Summary

Imported Webflow backgrounds with decorative elements using `z-index: -1` (patterns, shapes, vectors) appear briefly then disappear in:
- Canvas preview
- Code View preview
- Full page preview

The issue occurs because the page container and iframe `body` do not establish a **stacking context**, causing negative z-index elements to render behind the visible content.

## Root Cause

CSS `z-index: -1` elements require a parent that creates a new stacking context. Without it, they fall behind the document root (`<html>` or `<body>`), becoming invisible.

```text
CURRENT STATE (BROKEN):
┌─────────────────────────────────────────┐
│ <body> (no stacking context)            │
│   └─ .builder-page (position: relative) │
│        └─ .decorative (z-index: -1)     │ ← INVISIBLE (behind body)
│        └─ .content                      │
└─────────────────────────────────────────┘

FIXED STATE:
┌─────────────────────────────────────────┐
│ <body> (isolation: isolate)             │ ← Creates stacking context
│   └─ .builder-page (isolation: isolate) │ ← Creates stacking context  
│        └─ .decorative (z-index: -1)     │ ← VISIBLE (within context)
│        └─ .content                      │
└─────────────────────────────────────────┘
```

## Solution

Add `isolation: isolate` to establish stacking contexts in three places:

### Part 1: Canvas Page Frame

**File**: `src/builder/components/Canvas.tsx`

Add `isolation: 'isolate'` to the `.builder-page` div style:

```typescript
// Line ~2458-2472
style={{ 
  backgroundColor: '#ffffff',
  ...pageStyles,
  width: isPreviewMode ? '100%' : `${frameWidth}px`,
  // ... existing styles ...
  position: 'relative',
  isolation: 'isolate',  // ADD THIS - creates stacking context
  // ... rest of styles ...
}}
```

### Part 2: Code View iframe Preview

**File**: `src/builder/components/CodeView.tsx`

Add body styles to the preview HTML template:

```typescript
// Line ~731-752
const previewHTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${googleFontsLink}
    <style>
      /* Stacking context for negative z-index elements */
      body {
        isolation: isolate;
        position: relative;
        margin: 0;
      }
      ${cssCode}
    </style>
  </head>
  <body>
    ${bodyContent}
    ...
  </body>
</html>`;
```

### Part 3: Exported Stylesheet

**File**: `src/builder/utils/export.ts`

Add the same body styles to `exportStylesheet()`:

```typescript
// Line ~186-195
body {
  margin: 0;
  font-family: ...;
  ...
  isolation: isolate;   // ADD THIS
  position: relative;   // ADD THIS
}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/builder/components/Canvas.tsx` | Add `isolation: 'isolate'` to `.builder-page` style (line ~2467) |
| `src/builder/components/CodeView.tsx` | Add body reset CSS to iframe preview template (line ~737) |
| `src/builder/utils/export.ts` | Add `isolation: isolate; position: relative;` to body styles (line ~187) |

## Technical Details

### Canvas.tsx Changes (line ~2467)

```typescript
style={{ 
  // Fallback white background for imported content without explicit backgrounds
  backgroundColor: '#ffffff',
  ...pageStyles,
  width: isPreviewMode ? '100%' : `${frameWidth}px`,
  minHeight: isPreviewMode ? '100vh' : '1200px',
  maxHeight: isPreviewMode ? 'none' : 'calc(100vh - 8rem)',
  boxShadow: isPreviewMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
  transition: isResizing ? 'none' : 'width 0.3s ease',
  position: 'relative',
  isolation: 'isolate', // NEW: creates stacking context for z-index:-1 elements
  overflow: isPreviewMode ? 'visible' : 'auto',
  flexShrink: 0,
  cursor: ...,
  fontFamily: ...,
}}
```

### CodeView.tsx Changes (line ~731)

```typescript
const previewHTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${googleFontsLink}
    <style>
      /* Base reset for preview - ensures negative z-index elements are visible */
      body {
        margin: 0;
        padding: 0;
        isolation: isolate;
        position: relative;
      }
      ${cssCode}
    </style>
  </head>
  <body>
    ${bodyContent}
    <script>
      try {
        ${navigationScript}
        ${jsCode}
      } catch(e) {
        console.error('Preview script error:', e);
      }
    </script>
  </body>
</html>`;
```

### export.ts Changes (line ~187)

```typescript
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: hsl(var(--foreground));
  background-color: hsl(var(--background));
  isolation: isolate;
  position: relative;
}
```

## Why `isolation: isolate`?

- Creates a new stacking context without side effects
- Doesn't affect z-index of the element itself
- Child elements with negative z-index stay within this context
- Supported in all modern browsers
- Cleaner than using `z-index: 0` which can interfere with other layouts

## Expected Outcomes

1. Background patterns with `z-index: -1` remain visible in Canvas
2. Code View preview shows backgrounds correctly
3. Full page preview maintains backgrounds
4. Exported HTML/CSS renders backgrounds in external browsers
5. No visual regressions for non-negative z-index content

## Testing Checklist

- [ ] Import Webflow JSON with decorative background elements
- [ ] Verify backgrounds appear and persist in Canvas
- [ ] Verify backgrounds appear in Code View preview
- [ ] Click full preview button - backgrounds should stay visible
- [ ] Export project and open in browser - backgrounds render correctly
- [ ] Test that regular content (positive z-index) still renders on top
- [ ] Verify no layout shifts or visual regressions
