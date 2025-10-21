import React from 'react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';

interface InputLabelPrimitiveProps {
  instanceId: string;
  text?: string;
  htmlFor?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const InputLabelPrimitive: React.FC<InputLabelPrimitiveProps> = ({
  instanceId,
  text = 'Label',
  htmlFor = '',
  required = false,
  className = '',
  style = {},
}) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);

  const handleTextChange = (newValue: string) => {
    updateInstance(instanceId, { props: { text: newValue, htmlFor, required } });
  };

  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-foreground ${className}`}
      style={style}
    >
      <EditableText
        value={text}
        onChange={handleTextChange}
        as="span"
      />
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );
};
