import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { parseColorValue, rgbToHex, rgbToHsl, hslToRgb } from '../utils/normalization';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  
  const parsed = parseColorValue(value || '#000000');
  const [r, setR] = useState(parsed?.r || 0);
  const [g, setG] = useState(parsed?.g || 0);
  const [b, setB] = useState(parsed?.b || 0);
  const [alpha, setAlpha] = useState((parsed?.a || 1) * 100);
  
  const hsl = parsed ? rgbToHsl(parsed.r, parsed.g, parsed.b) : { h: 0, s: 0, l: 0 };
  const [h, setH] = useState(hsl.h);
  const [s, setS] = useState(hsl.s);
  const [l, setL] = useState(hsl.l);
  
  useEffect(() => {
    const parsed = parseColorValue(value || '#000000');
    if (parsed) {
      setR(parsed.r);
      setG(parsed.g);
      setB(parsed.b);
      setAlpha(parsed.a * 100);
      const hsl = rgbToHsl(parsed.r, parsed.g, parsed.b);
      setH(hsl.h);
      setS(hsl.s);
      setL(hsl.l);
    }
  }, [value]);
  
  const updateFromRgb = (newR: number, newG: number, newB: number, newAlpha: number) => {
    setR(newR);
    setG(newG);
    setB(newB);
    setAlpha(newAlpha);
    
    const hsl = rgbToHsl(newR, newG, newB);
    setH(hsl.h);
    setS(hsl.s);
    setL(hsl.l);
    
    const a = newAlpha / 100;
    onChange(`rgba(${newR}, ${newG}, ${newB}, ${a})`);
  };
  
  const updateFromHsl = (newH: number, newS: number, newL: number, newAlpha: number) => {
    setH(newH);
    setS(newS);
    setL(newL);
    setAlpha(newAlpha);
    
    const rgb = hslToRgb(newH, newS, newL);
    setR(rgb.r);
    setG(rgb.g);
    setB(rgb.b);
    
    const a = newAlpha / 100;
    onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`);
  };
  
  const currentColor = `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
  const hex = rgbToHex(r, g, b);
  
  // Common color tokens - you can extend this
  const tokens = [
    { name: 'Primary', value: 'hsl(var(--primary))' },
    { name: 'Secondary', value: 'hsl(var(--secondary))' },
    { name: 'Accent', value: 'hsl(var(--accent))' },
    { name: 'Muted', value: 'hsl(var(--muted))' },
    { name: 'Destructive', value: 'hsl(var(--destructive))' },
    { name: 'Foreground', value: 'hsl(var(--foreground))' },
    { name: 'Background', value: 'hsl(var(--background))' },
  ];
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative w-8 h-8 rounded border border-border cursor-pointer overflow-hidden ${className || ''}`}
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
            style={{ backgroundColor: currentColor }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start" style={{ zIndex: 9999 }}>
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-3">
            <TabsTrigger value="hex" className="text-xs">Hex</TabsTrigger>
            <TabsTrigger value="rgb" className="text-xs">RGB</TabsTrigger>
            <TabsTrigger value="hsl" className="text-xs">HSL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hex" className="space-y-3 mt-0">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Hex</label>
              <input
                type="text"
                value={hex}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                    const parsed = parseColorValue(val);
                    if (parsed) {
                      updateFromRgb(parsed.r, parsed.g, parsed.b, alpha);
                    }
                  }
                }}
                className="w-full h-8 px-2 text-sm border border-border rounded bg-background"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Alpha: {Math.round(alpha)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={alpha}
                onChange={(e) => updateFromRgb(r, g, b, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="rgb" className="space-y-2 mt-0">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">R: {r}</label>
              <input
                type="range"
                min="0"
                max="255"
                value={r}
                onChange={(e) => updateFromRgb(parseInt(e.target.value), g, b, alpha)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">G: {g}</label>
              <input
                type="range"
                min="0"
                max="255"
                value={g}
                onChange={(e) => updateFromRgb(r, parseInt(e.target.value), b, alpha)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">B: {b}</label>
              <input
                type="range"
                min="0"
                max="255"
                value={b}
                onChange={(e) => updateFromRgb(r, g, parseInt(e.target.value), alpha)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Alpha: {Math.round(alpha)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={alpha}
                onChange={(e) => updateFromRgb(r, g, b, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="hsl" className="space-y-2 mt-0">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">H: {h}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={h}
                onChange={(e) => updateFromHsl(parseInt(e.target.value), s, l, alpha)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">S: {s}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={s}
                onChange={(e) => updateFromHsl(h, parseInt(e.target.value), l, alpha)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">L: {l}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={l}
                onChange={(e) => updateFromHsl(h, s, parseInt(e.target.value), alpha)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Alpha: {Math.round(alpha)}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={alpha}
                onChange={(e) => updateFromHsl(h, s, l, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Preview */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Preview</div>
          <div
            className="w-full h-12 rounded border border-border"
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
              className="w-full h-full rounded"
              style={{ backgroundColor: currentColor }}
            />
          </div>
        </div>
        
        {/* Quick tokens */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">Tokens</div>
          <div className="grid grid-cols-4 gap-1">
            {tokens.map((token) => (
              <button
                key={token.name}
                onClick={() => {
                  onChange(token.value);
                  setOpen(false);
                }}
                className="h-6 rounded border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: token.value }}
                title={token.name}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
