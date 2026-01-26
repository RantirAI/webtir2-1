
# Plan: Fix Heading System in Code View

## Problem Summary

The heading system has a structural mismatch between:
1. **Canvas rendering**: Headings are wrapped in a `<div>` with `data-instance-id`, and the actual semantic tag (`<h1>`-`<h6>`) is rendered inside via `EditableText`
2. **Code View export**: Headings are correctly exported as semantic tags (`<h2 class="...">Content</h2>`)
3. **Code View preview**: The CSS is correctly generated, but there's a disconnect because the styles are applied to the class but the class is on the inner heading, not the wrapper

Additionally, when headings are imported from the Code View back to the canvas, the system correctly identifies them as `Heading` components with the proper `level` prop, but may not apply the design system's default typography if styles are not present in the imported CSS.

---

## Root Cause Analysis

### Issue 1: Canvas Structure vs. Export Structure
**Canvas (Heading.tsx:65-92)**:
```
<div data-instance-id="...">         <!-- Outer wrapper (no class) -->
  <h2 class="heading-1">Content</h2> <!-- Inner heading (has class) -->
</div>
```

**Code Export (codeExport.ts:81-83)**:
```
<h2 class="heading-1">Content</h2>   <!-- Direct semantic tag -->
```

This is actually **correct behavior** - the wrapper div is only needed in the builder for interaction handling. The export correctly strips it.

### Issue 2: Missing Typography on Import
When HTML is imported via Code View, headings are correctly identified (codeImport.ts:160-167, 365-368), but the system does NOT apply default typography from the design system. If the imported CSS doesn't contain font-size/weight/line-height for that class, the heading appears unstyled.

### Issue 3: CSS Export Missing Heading Styles
When headings are created in the canvas but no styles are explicitly set, the CSS export may not include typography rules. The `headingTypography.ts` utility exists but is only called when:
- User manually changes the heading level in StylePanel
- User uses the HeadingSettingsPopover

It is NOT called during:
- Initial heading creation from registry
- HTML import from Code View
- Code view "Apply Changes" flow

---

## Solution

### Part 1: Apply Heading Typography on Import

**File: `src/builder/utils/codeImport.ts`**

After creating a Heading component during import, apply the design system's default typography if no explicit styles exist.

Changes to `domNodeToInstance` function (around line 365-368):

```typescript
if (type === 'Heading') {
  props.level = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName) ? tagName : 'h1';
  
  // Apply default typography if no font styles were imported
  if (styleSourceIds.length > 0) {
    const { styles } = useStyleStore.getState();
    const primaryStyleId = styleSourceIds[0];
    
    // Check if typography styles already exist
    const hasFontSize = Object.keys(styles).some(
      key => key.startsWith(`${primaryStyleId}:`) && key.endsWith(':fontSize')
    );
    
    if (!hasFontSize) {
      // Import heading typography utility
      const { getHeadingTypography } = await import('./headingTypography');
      const typography = getHeadingTypography(props.level);
      
      setStyle(primaryStyleId, 'fontSize', typography.fontSize, 'desktop', 'default');
      setStyle(primaryStyleId, 'fontWeight', typography.fontWeight, 'desktop', 'default');
      setStyle(primaryStyleId, 'lineHeight', typography.lineHeight, 'desktop', 'default');
    }
  }
}
```

Similarly update `domNodeToInstancePreserving` function (around line 216-219).

### Part 2: Apply Typography on "Apply Changes to Canvas"

**File: `src/builder/components/CodeView.tsx`**

After parsing HTML and updating instances, traverse the tree to apply heading typography defaults for any headings missing font styles.

In the `applyCodeChanges` function (around line 208-225):

```typescript
const applyCodeChanges = () => {
  try {
    if (activeTab === 'html') {
      const newInstance = parseHTMLPreservingLinks(htmlCode, rootInstance);
      if (newInstance && rootInstance) {
        updateInstance(rootInstance.id, {
          children: newInstance.children,
          styleSourceIds: newInstance.styleSourceIds,
          props: newInstance.props,
        });
        
        // Apply heading typography defaults for any headings
        applyHeadingTypographyToTree(newInstance);
        
        toast({
          title: 'Code applied',
          description: 'HTML changes have been applied to the canvas.',
        });
      }
    }
    // ... rest of function
  }
};

// Helper function to apply typography to all headings in tree
function applyHeadingTypographyToTree(instance: ComponentInstance) {
  const { styles, setStyle } = useStyleStore.getState();
  
  if (instance.type === 'Heading') {
    const level = instance.props?.level || 'h1';
    const styleSourceId = instance.styleSourceIds?.[0];
    
    if (styleSourceId) {
      const hasFontSize = Object.keys(styles).some(
        key => key.startsWith(`${styleSourceId}:`) && key.endsWith(':fontSize')
      );
      
      if (!hasFontSize) {
        const typography = getHeadingTypography(level);
        setStyle(styleSourceId, 'fontSize', typography.fontSize, 'desktop', 'default');
        setStyle(styleSourceId, 'fontWeight', typography.fontWeight, 'desktop', 'default');
        setStyle(styleSourceId, 'lineHeight', typography.lineHeight, 'desktop', 'default');
      }
    }
  }
  
  // Recurse into children
  instance.children?.forEach(child => applyHeadingTypographyToTree(child));
}
```

### Part 3: Ensure Heading Primitive Exports Correctly (Verification)

**File: `src/builder/utils/codeExport.ts`** - Already correct

The export already maps `Heading` to `instance.props.level || 'h2'` (line 81-83). No changes needed.

### Part 4: Add Missing Import Statement

**File: `src/builder/components/CodeView.tsx`**

Add import for heading typography utility:
```typescript
import { getHeadingTypography } from '../utils/headingTypography';
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/builder/utils/codeImport.ts` | Apply heading typography defaults during import for both parser functions |
| `src/builder/components/CodeView.tsx` | Add typography application after "Apply Changes" and import the utility |

---

## Technical Details

### Typography Defaults Applied

| Level | Font Size | Line Height | Font Weight |
|-------|-----------|-------------|-------------|
| h1 | 48px | 1.2 | 700 |
| h2 | 40px | 1.3 | 700 |
| h3 | 32px | 1.3 | 600 |
| h4 | 24px | 1.4 | 600 |
| h5 | 20px | 1.5 | 600 |
| h6 | 16px | 1.5 | 600 |

### Conditional Application Logic
- Only apply defaults when no `fontSize` style exists for the heading's style source
- Preserves user-defined styles from imported CSS
- Works with both fresh imports and "Apply Changes" flow

---

## Expected Outcomes

1. Headings imported from Code View will have proper typography defaults
2. Headings edited in Code View and applied to canvas will maintain correct sizing
3. Code View preview will render headings with correct visual styles
4. Layers panel will correctly show "Heading" with proper level
5. Round-trip consistency: Canvas -> Code View -> Edit -> Apply -> Canvas works correctly
6. Semantic HTML tags (h1-h6) are preserved throughout the workflow
