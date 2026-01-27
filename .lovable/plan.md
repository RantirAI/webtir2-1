
# Plan: Auto-detect Breakpoint When Resizing Canvas

## Overview

Add automatic breakpoint detection when the user drags the canvas resize handles. When the canvas width crosses breakpoint thresholds, the system will automatically switch to the appropriate breakpoint, updating the toolbar selection, style system, and responsive typography preview.

## Current Behavior

- User drags resize handles → canvas width changes via `customWidth`
- Breakpoint stays the same → style system shows wrong font sizes
- Typography preview doesn't update (still shows desktop 48px even at mobile width)

## New Behavior

- User drags resize handles → canvas width changes
- System detects which breakpoint range the width falls into
- Breakpoint automatically switches → typography updates instantly
- H1 font size visually changes: 48px → 40px → 36px → 32px as width decreases

## Breakpoint Width Thresholds

Based on the `breakpoints` array in PageNavigation.tsx (lines 46-51):

| Breakpoint | Width | Threshold Range |
|------------|-------|-----------------|
| Desktop | 960px | > 768px |
| Tablet | 768px | 641px - 768px |
| Mobile Landscape | 640px | 376px - 640px |
| Mobile | 375px | ≤ 375px |

## Implementation

### File: `src/builder/components/Canvas.tsx`

**Change 1: Subscribe to `setCurrentBreakpoint` from style store**

Add to existing subscriptions around line 310:
```typescript
const setCurrentBreakpoint = useStyleStore((state) => state.setCurrentBreakpoint);
```

**Change 2: Add breakpoint detection helper function**

Add after the existing state declarations (around line 340):
```typescript
// Function to detect breakpoint based on canvas width
const detectBreakpointFromWidth = (width: number): string => {
  // Thresholds based on breakpoint widths: desktop=960, tablet=768, mobile-landscape=640, mobile=375
  if (width > 768) return 'desktop';
  if (width > 640) return 'tablet';
  if (width > 375) return 'mobile-landscape';
  return 'mobile';
};
```

**Change 3: Modify `handleResizeMove` to auto-switch breakpoints**

Current code (lines 435-440):
```typescript
const handleResizeMove = (e: React.MouseEvent) => {
  if (!isResizing) return;
  const delta = isResizing === 'right' ? (e.clientX - resizeStart.x) : (resizeStart.x - e.clientX);
  const newWidth = Math.max(320, Math.min(1920, resizeStart.width + delta * 2));
  setCustomWidth(newWidth);
};
```

Updated code:
```typescript
const handleResizeMove = (e: React.MouseEvent) => {
  if (!isResizing) return;
  const delta = isResizing === 'right' ? (e.clientX - resizeStart.x) : (resizeStart.x - e.clientX);
  const newWidth = Math.max(320, Math.min(1920, resizeStart.width + delta * 2));
  setCustomWidth(newWidth);
  
  // Auto-detect and switch breakpoint based on new width
  const detectedBreakpoint = detectBreakpointFromWidth(newWidth);
  if (detectedBreakpoint !== currentBreakpoint) {
    setCurrentBreakpoint(detectedBreakpoint);
  }
};
```

## Technical Flow

```text
User drags resize handle
        ↓
handleResizeMove() called
        ↓
Calculate newWidth (320-1920px range)
        ↓
setCustomWidth(newWidth) → canvas resizes visually
        ↓
detectBreakpointFromWidth(newWidth)
        ↓
If different from currentBreakpoint:
  setCurrentBreakpoint(detected) → updates useStyleStore
        ↓
All components re-render:
  - PageNavigation toolbar highlights correct icon
  - StylePanel shows correct font sizes (32px for mobile)
  - Heading/Text primitives apply responsive styles
  - BreakpointValueBadges highlight correct breakpoint
```

## Expected Behavior After Implementation

1. **Drag canvas narrower to ~700px**: 
   - Breakpoint switches to "Tablet"
   - H1 font size updates to 40px on canvas
   - StylePanel Size input shows 40

2. **Drag canvas narrower to ~500px**: 
   - Breakpoint switches to "Mobile Landscape"
   - H1 font size updates to 36px on canvas
   - StylePanel Size input shows 36

3. **Drag canvas narrower to ~350px**: 
   - Breakpoint switches to "Mobile"
   - H1 font size updates to 32px on canvas
   - StylePanel Size input shows 32

4. **Drag canvas wider back to ~900px**: 
   - Breakpoint switches to "Desktop"
   - H1 font size updates to 48px on canvas
   - StylePanel Size input shows 48

## Files Summary

| File | Change |
|------|--------|
| `src/builder/components/Canvas.tsx` | Add `setCurrentBreakpoint` subscription, add `detectBreakpointFromWidth` helper, modify `handleResizeMove` |

## Risk Assessment

**Very Low Risk**:
- Simple width-to-breakpoint mapping logic
- Uses the already-unified `setCurrentBreakpoint` from style store
- Non-breaking: only adds behavior during resize
- Real-time feedback makes the feature intuitive
