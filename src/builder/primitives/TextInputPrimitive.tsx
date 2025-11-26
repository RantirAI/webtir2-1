import React from 'react';

interface TextInputPrimitiveProps {
  instanceId: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TextInputPrimitive: React.FC<TextInputPrimitiveProps> = ({
  instanceId,
  placeholder = 'Enter text...',
  type = 'text',
  required = false,
  disabled = false,
  className = '',
  style = {},
}) => {
  return (
    <input
      data-instance-id={instanceId}
      type={type}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={style}
    />
  );
};
