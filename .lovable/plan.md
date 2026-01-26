
# Plan: Fix Canvas Edit Mode to Match Code View Rendering for Imported Webflow Content

## Problem Summary

The Canvas edit mode does not display imported Webflow content identically to the Code View preview. Specifically:
- **Blue and yellow decorative curved lines** (large SVG/image elements with absolute positioning) are visible in Code View but invisible in Canvas edit mode
- **Image sizing** appears different between the two views

The Code View preview works because it renders clean HTML/CSS into an isolated iframe without drag-and-drop wrapper components. The Canvas edit mode wraps every component in `DraggableInstance` and `DroppableContainer`, which interfere with CSS positioning.

## Root Cause Analysis

After extensive investigation, I identified **two key issues**:

### Issue 1: Wrapper `position: relative` Creates Unintended Containing Blocks

In `DroppableContainer.tsx` (line 87), the wrapper sets `position: relative` on container types:

```typescript
position: hasAbsolutePosition ? undefined : 'relative' as const,
```

For Webflow imports, when a **parent container** (like `wf-section-layout1`) gets wrapped with `position: relative`, it becomes the containing block for all `absolute` children. However, the **child images** (the decorative lines) that are absolutely positioned expect their containing block to be the **actual parent element** with `position: relative` set via CSS, not the dnd wrapper.

The chain looks like this:
```text
DroppableContainer [position: relative]  <-- UNEXPECTED containing block
  └─ .wf-section-layout1 [position: relative]  <-- Expected containing block
       └─ .wf-background-image [position: absolute; z-index: -1]  <-- Child
```

When the dnd wrapper has `position: relative`, the absolutely positioned child may be positioned relative to it instead of the actual styled parent, causing misalignment.

### Issue 2: Detection of Absolute Position Only Checks Desktop/Default State

The detection logic in both `DraggableInstance.tsx` and `DroppableContainer.tsx` only checks the desktop/default state:

```typescript
const positionKey = `${id}:desktop:default:position`;
const positionValue = styles[positionKey];
return positionValue === 'absolute' || positionValue === 'fixed';
```

This is correct for the import pipeline (which stores values at `desktop:default`), but the current implementation doesn't account for the full CSS cascade correctly.

### Why Code View Works

The Code View preview:
1. Renders into an isolated iframe
2. Has no wrapper divs around components
3. Applies the exact same CSS that would be exported
4. Preserves the DOM hierarchy exactly as designed

## Solution

To preserve full drag-and-drop editing while achieving better rendering fidelity, I propose a three-part fix:

### Part 1: Remove `position: relative` from DroppableContainer for Webflow Imports

