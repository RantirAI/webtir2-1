
# Plan: Fix Breakpoint Inheritance and Add Visual Override Indicators

## Problem Analysis

### Current Behavior (Broken)
The style system correctly implements a "mobile-down" cascade where:
1. Desktop styles are the base
2. Tablet styles inherit from desktop and can override
3. Mobile styles inherit from tablet (which inherits from desktop)

However, there are two issues:

**Issue 1: `getPropertySource` doesn't distinguish breakpoint inheritance**
The `getPropertySource` function (StylePanel.tsx lines 581-596) only checks:
- "active" = explicitly set on the current class at the **current breakpoint**
- "inherited" = exists in computed styles (from parent classes)
- "none" = not set

It **does not** differentiate between:
- A value inherited from desktop (when viewing tablet/mobile)
- A value explicitly overridden at the current breakpoint

**Issue 2: No visual indicator for breakpoint-specific overrides**
When viewing tablet or mobile breakpoints, users cannot see:
- Which properties have explicit overrides at this breakpoint
- Which properties are cascading from desktop
- Where the value is actually coming from

### Expected Behavior
1. Desktop styles remain the base and should not be affected when editing at smaller breakpoints
2. When viewing a smaller breakpoint (tablet/mobile):
   - Properties with explicit overrides at this breakpoint should show a distinct indicator
   - Properties cascading from desktop should show they're inherited from a larger breakpoint
3. Users should be able to easily clear breakpoint-specific overrides to restore desktop values

## Root Cause

The `getPropertyState` function in `useStyleStore.ts` (lines 307-315) correctly scopes property lookups to a specific breakpoint. The problem is that `getPropertySource` in StylePanel.tsx doesn't use this to distinguish breakpoint inheritance.

Currently:
```typescript
const getPropertySource = (property: string): "active" | "inherited" | "none" => {
  // Only checks if set at CURRENT breakpoint
  const activeValue = getPropertyState(activeStyleSourceId, property);
  if (activeValue !== undefined && activeValue !== "" ...) return "active";
  
  // Falls back to computed (doesn't know if it's from desktop)
  const computedValue = (computedStyles as any)[property];
  if (computedValue !== undefined ...) return "inherited";
  
  return "none";
};
```

## Solution

### Part 1: Add Breakpoint-Aware Property Source Detection

Update `getPropertySource` to return a more detailed source type:

```typescript
type PropertySource = 
  | "active"           // Explicitly set at current breakpoint
  | "breakpoint-inherited"  // Inherited from larger breakpoint (e.g., desktop → tablet)
  | "class-inherited"  // Inherited from a parent class
  | "none";            // Not set anywhere
```

### Part 2: Add Visual Indicators for Breakpoint Overrides

1. **Blue dot**: Property explicitly set at the current breakpoint
2. **Orange dot**: Property inherited from a parent class (class-level inheritance)
3. **Green dot**: Property inherited from a larger breakpoint (breakpoint inheritance)

Additionally, add a visual indicator near the breakpoint selector showing how many properties have overrides at the current breakpoint.

### Part 3: Add "Clear Breakpoint Override" Functionality

Allow users to easily remove a breakpoint-specific override and restore the inherited value from desktop.

## Files to Modify

### 1. `src/builder/store/useStyleStore.ts`

Add a new helper function to check if a property has an override at a specific breakpoint:

```typescript
// Add new function to check property source with breakpoint awareness
getPropertySourceForBreakpoint: (
  styleSourceId: string, 
  property: string, 
  targetBreakpoint?: string
): { 
  source: 'explicit' | 'breakpoint-inherited' | 'none';
  inheritedFrom?: string; // breakpoint ID if inherited
} => {
  const { styles, breakpoints, currentBreakpointId } = get();
  const bp = targetBreakpoint || currentBreakpointId;
  
  // Check if explicitly set at this breakpoint
  const key = `${styleSourceId}:${bp}:default:${property}`;
  if (styles[key] !== undefined && styles[key] !== '') {
    return { source: 'explicit' };
  }
  
  // Check if inherited from a larger breakpoint
  const bpIndex = breakpoints.findIndex(b => b.id === bp);
  for (let i = bpIndex - 1; i >= 0; i--) {
    const parentBp = breakpoints[i].id;
    const parentKey = `${styleSourceId}:${parentBp}:default:${property}`;
    if (styles[parentKey] !== undefined && styles[parentKey] !== '') {
      return { source: 'breakpoint-inherited', inheritedFrom: parentBp };
    }
  }
  
  return { source: 'none' };
}
```

Also add a function to clear a breakpoint-specific override:

```typescript
clearBreakpointOverride: (styleSourceId: string, property: string, breakpointId?: string) => {
  const bp = breakpointId || get().currentBreakpointId;
  // Only clear if not desktop (can't clear desktop - it's the base)
  if (bp === 'desktop') return;
  
  const key = `${styleSourceId}:${bp}:${get().currentPseudoState}:${property}`;
  set((state) => {
    const newStyles = { ...state.styles };
    delete newStyles[key];
    return { styles: newStyles };
  });
}
```

### 2. `src/builder/components/StylePanel.tsx`

Update `getPropertySource` to use breakpoint-aware detection:

