
# Plan: Fix Canvas Typography Responsive Preview via Inline Computed Styles

## Problem Summary

When a Heading component is created with responsive typography defaults (e.g., H1: 48px desktop → 32px mobile), the font size does not visually change on the canvas when switching to mobile breakpoint. The user sees 48px at all breakpoints.

## Root Cause Analysis

The issue is an **architectural mismatch** between how the canvas simulates breakpoints and how CSS media queries work:

### How Media Queries Work
The `StyleSheetInjector` generates CSS like this:
```css
.heading-1 { font-size: 48px; }
@media (max-width: 479px) { .heading-1 { font-size: 32px; } }
```

**Problem**: Media queries check the **browser viewport width**, not the **canvas frame width**. When the canvas is resized to 375px (mobile breakpoint), the browser window is still ~1920px wide, so the media query never activates.

### How Other Primitives Solve This
Several primitives (e.g., `DropdownPrimitive`, `TableElements`) correctly use inline styles computed via `getCanvasComputedStyles()`:

```typescript
// DropdownPrimitive.tsx:148-149
const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);
// Applied as inline style - overrides CSS classes
```

This utility reads the `currentBreakpointId` from the style store and computes the cascaded styles (desktop → tablet → mobile), returning the correct values for the selected breakpoint.

### Why Heading/Text Fail
The `Heading` and `Text` primitives **only apply CSS class names**, not computed inline styles:

```typescript
// Heading.tsx:116-117 (current)
className: className || undefined,
style: dataBindingStyle,  // Only dataBinding, no computed styles!
```

Since inline styles have higher CSS specificity than class styles, applying computed styles as `style={}` would correctly override the class-based desktop value.

## Solution

Update the `Heading` and `Text` primitives to compute and apply inline styles using `getCanvasComputedStyles`, ensuring the canvas preview respects the selected breakpoint.

## Files to Modify

### 1. `src/builder/primitives/Heading.tsx`

**Changes**:
1. Import `getCanvasComputedStyles` from `../utils/canvasStyles`
2. Compute inline styles based on current breakpoint
3. Merge computed styles with existing `dataBindingStyle`

**Before (lines 110-118)**:
```typescript
return React.createElement(
  level,
  {
    ref: elementRef,
    'data-instance-id': instance.id,
    className: className || undefined,
    style: dataBindingStyle,
    contentEditable: isEditing,
```

**After**:
```typescript
// At top of component, compute breakpoint-aware styles
const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);

return React.createElement(
  level,
  {
    ref: elementRef,
    'data-instance-id': instance.id,
    className: className || undefined,
    style: {
      ...computedStyles,  // Breakpoint-aware computed styles
      ...dataBindingStyle // dataBinding overrides if present
    },
    contentEditable: isEditing,
```

### 2. `src/builder/primitives/Text.tsx`

**Changes**:
1. Import `getCanvasComputedStyles` from `../utils/canvasStyles`
2. Compute inline styles based on current breakpoint
3. Apply computed styles to the wrapper `<div>`

**Before (lines 41-45)**:
```typescript
return (
  <div
    data-instance-id={instance.id}
    className={...}
    style={dataBindingStyle}
```

**After**:
```typescript
// At top of component
const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);

return (
  <div
    data-instance-id={instance.id}
    className={...}
    style={{
      ...computedStyles,
      ...dataBindingStyle
    }}
```

## Technical Details

### How `getCanvasComputedStyles` Works

```text
┌─────────────────────────────────────────────────────────────┐
│  User selects "Mobile" breakpoint in PageNavigation UI     │
│                          ↓                                  │
│  currentBreakpointId = 'mobile' (stored in useStyleStore)  │
│                          ↓                                  │
│  getCanvasComputedStyles(instanceId, styleSourceIds)       │
│                          ↓                                  │
│  getComputedStyles() cascades:                             │
│    desktop → tablet → mobile-landscape → mobile            │
│                          ↓                                  │
│  Returns { fontSize: '32px', lineHeight: '1.2', ... }      │
│                          ↓                                  │
│  Applied as inline style → overrides CSS class value       │
└─────────────────────────────────────────────────────────────┘
```

### Specificity Hierarchy
1. **Inline styles** (highest) - `style={{ fontSize: '32px' }}`
2. **Class styles** - `.heading-1 { font-size: 48px; }`
3. **Tag styles** (lowest) - `h1 { font-size: 2.5rem; }`

By applying computed styles inline, the canvas correctly shows the breakpoint-specific value regardless of browser viewport size.

### Why This Doesn't Affect Exported Code
The exported/published code still uses CSS classes with media queries, which work correctly in production because:
- The browser viewport equals the device width
- Media queries trigger at the correct widths

This fix only affects the **builder canvas preview** where we simulate breakpoints without changing the actual viewport.

## Files Summary

| File | Change |
|------|--------|
| `src/builder/primitives/Heading.tsx` | Add `getCanvasComputedStyles` and apply as inline style |
| `src/builder/primitives/Text.tsx` | Add `getCanvasComputedStyles` and apply as inline style |

## Expected Behavior After Fix

1. **H1 at Desktop**: Shows 48px font size ✓
2. **H1 at Tablet**: Shows 40px font size ✓
3. **H1 at Mobile**: Shows 32px font size ✓
4. **StylePanel shows correct values**: Already works (uses same getComputedStyles)
5. **Exported code unchanged**: Still uses CSS classes with media queries

## Testing Plan

1. Create a new Heading (H1) in the builder
2. Verify desktop shows 48px in canvas and StylePanel
3. Switch to Tablet breakpoint → verify 40px renders
4. Switch to Mobile breakpoint → verify 32px renders
5. Manually override mobile font size to 28px → verify it shows 28px
6. Switch back to Desktop → verify 48px unchanged
7. Export code → verify CSS contains proper media queries

## Risk Assessment

**Very Low Risk**:
- Pattern already used by other primitives (`DropdownPrimitive`, `TableElements`)
- Does not change exported code behavior
- Additive change (merging styles, not replacing)
- Backward compatible with existing dataBindingProps
