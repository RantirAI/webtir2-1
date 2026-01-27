
# Plan: Fix Z-Index Stacking Order for Webflow Decorative Lines

## Problem Summary

The decorative curved lines (with `z-index: -1`) are now visible in the Canvas, but they appear **in the foreground** instead of behind the main content. This is a stacking context issue.

## Root Cause

When we added `isolation: isolate` to fix the visibility issue, we applied it to **every wrapper** in `DraggableInstance` and `DroppableContainer`. This creates separate stacking contexts for each element, breaking the natural CSS stacking order.

**How `isolation: isolate` creates the problem:**

1. Each wrapper with `isolation: isolate` becomes its own stacking context
2. Elements with `z-index: -1` inside a wrapper are placed behind content **within that wrapper only**
3. But the wrapper itself renders in normal DOM order - appearing on TOP of sibling wrappers
4. Result: The decorative lines appear in front of the dashboard mockup because their wrapper comes after the mockup's wrapper in the DOM

```text
DOM Order:
┌─ Wrapper A (dashboard mockup) ─────────┐
│  → Dashboard image                      │
└─────────────────────────────────────────┘
┌─ Wrapper B (decorative lines) ──────────┐  ← Renders on TOP because it's later in DOM
│  → Lines with z-index: -1               │
└─────────────────────────────────────────┘
```

## Solution

Remove `isolation: isolate` from individual element wrappers. The stacking context is already properly established at the **page level**:

- `StyleSheetInjector.tsx` sets `isolation: isolate` on `html`, `body`, `.root-style`, and `.builder-page`
- `Canvas.tsx` applies `isolation: 'isolate'` to the `.builder-page` container

This page-level stacking context allows `z-index: -1` to work correctly across all elements, placing decorative lines behind the main content as intended.

## Files to Modify

### 1. `src/builder/components/DroppableContainer.tsx`

Remove all `isolation: 'isolate'` from the wrapper styles:

**Lines 88-122** - Update `wrapperStyle` to remove isolation:

```typescript
const wrapperStyle: React.CSSProperties = isContainerType
  ? {
      display: 'block',
      width: '100%',
      // For Webflow imports, don't set position - let CSS classes control containing blocks
      position: hasWebflowImport ? undefined : 'relative' as const,
      // REMOVED: isolation: 'isolate' - page-level stacking context is sufficient
      // Add drag feedback styles...
      outline: isValidDropTarget ? '2px dashed #3b82f6' : undefined,
      outlineOffset: isValidDropTarget ? '-2px' : undefined,
      backgroundColor: isValidDropTarget ? 'rgba(59, 130, 246, 0.08)' : undefined,
      borderRadius: isValidDropTarget ? '6px' : undefined,
      transition: 'outline 150ms ease, background-color 150ms ease',
    }
  : hasWebflowImport && !hasAbsolutePosition
  ? {
      // Webflow non-container elements
      display: 'block',
      width: '100%',
      // REMOVED: isolation: 'isolate'
    }
  : hasWebflowImport && hasAbsolutePosition
  ? {
      display: 'contents',
    }
  : {
      display: 'contents',
    };
```

### 2. `src/builder/components/DraggableInstance.tsx`

Remove `isolation: 'isolate'` from the style object:

**Lines 86-113** - Update style conditions to remove isolation:

```typescript
const style: React.CSSProperties = isDragging
  ? { /* dragging styles - no change */ }
  : isContainer
  ? {
      display: 'block',
      width: '100%',
      // REMOVED: isolation: hasWebflowStyles ? 'isolate' : undefined
    }
  : needsStackingContext
  ? {
      display: 'block',
      width: '100%',
      // REMOVED: isolation: 'isolate'
    }
  : hasAbsolutePosition
  ? {
      display: 'contents',
    }
  : {
      display: 'contents',
    };
```

## Technical Explanation

### Why Page-Level Stacking Context Works

The page-level stacking context (on `.builder-page`) ensures:
1. All elements within the page share a single stacking context
2. `z-index: -1` elements are placed behind `z-index: auto/0` elements correctly
3. The CSS cascade and DOM order work as expected within the page

### Why Element-Level Stacking Contexts Break It

When each wrapper has `isolation: isolate`:
1. Each wrapper becomes an atomic unit in the parent's stacking context
2. The `z-index` values inside a wrapper don't affect elements outside it
3. Wrappers are stacked by DOM order (later = on top), ignoring child z-index values

## Expected Result

After this fix:
- Decorative lines (blue/yellow curves) will appear **behind** the main content (dashboard mockup)
- The Canvas edit mode will match the Code View preview exactly
- Drag-and-drop functionality remains unaffected (bounding boxes still work with `display: block` + `width: 100%`)

## Risk Assessment

**Low risk:**
- The page-level stacking context already exists and handles z-index correctly in Code View preview
- We're removing code that creates unwanted behavior, not adding new complexity
- Drag-and-drop collision detection uses element bounding boxes, not stacking contexts
