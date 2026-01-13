import React from 'react';
import { icons } from 'lucide-react';

interface IconPrimitiveProps {
  name?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const IconPrimitive: React.FC<IconPrimitiveProps> = ({
  name = 'Circle',
  size = 24,
  color,
  strokeWidth = 2,
  className,
  style,
}) => {
  // Get the icon component from lucide-react icons map
  const IconComponent = icons[name as keyof typeof icons];
  
  if (!IconComponent) {
    // Fallback to Circle if icon not found
    const FallbackIcon = icons.Circle;
    return (
      <FallbackIcon 
        size={size} 
        color={color} 
        strokeWidth={strokeWidth}
        className={className}
        style={style}
      />
    );
  }
  
  return (
    <IconComponent 
      size={size} 
      color={color} 
      strokeWidth={strokeWidth}
      className={className}
      style={style}
    />
  );
};

export default IconPrimitive;
