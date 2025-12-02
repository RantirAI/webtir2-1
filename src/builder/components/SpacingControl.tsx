import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStyleStore } from '../store/useStyleStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  marginTop = '0',
  marginRight = '0',
  marginBottom = '0',
  marginLeft = '0',
  paddingTop = '0',
  paddingRight = '0',
  paddingBottom = '0',
  paddingLeft = '0',
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
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
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
      
      const isMargin = dragState.property.startsWith('margin');
      const shouldLinkAll = (isMargin && isMarginLinked) || (!isMargin && isPaddingLinked) || e.shiftKey;
      
      if (shouldLinkAll) {
        const propertyType = isMargin ? 'margin' : 'padding';
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        
        sides.forEach(side => {
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
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleGlobalMouseMove, true);
    document.addEventListener('mouseup', handleGlobalMouseUp, true);
    
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove, true);
      document.removeEventListener('mouseup', handleGlobalMouseUp, true);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [dragState, onUpdate, isMarginLinked, isPaddingLinked]);

  const getPropertyColor = (property: string, value: string): string => {
    // Check if value is default (0, empty, or unset)
    const isDefaultValue = !value || value === '0' || value === '';
    
    if (isDefaultValue) {
      return '#999999';
    }

    if (!styleSourceIds || styleSourceIds.length === 0) {
      return '#999999';
    }

    const lastClassIndex = styleSourceIds.length - 1;
    const lastClassId = styleSourceIds[lastClassIndex];
    const breakpoint = currentBreakpointId || 'base';
    const state = currentPseudoState || 'default';
    
    // Check if property is defined in the active (last) class
    const lastClassKey = `${lastClassId}:${breakpoint}:${state}:${property}`;
    if (styles[lastClassKey]) {
      return '#007bff'; // Blue for active class
    }

    // Check if property is inherited from any previous class
    for (let i = lastClassIndex - 1; i >= 0; i--) {
      const classId = styleSourceIds[i];
      const key = `${classId}:${breakpoint}:${state}:${property}`;
      if (styles[key]) {
        return '#f7c600'; // Yellow for inherited class
      }
    }

    return '#999999'; // Gray for default/unset
  };

  const getSourceTooltip = (property: string): string => {
    if (!styleSourceIds || styleSourceIds.length === 0) {
      return 'Default value';
    }

    const lastClassIndex = styleSourceIds.length - 1;
    const lastClassId = styleSourceIds[lastClassIndex];
    const breakpoint = currentBreakpointId || 'base';
    const state = currentPseudoState || 'default';
    
    // Check if property is defined in the active (last) class
    const lastClassKey = `${lastClassId}:${breakpoint}:${state}:${property}`;
    if (styles[lastClassKey]) {
      const lastClassName = styleSources[lastClassId]?.name || lastClassId;
      return `From .${lastClassName} (Active Class)`;
    }

    // Check if property is inherited from any previous class
    for (let i = lastClassIndex - 1; i >= 0; i--) {
      const classId = styleSourceIds[i];
      const key = `${classId}:${breakpoint}:${state}:${property}`;
      if (styles[key]) {
        const className = styleSources[classId]?.name || classId;
        return `Inherited from .${className}`;
      }
    }

    return 'Default value';
  };

  const parseValue = (value: string): { num: number; unit: string } => {
    if (value === 'auto') {
      return { num: 0, unit: 'auto' };
    }
    const match = value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw)?$/);
    if (match) {
      return { num: parseFloat(match[1]), unit: match[2] || 'px' };
    }
    return { num: 0, unit: 'px' };
  };

  const handleMouseDown = (e: React.MouseEvent, property: string, currentValue: string) => {
    if (currentValue === 'auto') {
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
        
        document.removeEventListener('mousemove', handleInitialMouseMove);
        document.removeEventListener('mouseup', handleInitialMouseUp);
        
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
      
      document.removeEventListener('mousemove', handleInitialMouseMove);
      document.removeEventListener('mouseup', handleInitialMouseUp);
    };
    
    document.addEventListener('mousemove', handleInitialMouseMove);
    document.addEventListener('mouseup', handleInitialMouseUp);
  };

  const handlePopoverValueChange = (value: string) => {
    if (editingProperty) {
      // Allow empty string for proper backspace behavior
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
      const isMargin = editingProperty.property.startsWith('margin');
      const shouldLinkAll = (isMargin && isMarginLinked) || (!isMargin && isPaddingLinked) || isShiftPressed;
      
      // If value is empty, default to 0
      const cleanValue = editingProperty.value.trim() === '' ? '0' : editingProperty.value;
      
      const finalValue = editingProperty.unit === 'auto' 
        ? 'auto' 
        : `${cleanValue}${editingProperty.unit}`;
      
      if (shouldLinkAll) {
        const propertyType = isMargin ? 'margin' : 'padding';
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        
        sides.forEach(side => {
          onUpdate(`${propertyType}${side}`, finalValue);
        });
      } else {
        onUpdate(editingProperty.property, finalValue);
      }
    }
    setEditingProperty(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && editingProperty) {
      handlePopoverClose(true);
    } else if (e.key === 'Escape') {
      setEditingProperty(null);
    }
  };

  const getPropertyLabel = (property: string): string => {
    const labels: Record<string, string> = {
      marginTop: 'Margin Top',
      marginRight: 'Margin Right',
      marginBottom: 'Margin Bottom',
      marginLeft: 'Margin Left',
      paddingTop: 'Padding Top',
      paddingRight: 'Padding Right',
      paddingBottom: 'Padding Bottom',
      paddingLeft: 'Padding Left',
    };
    return labels[property] || property;
  };

  const renderSpacingInput = (property: string, value: string) => {
    const isOpen = editingProperty?.property === property;
    const isDragging = dragState?.property === property && dragState?.isDragging;
    const isHovered = hoveredProperty === property;
    const propertyColor = getPropertyColor(property, value);
    const tooltip = getSourceTooltip(property);
    
    return (
      <>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onMouseEnter={() => !dragState?.isDragging && setHoveredProperty(property)}
                onMouseLeave={() => setHoveredProperty(null)}
                onMouseDown={(e) => handleMouseDown(e, property, value)}
                onContextMenu={(e) => e.preventDefault()}
                style={{ 
                  display: 'inline-block', 
                  cursor: isDragging ? 'ns-resize' : 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: propertyColor,
                  userSelect: 'none',
                  minWidth: '28px',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                  textDecoration: isHovered && !isDragging && !isOpen ? 'underline' : 'none',
                  backgroundColor: isDragging 
                    ? `${propertyColor}15` 
                    : isHovered && !isOpen 
                      ? `${propertyColor}0a` 
                      : 'transparent',
                  borderRadius: '3px',
                }}>
                  {value || '0'}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="font-medium">{getPropertyLabel(property)}</div>
              <div className="text-muted-foreground">{tooltip}</div>
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
              <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, pointerEvents: 'none' }} />
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
                  {(isShiftPressed || (property.startsWith('margin') ? isMarginLinked : isPaddingLinked)) && (
                    <span className="text-xs text-muted-foreground">All sides</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={editingProperty?.value ?? ''}
                    onChange={(e) => handlePopoverValueChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    autoFocus
                    disabled={editingProperty?.unit === 'auto'}
                  />
                   <Select
                    value={editingProperty?.unit || 'px'}
                    onValueChange={handlePopoverUnitChange}
                  >
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
                    Hold Shift to change all {property.startsWith('margin') ? 'margins' : 'paddings'}
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
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground tracking-wider">padding & margin</Label>
      
      <TooltipProvider delayDuration={300}>
        <div className="relative w-full" style={{ padding: '8px' }}>
          {/* SVG Container with preserved aspect ratio */}
          <div className="relative w-full" style={{ paddingBottom: '52.31%' /* 113/216 aspect ratio */ }}>
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 216 113"
              preserveAspectRatio="xMidYMid meet"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask id="mask0_716_4155" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="0" y="0" width="216" height="112">
                <path d="M212.998 0.710083H3.01156C1.63094 0.710083 0.511719 1.8293 0.511719 3.20993V109.203C0.511719 110.584 1.63094 111.703 3.01156 111.703H212.998C214.379 111.703 215.498 110.584 215.498 109.203V3.20993C215.498 1.8293 214.379 0.710083 212.998 0.710083Z" fill="white"/>
              </mask>
              <g mask="url(#mask0_716_4155)">
                <path d="M215.998 0.210083H0.0117188L81.5066 56.2066H134.503L215.998 0.210083Z" className="fill-muted/50"/>
                <path d="M215.999 112.203L134.504 56.2066L215.999 0.210083V112.203Z" className="fill-muted/30"/>
                <path d="M215.998 112.203H0.0117188L81.5066 56.2065H134.503L215.998 112.203Z" className="fill-muted/50"/>
                <path d="M0.0117188 0.210083L81.5066 56.2066L0.0117188 112.203V0.210083Z" className="fill-muted/30"/>
              </g>
              <path d="M212.998 0.710083H3.01156C1.63094 0.710083 0.511719 1.8293 0.511719 3.20993V109.203C0.511719 110.584 1.63094 111.703 3.01156 111.703H212.998C214.379 111.703 215.498 110.584 215.498 109.203V3.20993C215.498 1.8293 214.379 0.710083 212.998 0.710083Z" className="stroke-border" strokeWidth="0.999937"/>
              <path d="M176.001 25.7085H40.0096C38.629 25.7085 37.5098 26.8277 37.5098 28.2083V84.2048C37.5098 85.5855 38.629 86.7047 40.0096 86.7047H176.001C177.382 86.7047 178.501 85.5855 178.501 84.2048V28.2083C178.501 26.8277 177.382 25.7085 176.001 25.7085Z" className="fill-muted/40 stroke-border" strokeWidth="0.999937"/>
              <mask id="mask1_716_4155" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="40" y="28" width="136" height="56">
                <path d="M175.001 28.7083H41.0097C40.7336 28.7083 40.5098 28.9321 40.5098 29.2082V83.2048C40.5098 83.481 40.7336 83.7048 41.0097 83.7048H175.001C175.277 83.7048 175.501 83.481 175.501 83.2048V29.2082C175.501 28.9321 175.277 28.7083 175.001 28.7083Z" fill="white"/>
              </mask>
              <g mask="url(#mask1_716_4155)">
                <path d="M215.998 0.210083H0.0117188L81.5066 56.2066H134.503L215.998 0.210083Z" className="fill-muted/50"/>
                <path d="M215.999 112.203L134.504 56.2066L215.999 0.210083V112.203Z" className="fill-muted/30"/>
                <path d="M215.998 112.203H0.0117188L81.5066 56.2065H134.503L215.998 112.203Z" className="fill-muted/50"/>
                <path d="M0.0117188 0.210083L81.5066 56.2066L0.0117188 112.203V0.210083Z" className="fill-muted/30"/>
              </g>
              <path d="M175.001 28.7083H41.0097C40.7336 28.7083 40.5098 28.9321 40.5098 29.2082V83.2048C40.5098 83.481 40.7336 83.7048 41.0097 83.7048H175.001C175.277 83.7048 175.501 83.481 175.501 83.2048V29.2082C175.501 28.9321 175.277 28.7083 175.001 28.7083Z" className="stroke-border" strokeWidth="0.999937"/>
              <path d="M138.002 53.7068H78.0058C77.7297 53.7068 77.5059 53.9306 77.5059 54.2068V58.2065C77.5059 58.4826 77.7297 58.7065 78.0058 58.7065H138.002C138.278 58.7065 138.502 58.4826 138.502 58.2065V54.2068C138.502 53.9306 138.278 53.7068 138.002 53.7068Z" className="fill-muted/40 stroke-border" strokeWidth="0.999937"/>
            </svg>

            {/* Interactive spacing values - positioned with percentages matching SVG coordinates */}
            <div className="absolute inset-0">
              {/* Margin Top */}
              <div className="absolute" style={{ top: '6%', left: '50%', transform: 'translateX(-50%)' }}>
                {renderSpacingInput('marginTop', marginTop)}
              </div>

              {/* Margin Right */}
              <div className="absolute" style={{ top: '50%', right: '4%', transform: 'translateY(-50%)' }}>
                {renderSpacingInput('marginRight', marginRight)}
              </div>

              {/* Margin Bottom */}
              <div className="absolute" style={{ bottom: '6%', left: '50%', transform: 'translateX(-50%)' }}>
                {renderSpacingInput('marginBottom', marginBottom)}
              </div>

              {/* Margin Left */}
              <div className="absolute" style={{ top: '50%', left: '4%', transform: 'translateY(-50%)' }}>
                {renderSpacingInput('marginLeft', marginLeft)}
              </div>

              {/* Padding Top */}
              <div className="absolute" style={{ top: '28%', left: '50%', transform: 'translateX(-50%)' }}>
                {renderSpacingInput('paddingTop', paddingTop)}
              </div>

              {/* Padding Right */}
              <div className="absolute" style={{ top: '50%', right: '20%', transform: 'translateY(-50%)' }}>
                {renderSpacingInput('paddingRight', paddingRight)}
              </div>

              {/* Padding Bottom */}
              <div className="absolute" style={{ bottom: '28%', left: '50%', transform: 'translateX(-50%)' }}>
                {renderSpacingInput('paddingBottom', paddingBottom)}
              </div>

              {/* Padding Left */}
              <div className="absolute" style={{ top: '50%', left: '20%', transform: 'translateY(-50%)' }}>
                {renderSpacingInput('paddingLeft', paddingLeft)}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};
