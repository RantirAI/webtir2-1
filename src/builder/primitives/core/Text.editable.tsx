/**
 * @editable-file
 * 
 * Text Primitive - Editable Layer
 * 
 * This file contains user-customizable logic for the Text primitive.
 * Safe to modify - Changes here won't break core component functionality.
 * 
 * Customization options:
 * - Custom slot renderers
 * - Additional props handling
 * - Scoped custom CSS
 * - Animation overrides
 */

import React from 'react';
import { EditableComponentProps } from './types';
import { EditableText } from '../../components/EditableText';
import { useBuilderStore } from '../../store/useBuilderStore';
import { TextCore } from './Text.core';

// @editable: custom-styles
/**
 * Custom styles that can be applied to the Text component.
 * Modify these to change the default appearance.
 */
export const textCustomStyles: React.CSSProperties = {
  // Add custom CSS properties here
  // Example: textShadow: '0 1px 2px rgba(0,0,0,0.1)',
};
// @editable-end

// @editable: custom-classname
/**
 * Custom class names to apply to the Text component.
 * These are merged with the style-system generated classes.
 */
export const textCustomClassName = '';
// @editable-end

// @editable: content-renderer
/**
 * Custom content renderer for the Text component.
 * Override this to change how text content is displayed and edited.
 */
export const renderTextContent = (
  content: string,
  onChange: (newContent: string) => void,
  isSelected?: boolean
): React.ReactNode => {
  return (
    <EditableText
      value={content}
      onChange={onChange}
      as="p"
      style={{}}
      isSelected={isSelected}
    />
  );
};
// @editable-end

// @editable: component-wrapper
/**
 * Text Editable Component
 * 
 * This wrapper provides the editable functionality around the core Text component.
 * Modify the slots and custom styles here.
 */
export const TextEditable: React.FC<EditableComponentProps> = (props) => {
  const { instance, isSelected, renderSlot } = props;
  const { updateInstance } = useBuilderStore();

  // @editable: content-handler
  const handleTextChange = (newText: string) => {
    updateInstance(instance.id, {
      props: { ...instance.props, children: newText },
    });
  };
  // @editable-end

  // @editable: slot-definitions
  const slots = {
    content: renderSlot 
      ? renderSlot('content', renderTextContent(
          instance.props.children || 'Text',
          handleTextChange,
          isSelected
        ))
      : renderTextContent(
          instance.props.children || 'Text',
          handleTextChange,
          isSelected
        ),
  };
  // @editable-end

  return (
    <TextCore
      {...props}
      content={instance.props.children || 'Text'}
      onContentChange={handleTextChange}
      slots={slots}
      customStyles={textCustomStyles}
      customClassName={textCustomClassName}
    />
  );
};
// @editable-end

export default TextEditable;
