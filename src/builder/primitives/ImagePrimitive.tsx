import React, { useState, useMemo, useLayoutEffect } from 'react';
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
  const [isInNavContext, setIsInNavContext] = useState(false);
  
  // Extract non-style dataBindingProps
  const { style: dataBindingStyle, ...restDataBindingProps } = dataBindingProps;

  // Detect if the image is inside a Navigation context via DOM traversal
  useLayoutEffect(() => {
    // Use a small delay to ensure DOM is rendered
    const timer = setTimeout(() => {
      const el = document.querySelector(`[data-instance-id="${instance.id}"]`);
      if (el) {
        // Check for navigation context markers
        const navParent = el.closest('[data-nav-context="true"]') || 
                         el.closest('[data-component-label="Navigation"]') ||
                         el.closest('nav');
        setIsInNavContext(!!navParent);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [instance.id]);

  // Navigation-specific styles to prevent layout breaking
  const navStyles: React.CSSProperties = isInNavContext ? {
    maxHeight: '40px',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain' as const,
    flexShrink: 0,
  } : {};

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

  // Check if image has imported styles that define sizing
  const hasImportedStyles = useMemo(() => {
    return (instance.styleSourceIds || []).some(id => {
      const name = useStyleStore.getState().styleSources[id]?.name;
      return name?.startsWith('wf-');
    });
  }, [instance.styleSourceIds]);

  // Default image styles - minimal for imports, standard for native images
  // Note: position is NOT set here to allow CSS classes to define absolute positioning
  const defaultImageStyles: React.CSSProperties = hasImportedStyles
    ? { display: 'block' }
    : { maxWidth: '100%', height: 'auto', display: 'block' };

  return (
    <img
      data-instance-id={instance.id}
      className={(instance.styleSourceIds || []).map((id) => useStyleStore.getState().styleSources[id]?.name).filter(Boolean).join(' ')}
      src={imgSrc}
      alt={instance.props.alt || 'Image'}
      style={{ ...defaultImageStyles, ...navStyles, ...dataBindingStyle }}
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
