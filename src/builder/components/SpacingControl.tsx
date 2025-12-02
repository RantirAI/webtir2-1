import React, { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStyleStore } from "../store/useStyleStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils"; // Assuming you have a cn utility, if not, standard string interp works

interface SpacingControlProps {
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  onUpdate: (property: string, value: string) => void;
  styleSourceIds: string[];
  activeClassIndex: number | null;
  isMarginLinked?: boolean;
  isPaddingLinked?: boolean;
  onMarginLinkChange?: (linked: boolean) => void;
  onPaddingLinkChange?: (linked: boolean) => void;
}

export const SpacingControl: React.FC<SpacingControlProps> = ({
  marginTop = "0",
  marginRight = "0",
  marginBottom = "0",
  marginLeft = "0",
  paddingTop = "0",
  paddingRight = "0",
  paddingBottom = "0",
  paddingLeft = "0",
  onUpdate,
  styleSourceIds,
  activeClassIndex,
  isMarginLinked: externalIsMarginLinked,
  isPaddingLinked: externalIsPaddingLinked,
  onMarginLinkChange,
  onPaddingLinkChange,
}) => {
  const { styleSources, styles, currentBreakpointId, currentPseudoState } = useStyleStore();
  const [localIsMarginLinked, setLocalIsMarginLinked] = useState(false);
  const [localIsPaddingLinked, setLocalIsPaddingLinked] = useState(false);

  const isMarginLinked = externalIsMarginLinked !== undefined ? externalIsMarginLinked : localIsMarginLinked;
  const isPaddingLinked = externalIsPaddingLinked !== undefined ? externalIsPaddingLinked : localIsPaddingLinked;

  const setIsMarginLinked = (value: boolean) => {
    if (onMarginLinkChange) {
      onMarginLinkChange(value);
    } else {
      setLocalIsMarginLinked(value);
    }
  };

  const setIsPaddingLinked = (value: boolean) => {
    if (onPaddingLinkChange) {
      onPaddingLinkChange(value);
    } else {
      setLocalIsPaddingLinked(value);
    }
  };

  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    property: string;
    startY: number;
    startValue: number;
    unit: string;
  } | null>(null);
  const [editingProperty, setEditingProperty] = useState<{
    property: string;
    value: string;
    unit: string;
  } | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!dragState?.isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragState) return;

      e.preventDefault();
      e.stopPropagation();

      const deltaY = dragState.startY - e.clientY;
      const newValue = Math.max(0, dragState.startValue + Math.round(deltaY));

      const isMargin = dragState.property.startsWith("margin");
      const shouldLinkAll = (isMargin && isMarginLinked) || (!isMargin && isPaddingLinked) || e.shiftKey;

      if (shouldLinkAll) {
        const propertyType = isMargin ? "margin" : "padding";
        const sides = ["Top", "Right", "Bottom", "Left"];

        sides.forEach((side) => {
          onUpdate(`${propertyType}${side}`, `${newValue}${dragState.unit}`);
        });
      } else {
        onUpdate(dragState.property, `${newValue}${dragState.unit}`);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragState(null);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", handleGlobalMouseMove, true);
    document.addEventListener("mouseup", handleGlobalMouseUp, true);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove, true);
      document.removeEventListener("mouseup", handleGlobalMouseUp, true);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragState, onUpdate, isMarginLinked, isPaddingLinked]);

  const getPropertyState = (property: string): { color: string; source: string; isEditable: boolean } => {
    if (!styleSourceIds || styleSourceIds.length === 0) {
      return { color: "#999", source: "Not set (click to define)", isEditable: true };
    }

    const lastClassIndex = styleSourceIds.length - 1;
    const lastClassId = styleSourceIds[lastClassIndex];
    const breakpoint = currentBreakpointId || "base";
    const state = currentPseudoState || "default";

    const lastClassKey = `${lastClassId}:${breakpoint}:${state}:${property}`;
    if (styles[lastClassKey]) {
      const lastClassName = styleSources[lastClassId]?.name || lastClassId;
      return {
        color: "#3b82f6",
        source: `Active in Class ${lastClassIndex + 1} (.${lastClassName})`,
        isEditable: true,
      };
    }

    for (let i = lastClassIndex - 1; i >= 0; i--) {
      const classId = styleSourceIds[i];
      const key = `${classId}:${breakpoint}:${state}:${property}`;
      if (styles[key]) {
        const className = styleSources[classId]?.name || classId;
        return {
          color: "#ea9005",
          source: `Inherited from Class ${i + 1} (.${className}) - click to override in Class ${lastClassIndex + 1}`,
          isEditable: true,
        };
      }
    }

    return {
      color: "#999",
      source: `Not set - click to define in Class ${lastClassIndex + 1}`,
      isEditable: true,
    };
  };

  const parseValue = (value: string): { num: number; unit: string } => {
    if (value === "auto") {
      return { num: 0, unit: "auto" };
    }
    const match = value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw)?$/);
    if (match) {
      return { num: parseFloat(match[1]), unit: match[2] || "px" };
    }
    return { num: 0, unit: "px" };
  };

  const handleMouseDown = (e: React.MouseEvent, property: string, currentValue: string) => {
    if (currentValue === "auto") {
      const { num, unit } = parseValue(currentValue);
      setEditingProperty({
        property,
        value: num.toString(),
        unit,
      });
      return;
    }

    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();
    let hasMoved = false;
    let dragInitiated = false;

    const { num, unit } = parseValue(currentValue);

    const handleInitialMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);

      if (deltaX > 0 || deltaY > 0) {
        hasMoved = true;
      }

      if (!dragInitiated && (deltaX > 5 || deltaY > 5)) {
        dragInitiated = true;

        document.removeEventListener("mousemove", handleInitialMouseMove);
        document.removeEventListener("mouseup", handleInitialMouseUp);

        setDragState({
          isDragging: true,
          property,
          startY: moveEvent.clientY,
          startValue: num,
          unit,
        });
      }
    };

    const handleInitialMouseUp = () => {
      const endTime = Date.now();
      const timeDiff = endTime - startTime;

      if (!dragInitiated && timeDiff < 300 && !hasMoved) {
        setEditingProperty({
          property,
          value: num.toString(),
          unit,
        });
      }

      document.removeEventListener("mousemove", handleInitialMouseMove);
      document.removeEventListener("mouseup", handleInitialMouseUp);
    };

    document.addEventListener("mousemove", handleInitialMouseMove);
    document.addEventListener("mouseup", handleInitialMouseUp);
  };

  const handlePopoverValueChange = (value: string) => {
    if (editingProperty) {
      setEditingProperty({ ...editingProperty, value });
    }
  };

  const handlePopoverUnitChange = (unit: string) => {
    if (editingProperty) {
      setEditingProperty({ ...editingProperty, unit });
    }
  };

  const handlePopoverClose = (applyChanges: boolean = true) => {
    if (editingProperty && applyChanges) {
      const isMargin = editingProperty.property.startsWith("margin");
      const shouldLinkAll = (isMargin && isMarginLinked) || (!isMargin && isPaddingLinked) || isShiftPressed;

      const finalValue = editingProperty.unit === "auto" ? "auto" : `${editingProperty.value}${editingProperty.unit}`;

      if (shouldLinkAll) {
        const propertyType = isMargin ? "margin" : "padding";
        const sides = ["Top", "Right", "Bottom", "Left"];

        sides.forEach((side) => {
          onUpdate(`${propertyType}${side}`, finalValue);
        });
      } else {
        onUpdate(editingProperty.property, finalValue);
      }
    }
    setEditingProperty(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && editingProperty) {
      handlePopoverClose(true);
    } else if (e.key === "Escape") {
      setEditingProperty(null);
    }
  };

  const getPropertyLabel = (property: string): string => {
    const labels: Record<string, string> = {
      marginTop: "Margin Top",
      marginRight: "Margin Right",
      marginBottom: "Margin Bottom",
      marginLeft: "Margin Left",
      paddingTop: "Padding Top",
      paddingRight: "Padding Right",
      paddingBottom: "Padding Bottom",
      paddingLeft: "Padding Left",
    };
    return labels[property] || property;
  };

  const renderSpacingInput = (property: string, value: string) => {
    const isOpen = editingProperty?.property === property;
    const isDragging = dragState?.property === property && dragState?.isDragging;
    const isHovered = hoveredProperty === property;
    const inputRef = useRef<HTMLDivElement>(null);
    const propertyState = getPropertyState(property);

    // Clean styling matching screenshot
    return (
      <>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                ref={inputRef}
                onMouseEnter={() => !dragState?.isDragging && setHoveredProperty(property)}
                onMouseLeave={() => setHoveredProperty(null)}
                onMouseDown={(e) => handleMouseDown(e, property, value)}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isDragging ? "ns-resize" : "pointer",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    padding: "2px 4px",
                    fontSize: "11px",
                    lineHeight: "1",
                    fontWeight: 500,
                    color: "hsl(var(--foreground))",
                    userSelect: "none",
                    minWidth: "20px",
                    textAlign: "center",
                    transition: "all 0.1s ease",
                    backgroundColor: isHovered && !isDragging && !isOpen ? "hsl(var(--accent) / 0.5)" : "transparent",
                    borderRadius: "2px",
                  }}
                >
                  {value || "0"}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="font-medium">{getPropertyLabel(property)}</div>
              <div className="text-muted-foreground">{propertyState.source}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isOpen && (
          <Popover
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                handlePopoverClose(true);
              }
            }}
            modal={true}
          >
            <PopoverTrigger asChild>
              <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, pointerEvents: "none" }} />
            </PopoverTrigger>
            <PopoverContent
              className="w-64 p-4 bg-background border shadow-lg"
              align="start"
              side="right"
              sideOffset={8}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onCloseAutoFocus={(e) => e.preventDefault()}
              onEscapeKeyDown={() => handlePopoverClose(false)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">{getPropertyLabel(property)}</Label>
                  {(isShiftPressed || (property.startsWith("margin") ? isMarginLinked : isPaddingLinked)) && (
                    <span className="text-xs text-muted-foreground">All sides</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editingProperty?.value || "0"}
                    onChange={(e) => handlePopoverValueChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    autoFocus
                    disabled={editingProperty?.unit === "auto"}
                  />
                  <Select value={editingProperty?.unit || "px"} onValueChange={handlePopoverUnitChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="auto">auto</SelectItem>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="rem">rem</SelectItem>
                      <SelectItem value="em">em</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="vh">vh</SelectItem>
                      <SelectItem value="vw">vw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!isMarginLinked && !isPaddingLinked && (
                  <p className="text-xs text-muted-foreground">
                    Hold Shift to change all {property.startsWith("margin") ? "margins" : "paddings"}
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col gap-3 p-4 w-full">
      {/* Header Label */}
      <div className="text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">Spacing</div>

      <div className="relative w-full">
        <div className="text-[9px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
          Padding & Margin
        </div>

        {/* Main Box Container */}
        <div
          className="relative w-full h-[140px] border border-border/40 rounded-sm bg-background/20 select-none overflow-hidden"
          style={{ background: "linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(0,0,0,0.02))" }}
        >
          {/* SVG Overlay for diagonal connecting lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-border/30" style={{ zIndex: 0 }}>
            {/* Lines connecting outer corners to inner corners */}
            {/* Top Left */}
            <line x1="0" y1="0" x2="48" y2="34" strokeWidth="1" />
            {/* Top Right */}
            <line x1="100%" y1="0" x2="calc(100% - 48px)" y2="34" strokeWidth="1" />
            {/* Bottom Left */}
            <line x1="0" y1="100%" x2="48" y2="calc(100% - 34px)" strokeWidth="1" />
            {/* Bottom Right */}
            <line x1="100%" y1="100%" x2="calc(100% - 48px)" y2="calc(100% - 34px)" strokeWidth="1" />
          </svg>

          {/* MARGIN LABELS (Text inside the outer trapezoids) */}
          <div className="absolute top-1 left-2 text-[8px] text-muted-foreground/40 font-mono pointer-events-none">
            MARGIN
          </div>

          {/* Margin Top */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
            {renderSpacingInput("marginTop", marginTop)}
          </div>

          {/* Margin Right */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
            {renderSpacingInput("marginRight", marginRight)}
          </div>

          {/* Margin Bottom */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
            {renderSpacingInput("marginBottom", marginBottom)}
          </div>

          {/* Margin Left */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {renderSpacingInput("marginLeft", marginLeft)}
          </div>

          {/* Inner Padding Box */}
          <div className="absolute inset-x-12 inset-y-[34px] border border-border/40 bg-muted/5 rounded-[2px] z-0">
            <div className="absolute top-1 left-2 text-[8px] text-muted-foreground/40 font-mono pointer-events-none">
              PADDING
            </div>

            {/* Padding Top */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
              {renderSpacingInput("paddingTop", paddingTop)}
            </div>

            {/* Padding Right */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
              {renderSpacingInput("paddingRight", paddingRight)}
            </div>

            {/* Padding Bottom */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-10">
              {renderSpacingInput("paddingBottom", paddingBottom)}
            </div>

            {/* Padding Left */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
              {renderSpacingInput("paddingLeft", paddingLeft)}
            </div>

            {/* Central Pill/Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1.5 bg-border/20 rounded-full border border-border/10" />
          </div>
        </div>
      </div>
    </div>
  );
};
