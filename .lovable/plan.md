
# Plan: Fix Heading System for Canvas, Code View, and Layers Panel Alignment

## Problem Summary

The heading system has several issues causing inconsistencies between canvas rendering, code export, and the layers panel:

1. **Structural Mismatch**: The `Heading.tsx` primitive wraps the semantic heading (`<h1>`, `<h2>`, etc.) inside a plain `<div>` wrapper, but code export outputs only the semantic tag
2. **Missing Styling on Heading Element**: The `className` is applied to the inner heading but `data-instance-id` is on the outer div, causing selection/styling disconnect
3. **AI Typography Gap**: When AI generates headings, it doesn't call `applyHeadingTypography()` to set design system defaults
4. **Import Styling Gap**: When importing HTML headings, typography defaults are not applied

---

## Technical Solution

### 1. Refactor Heading.tsx Primitive

Remove the wrapper `<div>` and render the semantic heading tag directly with all required attributes.

```text
Current structure (problematic):
+----------------------------+
| <div data-instance-id>     |  <- interactions/selection
|   <h2 class="heading-1">   |  <- styling
|     Text                   |
|   </h2>                    |
| </div>                     |
+----------------------------+

New structure (correct):
+----------------------------+
| <h2 data-instance-id       |  <- interactions + selection
|     class="heading-1">     |  <- styling
|   Text                     |
| </h2>                      |
+----------------------------+
```

**File: `src/builder/primitives/Heading.tsx`**

Changes:
- Use `React.createElement()` with the dynamic heading level as the tag
- Apply `data-instance-id`, `className`, event handlers, and data binding props directly to the heading element
- Use `EditableText` children for content editing while maintaining semantic structure

### 2. Update AI Generation to Apply Heading Typography

**File: `src/builder/components/AIChat.tsx`**

After creating a `Heading` component instance, call `applyHeadingTypography()` to ensure design system defaults are applied when the AI doesn't provide explicit font size/weight/line-height.

```typescript
// After instance creation, check if it's a Heading
if (instance.type === 'Heading') {
  const level = instance.props.level || 'h1';
  const styleSourceId = instance.styleSourceIds?.[0];
  if (styleSourceId) {
    applyHeadingTypography(styleSourceId, level, setStyle);
  }
}
```

### 3. Update Import Flow for Heading Typography

**File: `src/builder/utils/codeImport.ts`**

When importing an HTML heading element, apply the corresponding typography defaults to ensure visual consistency.

```typescript
// After creating heading style source
if (type === 'Heading' && styleSourceIds.length > 0) {
  const level = props.level || 'h1';
  applyHeadingTypography(styleSourceIds[0], level, setStyle);
}
```

### 4. Ensure Code Export Maintains Correct Tag

**File: `src/builder/utils/codeExport.ts`** (already correct)

The export already correctly maps `Heading` → `instance.props.level || 'h2'`. No changes needed here.

**File: `src/builder/utils/export.ts`** (already correct)

The export utilities already handle heading tags correctly.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/builder/primitives/Heading.tsx` | Refactor to render semantic heading tag directly without wrapper div |
| `src/builder/components/AIChat.tsx` | Add `applyHeadingTypography()` call after creating Heading instances |
| `src/builder/utils/codeImport.ts` | Add typography application for imported headings |

---

## Detailed Code Changes

### Heading.tsx Refactor

The heading primitive will use `React.createElement()` to dynamically create the correct heading tag:

```typescript
// Create the heading element directly without wrapper div
const HeadingTag = level as keyof JSX.IntrinsicElements;

return React.createElement(
  HeadingTag,
  {
    'data-instance-id': instance.id,
    className,
    style: dataBindingStyle,
    onClick: isPreviewMode ? undefined : handleClick,
    onMouseEnter: isPreviewMode ? undefined : handleMouseEnter,
    onMouseLeave: isPreviewMode ? undefined : handleMouseLeave,
    onContextMenu: isPreviewMode ? undefined : onContextMenu,
    ...restDataBindingProps,
    // For contentEditable support during inline editing
    contentEditable: isEditing,
    suppressContentEditableWarning: true,
    onDoubleClick: handleDoubleClick,
    onBlur: handleBlur,
    onKeyDown: handleKeyDown,
    onInput: handleInput,
  },
  // Content as children (text or editable state)
  content
);
```

### AIChat.tsx Typography Application

Add import and call after instance creation:

```typescript
import { applyHeadingTypography } from '../utils/headingTypography';

// In the component processing loop, after creating instance:
if (componentSpec.type === 'Heading') {
  const level = componentSpec.props?.level || 'h1';
  const styleSourceId = Object.keys(newStyleSources)[0];
  if (styleSourceId) {
    const typography = getHeadingTypography(level);
    // Only apply if AI didn't provide explicit values
    if (!componentSpec.styles?.base?.fontSize) {
      setStyle(styleSourceId, 'fontSize', typography.fontSize, 'desktop', 'default');
    }
    if (!componentSpec.styles?.base?.fontWeight) {
      setStyle(styleSourceId, 'fontWeight', typography.fontWeight, 'desktop', 'default');
    }
    if (!componentSpec.styles?.base?.lineHeight) {
      setStyle(styleSourceId, 'lineHeight', typography.lineHeight, 'desktop', 'default');
    }
  }
}
```

---

## Expected Outcomes

1. **Canvas Edit Mode**: Headings render as semantic `<h1>`-`<h6>` tags directly with correct styles
2. **Code View Preview**: HTML export shows `<h2 class="...">` matching canvas structure
3. **Layers Panel**: Shows "Heading" component with correct level indicator
4. **Typography Consistency**: All headings (manual, AI-generated, imported) inherit design system defaults
5. **Style Application**: Clicking a heading correctly selects it and shows its styles in the panel
6. **Bidirectional Sync**: Changes in code view correctly update canvas headings and vice versa

---

## Testing Checklist

- [ ] Create H1-H6 headings manually and verify correct tag rendering
- [ ] Use AI to generate a page with headings and verify typography is applied
- [ ] Import HTML with headings and verify structure is preserved
- [ ] Switch between canvas and code view to verify consistency
- [ ] Edit heading content inline and verify changes sync to code view
- [ ] Change heading level in StylePanel and verify tag updates everywhere
