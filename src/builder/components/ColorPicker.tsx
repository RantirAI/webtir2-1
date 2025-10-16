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
  
  const parsed = parseColorValue(value || '#3B82F6');
  const [r, setR] = useState(parsed?.r || 59);
  const [g, setG] = useState(parsed?.g || 130);
  const [b, setB] = useState(parsed?.b || 246);
  const [alpha, setAlpha] = useState((parsed?.a || 1) * 100);
  
  const hsl = parsed ? rgbToHsl(parsed.r, parsed.g, parsed.b) : { h: 217, s: 91, l: 60 };
  const [h, setH] = useState(hsl.h);
  const [s, setS] = useState(hsl.s);
  const [l, setL] = useState(hsl.l);
  
  const [isDraggingPicker, setIsDraggingPicker] = useState(false);
  const [isDraggingHue, setIsDraggingHue] = useState(false);
  const [isDraggingAlpha, setIsDraggingAlpha] = useState(false);
  
  // Store original values for cancel functionality
  const [originalColor, setOriginalColor] = useState(value);
  
  // Track temporary color state (live preview)
  const [tempR, setTempR] = useState(r);
  const [tempG, setTempG] = useState(g);
  const [tempB, setTempB] = useState(b);
  const [tempAlpha, setTempAlpha] = useState(alpha);
  const [tempH, setTempH] = useState(h);
  const [tempS, setTempS] = useState(s);
  const [tempL, setTempL] = useState(l);
  
  useEffect(() => {
    const parsed = parseColorValue(value || '#3B82F6');
    if (parsed) {
      setR(parsed.r);
      setG(parsed.g);
      setB(parsed.b);
      setAlpha(parsed.a * 100);
      setTempR(parsed.r);
      setTempG(parsed.g);
      setTempB(parsed.b);
      setTempAlpha(parsed.a * 100);
      const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
      setH(hsl.h);
      setS(hsl.s);
      setL(hsl.l);
      setTempH(hsl.h);
      setTempS(hsl.s);
      setTempL(hsl.l);
    }
  }, [value]);
  
  // Store original color when opening picker
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setOriginalColor(value);
      // Initialize temp values
      setTempR(r);
      setTempG(g);
      setTempB(b);
      setTempAlpha(alpha);
      setTempH(h);
      setTempS(s);
      setTempL(l);
    }
    setOpen(isOpen);
  };
  
  const handleConfirm = () => {
    // Apply the temporary color
    const a = tempAlpha / 100;
    onChange(`rgba(${tempR}, ${tempG}, ${tempB}, ${a})`);
    
    // Update main state
    setR(tempR);
    setG(tempG);
    setB(tempB);
    setAlpha(tempAlpha);
    setH(tempH);
    setS(tempS);
    setL(tempL);
    
    setOpen(false);
  };
  
  const handleCancel = () => {
    // Revert to original color
    if (originalColor) {
      onChange(originalColor);
      const parsed = parseColorValue(originalColor);
      if (parsed) {
        setR(parsed.r);
        setG(parsed.g);
        setB(parsed.b);
        setAlpha(parsed.a * 100);
        setTempR(parsed.r);
        setTempG(parsed.g);
        setTempB(parsed.b);
        setTempAlpha(parsed.a * 100);
        const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
        setH(hsl.h);
        setS(hsl.s);
        setL(hsl.l);
        setTempH(hsl.h);
        setTempS(hsl.s);
        setTempL(hsl.l);
      }
    }
    setOpen(false);
  };
  
  // Mouse move handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPicker && pickerRef.current) {
        const rect = pickerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
        const newS = (x / rect.width) * 100;
        const newL = 100 - (y / rect.height) * 100;
        updateFromHsl(tempH, newS, newL, tempAlpha, true);
      } else if (isDraggingHue && hueRef.current) {
        const rect = hueRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newH = (x / rect.width) * 360;
        updateFromHsl(newH, tempS, tempL, tempAlpha, true);
      } else if (isDraggingAlpha && alphaRef.current) {
        const rect = alphaRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const newAlpha = (x / rect.width) * 100;
        updateFromHsl(tempH, tempS, tempL, newAlpha, true);
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
  }, [isDraggingPicker, isDraggingHue, isDraggingAlpha, tempH, tempS, tempL, tempAlpha]);
  
  const updateFromRgb = (newR: number, newG: number, newB: number, newAlpha: number, liveUpdate: boolean = true) => {
    setTempR(newR);
    setTempG(newG);
    setTempB(newB);
    setTempAlpha(newAlpha);
    
    const hsl = rgbToHsl(newR, newG, newB);
    setTempH(hsl.h);
    setTempS(hsl.s);
    setTempL(hsl.l);
    
    if (liveUpdate) {
      const a = newAlpha / 100;
      onChange(`rgba(${newR}, ${newG}, ${newB}, ${a})`);
    }
  };
  
  const updateFromHsl = (newH: number, newS: number, newL: number, newAlpha: number, liveUpdate: boolean = true) => {
    setTempH(newH);
    setTempS(newS);
    setTempL(newL);
    setTempAlpha(newAlpha);
    
    const rgb = hslToRgb(newH, newS, newL);
    setTempR(rgb.r);
    setTempG(rgb.g);
    setTempB(rgb.b);
    
    if (liveUpdate) {
      const a = newAlpha / 100;
      onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`);
    }
  };
  
  const currentColor = `rgba(${tempR}, ${tempG}, ${tempB}, ${tempAlpha / 100})`;
  const hex = rgbToHex(tempR, tempG, tempB);
  const hueColor = `hsl(${tempH}, 100%, 50%)`;
  
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
  
  const handleTokenClick = (tokenValue: string) => {
    // Update temp state with token color for preview
    const parsed = parseColorValue(tokenValue);
    if (parsed) {
      setTempR(parsed.r);
      setTempG(parsed.g);
      setTempB(parsed.b);
      setTempAlpha(parsed.a * 100);
      const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
      setTempH(hsl.h);
      setTempS(hsl.s);
      setTempL(hsl.l);
      
      // Live preview
      onChange(tokenValue);
    }
    // Don't close the modal - let user confirm or cancel
  };
  
  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
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
        className="w-64 p-3 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95" 
        align="start" 
        style={{ zIndex: 9999 }}
        onPointerDownOutside={(e) => {
          // Prevent closing during drag operations
          if (isDraggingPicker || isDraggingHue || isDraggingAlpha) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing when clicking inside the popover
          if (isDraggingPicker || isDraggingHue || isDraggingAlpha) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={handleCancel}
      >
        {/* 2D Color Picker */}
        <div
          ref={pickerRef}
          className="relative w-full h-40 rounded border border-border cursor-crosshair mb-3"
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
              updateFromHsl(tempH, newS, newL, tempAlpha);
            }
            setIsDraggingPicker(true);
          }}
        >
          {/* Picker cursor */}
          <div
            className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
            style={{
              left: `${tempS}%`,
              top: `${100 - tempL}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(0,0,0,0.3)',
            }}
          />
        </div>
        
        {/* Hue Slider */}
        <div className="mb-3">
          <div
            ref={hueRef}
            className="relative w-full h-3 rounded cursor-pointer"
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
                updateFromHsl(newH, tempS, tempL, tempAlpha);
              }
              setIsDraggingHue(true);
            }}
          >
            {/* Hue cursor */}
            <div
              className="absolute w-3 h-5 border-2 border-white rounded shadow-lg pointer-events-none"
              style={{
                left: `${(tempH / 360) * 100}%`,
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
            className="relative w-full h-3 rounded cursor-pointer border border-border"
            style={{
              background: `
                linear-gradient(to right, transparent, ${rgbToHex(tempR, tempG, tempB)}),
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
                updateFromHsl(tempH, tempS, tempL, newAlpha);
              }
              setIsDraggingAlpha(true);
            }}
          >
            {/* Alpha cursor */}
            <div
              className="absolute w-3 h-5 border-2 border-white rounded shadow-lg pointer-events-none"
              style={{
                left: `${tempAlpha}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: currentColor,
              }}
            />
          </div>
        </div>
        
        {/* Hex input and percentage */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <input
              type="text"
              value={hex}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  if (val.length === 7) {
                    const parsed = parseColorValue(val);
                    if (parsed) {
                      updateFromRgb(parsed.r, parsed.g, parsed.b, tempAlpha);
                    }
                  }
                }
              }}
              className="w-full h-7 px-2 text-xs border border-border rounded bg-background text-center font-mono uppercase"
              placeholder="#000000"
            />
          </div>
          <div className="flex-shrink-0 w-12">
            <input
              type="number"
              min="0"
              max="100"
              value={Math.round(tempAlpha)}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                updateFromHsl(tempH, tempS, tempL, val);
              }}
              className="w-full h-7 px-1 text-xs border border-border rounded bg-background text-center"
            />
          </div>
          <span className="text-xs text-muted-foreground">%</span>
        </div>
        
        {/* Color tokens */}
        <div className="pt-2 border-t border-border">
          <div className="text-[10px] text-muted-foreground mb-1.5">Variables</div>
          <div className="space-y-0.5">
            {tokens.map((token) => (
              <button
                key={token.name}
                onClick={() => handleTokenClick(token.value)}
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
            onClick={handleCancel}
            className="flex-1 h-7 px-2 text-xs border border-border rounded bg-background hover:bg-accent transition-colors flex items-center justify-center gap-1"
          >
            <span>✕</span>
            <span>Cancel</span>
          </button>
          <button
            onClick={handleConfirm}
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