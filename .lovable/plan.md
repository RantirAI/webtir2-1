
# Plan: Fix Canvas Typography Re-rendering on Breakpoint Change

## Problem Summary

The responsive typography changes (48px desktop → 40px tablet → 32px mobile) are correctly stored in the style system, but the canvas preview doesn't update visually when switching breakpoints. The Heading and Text components continue showing the desktop font size.

## Root Cause

The issue is a **React reactivity problem** - the components don't re-render when the breakpoint changes:

1. `getCanvasComputedStyles` uses `useStyleStore.getState()` which is a one-time synchronous read (not reactive)
2. `Heading.tsx` and `Text.tsx` don't subscribe to `currentBreakpointId` changes via the Zustand hook
3. Even though `getComputedStyles` correctly uses `currentBreakpointId`, the component never knows to re-compute because it's not subscribed to that state

## Solution

Subscribe to `currentBreakpointId` in the primitives using the Zustand hook pattern. This ensures the component re-renders when the user switches breakpoints, triggering a fresh computation of styles.

## Files to Modify

### 1. `src/builder/primitives/Heading.tsx`

Add subscription to `currentBreakpointId`:

**Current code (line 69):**
```typescript
// Compute breakpoint-aware styles for canvas preview
const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);
```

**Updated code:**
```typescript
// Subscribe to breakpoint changes to trigger re-render
const currentBreakpointId = useStyleStore((state) => state.currentBreakpointId);

// Compute breakpoint-aware styles for canvas preview (will re-run when breakpoint changes)
const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || [], currentBreakpointId);
```

### 2. `src/builder/primitives/Text.tsx`

Add subscription to `currentBreakpointId`:

**Current code (line 42):**
```typescript
// Compute breakpoint-aware styles for canvas preview
const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || []);
```

**Updated code:**
```typescript
// Subscribe to breakpoint changes to trigger re-render
const currentBreakpointId = useStyleStore((state) => state.currentBreakpointId);

// Compute breakpoint-aware styles for canvas preview (will re-run when breakpoint changes)
const computedStyles = getCanvasComputedStyles(instance.id, instance.styleSourceIds || [], currentBreakpointId);
```

## Technical Explanation

```text
Before (broken):
┌─────────────────────────────────────────────────────────────┐
│  User switches to Mobile breakpoint                         │
│                          ↓                                   │
│  currentBreakpointId = 'mobile' (store updated)             │
│                          ↓                                   │
│  Heading component: NOT subscribed → NO re-render           │
│                          ↓                                   │
│  getCanvasComputedStyles never called again                 │
│                          ↓                                   │
│  Canvas still shows 48px (stale desktop value)              │
└─────────────────────────────────────────────────────────────┘

After (fixed):
┌─────────────────────────────────────────────────────────────┐
│  User switches to Mobile breakpoint                         │
│                          ↓                                   │
│  currentBreakpointId = 'mobile' (store updated)             │
│                          ↓                                   │
│  Heading component: SUBSCRIBED → RE-RENDERS                 │
│                          ↓                                   │
│  getCanvasComputedStyles called with 'mobile' breakpoint    │
│                          ↓                                   │
│  Canvas shows 32px (correct mobile value)                   │
└─────────────────────────────────────────────────────────────┘
```

## Files Summary

| File | Change |
|------|--------|
| `src/builder/primitives/Heading.tsx` | Add `useStyleStore` subscription to `currentBreakpointId` |
| `src/builder/primitives/Text.tsx` | Add `useStyleStore` subscription to `currentBreakpointId` |

## Expected Behavior After Fix

1. **H1 at Desktop**: Shows 48px font size
2. **Switch to Tablet**: Component re-renders, shows 40px font size
3. **Switch to Mobile**: Component re-renders, shows 32px font size
4. **Switch back to Desktop**: Component re-renders, shows 48px again

## Testing Plan

1. Create a new Heading (H1) in the builder
2. Verify desktop shows 48px in canvas
3. Click Tablet breakpoint → verify heading immediately updates to 40px
4. Click Mobile breakpoint → verify heading immediately updates to 32px
5. Repeat with Text component

## Risk Assessment

**Very Low Risk**:
- Adding a subscription is a minimal, targeted change
- Pattern is already used elsewhere in the codebase (StylePanel, SpacingControl)
- Does not affect exported code behavior
- Backward compatible with existing functionality
