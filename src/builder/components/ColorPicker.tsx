import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseColorValue, rgbToHex, rgbToHsl, hslToRgb } from '../utils/normalization';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const alphaRef = useRef<HTMLDivElement>(null);
  
  // Original color stored when modal opens
  const [originalColor, setOriginalColor] = useState(value);
  
  // Working state - only used while modal is open
  const [workingR, setWorkingR] = useState(0);
  const [workingG, setWorkingG] = useState(0);
  const [workingB, setWorkingB] = useState(0);
  const [workingAlpha, setWorkingAlpha] = useState(100);
  const [workingH, setWorkingH] = useState(0);
  const [workingS, setWorkingS] = useState(0);
  const [workingL, setWorkingL] = useState(0);
  
  const [isDraggingPicker, setIsDraggingPicker] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingAlpha, setIsDraggingAlpha] = useState(false);
  
  // Initialize working state when opening
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOriginalColor(value);
      const parsed = parseColorValue(value || '#3B82F6');
      if (parsed) {
        setWorkingR(parsed.r);
        setWorkingG(parsed.g);
        setWorkingB(parsed.b);
        setWorkingAlpha(parsed.a * 100);
        const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
        setWorkingH(hsl.h);
        setWorkingS(hsl.s);
        setWorkingL(hsl.l);
      }
    }
    setOpen(isOpen);
  };
  
  const handleConfirm = () => {
    // Only update parent on confirm
    // Output pure color (hex) when alpha is 100%, otherwise rgba
    const a = workingAlpha / 100;
    if (a >= 1) {
      // Full opacity - output pure hex color (no alpha)
      onChange(rgbToHex(workingR, workingG, workingB));
    } else {
      // Partial opacity - output rgba
      onChange(`rgba(${workingR}, ${workingG}, ${workingB}, ${a.toFixed(2)})`);
    }
    setOpen(false);
  };
  
  const handleCancel = () => {
    // Don't change anything, just close
    setOpen(false);
  };
  
  // Mouse move handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPicker && pickerRef.current) {
        const rect = pickerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        const newS = (x / rect.width) * 100;
        const newL = 100 - (y / rect.height) * 100;
        updateFromHsl(workingH, newS, newL, workingAlpha);
      } else if (isDraggingHue && hueRef.current) {
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newH = (x / rect.width) * 360;
        updateFromHsl(newH, workingS, workingL, workingAlpha);
      } else if (isDraggingAlpha && alphaRef.current) {
        const rect = alphaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newAlpha = (x / rect.width) * 100;
        updateFromHsl(workingH, workingS, workingL, newAlpha);
      }
    };
    
    const handleMouseUp = () => {
      setIsDraggingPicker(false);
      setIsDraggingHue(false);
      setIsDraggingAlpha(false);
    };
    
    if (isDraggingPicker || isDraggingHue || isDraggingAlpha) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDraggingPicker, isDraggingHue, isDraggingAlpha, workingH, workingS, workingL, workingAlpha]);
  
  const updateFromRgb = (newR: number, newG: number, newB: number, newAlpha: number) => {
    setWorkingR(newR);
    setWorkingG(newG);
    setWorkingB(newB);
    setWorkingAlpha(newAlpha);
    
    const hsl = rgbToHsl(newR, newG, newB);
    setWorkingH(hsl.h);
    setWorkingS(hsl.s);
    setWorkingL(hsl.l);
  };
  
  const updateFromHsl = (newH: number, newS: number, newL: number, newAlpha: number) => {
    setWorkingH(newH);
    setWorkingS(newS);
    setWorkingL(newL);
    setWorkingAlpha(newAlpha);
    
    const rgb = hslToRgb(newH, newS, newL);
    setWorkingR(rgb.r);
    setWorkingG(rgb.g);
    setWorkingB(rgb.b);
  };
  
  const currentColor = `rgba(${workingR}, ${workingG}, ${workingB}, ${workingAlpha / 100})`;
  const hex = rgbToHex(workingR, workingG, workingB);
  const hueColor = `hsl(${workingH}, 100%, 50%)`;
  
  // Common color tokens
  const tokens = [
    { name: 'Primary', hex: '#3B82F6', value: 'hsl(var(--primary))' },
    { name: 'Secondary', hex: '#10B981', value: 'hsl(var(--secondary))' },
    { name: 'Accent', hex: '#8B5CF6', value: 'hsl(var(--accent))' },
    { name: 'Muted', hex: '#9CA3AF', value: 'hsl(var(--muted))' },
    { name: 'Foreground', hex: '#000000', value: 'hsl(var(--foreground))' },
    { name: 'Background', hex: '#FFFFFF', value: 'hsl(var(--background))' },
    { name: 'Border', hex: '#E5E7EB', value: 'hsl(var(--border))' },
    { name: 'Destructive', hex: '#EF4444', value: 'hsl(var(--destructive))' },
  ];
  
  const handleTokenClick = (tokenHex: string) => {
    const parsed = parseColorValue(tokenHex);
    if (parsed) {
      updateFromRgb(parsed.r, parsed.g, parsed.b, workingAlpha);
    }
  };
  
  const handleHexInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow typing incomplete hex values
    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
      // Only parse when complete
      if (val.length === 7) {
        const parsed = parseColorValue(val);
        if (parsed) {
          updateFromRgb(parsed.r, parsed.g, parsed.b, workingAlpha);
        }
      }
    }
  };
  
  const handleAlphaInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty or partial input
    if (val === '') return;
    const numVal = parseInt(val);
    if (!isNaN(numVal)) {
      const clampedVal = Math.max(0, Math.min(100, numVal));
      updateFromHsl(workingH, workingS, workingL, clampedVal);
    }
  };
  
  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={true}>
      <PopoverTrigger asChild>
        <button
          className={`relative w-5 h-5 rounded border border-border cursor-pointer overflow-hidden ${className || ''}`}
          style={{
            background: `
              linear-gradient(45deg, #ccc 25%, transparent 25%),
              linear-gradient(-45deg, #ccc 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #ccc 75%),
              linear-gradient(-45deg, transparent 75%, #ccc 75%)
            `,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: value }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 animate-in fade-in-0 zoom-in-95 duration-200" 
        align="start" 
        side="right"
        sideOffset={5}
        style={{ zIndex: 9999 }}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          // Only close if not dragging and not clicking inside inputs
          if (isDraggingPicker || isDraggingHue || isDraggingAlpha) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent accidental closure during interactions
          if (isDraggingPicker || isDraggingHue || isDraggingAlpha) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={handleCancel}
      >
        {/* 2D Color Picker */}
        <div
          ref={pickerRef}
          className="relative w-full h-40 rounded border border-border cursor-crosshair mb-3 select-none"
          style={{
            background: `
              linear-gradient(to top, #000, transparent),
              linear-gradient(to right, #fff, ${hueColor})
            `,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const rect = pickerRef.current?.getBoundingClientRect();
            if (rect) {
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
              const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
              const newS = (x / rect.width) * 100;
              const newL = 100 - (y / rect.height) * 100;
              updateFromHsl(workingH, newS, newL, workingAlpha);
            }
            setIsDraggingPicker(true);
          }}
        >
          {/* Picker cursor */}
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${workingS}%`,
              top: `${100 - workingL}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)',
            }}
          />
        </div>
        
        {/* Hue Slider */}
        <div className="mb-3">
          <div
            ref={hueRef}
            className="relative w-full h-3 rounded cursor-pointer select-none"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = hueRef.current?.getBoundingClientRect();
              if (rect) {
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const newH = (x / rect.width) * 360;
                updateFromHsl(newH, workingS, workingL, workingAlpha);
              }
              setIsDraggingHue(true);
            }}
          >
            {/* Hue cursor */}
            <div
              className="absolute w-3 h-5 border-2 border-white rounded shadow-lg pointer-events-none"
              style={{
                left: `${(workingH / 360) * 100}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: hueColor,
              }}
            />
          </div>
        </div>
        
        {/* Alpha Slider */}
        <div className="mb-3">
          <div
            ref={alphaRef}
            className="relative w-full h-3 rounded cursor-pointer border border-border select-none"
            style={{
              background: `
                linear-gradient(to right, transparent, ${rgbToHex(workingR, workingG, workingB)}),
                linear-gradient(45deg, #ccc 25%, transparent 25%),
                linear-gradient(-45deg, #ccc 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #ccc 75%),
                linear-gradient(-45deg, transparent 75%, #ccc 75%)
              `,
              backgroundSize: 'cover, 8px 8px, 8px 8px, 8px 8px, 8px 8px',
              backgroundPosition: 'center, 0 0, 0 4px, 4px -4px, -4px 0px',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = alphaRef.current?.getBoundingClientRect();
              if (rect) {
                const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                const newAlpha = (x / rect.width) * 100;
                updateFromHsl(workingH, workingS, workingL, newAlpha);
              }
              setIsDraggingAlpha(true);
            }}
          >
            {/* Alpha cursor */}
            <div
              className="absolute w-3 h-5 border-2 border-white rounded shadow-lg pointer-events-none"
              style={{
                left: `${workingAlpha}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: currentColor,
              }}
            />
          </div>
        </div>
        
        {/* Hex input and alpha percentage */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <div className="text-[9px] text-muted-foreground mb-0.5">HEX</div>
            <input
              type="text"
              value={hex}
              onChange={handleHexInput}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="w-full h-7 px-2 text-xs border border-border rounded bg-background text-center font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="#000000"
            />
          </div>
          <div className="flex-shrink-0 w-20">
            <div className="text-[9px] text-muted-foreground mb-0.5">Alpha</div>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(workingAlpha)}
                onChange={handleAlphaInput}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-12 h-7 px-2 text-xs border border-border rounded-l bg-background text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="h-7 px-2 flex items-center text-xs text-muted-foreground bg-muted border border-l-0 border-border rounded-r">%</span>
            </div>
          </div>
        </div>
        
        {/* Alpha info message */}
        {workingAlpha < 100 && (
          <div className="text-[9px] text-amber-600 dark:text-amber-400 mb-2 px-1">
            Color will include alpha transparency. For element opacity, use the Effects → Opacity slider.
          </div>
        )}
        
        {/* Color tokens */}
        <div className="pt-2 border-t border-border">
          <div className="text-[10px] text-muted-foreground mb-1.5">Variables</div>
          <div className="space-y-0.5">
            {tokens.map((token) => (
              <button
                key={token.name}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTokenClick(token.hex);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-accent transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded border border-border flex-shrink-0"
                  style={{ backgroundColor: token.hex }}
                />
                <span className="text-[10px] text-foreground flex-1 truncate">{token.name}</span>
                <span className="text-[9px] text-muted-foreground font-mono">{token.hex}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Confirm/Cancel buttons */}
        <div className="flex gap-2 pt-2 border-t border-border mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1 h-7 px-2 text-xs border border-border rounded bg-background hover:bg-accent transition-colors flex items-center justify-center gap-1"
          >
            <span>✕</span>
            <span>Cancel</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleConfirm();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1 h-7 px-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
          >
            <span>✓</span>
            <span>Confirm</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};