import React from 'react';
import { EditableText } from '../components/EditableText';
import { useBuilderStore } from '../store/useBuilderStore';

interface FormPrimitiveProps {
  instanceId: string;
  fields?: Array<{ label: string; type: string; placeholder: string }>;
  buttonText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const FormPrimitive: React.FC<FormPrimitiveProps> = ({
  instanceId,
  fields = [
    { label: 'Name', type: 'text', placeholder: 'Enter your name' },
    { label: 'Email', type: 'email', placeholder: 'Enter your email' },
    { label: 'Message', type: 'textarea', placeholder: 'Enter your message' },
  ],
  buttonText = 'Submit',
  className = '',
  style = {},
}) => {
  const updateInstance = useBuilderStore((state) => state.updateInstance);

  const handleFieldLabelChange = (index: number, newLabel: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], label: newLabel };
    updateInstance(instanceId, { props: { fields: newFields, buttonText } });
  };

  const handleButtonTextChange = (newText: string) => {
    updateInstance(instanceId, { props: { fields, buttonText: newText } });
  };

  return (
    <form 
      className={`space-y-4 ${className}`}
      style={style}
      onSubmit={(e) => e.preventDefault()}
    >
      {fields.map((field, index) => (
        <div key={index} className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            <EditableText
              value={field.label}
              onChange={(newValue) => handleFieldLabelChange(index, newValue)}
              as="span"
            />
          </label>
          {field.type === 'textarea' ? (
            <textarea
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
            />
          ) : (
            <input
              type={field.type}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
      >
        <EditableText
          value={buttonText}
          onChange={handleButtonTextChange}
          as="span"
        />
      </button>
    </form>
  );
};
