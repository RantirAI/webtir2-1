

# Plan: Fix Flex Layout Inconsistencies in Canvas Edit Mode

## Problem Summary

The `display: flex` and related flex properties (`justify-content`, `align-items`, `flex-direction`) do not work consistently in Canvas edit mode. Flex layouts break when:
- Adding or removing child components
- Nesting containers inside flex containers
- The drag-and-drop wrappers interfere with flex item sizing

## Root Cause Analysis

The issue stems from the **DOM structure created by drag-and-drop wrappers** in Canvas edit mode:

```text
<DroppableContainer wrapper> (display: block, width: 100%)
  <div class="user-flex-class"> (display: flex, justify-content: space-between)
    <DraggableInstance wrapper for child 1> (display: contents for leaf elements)
      <h1>Heading</h1>
    </DraggableInstance>
    <DraggableInstance wrapper for child 2> (display: block, width: 100% for containers!)
      <DroppableContainer for nested container>
        <div class="nested-div">...</div>
      </DroppableContainer>
    </DraggableInstance>
  </div>
</DroppableContainer>
```

**Key Findings:**

1. **Leaf elements work correctly**: Text, Heading, Button, etc. get `display: contents` on their `DraggableInstance` wrapper, making the wrapper transparent to flex layout.

2. **Container children break flex**: When a child is a container (Div, Section, Container), its `DraggableInstance` wrapper uses `display: block; width: 100%`. This causes the wrapper to take full width, breaking `justify-content: space-between` and other flex distribution.

3. **DroppableContainer also uses `display: block`**: The outer wrapper on container types uses `display: block; width: 100%`, which prevents the container itself from being a proper flex item in its parent.

## Solution

Update the wrapper styles to use `display: contents` for container types that should participate in flex layouts, while maintaining proper drag-and-drop hit areas.

### Approach: Use `display: contents` with Hit Area Preservation

The fix involves:
1. Using `display: contents` on `DraggableInstance` for ALL element types (not just leaves)
2. Using `display: contents` on `DroppableContainer` for container types
3. Ensuring the actual primitive elements provide the necessary hit areas for dnd-kit

Since the primitives themselves (Container, Section, Div) render actual `<div>` elements with proper sizing, dnd-kit can use those for collision detection.

## Files to Modify

### 1. `src/builder/components/DraggableInstance.tsx`

Change container wrapper from `display: block; width: 100%` to `display: contents`:

```typescript
// Before (lines 86-93):
: isContainer
? {
    display: 'block',
    width: '100%',
  }

// After:
: isContainer
? {
    // Use display: contents for containers too, so they can be flex items
    // The actual container primitive provides the measurable bounding box
    display: 'contents',
  }
```

### 2. `src/builder/components/DroppableContainer.tsx`

Change the wrapper style for containers to use `display: contents` instead of `display: block`:

```typescript
// Before (lines 88-102):
const wrapperStyle: React.CSSProperties = isContainerType
  ? {
      display: 'block',
      width: '100%',
      position: hasWebflowImport ? undefined : 'relative' as const,
      // ... feedback styles
    }

// After:
const wrapperStyle: React.CSSProperties = isContainerType
  ? {
      // Use display: contents so containers can be proper flex items
      // The actual primitive element provides the bounding box for dnd-kit
      display: 'contents',
      // Note: position and visual feedback styles moved to the primitive or handled differently
    }
```

### 3. Handle Drag Feedback Differently

Since `display: contents` doesn't allow visual feedback on the wrapper itself, we need to apply the drop target feedback to the primitive element. This can be done by passing feedback state through props:

**Option A**: Pass drop target state through `commonProps` to primitives

```typescript
// In Canvas.tsx, add to commonProps:
const commonProps = {
  instance,
  isSelected,
  isHovered,
  isDropTarget: /* check if this instance is a valid drop target */,
  // ...
};
```

**Option B**: Use CSS pseudo-elements or data attributes on the primitive

The primitives can check if they're drop targets and apply their own visual feedback.

### 4. Alternative: Maintain Block for Drag Feedback, Use CSS

If preserving the visual drag feedback on wrappers is critical, an alternative approach is to:
- Keep `display: block` on wrappers
- But remove `width: 100%` so wrappers shrink to their content
- Add `flex-shrink: 0` to prevent unwanted shrinking

```typescript
: isContainer
? {
    display: 'block',
    // Don't force width: 100% - let flex determine sizing
    // The wrapper will shrink to fit the container primitive
  }
```

## Recommended Implementation

After analysis, **Alternative approach** (keeping `display: block` but removing forced `width: 100%`) is safer because:
1. It maintains dnd-kit compatibility without major refactoring
2. It preserves visual drag feedback capabilities
3. It allows flex properties to work correctly

### Changes Required

**`src/builder/components/DraggableInstance.tsx`** (lines 86-93):

```typescript
// Current:
: isContainer
? {
    display: 'block',
    width: '100%',
  }

// New:
: isContainer
? {
    // Allow containers to participate in flex layouts properly
    // Don't force width: 100% - let parent flex container control sizing
    display: 'block',
  }
```

**`src/builder/components/DroppableContainer.tsx`** (lines 88-102):

```typescript
// Current:
const wrapperStyle: React.CSSProperties = isContainerType
  ? {
      display: 'block',
      width: '100%',
      position: hasWebflowImport ? undefined : 'relative' as const,
      outline: isValidDropTarget ? '2px dashed #3b82f6' : undefined,
      // ...
    }

// New:
const wrapperStyle: React.CSSProperties = isContainerType
  ? {
      display: 'block',
      // Don't force width: 100% - let flex layouts control sizing
      // For full-width containers, the primitive CSS class can set width: 100%
      position: hasWebflowImport ? undefined : 'relative' as const,
      outline: isValidDropTarget ? '2px dashed #3b82f6' : undefined,
      // ...
    }
```

### Additional Fix: Ensure Container Primitives Have Proper Default Sizing

The `primitive-defaults.css` already handles Section sizing:

```css
.builder-section {
  width: 100%;
  min-width: 100%;
  flex-basis: 100%;
}
```

But Container and Div may need similar handling. We should ensure that when a user sets `display: flex` on a parent, child containers can still have their own width controlled via their CSS class, rather than being forced to 100% by the wrapper.

## Testing Plan

1. Create a Div with `display: flex` and `justify-content: space-between`
2. Add two Heading children → Should work (leaves use `display: contents`)
3. Add a nested Div child → Should work after fix (no forced `width: 100%`)
4. Set different width on the nested Div (e.g., 200px) → Should respect the width
5. Drag and reorder children → Should work normally
6. Check that drag feedback (outline/background) still appears

## Risk Assessment

**Low-Medium Risk:**
- Removing `width: 100%` may cause some containers to shrink unexpectedly if they don't have explicit width set in their CSS class
- This is actually **correct behavior** - containers should respect flex sizing, not always take 100% width
- Users who want full-width containers can set `width: 100%` in their style class

## Backward Compatibility

This change aligns Canvas behavior with Code View and Export behavior, where wrappers don't exist and flex layouts work correctly. Any existing projects that rely on the wrapper's forced `width: 100%` may see layout changes, but those projects likely have broken layouts in Code View anyway.

