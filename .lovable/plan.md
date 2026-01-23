# Plan: Fix Layout Style Properties and Responsive Breakpoint System

## ✅ COMPLETED

### Changes Made

1. **`src/builder/store/useStyleStore.ts`**
   - Updated `defaultBreakpoints` to use `desktop`, `tablet`, `mobile-landscape`, `mobile`
   - Changed `currentBreakpointId` default from `'base'` to `'desktop'`

2. **`src/builder/components/StyleSheetInjector.tsx`**
   - Updated base style detection from `bp === 'base'` to `bp === 'desktop'`
   - Updated responsive breakpoint filter from `bp.id !== 'base'` to `bp.id !== 'desktop'`

3. **`src/builder/utils/initStyles.ts`**
   - Added `migrateBaseToDesktop()` function for backwards compatibility
   - Migrates existing `base:` style keys to `desktop:` on initialization

### Breakpoint System (Aligned)

| ID | Label | Max Width | CSS Media Query |
|----|-------|-----------|-----------------|
| `desktop` | Desktop | - | (no media query - base styles) |
| `tablet` | Tablet | 991px | `@media (max-width: 991px)` |
| `mobile-landscape` | Mobile L | 767px | `@media (max-width: 767px)` |
| `mobile` | Mobile | 479px | `@media (max-width: 479px)` |

### Cascade Logic
- Desktop view: applies only `desktop` styles
- Tablet view: cascades `desktop` → `tablet`
- Mobile Landscape: cascades `desktop` → `tablet` → `mobile-landscape`
- Mobile: cascades all breakpoints
