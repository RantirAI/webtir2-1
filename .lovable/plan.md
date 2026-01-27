
# Plan: Add Visual Breakpoint Indicators for Typography Responsive Scaling

## Overview

This plan addresses two issues:
1. Missing `mobile-landscape` breakpoint in responsive typography defaults
2. Adding enhanced visual breakpoint indicators in the Typography section to show font sizes at each breakpoint

## Problem Analysis

### Issue 1: Missing Breakpoint
The `applyResponsiveHeadingTypography` function currently applies styles to only three breakpoints:
- `desktop` (48px for H1)
- `tablet` (40px for H1)  
- `mobile` (32px for H1)

However, the system has **four** breakpoints:
- `desktop` (base)
- `tablet` (991px)
- `mobile-landscape` (767px) ← **Missing!**
- `mobile` (479px)

When switching to `mobile-landscape`, the cascade finds `tablet` (40px), not `mobile` (32px), causing unexpected behavior.

### Issue 2: No Visual Breakpoint Preview
Currently, the Typography section shows a single font size input with a small colored dot indicator. Users cannot quickly see what font sizes are set at other breakpoints without manually switching.

## Solution

### Part 1: Add `mobile-landscape` Breakpoint to Typography Map

Update `src/builder/utils/headingTypography.ts`:
- Extend `ResponsiveTypography` interface to include `mobileLandscape`
- Add `mobile-landscape` values to `responsiveHeadingMap` (intermediate between tablet and mobile)
- Update `applyResponsiveHeadingTypography` to set styles for `mobile-landscape` breakpoint

### Part 2: Add Breakpoint Value Badges in Typography Section

Create a new component `BreakpointValueBadges` that displays small pills showing font size values at each breakpoint:

```
Size [32px]  📱 32px  📱L 36px  📱 40px  🖥️ 48px
```

Each badge shows:
- Breakpoint icon (desktop/tablet/mobile)
- The value at that breakpoint
- Color coding: blue (explicit), green (inherited from larger), gray (not set)

## Files to Modify

### 1. `src/builder/utils/headingTypography.ts`

**Changes:**
- Add `mobileLandscape` to `ResponsiveTypography` interface
- Add `mobile-landscape` values to all heading levels in `responsiveHeadingMap`
- Update `applyResponsiveHeadingTypography` to set `mobile-landscape` font sizes

**New values for H1:**
```typescript
h1: {
  desktop: { fontSize: '48px', ... },
  tablet: { fontSize: '40px', ... },
  mobileLandscape: { fontSize: '36px', ... },  // NEW
  mobile: { fontSize: '32px', ... },
}
```

### 2. `src/builder/components/StylePanel.tsx`

**Changes:**
- Create new `BreakpointValueBadges` component showing font sizes at all breakpoints
- Add this component below the "Size" input in the Typography section
- Each badge is clickable to jump to that breakpoint

**New UI Component (approximately 50 lines):**
```tsx
const BreakpointValueBadges: React.FC<{ property: string }> = ({ property }) => {
  // Get values at each breakpoint
  const breakpoints = ['desktop', 'tablet', 'mobile-landscape', 'mobile'];
  const values = breakpoints.map(bp => ({
    id: bp,
    value: getValueAtBreakpoint(bp, property),
    isExplicit: isExplicitAtBreakpoint(bp, property),
    isCurrent: bp === currentBreakpointId,
  }));
  
  return (
    <div className="flex gap-1 mt-1">
      {values.map(({ id, value, isExplicit, isCurrent }) => (
        <button
          key={id}
          onClick={() => setCurrentBreakpoint(id)}
          className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-mono",
            isCurrent && "ring-2 ring-primary",
            isExplicit ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"
          )}
          title={`${id}: ${value || 'not set'}`}
        >
          <span className="mr-0.5">{getBreakpointIcon(id)}</span>
          {value || '—'}
        </button>
      ))}
    </div>
  );
};
```

## Visual Design

### Current UI (Font Size Row):
```
┌──────────────────────────────────────────────────┐
│ Size●  [48px    ]   Height  [1.2     ]          │
└──────────────────────────────────────────────────┘
```

### New UI (with Breakpoint Badges):
```
┌──────────────────────────────────────────────────┐
│ Size●  [48px    ]   Height  [1.2     ]          │
│ 🖥️48px  📱40px  📱L36px  📱32px                  │
│ ──────  ──────  ──────   ──────                 │
│ current  ↑set    ↑set     ↑set                  │
└──────────────────────────────────────────────────┘
```

Badge states:
- **Blue background**: Value explicitly set at this breakpoint
- **Green border**: Currently viewing this breakpoint
- **Gray background**: Value inherited from larger breakpoint (shows inherited value)
- **Clickable**: Clicking a badge switches to that breakpoint

## Technical Details

### New Helper Functions in StylePanel

```typescript
// Get the explicit or inherited value for a property at a specific breakpoint
const getValueAtBreakpoint = (breakpointId: string, property: string): string | undefined => {
  const { getPropertySourceForBreakpoint } = useStyleStore.getState();
  const sourceInfo = getPropertySourceForBreakpoint(activeStyleSourceId, property, breakpointId);
  return sourceInfo.value;
};

// Check if a value is explicitly set at a breakpoint (vs inherited)
const isExplicitAtBreakpoint = (breakpointId: string, property: string): boolean => {
  const { getPropertySourceForBreakpoint } = useStyleStore.getState();
  const sourceInfo = getPropertySourceForBreakpoint(activeStyleSourceId, property, breakpointId);
  return sourceInfo.source === 'explicit';
};
```

### Breakpoint Icon Mapping

```typescript
const breakpointIcons: Record<string, string> = {
  'desktop': '🖥️',
  'tablet': '📱',
  'mobile-landscape': '📱L',
  'mobile': '📱',
};
```

## Implementation Order

1. **Fix typography map** - Add `mobile-landscape` to ensure responsive scaling works correctly at all breakpoints
2. **Add helper functions** - Create utilities to query values at specific breakpoints
3. **Create BreakpointValueBadges component** - Build the visual indicator UI
4. **Integrate into Typography section** - Add badges below the font size input

## Expected Behavior After Implementation

1. **Creating H1 heading**: Automatically applies:
   - Desktop: 48px
   - Tablet: 40px
   - Mobile Landscape: 36px (NEW)
   - Mobile: 32px

2. **Visual indicators**: Below font size input, see all breakpoint values at a glance:
   - Blue badges = explicitly set
   - Gray badges = inherited
   - Ring around current breakpoint
   - Click any badge to switch breakpoints

3. **Canvas preview**: Correctly shows 36px at mobile-landscape, 32px at mobile

## Files Summary

| File | Change |
|------|--------|
| `src/builder/utils/headingTypography.ts` | Add `mobile-landscape` breakpoint to typography map and apply function |
| `src/builder/components/StylePanel.tsx` | Add `BreakpointValueBadges` component and integrate into Typography section |
