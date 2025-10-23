import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ShadowItem } from '../store/types';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShadowManagerProps {
  shadows: ShadowItem[];
  onChange: (shadows: ShadowItem[]) => void;
}

export const ShadowManager: React.FC<ShadowManagerProps> = ({ shadows, onChange }) => {
  const [expandedShadow, setExpandedShadow] = useState<string | null>(shadows[0]?.id || null);

  const addShadow = () => {
    const newShadow: ShadowItem = {
      id: Date.now().toString(),
      enabled: true,
      inset: false,
      x: '0px',
      y: '2px',
      blur: '5px',
      spread: '0px',
      color: 'rgba(0, 0, 0, 0.2)',
    };
    onChange([...shadows, newShadow]);
    setExpandedShadow(newShadow.id);
  };

  const removeShadow = (id: string) => {
    onChange(shadows.filter(s => s.id !== id));
    if (expandedShadow === id) {
      setExpandedShadow(shadows[0]?.id || null);
    }
  };

  const updateShadow = (id: string, updates: Partial<ShadowItem>) => {
    onChange(shadows.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const parsePixelValue = (value: string): number => {
    const match = value.match(/^(-?\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const formatPixelValue = (value: number): string => `${value}px`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="Label">Box shadows</label>
        <Button
          size="sm"
          variant="ghost"
          className="h-5 w-5 p-0 text-foreground hover:text-foreground"
          onClick={addShadow}
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="space-y-1.5">
        {shadows.map((shadow, index) => (
          <div key={shadow.id} className="border border-border rounded-md overflow-hidden">
            {/* Shadow Header */}
            <div 
              className="flex items-center justify-between p-1.5 bg-muted/30 cursor-pointer hover:bg-muted/50"
              onClick={() => setExpandedShadow(expandedShadow === shadow.id ? null : shadow.id)}
            >
              <div className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={shadow.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateShadow(shadow.id, { enabled: e.target.checked });
                  }}
                  className="w-3 h-3"
                />
                <span className="text-[9px] text-foreground">
                  {shadow.inset ? 'Inner' : 'Outer'}: {shadow.x} {shadow.y} {shadow.blur}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 text-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  removeShadow(shadow.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>

            {/* Shadow Controls */}
            {expandedShadow === shadow.id && (
              <div className="p-2 space-y-2 bg-background">
                {/* Type Toggle */}
                <div className="space-y-0.5">
                  <label className="text-[9px] font-medium text-foreground">Type</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      className={`text-[9px] py-1 px-2 rounded border ${!shadow.inset ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                      onClick={() => updateShadow(shadow.id, { inset: false })}
                    >
                      Outside
                    </button>
                    <button
                      className={`text-[9px] py-1 px-2 rounded border ${shadow.inset ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border hover:bg-muted'}`}
                      onClick={() => updateShadow(shadow.id, { inset: true })}
                    >
                      Inside
                    </button>
                  </div>
                </div>

                {/* X Offset */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-medium text-foreground">X</label>
                    <Input
                      type="number"
                      value={parsePixelValue(shadow.x)}
                      onChange={(e) => updateShadow(shadow.id, { x: formatPixelValue(parseFloat(e.target.value) || 0) })}
                      className="w-12 h-5 text-[9px] px-1"
                    />
                  </div>
                  <Slider
                    value={[parsePixelValue(shadow.x)]}
                    onValueChange={([val]) => updateShadow(shadow.id, { x: formatPixelValue(val) })}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                {/* Y Offset */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-medium text-foreground">Y</label>
                    <Input
                      type="number"
                      value={parsePixelValue(shadow.y)}
                      onChange={(e) => updateShadow(shadow.id, { y: formatPixelValue(parseFloat(e.target.value) || 0) })}
                      className="w-12 h-5 text-[9px] px-1"
                    />
                  </div>
                  <Slider
                    value={[parsePixelValue(shadow.y)]}
                    onValueChange={([val]) => updateShadow(shadow.id, { y: formatPixelValue(val) })}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                {/* Blur */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-medium text-foreground">Blur</label>
                    <Input
                      type="number"
                      value={parsePixelValue(shadow.blur)}
                      onChange={(e) => updateShadow(shadow.id, { blur: formatPixelValue(parseFloat(e.target.value) || 0) })}
                      className="w-12 h-5 text-[9px] px-1"
                    />
                  </div>
                  <Slider
                    value={[parsePixelValue(shadow.blur)]}
                    onValueChange={([val]) => updateShadow(shadow.id, { blur: formatPixelValue(val) })}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Size (Spread) */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-medium text-foreground">Size</label>
                    <Input
                      type="number"
                      value={parsePixelValue(shadow.spread)}
                      onChange={(e) => updateShadow(shadow.id, { spread: formatPixelValue(parseFloat(e.target.value) || 0) })}
                      className="w-12 h-5 text-[9px] px-1"
                    />
                  </div>
                  <Slider
                    value={[parsePixelValue(shadow.spread)]}
                    onValueChange={([val]) => updateShadow(shadow.id, { spread: formatPixelValue(val) })}
                    min={-50}
                    max={50}
                    step={1}
                  />
                </div>

                {/* Color */}
                <div className="space-y-0.5">
                  <label className="text-[9px] font-medium text-foreground">Color</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={shadow.color.match(/#[0-9a-fA-F]{6}/) ? shadow.color : '#000000'}
                      onChange={(e) => {
                        const hex = e.target.value;
                        updateShadow(shadow.id, { color: `${hex}33` });
                      }}
                      className="w-5 h-5 rounded border border-border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={shadow.color}
                      onChange={(e) => updateShadow(shadow.id, { color: e.target.value })}
                      placeholder="rgba(0, 0, 0, 0.2)"
                      className="flex-1 h-5 text-[9px] px-1.5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {shadows.length === 0 && (
          <div className="text-[9px] text-muted-foreground text-center py-3">
            No shadows. Click + to add one.
          </div>
        )}
      </div>
    </div>
  );
};
