import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';

interface RadioOption {
  id: string;
  label: string;
  value: string;
}

interface RadioPrimitiveProps {
  instanceId: string;
  name?: string;
  options?: RadioOption[];
  required?: boolean;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  style?: React.CSSProperties;
}

export const RadioPrimitive: React.FC<RadioPrimitiveProps> = ({
  instanceId,
  name = 'radio-group',
  options = [
    { id: '1', label: 'Option 1', value: 'option1' },
    { id: '2', label: 'Option 2', value: 'option2' },
    { id: '3', label: 'Option 3', value: 'option3' },
  ],
  required = false,
  disabled = false,
  orientation = 'vertical',
  className = '',
  style = {},
}) => {
  return (
    <div
      data-instance-id={instanceId}
      className={`${orientation === 'horizontal' ? 'flex gap-4' : 'space-y-2'} ${className}`}
      style={style}
    >
      {options.map((option) => (
        <label key={option.id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            value={option.value}
            required={required}
            disabled={disabled}
            className="w-4 h-4 border border-primary text-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-foreground">{option.label}</span>
        </label>
      ))}
    </div>
  );
};
