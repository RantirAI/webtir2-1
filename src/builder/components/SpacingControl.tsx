import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link2, Link2Off } from 'lucide-react';

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
  isPrimaryClass?: boolean; // true for Primary (blue), false for Combo (yellow)
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
  isPrimaryClass = true, // default to primary (blue)
  isMarginLinked: externalIsMarginLinked,
  isPaddingLinked: externalIsPaddingLinked,
  onMarginLinkChange,
  onPaddingLinkChange,
}) => {
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
    
    return (
      <>
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
            ...inputStyle,
            color: isHovered && !isDragging && !isOpen ? hoverColor : baseColor,
            textDecoration: isHovered && !isDragging && !isOpen ? 'underline' : 'none',
            backgroundColor: isDragging ? activeBgColor : 'transparent',
          }}>
            {value || '0'}
          </div>
        </div>
        
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

  // Determine color based on class type
  const baseColor = isPrimaryClass ? 'rgb(59, 130, 246)' : 'rgb(234, 179, 8)'; // blue for primary, yellow for combo
  const hoverColor = isPrimaryClass ? 'rgb(37, 99, 235)' : 'rgb(202, 138, 4)'; // darker on hover
  const activeBgColor = isPrimaryClass ? 'rgba(59, 130, 246, 0.1)' : 'rgba(234, 179, 8, 0.1)';

  const inputStyle: React.CSSProperties = {
    padding: '2px 4px',
    fontSize: '11px',
    fontWeight: 500,
    color: baseColor,
    userSelect: 'none',
    minWidth: '24px',
    textAlign: 'center',
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '4px',
      padding: '12px',
    }}>
      {/* Margin Label and Chainlink */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <span style={{
          fontSize: '9px',
          color: '#999',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 600
        }}>
          MARGIN
        </span>
        <button
          onClick={() => setIsMarginLinked(!isMarginLinked)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: isMarginLinked ? baseColor : '#999',
            transition: 'color 0.2s'
          }}
          title={isMarginLinked ? "Unlink margins" : "Link all margins"}
        >
          {isMarginLinked ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
        </button>
      </div>

      {/* Margin Area */}
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '4px', 
        paddingTop: '16px' 
      }}>
        {/* Top Margin */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          padding: '4px'
        }}>
          {renderSpacingInput('marginTop', marginTop)}
        </div>

        {/* Middle Row: Left Margin + Padding Box + Right Margin */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '4px' }}>
          {/* Left Margin */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}>
            {renderSpacingInput('marginLeft', marginLeft)}
          </div>

          {/* Padding Box */}
          <div style={{
            flex: 1,
            border: '1px solid #e5e5e5',
            borderRadius: '4px',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            position: 'relative'
          }}>
            {/* Padding Label and Chainlink */}
            <div style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{
                fontSize: '9px',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: 600
              }}>
                PADDING
              </span>
              <button
                onClick={() => setIsPaddingLinked(!isPaddingLinked)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  color: isPaddingLinked ? baseColor : '#999',
                  transition: 'color 0.2s'
                }}
                title={isPaddingLinked ? "Unlink paddings" : "Link all paddings"}
              >
                {isPaddingLinked ? <Link2 className="w-3 h-3" /> : <Link2Off className="w-3 h-3" />}
              </button>
            </div>

            <div style={{ paddingTop: '14px', width: '100%' }}>
              {/* Top Padding */}
              <div style={{ 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '4px'
              }}>
                {renderSpacingInput('paddingTop', paddingTop)}
              </div>

              {/* Left and Right Padding */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '8px', 
                width: '100%', 
                margin: '4px 0' 
              }}>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '4px'
                }}>
                  {renderSpacingInput('paddingLeft', paddingLeft)}
                </div>
                
                <div style={{ 
                  width: '32px', 
                  height: '32px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '2px',
                  background: '#fafafa'
                }} />
                
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '4px'
                }}>
                  {renderSpacingInput('paddingRight', paddingRight)}
                </div>
              </div>

              {/* Bottom Padding */}
              <div style={{ 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '4px'
              }}>
                {renderSpacingInput('paddingBottom', paddingBottom)}
              </div>
            </div>
          </div>

          {/* Right Margin */}
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}>
            {renderSpacingInput('marginRight', marginRight)}
          </div>
        </div>

        {/* Bottom Margin */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          padding: '4px'
        }}>
          {renderSpacingInput('marginBottom', marginBottom)}
        </div>
      </div>
    </div>
  );
};