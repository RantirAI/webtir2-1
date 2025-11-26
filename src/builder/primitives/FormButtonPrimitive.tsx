import React from 'react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';

interface FormButtonPrimitiveProps {
  instanceId: string;
  text?: string;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const FormButtonPrimitive: React.FC<FormButtonPrimitiveProps> = ({
  instanceId,
  text = 'Button',
  type = 'button',
  disabled = false,
  className = '',
  style = {},
}) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);

  const handleTextChange = (newValue: string) => {
    updateInstance(instanceId, { props: { text: newValue, type, disabled } });
  };

  return (
    <button
      data-instance-id={instanceId}
      type={type}
      disabled={disabled}
      className={`px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={style}
    >
      <EditableText
        value={text}
        onChange={handleTextChange}
        as="span"
      />
    </button>
  );
};
