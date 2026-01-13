import React, { useState, useMemo } from 'react';
import { ComponentInstance } from '../store/types';
import { useStyleStore } from '../store/useStyleStore';

// Default fallback images
const FALLBACK_IMAGES = {
  default: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  profile: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  dashboard: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
  developer: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
};

// Check if a src is a placeholder or invalid
function isInvalidSrc(src: string | undefined): boolean {
  if (!src) return true;
  if (src.includes('PLACEHOLDER') || src.includes('placeholder')) return true;
  if (src.startsWith('IMAGE_')) return true;
  if (src === 'https://via.placeholder.com/400x300') return true;
  return false;
}

// Get appropriate fallback based on context
function getFallbackImage(alt: string | undefined): string {
  const altLower = (alt || '').toLowerCase();
  if (altLower.includes('profile') || altLower.includes('avatar') || altLower.includes('headshot') || altLower.includes('photo')) {
    return FALLBACK_IMAGES.profile;
  }
  if (altLower.includes('dashboard') || altLower.includes('product') || altLower.includes('screenshot')) {
    return FALLBACK_IMAGES.dashboard;
  }
  if (altLower.includes('developer') || altLower.includes('coding') || altLower.includes('code')) {
    return FALLBACK_IMAGES.developer;
  }
  return FALLBACK_IMAGES.default;
}

interface ImagePrimitiveProps {
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

export const ImagePrimitive: React.FC<ImagePrimitiveProps> = ({
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
  const [imgError, setImgError] = useState(false);
  
  // Extract non-style dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  // Compute the actual image source with fallback handling
  const imgSrc = useMemo(() => {
    const src = instance.props.src as string | undefined;
    const alt = instance.props.alt as string | undefined;
    
    // If src is invalid or a placeholder, use contextual fallback
    if (isInvalidSrc(src)) {
      return getFallbackImage(alt);
    }
    
    // If previous load failed, use fallback
    if (imgError) {
      return getFallbackImage(alt);
    }
    
    return src;
  }, [instance.props.src, instance.props.alt, imgError]);

  const handleError = () => {
    setImgError(true);
  };

  return (
    <img
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      src={imgSrc}
      alt={instance.props.alt || 'Image'}
      style={{ position: 'relative', ...dataBindingStyle }}
      onError={handleError}
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
    />
  );
};
