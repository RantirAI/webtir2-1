

# Plan: Fix Canvas Edit Mode Rendering for Images and Background Elements

## Problem Summary

Canvas edit mode renders imported content differently than Canvas preview mode:
1. **Background elements with `z-index: -1`**: Visible in preview, but disappear in edit mode
2. **Image sizing**: Image appears correctly sized in preview, but renders too small in edit mode (50% × 88% specified but not applied)

Both modes use the same CSS (from `StyleSheetInjector`), but the DOM structure differs due to drag-and-drop wrapper components.

## Root Cause

In Canvas edit mode, components are wrapped in `DraggableInstance` and `DroppableContainer` which use `display: contents` for non-container elements. While `display: contents` is designed to be layout-transparent, it has known issues:

1. **Stacking context inheritance**: Elements with `display: contents` don't create stacking contexts, which can break `z-index: -1` layering for children when the wrapper chain is interrupted
2. **Sizing context**: Percentage-based sizing depends on the parent's dimensions; `display: contents` can affect how these are calculated
3. **`ImagePrimitive` default styles**: The inline styles `maxWidth: 100%` and `height: auto` can override CSS class styles that specify exact dimensions

```text
PREVIEW MODE (WORKS):
┌─────────────────────────────────────┐
│ .builder-page (isolation: isolate) │
│   └─ .root-style (position: rel)   │
│        └─ .wf-section              │
│             └─ .wf-background      │ ← z-index:-1 works
│             └─ .wf-image           │ ← 50% width works
└─────────────────────────────────────┘

EDIT MODE (BROKEN):
┌─────────────────────────────────────┐
│ .builder-page (isolation: isolate) │
│   └─ DroppableContainer            │ ← display: contents
│        └─ .root-style              │
│             └─ DraggableInstance   │ ← display: contents
│                  └─ .wf-section    │
│                       └─ ...       │
│                            └─ .wf-background │ ← z-index broken
│                            └─ .wf-image      │ ← sizing broken
└─────────────────────────────────────┘
```

## Solution

Three-part fix to ensure edit mode matches preview mode rendering:

### Part 1: Fix DraggableInstance Wrapper for Positioned Elements

Update `DraggableInstance` to detect when the wrapped element has positioning-related CSS classes (absolute/relative positioning, negative z-index) and avoid using `display: contents` in those cases.

**File: `src/builder/components/DraggableInstance.tsx`**

Add detection for imported Webflow classes (`wf-` prefix) and use a proper block wrapper that preserves positioning context:

```typescript
// For non-containers, check if this is a Webflow import that needs proper positioning
const hasPositionedContent = instance.styleSourceIds?.some(id => {
  const name = styleSources[id]?.name;
  return name?.startsWith('wf-') || name?.includes('background') || name?.includes('absolute');
});

const style: React.CSSProperties = isDragging
  ? { /* ... dragging styles ... */ }
  : isContainer
  ? { display: 'block', width: '100%' }
  : hasPositionedContent
  ? { 
      // For positioned content, use block display to preserve stacking context
      display: 'block',
      width: '100%',
      position: 'relative',
    }
  : { display: 'contents' };
```

### Part 2: Fix DroppableContainer for Positioned Children

Apply the same logic to `DroppableContainer` to ensure elements with negative z-index have proper positioning context.

**File: `src/builder/components/DroppableContainer.tsx`**

Extend container types detection to include Webflow-imported elements that need proper stacking:

```typescript
// Also check for Webflow imports that need stacking context
const hasWebflowImport = instance.styleSourceIds?.some(id => {
  const name = styleSources[id]?.name;
  return name?.startsWith('wf-');
});

const wrapperStyle: React.CSSProperties = isContainerType || hasWebflowImport
  ? {
      display: 'block',
      width: '100%',
      position: 'relative',
      isolation: 'isolate', // Ensure stacking context for z-index:-1 children
      // ... existing drag feedback styles ...
    }
  : { display: 'contents' };
```

### Part 3: Remove Conflicting Default Styles from ImagePrimitive

The `ImagePrimitive` sets `maxWidth: 100%` and `height: auto` as default inline styles, which can override CSS class-defined dimensions.

**File: `src/builder/primitives/ImagePrimitive.tsx`**

Make default styles conditional based on whether the image has imported styling:

