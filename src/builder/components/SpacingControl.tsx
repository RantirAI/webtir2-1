import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
}) => {
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
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

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      
      const deltaY = dragState.startY - e.clientY;
      const speed = Math.abs(deltaY) > 20 ? 5 : 1;
      const change = Math.sign(deltaY) * speed;
      const newValue = Math.max(0, dragState.startValue + Math.round(deltaY / (speed === 5 ? 2 : 1)));
      
      // If Shift is pressed, update all sides of margin or padding
      if (e.shiftKey) {
        const isMargin = dragState.property.startsWith('margin');
        const propertyType = isMargin ? 'margin' : 'padding';
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        
        sides.forEach(side => {
          onUpdate(`${propertyType}${side}`, `${newValue}${dragState.unit}`);
        });
      } else {
        onUpdate(dragState.property, `${newValue}${dragState.unit}`);
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ns-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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
    e.preventDefault();
    e.stopPropagation();
    const { num, unit } = parseValue(currentValue);
    
    let dragStarted = false;
    let hasMoved = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const startTime = Date.now();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = Math.abs(moveEvent.clientX - startX);
      const deltaY = Math.abs(moveEvent.clientY - startY);
      
      // Track if mouse has moved at all
      if (deltaX > 0 || deltaY > 0) {
        hasMoved = true;
      }
      
      // Start drag if moved more than 5px vertically
      if (!dragStarted && deltaY > 5) {
        dragStarted = true;
        setDragState({
          isDragging: true,
          property,
          startY: moveEvent.clientY,
          startValue: num,
          unit,
        });
      }
    };
    
    const handleMouseUp = () => {
      const endTime = Date.now();
      const timeDiff = endTime - startTime;
      
      // If it was a quick click without significant movement, open popover
      if (!dragStarted && timeDiff < 300 && !hasMoved) {
        setEditingProperty({
          property,
          value: num.toString(),
          unit,
        });
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Removed - input changes are now handled only through popover or drag


  const handlePopoverValueChange = (value: string) => {
    if (editingProperty) {
      setEditingProperty({ ...editingProperty, value });
    }
  };

  const handlePopoverUnitChange = (unit: string) => {
    if (editingProperty) {
      setEditingProperty({ ...editingProperty, unit });
      
      // If Shift is pressed, update all sides
      if (isShiftPressed) {
        const isMargin = editingProperty.property.startsWith('margin');
        const propertyType = isMargin ? 'margin' : 'padding';
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        
        sides.forEach(side => {
          onUpdate(`${propertyType}${side}`, `${editingProperty.value}${unit}`);
        });
      } else {
        onUpdate(editingProperty.property, `${editingProperty.value}${unit}`);
      }
    }
  };

  const handlePopoverClose = () => {
    if (editingProperty) {
      // If Shift is pressed, update all sides
      if (isShiftPressed) {
        const isMargin = editingProperty.property.startsWith('margin');
        const propertyType = isMargin ? 'margin' : 'padding';
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        
        sides.forEach(side => {
          onUpdate(`${propertyType}${side}`, `${editingProperty.value}${editingProperty.unit}`);
        });
      } else {
        onUpdate(editingProperty.property, `${editingProperty.value}${editingProperty.unit}`);
      }
      setEditingProperty(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && editingProperty) {
      // If Shift is pressed, update all sides
      if (e.shiftKey) {
        const isMargin = editingProperty.property.startsWith('margin');
        const propertyType = isMargin ? 'margin' : 'padding';
        const sides = ['Top', 'Right', 'Bottom', 'Left'];
        
        sides.forEach(side => {
          onUpdate(`${propertyType}${side}`, `${editingProperty.value}${editingProperty.unit}`);
        });
      } else {
        onUpdate(editingProperty.property, `${editingProperty.value}${editingProperty.unit}`);
      }
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

  const renderSpacingInput = (property: string, value: string, customStyle?: React.CSSProperties) => {
    const isOpen = editingProperty?.property === property;
    const isDragging = dragState?.property === property && dragState?.isDragging;
    
    return (
      <Popover 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open && editingProperty?.property === property) {
            handlePopoverClose();
          }
        }}
        modal={false}
      >
        <PopoverTrigger asChild>
          <div
            onMouseDown={(e) => {
              // Only handle if not already dragging something else
              if (!dragState?.isDragging || dragState?.property === property) {
                handleMouseDown(e, property, value);
              }
            }}
            style={{ 
              display: 'inline-block', 
              cursor: isDragging ? 'ns-resize' : 'ns-resize',
              position: 'relative'
            }}
          >
            <input
              type="text"
              value={value || '0'}
              readOnly
              style={{ ...inputStyle, ...customStyle, pointerEvents: 'none' }}
              className="spacing-input"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-64 p-4 z-[10000] bg-background border shadow-md pointer-events-auto" 
          align="start"
          onInteractOutside={(e) => {
            // Prevent closing when clicking inside
            e.preventDefault();
          }}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{getPropertyLabel(property)}</Label>
              {isShiftPressed && (
                <span className="text-xs text-muted-foreground">All sides</span>
              )}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                value={editingProperty?.value || '0'}
                onChange={(e) => handlePopoverValueChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 pointer-events-auto"
                autoFocus
              />
              <Select
                value={editingProperty?.unit || 'px'}
                onValueChange={handlePopoverUnitChange}
              >
                <SelectTrigger className="w-20 pointer-events-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10001] bg-background pointer-events-auto">
                  <SelectItem value="px">PX</SelectItem>
                  <SelectItem value="rem">REM</SelectItem>
                  <SelectItem value="em">EM</SelectItem>
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="vh">VH</SelectItem>
                  <SelectItem value="vw">VW</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Hold Shift to change all {property.startsWith('margin') ? 'margins' : 'paddings'}
            </p>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const getAreaStyle = (area: string) => {
    const isDragging = dragState?.property === area;
    
    return {
      backgroundColor: isDragging ? 'rgba(243, 156, 18, 0.1)' : 'transparent',
      transition: 'background-color 0.15s ease',
    };
  };

  const inputStyle = {
    width: '40px',
    height: '18px',
    textAlign: 'center' as const,
    fontSize: '11px',
    fontWeight: 500,
    background: 'transparent',
    border: 'none',
    borderRadius: '2px',
    cursor: 'ns-resize',
    userSelect: 'none' as const,
    color: '#F39C12',
    transition: 'background-color 0.15s ease',
    outline: 'none',
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '3px',
      padding: '8px',
    }}>
      {/* Margin Label */}
      <div style={{
        position: 'absolute',
        top: '6px',
        left: '6px',
        fontSize: '10px',
        color: '#999',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        fontWeight: 600
      }}>
        MARGIN
      </div>

      {/* Margin Area */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '12px' }}>
        {/* Top Margin */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '2px',
            ...getAreaStyle('marginTop')
          }}
        >
          {renderSpacingInput('marginTop', marginTop)}
        </div>

        {/* Middle Row: Left Margin + Padding Box + Right Margin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {/* Left Margin */}
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '2px',
              ...getAreaStyle('marginLeft')
            }}
          >
            {renderSpacingInput('marginLeft', marginLeft)}
          </div>

          {/* Padding Box */}
          <div style={{
            flex: 1,
            border: '1px solid #e5e5e5',
            borderRadius: '2px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            background: '#fff',
            position: 'relative'
          }}>
            {/* Padding Label */}
            <div style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              fontSize: '10px',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600
            }}>
              PADDING
            </div>

            <div style={{ paddingTop: '10px', width: '100%' }}>
              {/* Top Padding */}
              <div 
                style={{ 
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '2px',
                  borderRadius: '2px',
                  ...getAreaStyle('paddingTop')
                }}
              >
                {renderSpacingInput('paddingTop', paddingTop)}
              </div>

              {/* Left and Right Padding */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', width: '100%', margin: '2px 0' }}>
                <div 
                  style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '2px',
                    borderRadius: '2px',
                    ...getAreaStyle('paddingLeft')
                  }}
                >
                  {renderSpacingInput('paddingLeft', paddingLeft)}
                </div>
                
                <div style={{ 
                  width: '20px', 
                  height: '20px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '2px',
                  background: '#fafafa'
                }} />
                
                <div 
                  style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '2px',
                    borderRadius: '2px',
                    ...getAreaStyle('paddingRight')
                  }}
                >
                  {renderSpacingInput('paddingRight', paddingRight)}
                </div>
              </div>

              {/* Bottom Padding */}
              <div 
                style={{ 
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '2px',
                  borderRadius: '2px',
                  ...getAreaStyle('paddingBottom')
                }}
              >
                {renderSpacingInput('paddingBottom', paddingBottom)}
              </div>
            </div>
          </div>

          {/* Right Margin */}
          <div 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              borderRadius: '2px',
              ...getAreaStyle('marginRight')
            }}
          >
            {renderSpacingInput('marginRight', marginRight)}
          </div>
        </div>

        {/* Bottom Margin */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: '2px',
            borderRadius: '2px',
            ...getAreaStyle('marginBottom')
          }}
        >
          {renderSpacingInput('marginBottom', marginBottom)}
        </div>
      </div>

      <style>{`
        .spacing-input {
          cursor: ns-resize !important;
        }
        
        .spacing-input:hover {
          background: rgba(243, 156, 18, 0.12) !important;
          border-radius: 2px;
        }
        
        .dark .spacing-input {
          color: #F39C12 !important;
        }
      `}</style>
    </div>
  );
};
