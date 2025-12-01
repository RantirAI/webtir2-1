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
      data-instance-id={instanceId}
      htmlFor={htmlFor}
      className={className || undefined}
      style={style}
    >
      <EditableText
        value={text}
        onChange={handleTextChange}
        as="span"
      />
      {required && <span style={{ color: 'hsl(var(--destructive))', marginLeft: '4px' }}>*</span>}
    </label>
  );
};
