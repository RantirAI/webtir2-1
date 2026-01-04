import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Trash2, RotateCcw, RotateCw, ImageOff } from 'lucide-react';
import { ColorPicker } from './ColorPicker';

interface GradientStop {
  color: string;
  position: number; // 0-100
}

interface GradientPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

type GradientType = 'linear' | 'radial' | 'conic' | 'none';

export const GradientPicker: React.FC<GradientPickerProps> = ({ value, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [gradientType, setGradientType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(180);
  const [stops, setStops] = useState<GradientStop[]>([
    { color: '#000000', position: 0 },
    { color: '#ffffff', position: 100 },
  ]);
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Parse existing gradient value
  useEffect(() => {
    if (!value || value === 'none') {
      setGradientType('none');
      return;
    }
    
    // Parse linear-gradient
    const linearMatch = value.match(/linear-gradient\((\d+)deg,\s*(.+)\)/);
    if (linearMatch) {
      setGradientType('linear');
      setAngle(parseInt(linearMatch[1]));
      parseStops(linearMatch[2]);
      return;
    }
    
    // Parse radial-gradient
    const radialMatch = value.match(/radial-gradient\((.+)\)/);
    if (radialMatch) {
      setGradientType('radial');
      parseStops(radialMatch[1]);
      return;
    }
    
    // Parse conic-gradient
    const conicMatch = value.match(/conic-gradient\(from\s*(\d+)deg,\s*(.+)\)/);
    if (conicMatch) {
      setGradientType('conic');
      setAngle(parseInt(conicMatch[1]));
      parseStops(conicMatch[2]);
      return;
    }
  }, [value, open]);
  
  const parseStops = (stopsStr: string) => {
    const stopRegex = /(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgba?\([^)]+\)|[a-z]+)\s*(\d+)?%?/g;
    const matches = [...stopsStr.matchAll(stopRegex)];
    if (matches.length >= 2) {
      const parsedStops: GradientStop[] = matches.map((match, i) => ({
        color: match[1],
        position: match[2] ? parseInt(match[2]) : (i / (matches.length - 1)) * 100,
      }));
      setStops(parsedStops);
    }
  };
  
  const generateGradient = () => {
    if (gradientType === 'none') return 'none';
    
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
    
    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${angle}deg, ${stopsStr})`;
      case 'radial':
        return `radial-gradient(circle, ${stopsStr})`;
      case 'conic':
        return `conic-gradient(from ${angle}deg, ${stopsStr})`;
      default:
        return 'none';
    }
  };
  
  const handleApply = () => {
    onChange(generateGradient());
  };
  
  const addStop = () => {
    const midPosition = stops.length > 0 
      ? (stops[0].position + stops[stops.length - 1].position) / 2 
      : 50;
    setStops([...stops, { color: '#888888', position: midPosition }]);
    setSelectedStopIndex(stops.length);
  };
  
  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
    if (selectedStopIndex >= newStops.length) {
      setSelectedStopIndex(newStops.length - 1);
    }
  };
  
  const updateStopColor = (index: number, color: string) => {
    const newStops = [...stops];
    newStops[index].color = color;
    setStops(newStops);
  };
  
  const handleSliderMouseDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setSelectedStopIndex(index);
    setIsDragging(true);
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const position = Math.round((x / rect.width) * 100);
      
      const newStops = [...stops];
      newStops[selectedStopIndex].position = position;
      setStops(newStops);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, selectedStopIndex, stops]);
  
  const previewGradient = generateGradient();
  
  const typeButtons: { type: GradientType; icon: React.ReactNode; label: string }[] = [
    { type: 'none', icon: <ImageOff className="w-3.5 h-3.5" />, label: 'None' },
    { type: 'linear', icon: <div className="w-3.5 h-3.5 bg-gradient-to-r from-muted-foreground to-transparent rounded-sm" />, label: 'Linear' },
    { type: 'radial', icon: <div className="w-3.5 h-3.5 rounded-full bg-[radial-gradient(circle,_hsl(var(--muted-foreground))_0%,_transparent_70%)]" />, label: 'Radial' },
    { type: 'conic', icon: <div className="w-3.5 h-3.5 rounded-full bg-[conic-gradient(hsl(var(--muted-foreground)),_transparent)]" />, label: 'Conic' },
  ];
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`relative w-5 h-5 rounded border border-border cursor-pointer overflow-hidden ${className || ''}`}
          style={{
            background: value && value !== 'none' 
              ? value 
              : `linear-gradient(45deg, #ccc 25%, transparent 25%),
                 linear-gradient(-45deg, #ccc 25%, transparent 25%),
                 linear-gradient(45deg, transparent 75%, #ccc 75%),
                 linear-gradient(-45deg, transparent 75%, #ccc 75%)`,
            backgroundSize: value && value !== 'none' ? 'cover' : '8px 8px',
            backgroundPosition: value && value !== 'none' ? 'center' : '0 0, 0 4px, 4px -4px, -4px 0px',
          }}
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-3 animate-in fade-in-0 zoom-in-95 duration-200" 
        align="start" 
        side="right"
        sideOffset={5}
        style={{ zIndex: 9999 }}
      >
        {/* Gradient Type Selection */}
        <div className="mb-3">
          <div className="text-[10px] text-muted-foreground mb-1.5">Type</div>
          <div className="flex gap-1">
            {typeButtons.map(({ type, icon, label }) => (
              <button
                key={type}
                onClick={() => setGradientType(type)}
                className={`flex-1 h-8 flex items-center justify-center gap-1.5 rounded border text-xs transition-colors ${
                  gradientType === type 
                    ? 'bg-accent border-primary text-foreground' 
                    : 'bg-background border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
                title={label}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        
        {gradientType !== 'none' && (
          <>
            {/* Angle Control */}
            {(gradientType === 'linear' || gradientType === 'conic') && (
              <div className="mb-3">
                <div className="text-[10px] text-muted-foreground mb-1.5">Angle</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAngle((prev) => (prev - 45 + 360) % 360)}
                    className="p-1.5 rounded border border-border hover:bg-accent"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value))}
                    className="flex-1 h-2 accent-primary"
                  />
                  <button
                    onClick={() => setAngle((prev) => (prev + 45) % 360)}
                    className="p-1.5 rounded border border-border hover:bg-accent"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={angle}
                    onChange={(e) => setAngle(parseInt(e.target.value) || 0)}
                    className="w-14 h-7 px-2 text-xs border border-border rounded bg-background text-center"
                  />
                  <span className="text-[10px] text-muted-foreground">DEG</span>
                </div>
              </div>
            )}
            
            {/* Gradient Slider */}
            <div className="mb-3">
              <div className="text-[10px] text-muted-foreground mb-1.5">Stops</div>
              <div
                ref={sliderRef}
                className="relative h-4 rounded border border-border cursor-pointer"
                style={{ background: previewGradient !== 'none' ? previewGradient : '#888' }}
              >
                {stops.map((stop, index) => (
                  <div
                    key={index}
                    className={`absolute top-0 w-3 h-6 -translate-x-1/2 cursor-grab ${
                      selectedStopIndex === index ? 'z-10' : 'z-0'
                    }`}
                    style={{ left: `${stop.position}%` }}
                    onMouseDown={(e) => handleSliderMouseDown(e, index)}
                  >
                    <div
                      className={`w-full h-4 rounded border-2 ${
                        selectedStopIndex === index ? 'border-primary' : 'border-white'
                      } shadow`}
                      style={{ backgroundColor: stop.color }}
                    />
                    <div 
                      className={`w-0 h-0 mx-auto border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent ${
                        selectedStopIndex === index ? 'border-t-primary' : 'border-t-white'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Selected Stop Color */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[10px] text-muted-foreground">Color</div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={addStop}
                    className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                    title="Add stop"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  {stops.length > 2 && (
                    <button
                      onClick={() => removeStop(selectedStopIndex)}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                      title="Remove stop"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={stops[selectedStopIndex]?.color || '#000000'}
                  onChange={(color) => updateStopColor(selectedStopIndex, color)}
                />
                <span className="text-[9px] text-muted-foreground font-mono">
                  {stops[selectedStopIndex]?.color || '#000000'}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stops[selectedStopIndex]?.position || 0}
                    onChange={(e) => {
                      const newStops = [...stops];
                      newStops[selectedStopIndex].position = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                      setStops(newStops);
                    }}
                    className="w-12 h-6 px-1 text-[10px] border border-border rounded bg-background text-center"
                  />
                  <span className="text-[10px] text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div className="mb-3">
              <div className="text-[10px] text-muted-foreground mb-1.5">Preview</div>
              <div 
                className="h-16 rounded border border-border"
                style={{ background: previewGradient }}
              />
            </div>
          </>
        )}
        
        {/* Apply Button */}
        <button
          onClick={() => {
            handleApply();
            setOpen(false);
          }}
          className="w-full h-7 px-2 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          Apply Gradient
        </button>
      </PopoverContent>
    </Popover>
  );
};