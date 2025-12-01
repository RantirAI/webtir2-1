import React from 'react';

interface RulerOverlayProps {
  width: number;
  zoom: number;
}

export const RulerOverlay: React.FC<RulerOverlayProps> = ({ width, zoom }) => {
  const scale = zoom / 100;
  const tickInterval = 100; // Major ticks every 100px
  const minorTickInterval = 10; // Minor ticks every 10px
  const rulerHeight = 24;
  const sideRulerWidth = 24;

  // Calculate visible range based on width
  const visibleWidth = Math.ceil(width / tickInterval) * tickInterval + tickInterval;
  const visibleHeight = 2000; // Approximate page height

  // Generate ticks for horizontal ruler
  const horizontalTicks = [];
  for (let i = 0; i <= visibleWidth; i += minorTickInterval) {
    const isMajor = i % tickInterval === 0;
    horizontalTicks.push(
      <div
        key={`h-${i}`}
        className="absolute bottom-0"
        style={{
          left: `${i * scale}px`,
          width: '1px',
          height: isMajor ? '12px' : '6px',
          backgroundColor: isMajor ? 'hsl(var(--foreground) / 0.6)' : 'hsl(var(--foreground) / 0.3)',
        }}
      >
        {isMajor && (
          <span 
            className="absolute text-[9px] font-mono text-foreground/60"
            style={{ 
              top: '-12px', 
              left: '2px',
              transform: 'none',
            }}
          >
            {i}
          </span>
        )}
      </div>
    );
  }

  // Generate ticks for vertical ruler
  const verticalTicks = [];
  for (let i = 0; i <= visibleHeight; i += minorTickInterval) {
    const isMajor = i % tickInterval === 0;
    verticalTicks.push(
      <div
        key={`v-${i}`}
        className="absolute right-0"
        style={{
          top: `${i * scale}px`,
          height: '1px',
          width: isMajor ? '12px' : '6px',
          backgroundColor: isMajor ? 'hsl(var(--foreground) / 0.6)' : 'hsl(var(--foreground) / 0.3)',
        }}
      >
        {isMajor && (
          <span 
            className="absolute text-[9px] font-mono text-foreground/60"
            style={{ 
              left: '-20px', 
              top: '2px',
              transform: 'rotate(-90deg)',
              transformOrigin: 'right center',
            }}
          >
            {i}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Horizontal Ruler */}
      <div 
        className="absolute top-0 left-0 right-0 bg-background border-b border-border z-[70]"
        style={{ 
          height: `${rulerHeight}px`,
          marginLeft: `${sideRulerWidth}px`,
        }}
      >
        <div className="relative h-full overflow-hidden">
          {horizontalTicks}
        </div>
      </div>

      {/* Vertical Ruler */}
      <div 
        className="absolute top-0 left-0 bottom-0 bg-background border-r border-border z-[70]"
        style={{ 
          width: `${sideRulerWidth}px`,
          marginTop: `${rulerHeight}px`,
        }}
      >
        <div className="relative w-full overflow-hidden">
          {verticalTicks}
        </div>
      </div>

      {/* Corner Square */}
      <div 
        className="absolute top-0 left-0 bg-background border-r border-b border-border z-[71]"
        style={{ 
          width: `${sideRulerWidth}px`,
          height: `${rulerHeight}px`,
        }}
      />
    </>
  );
};
