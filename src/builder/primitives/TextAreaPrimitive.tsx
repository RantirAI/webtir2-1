import React from 'react';

interface TextAreaPrimitiveProps {
  instanceId: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TextAreaPrimitive: React.FC<TextAreaPrimitiveProps> = ({
  instanceId,
  placeholder = 'Enter text...',
  rows = 4,
  required = false,
  disabled = false,
  className = '',
  style = {},
}) => {
  return (
    <textarea
      data-instance-id={instanceId}
      placeholder={placeholder}
      rows={rows}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed resize-y ${className}`}
      style={style}
    />
  );
};
