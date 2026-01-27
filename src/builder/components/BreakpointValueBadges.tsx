import React from "react";
import { useStyleStore } from "../store/useStyleStore";
import { cn } from "@/lib/utils";
import { Monitor, Tablet, Smartphone } from "lucide-react";

interface BreakpointValueBadgesProps {
  property: string;
  styleSourceId: string | null;
}

const BREAKPOINTS = [
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'tablet', label: 'Tablet', icon: Tablet },
  { id: 'mobile-landscape', label: 'Mobile L', icon: Smartphone },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
] as const;

export const BreakpointValueBadges: React.FC<BreakpointValueBadgesProps> = ({
  property,
  styleSourceId,
}) => {
  const currentBreakpointId = useStyleStore((state) => state.currentBreakpointId);
  const setCurrentBreakpoint = useStyleStore((state) => state.setCurrentBreakpoint);
  const getPropertySourceForBreakpoint = useStyleStore((state) => state.getPropertySourceForBreakpoint);

  if (!styleSourceId) return null;

  const breakpointValues = BREAKPOINTS.map((bp) => {
    const sourceInfo = getPropertySourceForBreakpoint(styleSourceId, property, bp.id, 'default');
    return {
      ...bp,
      value: sourceInfo.value,
      isExplicit: sourceInfo.source === 'explicit',
      inheritedFrom: sourceInfo.inheritedFrom,
      isCurrent: bp.id === currentBreakpointId,
    };
  });

  // Only show if at least one breakpoint has a value
  const hasAnyValue = breakpointValues.some(bp => bp.value);
  if (!hasAnyValue) return null;

  return (
    <div className="flex gap-1 mt-1.5 flex-wrap">
      {breakpointValues.map((bp) => {
        const Icon = bp.icon;
        const isLandscape = bp.id === 'mobile-landscape';
        
        return (
          <button
            key={bp.id}
            onClick={() => setCurrentBreakpoint(bp.id)}
            className={cn(
              "px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-0.5 transition-all",
              "border hover:bg-accent/50",
              bp.isCurrent && "ring-2 ring-primary ring-offset-1",
              bp.isExplicit 
                ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700" 
                : bp.value 
                  ? "bg-muted text-muted-foreground border-muted-foreground/30" 
                  : "bg-muted/50 text-muted-foreground/50 border-transparent"
            )}
            title={`${bp.label}: ${bp.value || 'not set'}${bp.inheritedFrom ? ` (inherited from ${bp.inheritedFrom})` : ''}`}
          >
            <Icon 
              className={cn(
                "w-2.5 h-2.5",
                isLandscape && "rotate-90"
              )} 
            />
            <span className="max-w-[40px] truncate">
              {bp.value || '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
};
