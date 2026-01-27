
## Summary of what’s still broken (based on your screenshot)

The Canvas is being resized to a mobile width, but the typography system still thinks you’re on the **Desktop** breakpoint. That’s why:
- The **Size input stays 48px**
- The canvas Heading stays at **48px**
- The breakpoint badges show values for all breakpoints, but the **current breakpoint highlight remains Desktop**

## Root cause

There are currently **two separate “breakpoint states”** in the app:

1) **Builder page local state** (`src/pages/Builder.tsx`)
- `const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop')`
- This is what PageNavigation changes.
- Canvas width responds to this.

2) **Style system state** (`useStyleStore.currentBreakpointId`)
- This is what StylePanel + getCanvasComputedStyles use to decide which responsive styles apply.
- This is what Heading/Text are subscribed to.

Right now, **switching breakpoints in the top toolbar only updates (1), not (2)**. So the canvas is “mobile-sized” but the styles remain “desktop”.

## Fix (design decision)

Make `useStyleStore.currentBreakpointId` the **single source of truth** for breakpoints, and have Builder/PageNavigation/Canvas all use that value.

This ensures:
- Switching breakpoint in PageNavigation changes both canvas width AND typography breakpoint
- Clicking the new BreakpointValueBadges also changes canvas width AND PageNavigation selection
- Heading/Text + any other primitives using `getCanvasComputedStyles()` instantly preview the correct responsive styles

## Implementation steps (code changes)

### 1) Update `src/pages/Builder.tsx` to use the style store breakpoint
- Remove the local React state:
  - `const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');`
- Replace it with Zustand store values:
  - `const currentBreakpoint = useStyleStore((s) => s.currentBreakpointId);`
  - `const setCurrentBreakpoint = useStyleStore((s) => s.setCurrentBreakpoint);`

Keep the prop names the same so the rest of the component remains unchanged:
- `<Canvas currentBreakpoint={currentBreakpoint} ... />`
- `<PageNavigation currentBreakpoint={currentBreakpoint} onBreakpointChange={setCurrentBreakpoint} ... />`

### 2) Validate that all breakpoint IDs match everywhere
Confirm we consistently use:
- `desktop`
- `tablet`
- `mobile-landscape`
- `mobile`

(Your `PageNavigation.breakpoints` already includes `mobile-landscape`, and `useStyleStore` does too, which is good.)

### 3) Optional quality improvement (not required for the fix)
If there are any other places still using a local “breakpoint” state (or hardcoded “desktop/tablet/mobile”), align them to the same 4-breakpoint model. (For example, the unused `DeviceSelector.tsx` only supports 3 breakpoints; since it’s unused, we can ignore or later update.)

## Files to change

- `src/pages/Builder.tsx` (primary fix; breakpoint state unification)

No other files should be required to make the responsive typography preview work.

## How we’ll verify the fix (exact checks)

1) Add a new Heading (H1).
2) On Desktop:
   - StylePanel “Size” shows **48**
   - Canvas shows **48px**
3) Switch to Tablet in the top toolbar:
   - StylePanel “Size” updates to **40**
   - Canvas heading updates to **40px**
4) Switch to Mobile-Landscape:
   - StylePanel “Size” updates to **36**
   - Canvas heading updates to **36px**
5) Switch to Mobile:
   - StylePanel “Size” updates to **32**
   - Canvas heading updates to **32px**
6) Click the breakpoint badges in StylePanel:
   - It should also change the canvas width + the toolbar breakpoint, not just the style panel

## Risks / edge cases

- Very low risk: this is a state-wiring fix, not a style-system rewrite.
- Potential behavior change: clicking breakpoint badges will now also resize the canvas (this is desirable, because it matches user expectations and fixes the confusion).

## Next improvements (optional, after this is fixed)

1) Auto-detect breakpoint from manual canvas resize (if user drags width handles) and switch the style breakpoint accordingly.
2) Add a small “Current breakpoint: Mobile” label near Typography to reduce confusion.
3) Extend responsive preview to other primitives (Link/Button/etc.) that may still rely on media queries only.
