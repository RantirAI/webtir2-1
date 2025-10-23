import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UnitInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  units?: string[];
  style?: React.CSSProperties;
}

export const UnitInput: React.FC<UnitInputProps> = ({
  value = '',
  onChange,
  placeholder = '0',
  className = '',
  units = ['px', 'rem', 'em', '%', 'vw', 'vh'],
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverValue, setPopoverValue] = useState('');
  const [popoverUnit, setPopoverUnit] = useState('px');

  // Extract numeric value and unit from input
  const parseValue = (val: string) => {
    const match = val.match(/^(-?\d*\.?\d+)(.*)$/);
    if (match) {
      return { number: match[1], unit: match[2] || 'px' };
    }
    return { number: '', unit: 'px' };
  };

  const { number, unit } = parseValue(value);

  const handleInputClick = () => {
    setPopoverValue(number);
    setPopoverUnit(unit);
    setIsOpen(true);
  };

  const handlePopoverValueChange = (newValue: string) => {
    setPopoverValue(newValue);
  };

  const handlePopoverUnitChange = (newUnit: string) => {
    setPopoverUnit(newUnit);
    // Apply immediately when unit changes
    onChange(popoverValue ? `${popoverValue}${newUnit}` : '');
  };

  const handlePopoverClose = () => {
    if (isOpen) {
      onChange(popoverValue ? `${popoverValue}${popoverUnit}` : '');
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onChange(popoverValue ? `${popoverValue}${popoverUnit}` : '');
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className={`flex gap-0.5 ${className}`} style={{ alignItems: 'center', ...style }}>
          <input
            type="text"
            className="Input flex-1 cursor-pointer"
            placeholder={placeholder}
            value={number}
            onClick={handleInputClick}
            readOnly
            style={{ 
              minWidth: '32px',
              maxWidth: '60px',
              height: '24px',
              fontSize: '11px',
              padding: '0 4px',
              textAlign: 'center',
            }}
          />
          <Select value={unit} onValueChange={(newUnit) => onChange(number ? `${number}${newUnit}` : '')}>
            <SelectTrigger className="w-9 h-6 text-[9px] border-border px-0.5 bg-[#F5F5F5] dark:bg-[#09090b] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[50px] bg-background z-[9999]" align="end" side="bottom" sideOffset={2}>
              {units.map((u) => (
                <SelectItem key={u} value={u} className="text-[10px] py-0.5">
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3 bg-background border border-border z-[9999]" 
        onInteractOutside={handlePopoverClose}
        onEscapeKeyDown={handlePopoverClose}
      >
        <div className="space-y-2">
          <Label className="text-xs font-medium">Enter Value</Label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              value={popoverValue}
              onChange={(e) => handlePopoverValueChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              autoFocus
            />
            <Select value={popoverUnit} onValueChange={handlePopoverUnitChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background z-[99999]">
                {units.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
