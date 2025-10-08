import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  // Extract numeric value and unit from input
  const parseValue = (val: string) => {
    const match = val.match(/^(-?\d*\.?\d+)(.*)$/);
    if (match) {
      return { number: match[1], unit: match[2] || 'px' };
    }
    return { number: '', unit: 'px' };
  };

  const { number, unit } = parseValue(value);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value;
    onChange(newNumber ? `${newNumber}${unit}` : '');
  };

  const handleUnitChange = (newUnit: string) => {
    onChange(number ? `${number}${newUnit}` : '');
  };

  return (
    <div className={`flex gap-0.5 ${className}`} style={{ alignItems: 'center', ...style }}>
      <input
        type="text"
        className="Input flex-1"
        placeholder={placeholder}
        value={number}
        onChange={handleNumberChange}
        style={{ 
          minWidth: '32px',
          maxWidth: '60px',
          height: '24px',
          fontSize: '11px',
          padding: '0 4px',
          textAlign: 'center',
        }}
      />
      <Select value={unit} onValueChange={handleUnitChange}>
        <SelectTrigger className="w-11 h-6 text-[10px] border-border px-1 bg-[#F5F5F5] dark:bg-[#09090b] text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-[60px] bg-background z-[9999]">
          {units.map((u) => (
            <SelectItem key={u} value={u} className="text-xs">
              {u}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