```typescript
// Only apply default sizing if no CSS classes define specific dimensions
const hasImportedStyles = (instance.styleSourceIds || []).some(id => {
  const name = useStyleStore.getState().styleSources[id]?.name;
  return name?.startsWith('wf-');
});

const defaultImageStyles: React.CSSProperties = hasImportedStyles
  ? {
      // Minimal resets for imported images - let CSS classes control sizing
      display: 'block',
    }
  : {
      // Standard defaults for native images
      maxWidth: '100%',
      height: 'auto',
      display: 'block',
    };
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/builder/components/DraggableInstance.tsx` | Add detection for positioned/imported content, use block display instead of contents |
| `src/builder/components/DroppableContainer.tsx` | Add detection for Webflow imports, ensure stacking context |
| `src/builder/primitives/ImagePrimitive.tsx` | Conditionally apply default sizing styles |

---

## Technical Implementation Details

### DraggableInstance.tsx

```typescript
import { useStyleStore } from '../store/useStyleStore';

// Inside component:
const { styleSources } = useStyleStore();

// Check if wrapped element needs proper positioning context
const hasPositionedContent = instance.styleSourceIds?.some(id => {
  const source = styleSources[id];
  const name = source?.name || '';
  return name.startsWith('wf-') || name.includes('absolute') || name.includes('background');
});

// Update style calculation:
const style: React.CSSProperties = isDragging
  ? { /* existing dragging styles */ }
  : isContainer
  ? { display: 'block', width: '100%' }
  : hasPositionedContent
  ? { 
      display: 'block',
      width: '100%', 
      position: 'relative',
      isolation: 'isolate',
    }
  : { display: 'contents' };
```

### DroppableContainer.tsx

```typescript
import { useStyleStore } from '../store/useStyleStore';

// Inside component:
const { styleSources } = useStyleStore();

// Check for Webflow imports
const hasWebflowImport = instance.styleSourceIds?.some(id => {
  const name = styleSources[id]?.name;
  return name?.startsWith('wf-');
});

// Update wrapper style:
const wrapperStyle: React.CSSProperties = isContainerType || hasWebflowImport
  ? {
      display: 'block',
      width: '100%',
      position: 'relative',
      isolation: 'isolate',
      // existing drag feedback styles...
    }
  : { display: 'contents' };
```

### ImagePrimitive.tsx

```typescript
// Check if image has imported styles that define sizing
const hasImportedStyles = useMemo(() => {
  return (instance.styleSourceIds || []).some(id => {
    const name = useStyleStore.getState().styleSources[id]?.name;
    return name?.startsWith('wf-');
  });
}, [instance.styleSourceIds]);

// Apply conditional default styles
const defaultImageStyles: React.CSSProperties = hasImportedStyles
  ? { display: 'block' }
  : { maxWidth: '100%', height: 'auto', display: 'block' };
```

---

## Why This Will Work

1. **Stacking context preservation**: Elements wrapped with `position: relative` and `isolation: isolate` create proper stacking contexts, allowing `z-index: -1` children to render correctly within their container instead of escaping behind the document.

2. **Sizing context preservation**: Using `display: block` with `width: 100%` instead of `display: contents` ensures percentage-based child sizing works correctly.

3. **Selective application**: Only Webflow imports (`wf-` prefix) get the block wrapper treatment, so native builder components continue using the optimized `display: contents` behavior.

4. **No inline style conflicts**: Removing default `maxWidth`/`height` from imported images allows CSS classes to fully control dimensions.

---

## Testing Checklist

After implementation:
- [ ] Import Webflow design with background elements using z-index: -1
- [ ] Background patterns visible in Canvas edit mode (not just preview)
- [ ] Image sizing matches between edit and preview modes
- [ ] Drag-and-drop still works correctly for all element types
- [ ] Native builder components (non-imported) still render correctly
- [ ] No layout shifts when switching between edit and preview modes

---

## Risk Assessment

**Low-Medium risk** - Changes affect the drag-and-drop wrapper logic, which is fundamental to Canvas interaction:

- **Low risk**: Changes are conditional and only affect Webflow imports
- **Mitigation**: Native builder components continue using existing logic
- **Rollback**: Easy to revert if issues are discovered, as changes are isolated to three files

