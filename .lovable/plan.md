
# Plan: Fix Heading and Image Display Consistency in Canvas

## Problem Summary

Two display inconsistencies between Code View and Canvas:

1. **Headings**: Display as large styled text in Code View preview but appear as unstyled body text in Canvas
2. **Images**: Display at correct size in Code View but appear much smaller in Canvas

## Root Cause Analysis

### Heading Issue

The `Heading.tsx` primitive wraps the semantic heading tag (`h1`-`h6`) inside a plain `<div>`:

```text
Canvas Structure (current):
+---------------------------------+
| <div data-instance-id="...">    |  <- NO className, receives events
|   <h1 class="wf-section-title"> |  <- HAS className, rendered by EditableText
|     Content                     |
|   </h1>                         |
| </div>                          |
+---------------------------------+

Code View Export (correct):
+---------------------------------+
| <h1 class="wf-section-title">   |  <- Direct semantic tag with class
|   Content                       |
| </h1>                           |
+---------------------------------+
```

The CSS rule `.wf-section-title { font-size: 40px; }` works in Code View because the class is directly on the `h1`. In Canvas, the structure is correct but the issue is that the `EditableText` component correctly applies the class to the inner heading - this should work.

**Actual Issue**: After further analysis, the problem is that the imported CSS styles (like `font-size`, `font-weight`) are being applied to the style store, but they may not be getting properly read because:
1. The CSS import maps certain properties incorrectly
2. The typography defaults are only applied when `!hasFontSize` - but the imported CSS might have the styles under different key formats

### Image Sizing Issue

The `ImagePrimitive` relies on className for sizing, but the parent `DraggableInstance` wrapper uses `display: contents` for non-containers. This should be transparent, but imported width percentages (like `width: 100%`) need a sized parent.

Additionally, looking at the imported Webflow classes, they likely use max-width and responsive sizing that depends on proper container context.

## Solution

### Part 1: Refactor Heading Primitive to Render Semantic Tag Directly

Remove the wrapper `<div>` from `Heading.tsx` and render the semantic heading tag directly with all required attributes.

**File: `src/builder/primitives/Heading.tsx`**

**Current structure:**
```jsx
<div data-instance-id={...} onClick={...}>
  <EditableText as={level} className={className} />
</div>
```

**New structure:**
```jsx
// Dynamic heading tag with inline editing support
React.createElement(
  level, // 'h1', 'h2', etc.
  {
    'data-instance-id': instance.id,
    className,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    contentEditable: isEditing,
    // ... other handlers
  },
  content
);
```

This ensures:
- The semantic tag receives the className directly
- The `data-instance-id` is on the same element
- CSS styles apply correctly to the actual heading element

### Part 2: Add Default CSS Reset for Semantic Headings

Add base heading styles to `StyleSheetInjector.tsx` to ensure headings have readable defaults even without explicit styles.

**File: `src/builder/components/StyleSheetInjector.tsx`**

Add to `BASE_CSS`:
```css
/* Default heading typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: bold;
}

h1 { font-size: 2.5rem; line-height: 1.2; }
h2 { font-size: 2rem; line-height: 1.3; }
h3 { font-size: 1.75rem; line-height: 1.3; }
h4 { font-size: 1.5rem; line-height: 1.4; }
h5 { font-size: 1.25rem; line-height: 1.4; }
h6 { font-size: 1rem; line-height: 1.5; }
```

### Part 3: Fix Image Default Sizing

Add sensible defaults to `ImagePrimitive.tsx` to ensure images don't collapse to intrinsic size.

**File: `src/builder/primitives/ImagePrimitive.tsx`**

Add default styles:
```jsx
const defaultImageStyles: React.CSSProperties = {
  maxWidth: '100%',
  height: 'auto',
  display: 'block',
};
```

And apply to the img element style prop.

## Files to Modify

| File | Changes |
|------|---------|
| `src/builder/primitives/Heading.tsx` | Refactor to render semantic heading tag directly without wrapper div |
| `src/builder/components/StyleSheetInjector.tsx` | Add default heading typography to BASE_CSS |
| `src/builder/primitives/ImagePrimitive.tsx` | Add default image sizing styles (max-width: 100%, height: auto) |

## Technical Implementation Details

### Heading.tsx Changes

Replace the current wrapper-based structure with a direct semantic element using React.createElement for dynamic tag rendering. Key changes:

1. Remove wrapper `<div>`
2. Merge inline editing state into a single element
3. Apply all event handlers and data attributes directly to the heading element
4. Maintain contentEditable support for inline editing

### StyleSheetInjector.tsx Changes

Extend the `BASE_CSS` constant to include default heading styles that match the design system. These have low specificity so they're overridden by any class-based styles.

### ImagePrimitive.tsx Changes

Add `maxWidth: '100%'` and `height: 'auto'` to ensure images scale correctly within their container rather than using intrinsic size.

## Expected Outcomes

1. Headings in Canvas display with correct typography (matching Code View preview)
2. Headings render as semantic HTML elements (`h1`-`h6`) with proper styling
3. Images scale correctly to their container width rather than collapsing
4. Canvas rendering matches Code View preview for both headings and images
5. Breakpoint-specific styles continue to work correctly
6. Inline editing for headings continues to function

## Testing Checklist

- [ ] Import Webflow HTML with H1 heading - verify it displays with correct font size in Canvas
- [ ] Create manual heading in Canvas - verify typography matches expected level
- [ ] Switch heading levels (H1 → H3) - verify font size updates
- [ ] Import page with images - verify images display at correct size in Canvas
- [ ] Compare Canvas rendering with Code View preview - should match visually
- [ ] Test responsive breakpoints - headings and images should adapt correctly
- [ ] Verify inline editing still works for headings
