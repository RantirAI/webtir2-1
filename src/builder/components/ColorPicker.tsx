import React, { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseColorValue, rgbToHex, rgbToHsv, hsvToRgb } from '../utils/normalization';

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
  
  // Working state using HSV (better for 2D picker)
  const [workingR, setWorkingR] = useState(0);
  const [workingG, setWorkingG] = useState(0);
  const [workingB, setWorkingB] = useState(0);
  const [workingAlpha, setWorkingAlpha] = useState(100);
  const [workingH, setWorkingH] = useState(0);
  const [workingS, setWorkingS] = useState(0);
  const [workingV, setWorkingV] = useState(100);
  
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
        const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
        setWorkingH(hsv.h);
        setWorkingS(hsv.s);
        setWorkingV(hsv.v);
      }
    }
    setOpen(isOpen);
  };
  
  const handleConfirm = () => {
    // Output pure color (hex) when alpha is 100%, otherwise rgba
    const a = workingAlpha / 100;
    if (a >= 1) {
      onChange(rgbToHex(workingR, workingG, workingB));
    } else {
      onChange(`rgba(${workingR}, ${workingG}, ${workingB}, ${a.toFixed(2)})`);
    }
    setOpen(false);
  };
  
  const handleCancel = () => {
    setOpen(false);
  };
  
  // Mouse move handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPicker && pickerRef.current) {
        const rect = pickerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        // X = Saturation (0-100), Y = Value (100-0, inverted)
        const newS = (x / rect.width) * 100;
        const newV = 100 - (y / rect.height) * 100;
        updateFromHsv(workingH, newS, newV, workingAlpha);
      } else if (isDraggingHue && hueRef.current) {
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newH = (x / rect.width) * 360;
        updateFromHsv(newH, workingS, workingV, workingAlpha);
      } else if (isDraggingAlpha && alphaRef.current) {
        const rect = alphaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newAlpha = (x / rect.width) * 100;
        updateFromHsv(workingH, workingS, workingV, newAlpha);
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
  }, [isDraggingPicker, isDraggingHue, isDraggingAlpha, workingH, workingS, workingV, workingAlpha]);
  
  const updateFromRgb = (newR: number, newG: number, newB: number, newAlpha: number) => {
    setWorkingR(newR);
    setWorkingG(newG);
    setWorkingB(newB);
    setWorkingAlpha(newAlpha);
    
    const hsv = rgbToHsv(newR, newG, newB);
    setWorkingH(hsv.h);
    setWorkingS(hsv.s);
    setWorkingV(hsv.v);
  };
  
  const updateFromHsv = (newH: number, newS: number, newV: number, newAlpha: number) => {
    setWorkingH(newH);
    setWorkingS(newS);
    setWorkingV(newV);
    setWorkingAlpha(newAlpha);
    
    const rgb = hsvToRgb(newH, newS, newV);
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
    if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
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
    if (val === '') return;
    const numVal = parseInt(val);
    if (!isNaN(numVal)) {
      const clampedVal = Math.max(0, Math.min(100, numVal));
      updateFromHsv(workingH, workingS, workingV, clampedVal);
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
          if (isDraggingPicker || isDraggingHue || isDraggingAlpha) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (isDraggingPicker || isDraggingHue || isDraggingAlpha) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={handleCancel}
      >
        {/* 2D Color Picker - HSV model: X=Saturation, Y=Value */}
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
              const newV = 100 - (y / rect.height) * 100;
              updateFromHsv(workingH, newS, newV, workingAlpha);
            }
            setIsDraggingPicker(true);
          }}
        >
          {/* Picker cursor */}
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${workingS}%`,
              top: `${100 - workingV}%`,
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
                updateFromHsv(newH, workingS, workingV, workingAlpha);
              }
              setIsDraggingHue(true);
            }}
          >
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
                updateFromHsv(workingH, workingS, workingV, newAlpha);
              }
              setIsDraggingAlpha(true);
            }}
          >
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
          <div className="flex-shrink-0">
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
                className="w-14 h-7 px-2 text-xs border border-border rounded-l bg-background text-center focus:outline-none focus:ring-2 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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