```typescript
// Enhanced property source detection
const getPropertySource = (property: string): "active" | "breakpoint-inherited" | "class-inherited" | "none" => {
  if (!selectedInstance || !activeStyleSourceId) return "none";
  
  const { getPropertySourceForBreakpoint, currentBreakpointId } = useStyleStore.getState();
  
  // Check the active class first
  const sourceInfo = getPropertySourceForBreakpoint(activeStyleSourceId, property);
  
  if (sourceInfo.source === 'explicit') {
    return "active";
  }
  
  if (sourceInfo.source === 'breakpoint-inherited') {
    return "breakpoint-inherited";
  }
  
  // Check if inherited from parent classes (class-level inheritance)
  const computedValue = (computedStyles as any)[property];
  if (computedValue !== undefined && computedValue !== "" && 
      computedValue !== "auto" && computedValue !== "none") {
    // Could be from a parent class - check other classes
    const otherClasses = selectedInstance.styleSourceIds?.filter(id => id !== activeStyleSourceId) || [];
    for (const classId of otherClasses) {
      const classSource = getPropertySourceForBreakpoint(classId, property);
      if (classSource.source !== 'none') {
        return "class-inherited";
      }
    }
  }
  
  return "none";
};
```

Update the `PropertyIndicator` component to show three colors:

```typescript
const PropertyIndicator: React.FC<{ property: string }> = ({ property }) => {
  const source = getPropertySource(property);
  if (source === "none") return null;
  
  // Blue = explicit at this breakpoint
  // Green = inherited from larger breakpoint  
  // Orange = inherited from parent class
  const colorMap = {
    "active": "hsl(217, 91%, 60%)",         // Blue
    "breakpoint-inherited": "hsl(142, 76%, 36%)", // Green
    "class-inherited": "hsl(45, 93%, 47%)", // Orange/Yellow
  };
  
  const labelMap = {
    "active": "Set at this breakpoint",
    "breakpoint-inherited": "Inherited from larger breakpoint",
    "class-inherited": "Inherited from parent class",
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: colorMap[source],
              display: "inline-block",
              marginLeft: "4px",
              cursor: "help",
            }}
          />
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          {labelMap[source]}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
```

### 3. Add Breakpoint Override Indicator to Class Selector Area

Add a visual indicator near the breakpoint selector showing if the current breakpoint has overrides:

```typescript
// Add after line 1500 (after the state dropdown)
{currentBreakpointId !== 'desktop' && (
  <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded text-xs text-green-600">
    <span className="w-2 h-2 rounded-full bg-green-500" />
    <span>{breakpointOverrideCount} overrides</span>
    <button
      onClick={() => clearAllBreakpointOverrides()}
      className="ml-1 hover:text-green-800"
      title="Clear all breakpoint overrides"
    >
      <RotateCcw className="w-3 h-3" />
    </button>
  </div>
)}
```

### 4. Add Per-Property Clear Override Action

When hovering over a property with a breakpoint-specific override, show a clear button:

```typescript
// In property row rendering, add clear button for breakpoint overrides
{getPropertySource(property) === "active" && currentBreakpointId !== 'desktop' && (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => clearBreakpointOverride(activeStyleSourceId, property)}
          className="w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <RotateCcw className="w-3 h-3 text-muted-foreground hover:text-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent>Clear breakpoint override</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)}
```

## Visual Design

```text
Property Indicator Colors:
┌─────────────────────────────────────────────────────────────┐
│  ● Blue   = Explicitly set at current breakpoint            │
│  ● Green  = Inherited from larger breakpoint (e.g., desktop)│
│  ● Orange = Inherited from parent class                     │
└─────────────────────────────────────────────────────────────┘

Breakpoint Selector with Override Indicator:
┌─────────────────────────────────────────────────────────────┐
│  [📱 Mobile ▼]  ● 3 overrides [↺]                          │
│                                                             │
│  Display: [Flex] [Block] [Grid] ...  ● (green = from desktop)│
│  Direction: [Row] [Column] ...       ● (blue = override)    │
│  Gap: [16px] [↺]                     ● (blue = override)    │
└─────────────────────────────────────────────────────────────┘
```

## Implementation Order

1. Add `getPropertySourceForBreakpoint` and `clearBreakpointOverride` to `useStyleStore.ts`
2. Update `getPropertySource` in StylePanel.tsx to use the new helper
3. Update `PropertyIndicator` component with three-color system and tooltips
4. Add breakpoint override count indicator near class selector
5. Add per-property clear override buttons
6. Test with various breakpoint scenarios

## Expected Outcome

After implementation:
- Desktop styles remain intact when editing tablet/mobile breakpoints
- Users can clearly see which properties have explicit overrides at the current breakpoint (blue)
- Users can see which properties are cascading from desktop (green)
- Users can easily clear individual breakpoint overrides to restore desktop values
- The breakpoint override indicator shows a count of how many properties are customized at the current breakpoint

## Risk Assessment

**Low Risk:**
- Changes are additive (new helper functions, enhanced indicators)
- Existing `setStyle` and `getComputedStyles` behavior unchanged
- Visual indicators are non-blocking enhancements
- Clear override functionality uses existing `delete` pattern from `resetStyles`
