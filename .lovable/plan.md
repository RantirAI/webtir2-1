
# Plan: Fix Layout Style Properties and Responsive Breakpoint System

## Problem Identified
There's a critical mismatch between the breakpoint IDs used in the UI (`PageNavigation`) and the style system (`useStyleStore`):

- **PageNavigation uses**: `desktop`, `tablet`, `mobile-landscape`, `mobile`
- **StyleStore uses**: `base`, `tablet`, `mobile`

This causes styles set at "desktop" breakpoint to not cascade properly, and `mobile-landscape` is completely unsupported.

---

## Solution

### Phase 1: Align Breakpoint IDs

**File: `src/builder/store/useStyleStore.ts`**

Update `defaultBreakpoints` to match PageNavigation:

```typescript
const defaultBreakpoints: Breakpoint[] = [
  { id: 'desktop', label: 'Desktop' },  // Was 'base'
  { id: 'tablet', label: 'Tablet', maxWidth: 991 },
  { id: 'mobile-landscape', label: 'Mobile L', maxWidth: 767 },  // NEW
  { id: 'mobile', label: 'Mobile', maxWidth: 479 },
];
```

### Phase 2: Update StyleSheetInjector Media Queries

**File: `src/builder/components/StyleSheetInjector.tsx`**

Ensure CSS media queries are generated for all 4 breakpoints with correct max-width values matching the canvas widths.

### Phase 3: Add Breakpoint Indicator to StylePanel

**File: `src/builder/components/StylePanel.tsx`**

Add visual feedback showing which breakpoint is active and whether a property has breakpoint-specific overrides (similar to property source indicators).

### Phase 4: Migrate Existing Styles (Optional)

Create a migration utility to rename any existing `base:` style keys to `desktop:` for backwards compatibility.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/builder/store/useStyleStore.ts` | Update `defaultBreakpoints` array to use aligned IDs |
| `src/builder/components/StyleSheetInjector.tsx` | Verify media query generation for all breakpoints |
| `src/builder/components/StylePanel.tsx` | Add breakpoint indicator UI (optional enhancement) |

---

## Technical Details

### Breakpoint Cascade Logic
The `getComputedStyles` function cascades styles from largest to smallest breakpoint. With aligned IDs:
- Desktop view: applies only `desktop` styles
- Tablet view: cascades `desktop` → `tablet`
- Mobile Landscape: cascades `desktop` → `tablet` → `mobile-landscape`
- Mobile: cascades all breakpoints

### CSS Output Example
```css
.section-1 { display: flex; flex-direction: row; }
@media (max-width: 991px) { .section-1 { flex-direction: column; } }
@media (max-width: 767px) { .section-1 { gap: 16px; } }
@media (max-width: 479px) { .section-1 { padding: 16px; } }
```

---

## Expected Outcome
- Layout properties (display, flex-direction, align-items, justify-content) will correctly respond to breakpoint changes
- Styles set at each breakpoint will properly cascade and apply responsive overrides
- Users can set different layouts for desktop vs mobile with proper CSS media query output
