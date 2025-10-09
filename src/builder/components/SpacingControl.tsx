import React, { useState, useRef, useEffect } from 'react';

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

  useEffect(() => {
    if (!dragState?.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState) return;
      
      const deltaY = dragState.startY - e.clientY;
      const change = Math.round(deltaY / 2);
      const newValue = Math.max(0, dragState.startValue + change);
      
      onUpdate(dragState.property, `${newValue}${dragState.unit}`);
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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

  const handleInputChange = (property: string, value: string) => {
    onUpdate(property, value);
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
          <input
            type="text"
            value={marginTop || '0'}
            onChange={(e) => handleInputChange('marginTop', e.target.value)}
            onMouseDown={(e) => handleMouseDown(e, 'marginTop', marginTop)}
            style={inputStyle}
            className="spacing-input"
          />
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
            <input
              type="text"
              value={marginLeft || '0'}
              onChange={(e) => handleInputChange('marginLeft', e.target.value)}
              onMouseDown={(e) => handleMouseDown(e, 'marginLeft', marginLeft)}
              style={inputStyle}
              className="spacing-input"
            />
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
              <input
                type="text"
                value={paddingTop || '0'}
                onChange={(e) => handleInputChange('paddingTop', e.target.value)}
                onMouseDown={(e) => handleMouseDown(e, 'paddingTop', paddingTop)}
                style={{ ...inputStyle, width: '40px' }}
                className="spacing-input"
              />
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
                <input
                  type="text"
                  value={paddingLeft || '0'}
                  onChange={(e) => handleInputChange('paddingLeft', e.target.value)}
                  onMouseDown={(e) => handleMouseDown(e, 'paddingLeft', paddingLeft)}
                  style={{ ...inputStyle, width: '40px' }}
                  className="spacing-input"
                />
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
                <input
                  type="text"
                  value={paddingRight || '0'}
                  onChange={(e) => handleInputChange('paddingRight', e.target.value)}
                  onMouseDown={(e) => handleMouseDown(e, 'paddingRight', paddingRight)}
                  style={{ ...inputStyle, width: '40px' }}
                  className="spacing-input"
                />
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
              <input
                type="text"
                value={paddingBottom || '0'}
                onChange={(e) => handleInputChange('paddingBottom', e.target.value)}
                onMouseDown={(e) => handleMouseDown(e, 'paddingBottom', paddingBottom)}
                style={{ ...inputStyle, width: '40px' }}
                className="spacing-input"
              />
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
            <input
              type="text"
              value={marginRight || '0'}
              onChange={(e) => handleInputChange('marginRight', e.target.value)}
              onMouseDown={(e) => handleMouseDown(e, 'marginRight', marginRight)}
              style={inputStyle}
              className="spacing-input"
            />
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
          <input
            type="text"
            value={marginBottom || '0'}
            onChange={(e) => handleInputChange('marginBottom', e.target.value)}
            onMouseDown={(e) => handleMouseDown(e, 'marginBottom', marginBottom)}
            style={inputStyle}
            className="spacing-input"
          />
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
