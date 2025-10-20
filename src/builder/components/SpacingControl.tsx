import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2, Link2Off } from 'lucide-react';
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
  styleSourceIds: string[]; // Array of class IDs for this component
  activeClassIndex: number | null; // Currently active class index (0 = primary, 1+ = combo)
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
  // Use controlled state if props are provided, otherwise use local state
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

  // Global drag handling
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
      
      // If chainlink is active or Shift is pressed, update all sides
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

    // Add listeners to document to catch all mouse movements
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
  }, [dragState, onUpdate]);

  // Determine property color state (blue = active, yellow/orange = inherited, gray = default)
  // STRICT RULE: Only show editable state for the LAST class in chain
  const getPropertyState = (property: string): { color: string; source: string; isEditable: boolean } => {
    // If no classes exist, everything is gray/default
    if (!styleSourceIds || styleSourceIds.length === 0) {
      return { color: '#999', source: 'Not set (click to define)', isEditable: true };
    }

    // Always check the LAST class in the chain (only editable one)
    const lastClassIndex = styleSourceIds.length - 1;
    const lastClassId = styleSourceIds[lastClassIndex];
    const breakpoint = currentBreakpointId || 'base';
    const state = currentPseudoState || 'default';
    
    // Check if property is defined in the LAST (active) class
    const lastClassKey = `${lastClassId}:${breakpoint}:${state}:${property}`;
    if (styles[lastClassKey]) {
      const lastClassName = styleSources[lastClassId]?.name || lastClassId;
      return { 
        color: '#3b82f6', // Blue for active (defined on last class)
        source: `Active in Class ${lastClassIndex + 1} (.${lastClassName})`,
        isEditable: true 
      };
    }

    // Check if property is inherited from previous classes
    for (let i = lastClassIndex - 1; i >= 0; i--) {
      const classId = styleSourceIds[i];
      const key = `${classId}:${breakpoint}:${state}:${property}`;
      if (styles[key]) {
        const className = styleSources[classId]?.name || classId;
        return { 
          color: '#ea9005', // Orange for inherited - can be overridden in last class
          source: `Inherited from Class ${i + 1} (.${className}) - click to override in Class ${lastClassIndex + 1}`,
          isEditable: true
        };
      }
    }

    // Not set in any class - can be defined in last class
    return { 
      color: '#999', 
      source: `Not set - click to define in Class ${lastClassIndex + 1}`, 
      isEditable: true 
    };
  };

  const parseValue = (value: string): { num: number; unit: string } => {
    const match = value.match(/^(-?\d+(?:\.\d+)?)(px|rem|em|%|vh|vw)?$/);
    if (match) {
      return { num: parseFloat(match[1]), unit: match[2] || 'px' };
    }
    return { num: 0, unit: 'px' };
  };

  const handleMouseDown = (e: React.MouseEvent, property: string, currentValue: string) => {
    // Only handle left click
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
      
      // Start drag if moved more than 5px in any direction
      if (!dragInitiated && (deltaX > 5 || deltaY > 5)) {
        dragInitiated = true;
        
        // Remove initial listeners
        document.removeEventListener('mousemove', handleInitialMouseMove);
        document.removeEventListener('mouseup', handleInitialMouseUp);
        
        // Set drag state which will trigger the global drag handler
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
      
      // If it was a quick click without movement, open popover
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
    
    // Initial listeners to detect click vs drag
    document.addEventListener('mousemove', handleInitialMouseMove);
    document.addEventListener('mouseup', handleInitialMouseUp);
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
      const isMargin = editingProperty.property.startsWith('margin');
      const shouldLinkAll = (isMargin && isMarginLinked) || (!isMargin && isPaddingLinked) || isShiftPressed;
      
      // If chainlink is active or Shift is pressed, update all sides
      if (shouldLinkAll) {
        const propertyType = isMargin ? 'margin' : 'padding';
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        
        sides.forEach(side => {
          onUpdate(`${propertyType}${side}`, `${editingProperty.value}${editingProperty.unit}`);
        });
      } else {
        onUpdate(editingProperty.property, `${editingProperty.value}${editingProperty.unit}`);
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
    const inputRef = useRef<HTMLDivElement>(null);
    const propertyState = getPropertyState(property);
    
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
                  display: 'inline-block', 
                  cursor: isDragging ? 'ns-resize' : 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{
                  padding: '2px 6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: propertyState.color,
                  userSelect: 'none',
                  minWidth: '28px',
                  textAlign: 'center',
                  transition: 'color 0.3s ease, background-color 0.3s ease, transform 0.15s ease',
                  textDecoration: isHovered && !isDragging && !isOpen ? 'underline' : 'none',
                  backgroundColor: isDragging 
                    ? `${propertyState.color}15` 
                    : isHovered && !isOpen 
                    ? `${propertyState.color}0a` 
                    : 'transparent',
                  borderRadius: '2px',
                  transform: isHovered && !isDragging && !isOpen ? 'scale(1.05)' : 'scale(1)',
                }}>
                  {value || '0'}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              <div className="font-medium">{getPropertyLabel(property)}</div>
              <div className="text-muted-foreground">{propertyState.source}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Popover rendered separately */}
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
                    type="number"
                    value={editingProperty?.value || '0'}
                    onChange={(e) => handlePopoverValueChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    autoFocus
                  />
                  <Select
                    value={editingProperty?.unit || 'px'}
                    onValueChange={handlePopoverUnitChange}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
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

  // Determine link icon color based on active class
  const linkIconColor = activeClassIndex === 0 ? '#3b82f6' : activeClassIndex !== null ? '#3b82f6' : '#999';

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      padding: '12px',
    }}>
      {/* SVG Background with Margin and Padding Visual */}
      <svg width="100%" height="120" viewBox="0 0 216 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        {/* Margin Area (Outer Box with Diagonal Pattern) */}
        <mask id="mask0" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="0" y="0" width="216" height="120">
          <path d="M212 0H4C1.79 0 0 1.79 0 4V116C0 118.21 1.79 120 4 120H212C214.21 120 216 118.21 216 116V4C216 1.79 214.21 0 212 0Z" fill="white"/>
        </mask>
        <g mask="url(#mask0)">
          <path d="M216 0H0L81.5 60H134.5L216 0Z" fill="#F8F8F8"/>
          <path d="M216 120L134.5 60L216 0V120Z" fill="#F1F3F5"/>
          <path d="M216 120H0L81.5 60H134.5L216 120Z" fill="#F8F8F8"/>
          <path d="M0 0L81.5 60L0 120V0Z" fill="#F1F3F5"/>
        </g>
        <rect x="0.5" y="0.5" width="215" height="119" rx="3.5" stroke="#E6E6E6"/>
        
        {/* Padding Area (Inner Box) */}
        <rect x="37.5" y="28.5" width="141" height="63" rx="3.5" fill="#F5F5F5" stroke="#E6E6E6"/>
        <mask id="mask1" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="40" y="31" width="136" height="58">
          <path d="M175 31H41C40.45 31 40 31.45 40 32V88C40 88.55 40.45 89 41 89H175C175.55 89 176 88.55 176 88V32C176 31.45 175.55 31 175 31Z" fill="white"/>
        </mask>
        <g mask="url(#mask1)">
          <path d="M216 0H0L81.5 60H134.5L216 0Z" fill="#FCFCFC"/>
          <path d="M216 120L134.5 60L216 0V120Z" fill="#F8F8F8"/>
          <path d="M216 120H0L81.5 60H134.5L216 120Z" fill="#FCFCFC"/>
          <path d="M0 0L81.5 60L0 120V0Z" fill="#F8F8F8"/>
        </g>
        
        {/* Content Box (Center) */}
        <rect x="88.5" y="50.5" width="39" height="19" rx="2.5" fill="#FAFAFA" stroke="#E6E6E6"/>
      </svg>

      {/* Interactive Spacing Inputs Overlaid on SVG */}
      <div style={{ position: 'relative', width: '100%', height: '120px' }}>
        {/* MARGIN Label with Chainlink - Inside outer box */}
        <div style={{ 
          position: 'absolute', 
          top: '8px', 
          left: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ 
            fontSize: '9px',
            fontWeight: 600,
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>MARGIN</span>
          <button
            onClick={() => setIsMarginLinked(!isMarginLinked)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: isMarginLinked ? linkIconColor : '#999',
              transition: 'color 0.2s'
            }}
            title={isMarginLinked ? "Unlink margins" : "Link all margins"}
          >
            {isMarginLinked ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
          </button>
        </div>

        {/* PADDING Label with Chainlink - Inside inner box */}
        <div style={{ 
          position: 'absolute', 
          top: '32px', 
          left: '45px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span style={{ 
            fontSize: '9px',
            fontWeight: 600,
            color: '#999',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>PADDING</span>
          <button
            onClick={() => setIsPaddingLinked(!isPaddingLinked)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: isPaddingLinked ? linkIconColor : '#999',
              transition: 'color 0.2s'
            }}
            title={isPaddingLinked ? "Unlink paddings" : "Link all paddings"}
          >
            {isPaddingLinked ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
          </button>
        </div>

        {/* Margin Top - Centered on top side */}
        <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)' }}>
          {renderSpacingInput('marginTop', marginTop)}
        </div>

        {/* Margin Right - Centered on right side */}
        <div style={{ position: 'absolute', top: '50%', right: '6px', transform: 'translateY(-50%)' }}>
          {renderSpacingInput('marginRight', marginRight)}
        </div>

        {/* Margin Bottom - Centered on bottom side */}
        <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)' }}>
          {renderSpacingInput('marginBottom', marginBottom)}
        </div>

        {/* Margin Left - Centered on left side */}
        <div style={{ position: 'absolute', top: '50%', left: '6px', transform: 'translateY(-50%)' }}>
          {renderSpacingInput('marginLeft', marginLeft)}
        </div>

        {/* Padding Top - Centered on top side of inner box */}
        <div style={{ position: 'absolute', top: '32px', left: '50%', transform: 'translateX(-50%)' }}>
          {renderSpacingInput('paddingTop', paddingTop)}
        </div>

        {/* Padding Right - Centered on right side of inner box */}
        <div style={{ position: 'absolute', top: '50%', right: '44px', transform: 'translateY(-50%)' }}>
          {renderSpacingInput('paddingRight', paddingRight)}
        </div>

        {/* Padding Bottom - Centered on bottom side of inner box */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)' }}>
          {renderSpacingInput('paddingBottom', paddingBottom)}
        </div>

        {/* Padding Left - Centered on left side of inner box */}
        <div style={{ position: 'absolute', top: '50%', left: '44px', transform: 'translateY(-50%)' }}>
          {renderSpacingInput('paddingLeft', paddingLeft)}
        </div>
      </div>
    </div>
  );
};