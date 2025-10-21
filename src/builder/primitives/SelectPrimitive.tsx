import React from 'react';
import { useBuilderStore } from '../store/useBuilderStore';

interface SelectOption {
  id: string;
  label: string;
  value: string;
}

interface SelectPrimitiveProps {
  instanceId: string;
  options?: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const SelectPrimitive: React.FC<SelectPrimitiveProps> = ({
  instanceId,
  options = [
    { id: '1', label: 'Option 1', value: 'option1' },
    { id: '2', label: 'Option 2', value: 'option2' },
    { id: '3', label: 'Option 3', value: 'option3' },
  ],
  placeholder = 'Select an option...',
  required = false,
  disabled = false,
  className = '',
  style = {},
}) => {
  return (
    <select
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={style}
      defaultValue=""
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.id} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
