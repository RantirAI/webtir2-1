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

  useEffect(() => {
    if (!dragState?.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      
      // Calculate change based on vertical mouse movement
      // Moving up (negative clientY change) increases value
      // Moving down (positive clientY change) decreases value
      const deltaY = dragState.startY - e.clientY;
      const change = Math.round(deltaY);
      const newValue = Math.max(0, dragState.startValue + change);
      
      onUpdate(dragState.property, `${newValue}${dragState.unit}`);
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection during drag
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
    const { num, unit } = parseValue(currentValue);
    setDragState({
      isDragging: true,
      property,
      startY: e.clientY,
      startValue: num,
      unit,
    });
  };

  // Removed - input changes are now handled only through popover or drag

  const handleInputClick = (e: React.MouseEvent, property: string, currentValue: string) => {
    e.stopPropagation();
    const { num, unit } = parseValue(currentValue);
    setEditingProperty({
      property,
      value: num.toString(),
      unit,
    });
  };

  const handlePopoverValueChange = (value: string) => {
    if (editingProperty) {
      setEditingProperty({ ...editingProperty, value });
    }
  };

  const handlePopoverUnitChange = (unit: string) => {
    if (editingProperty) {
      setEditingProperty({ ...editingProperty, unit });
      onUpdate(editingProperty.property, `${editingProperty.value}${unit}`);
    }
  };

  const handlePopoverClose = () => {
    if (editingProperty) {
      onUpdate(editingProperty.property, `${editingProperty.value}${editingProperty.unit}`);
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
    
    return (
      <Popover open={isOpen} onOpenChange={(open) => {
        if (!open && editingProperty?.property === property) {
          handlePopoverClose();
        }
      }}>
        <PopoverTrigger asChild>
          <input
            type="text"
            value={value || '0'}
            readOnly
            onMouseDown={(e) => handleMouseDown(e, property, value)}
            onClick={(e) => handleInputClick(e, property, value)}
            style={{ ...inputStyle, ...customStyle }}
            className="spacing-input"
          />
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-3">
            <Label className="text-sm font-medium">{getPropertyLabel(property)}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={editingProperty?.value || '0'}
                onChange={(e) => handlePopoverValueChange(e.target.value)}
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
                <SelectContent>
                  <SelectItem value="px">PX</SelectItem>
                  <SelectItem value="rem">REM</SelectItem>
                  <SelectItem value="em">EM</SelectItem>
                  <SelectItem value="%">%</SelectItem>
                  <SelectItem value="vh">VH</SelectItem>
                  <SelectItem value="vw">VW</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const getAreaStyle = (area: string) => {
    const isHovered = hoveredArea === area;
    const isDragging = dragState?.property === area;
    
    return {
      backgroundColor: isHovered || isDragging 
        ? 'rgba(59, 130, 246, 0.1)' 
        : 'transparent',
      transition: 'background-color 0.15s ease',
    };
  };

  const inputStyle = {
    width: '48px',
    height: '24px',
    textAlign: 'center' as const,
    fontSize: '11px',
    background: '#F5F5F5',
    border: '1px solid hsl(var(--border))',
    borderRadius: '4px',
    cursor: 'ns-resize',
    userSelect: 'none' as const,
    color: 'hsl(var(--foreground))',
  };

  const darkInputStyle = {
    ...inputStyle,
    background: '#09090b',
    color: '#ffffff',
  };

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      background: 'hsl(var(--muted) / 0.1)',
      border: '1px solid hsl(var(--border))',
      borderRadius: '4px',
      padding: 'var(--space-4)',
      minHeight: '160px'
    }}>
      {/* Margin Label */}
      <div style={{
        position: 'absolute',
        top: '4px',
        left: '4px',
        fontSize: '8px',
        color: 'hsl(var(--muted-foreground))',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontWeight: 600
      }}>
        MARGIN
      </div>

      {/* Margin Area */}
      <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {/* Top Margin */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: 'var(--space-1)',
            ...getAreaStyle('marginTop')
          }}
          onMouseEnter={() => setHoveredArea('marginTop')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          {renderSpacingInput('marginTop', marginTop)}
        </div>

        {/* Middle Row: Left Margin + Padding Box + Right Margin */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Left Margin */}
          <div 
            style={{ 
              display: 'flex',
              padding: 'var(--space-1)',
              ...getAreaStyle('marginLeft')
            }}
            onMouseEnter={() => setHoveredArea('marginLeft')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            {renderSpacingInput('marginLeft', marginLeft)}
          </div>

          {/* Padding Box */}
          <div style={{
            flex: 1,
            border: '1px solid hsl(var(--border))',
            borderRadius: '4px',
            padding: 'var(--space-3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            minHeight: '90px',
            position: 'relative'
          }}>
            {/* Padding Label */}
            <div style={{
              fontSize: '8px',
              color: 'hsl(var(--muted-foreground))',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600
            }}>
              PADDING
            </div>

            {/* Top Padding */}
            <div 
              style={{ 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--space-1)',
                ...getAreaStyle('paddingTop')
              }}
              onMouseEnter={() => setHoveredArea('paddingTop')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              {renderSpacingInput('paddingTop', paddingTop, { width: '40px' })}
            </div>

            {/* Left and Right Padding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%' }}>
              <div 
                style={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  padding: 'var(--space-1)',
                  ...getAreaStyle('paddingLeft')
                }}
                onMouseEnter={() => setHoveredArea('paddingLeft')}
                onMouseLeave={() => setHoveredArea(null)}
              >
                {renderSpacingInput('paddingLeft', paddingLeft, { width: '40px' })}
              </div>
              
              <div style={{ flex: 1 }} />
              
              <div 
                style={{ 
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: 'var(--space-1)',
                  ...getAreaStyle('paddingRight')
                }}
                onMouseEnter={() => setHoveredArea('paddingRight')}
                onMouseLeave={() => setHoveredArea(null)}
              >
                {renderSpacingInput('paddingRight', paddingRight, { width: '40px' })}
              </div>
            </div>

            {/* Bottom Padding */}
            <div 
              style={{ 
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: 'var(--space-1)',
                ...getAreaStyle('paddingBottom')
              }}
              onMouseEnter={() => setHoveredArea('paddingBottom')}
              onMouseLeave={() => setHoveredArea(null)}
            >
              {renderSpacingInput('paddingBottom', paddingBottom, { width: '40px' })}
            </div>
          </div>

          {/* Right Margin */}
          <div 
            style={{ 
              display: 'flex',
              padding: 'var(--space-1)',
              ...getAreaStyle('marginRight')
            }}
            onMouseEnter={() => setHoveredArea('marginRight')}
            onMouseLeave={() => setHoveredArea(null)}
          >
            {renderSpacingInput('marginRight', marginRight)}
          </div>
        </div>

        {/* Bottom Margin */}
        <div 
          style={{ 
            display: 'flex', 
            justifyContent: 'center',
            padding: 'var(--space-1)',
            ...getAreaStyle('marginBottom')
          }}
          onMouseEnter={() => setHoveredArea('marginBottom')}
          onMouseLeave={() => setHoveredArea(null)}
        >
          {renderSpacingInput('marginBottom', marginBottom)}
        </div>
      </div>

      <style>{`
        .dark .spacing-input {
          background: #09090b !important;
          color: #ffffff !important;
        }
        
        .spacing-input:hover {
          background: hsl(var(--accent)) !important;
        }
        
        .spacing-input:focus {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 0;
        }
      `}</style>
    </div>
  );
};
