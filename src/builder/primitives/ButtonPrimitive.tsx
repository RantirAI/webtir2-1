import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, ExternalLink, Download, Plus, Minus, Check, X, LucideIcon } from 'lucide-react';

interface ButtonPrimitiveProps {
  instance: ComponentInstance;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
  dataBindingProps?: Record<string, any>;
}

// Icon mapping for button icons
const iconMap: Record<string, LucideIcon> = {
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'external-link': ExternalLink,
  'download': Download,
  'plus': Plus,
  'minus': Minus,
  'check': Check,
  'x': X,
};

export const ButtonPrimitive: React.FC<ButtonPrimitiveProps> = ({
  instance,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isPreviewMode,
  dataBindingProps = {},
}) => {
  // Extract non-style dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  // Get props
  const buttonText = instance.props.children || instance.props.text || 'Button';
  const buttonVariant = instance.props.variant || 'primary';
  const href = instance.props.href || instance.props.url || '';
  const target = instance.props.target || '_self';
  const iconLeft = instance.props.iconLeft || '';
  const iconRight = instance.props.iconRight || '';

  // Get class names from style sources
  const className = (instance.styleSourceIds || [])
    .map((id) => useStyleStore.getState().styleSources[id]?.name)
    .filter(Boolean)
    .join(' ');

  // Render icon component
  const renderIcon = (iconName: string, position: 'left' | 'right') => {
    if (!iconName) return null;
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return (
      <IconComponent 
        size={14} 
        className={position === 'left' ? 'mr-1.5' : 'ml-1.5'} 
      />
    );
  };

  // Button content
  const buttonContent = (
    <>
      {renderIcon(iconLeft, 'left')}
      <span>{buttonText}</span>
      {renderIcon(iconRight, 'right')}
    </>
  );

  // Common props for both button and anchor
  const commonProps = {
    'data-instance-id': instance.id,
    'data-variant': buttonVariant,
    className,
    style: { 
      position: 'relative' as const, 
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...dataBindingStyle 
    },
    onMouseEnter: isPreviewMode ? undefined : (e: React.MouseEvent) => {
      e.stopPropagation();
      onHover?.();
    },
    onMouseLeave: isPreviewMode ? undefined : (e: React.MouseEvent) => {
      e.stopPropagation();
      onHoverEnd?.();
    },
    onContextMenu: isPreviewMode ? undefined : onContextMenu,
    ...restDataBindingProps,
  };

  // If there's a URL and in preview mode, render as anchor
  if (href && isPreviewMode) {
    return (
      <a
        {...commonProps}
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      >
        {buttonContent}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button
      {...commonProps}
      onClick={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect?.();
      }}
    >
      {buttonContent}
    </button>
  );
};