The DroppableContainer should NOT set `position: relative` on Webflow-imported elements, as this can create unintended containing blocks. Instead:
- Only use `isolation: isolate` for stacking context (doesn't create containing block)
- Let the actual CSS classes control positioning hierarchy

**File: `src/builder/components/DroppableContainer.tsx`**

Change the wrapper style to NOT set `position: relative` for Webflow imports:

```typescript
const wrapperStyle: React.CSSProperties = isContainerType || (hasWebflowImport && !hasAbsolutePosition)
  ? {
      display: 'block',
      width: '100%',
      // DON'T set position:relative for Webflow imports - let CSS classes control containing blocks
      // Only set for native builder containers (non-Webflow)
      position: !hasWebflowImport ? 'relative' as const : undefined,
      isolation: 'isolate',
      // ... drag feedback styles
    }
  : // ... other cases
```

### Part 2: Ensure DraggableInstance Doesn't Interfere with Absolute Positioning

Update DraggableInstance to be more transparent for Webflow-imported absolutely positioned elements:

**File: `src/builder/components/DraggableInstance.tsx`**

Ensure that for absolutely positioned Webflow elements, the wrapper uses `display: contents` and doesn't add any positioning:

```typescript
// For absolutely positioned Webflow elements, be completely transparent
: hasAbsolutePosition
? {
    display: 'contents',
  }
// Existing handling for other cases...
```

This is already implemented correctly, but we need to verify the detection is accurate.

### Part 3: Fix Detection to Check Parent Chain for Containing Block

The core issue is that we're setting `position: relative` on wrapper divs that shouldn't be containing blocks. A more robust approach is to:

1. For Webflow imports, NEVER set `position: relative` on the dnd wrapper
2. Let the actual imported CSS handle all positioning
3. Only use `isolation: isolate` when needed for stacking (negative z-index)

**Updated logic for DroppableContainer.tsx:**

```typescript
const wrapperStyle: React.CSSProperties = isContainerType
  ? {
      display: 'block',
      width: '100%',
      // For Webflow imports, don't set position - let CSS classes control
      // For native builder containers, set position:relative
      position: hasWebflowImport ? undefined : 'relative' as const,
      // Always use isolation for stacking context support
      isolation: hasWebflowImport ? 'isolate' : undefined,
      // ... drag feedback styles
    }
  : hasWebflowImport && !hasAbsolutePosition
  ? {
      // Webflow non-container but needs stacking context
      display: 'block',
      width: '100%',
      isolation: 'isolate',
      // NO position: relative!
    }
  : hasWebflowImport && hasAbsolutePosition
  ? {
      // Webflow absolutely positioned - be transparent
      display: 'contents',
    }
  : {
      // Non-Webflow non-containers
      display: 'contents',
    };
```

### Part 4: Update DraggableInstance Similarly

**File: `src/builder/components/DraggableInstance.tsx`**

Apply the same principle - no `position: relative` for Webflow imports:

```typescript
const style: React.CSSProperties = isDragging
  ? { /* dragging styles */ }
  : isContainer
  ? {
      display: 'block',
      width: '100%',
      // No position:relative for containers - let CSS handle it
    }
  : needsStackingContext
  ? {
      display: 'block',
      width: '100%',
      isolation: 'isolate',
      // NO position: relative - this is the key fix
    }
  : hasAbsolutePosition
  ? {
      display: 'contents',
    }
  : {
      display: 'contents',
    };
```

## Technical Details

### Files to Modify

| File | Change |
|------|--------|
| `src/builder/components/DroppableContainer.tsx` | Remove `position: relative` for Webflow imports; keep `isolation: isolate` only |
| `src/builder/components/DraggableInstance.tsx` | Same - remove position relative for Webflow imports |

### Why This Works

1. **Containing blocks preserved**: By not setting `position: relative` on wrapper divs, absolutely positioned children will find their containing block in the actual DOM element that has `position: relative` via CSS (e.g., `.wf-section-layout1`).

2. **Stacking context maintained**: `isolation: isolate` creates a stacking context WITHOUT being a containing block, so `z-index: -1` elements remain visible while absolute positioning references the correct parent.

3. **Drag-and-drop still works**: The dnd-kit library uses `ref` callbacks for bounding boxes. `display: block` with `width: 100%` provides measurable dimensions for collision detection, even without `position: relative`.

4. **Backward compatible**: Native builder components (non-Webflow) can still use `position: relative` on wrappers if needed, as they don't have the same containing block expectations.

### CSS Property: `isolation: isolate` vs `position: relative`

| Property | Creates Stacking Context | Creates Containing Block |
|----------|-------------------------|-------------------------|
| `position: relative` | Yes | Yes (for absolute children) |
| `isolation: isolate` | Yes | No |

The key insight is that `isolation: isolate` provides the stacking context we need for `z-index: -1` elements WITHOUT becoming a containing block for `position: absolute` children.

## Implementation Steps

1. Update `DroppableContainer.tsx`:
   - Remove `position: relative` from Webflow import wrappers
   - Keep only `isolation: isolate` for stacking context

2. Update `DraggableInstance.tsx`:
   - Same change - no `position: relative` for Webflow content

3. Test:
   - Re-import Webflow design with decorative curved lines
   - Verify lines appear in Canvas edit mode
   - Verify drag-and-drop still works
   - Verify image sizing matches Code View

## Risk Assessment

**Low risk** - Changes are conservative and scoped:
- Only affects Webflow imports (detected by `wf-` prefix)
- Native builder components unchanged
- `display: block` with `width: 100%` maintains bounding boxes for dnd-kit
- Easy to verify and rollback if needed
