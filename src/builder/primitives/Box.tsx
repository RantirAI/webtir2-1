import React from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';
import { icons } from 'lucide-react';

interface DivProps {
  instance: ComponentInstance;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isPreviewMode?: boolean;
  dataBindingProps?: Record<string, any>;
  featureCardIcon?: string; // Icon name from parent Feature Card
}

export const Div: React.FC<DivProps> = ({
  instance,
  children,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onHoverEnd,
  onContextMenu,
  isPreviewMode,
  dataBindingProps = {},
  featureCardIcon,
}) => {
  const isRoot = instance.id === 'root';

  // Only essential inline styles - let CSS classes control all layout/sizing
  // No default background color - divs should be transparent by default
  const defaultStyles: React.CSSProperties = {
    ...(dataBindingProps.style || {}), // Apply visibility and other data binding styles
    // Add flex centering for icon containers
    ...(featureCardIcon ? { display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
  };

  const finalStyles = defaultStyles;

  const classNames = (instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ');
  
  // Extract non-style dataBindingProps
  const { style: _style, ...restDataBindingProps } = dataBindingProps;

  // Render Lucide icon if featureCardIcon is provided
  const renderIcon = () => {
    if (!featureCardIcon) return null;
    const LucideIcon = icons[featureCardIcon as keyof typeof icons];
    if (!LucideIcon) return null;
    return (
      <LucideIcon 
        size={24} 
        style={{ 
          color: 'currentColor',
          flexShrink: 0,
        }} 
      />
    );
  };
  
  return (
    <div
      data-instance-id={instance.id}
      className={classNames || undefined}
      style={finalStyles}
      onClick={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onMouseEnter={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        onHover?.();
      }}
      onMouseLeave={isPreviewMode ? undefined : (e) => {
        e.stopPropagation();
        onHoverEnd?.();
      }}
      onContextMenu={isPreviewMode ? undefined : onContextMenu}
      {...restDataBindingProps}
    >
      {featureCardIcon ? renderIcon() : children}
    </div>
  );
};
