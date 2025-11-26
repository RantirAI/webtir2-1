import React from 'react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';

interface CheckboxPrimitiveProps {
  instanceId: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CheckboxPrimitive: React.FC<CheckboxPrimitiveProps> = ({
  instanceId,
  label = 'Checkbox label',
  required = false,
  disabled = false,
  className = '',
  style = {},
}) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);

  const handleLabelChange = (newValue: string) => {
    updateInstance(instanceId, { props: { label: newValue, required, disabled } });
  };

  return (
    <label 
      data-instance-id={instanceId}
      className={`flex items-center gap-2 cursor-pointer ${className}`} 
      style={style}
    >
      <input
        type="checkbox"
        required={required}
        disabled={disabled}
        className="w-4 h-4 rounded border border-primary text-primary focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <span className="text-sm text-foreground">
        <EditableText
          value={label}
          onChange={handleLabelChange}
          as="span"
        />
        {required && <span className="text-destructive ml-1">*</span>}
      </span>
    </label>
  );
};
