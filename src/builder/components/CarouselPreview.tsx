import React, { useState, useEffect, useCallback, useRef } from 'react';

interface CarouselSlide {
  id: string;
  imageUrl?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  altText?: string;
  alt?: string;
  hasChildren?: boolean;
  childContent?: any[];
}

interface CarouselPreviewProps {
  slides: CarouselSlide[];
  styles: Record<string, any>;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  pauseOnHover?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  loop?: boolean;
  isPreviewMode?: boolean;
  renderInstance?: (instance: any, parent?: any, index?: number) => React.ReactNode;
  parentInstance?: any;
}

export const CarouselPreview: React.FC<CarouselPreviewProps> = ({
  slides,
  styles,
  autoPlay = false,
  autoPlayInterval = 3000,
  pauseOnHover = true,
  showArrows = true,
  showDots = true,
  loop = true,
  isPreviewMode = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const slideCount = slides.length;

  const goToNext = useCallback(() => {
    if (slideCount <= 1) return;
    setActiveIndex((prev) => {
      if (prev >= slideCount - 1) {
        return loop ? 0 : prev;
      }
      return prev + 1;
    });
  }, [slideCount, loop]);

  const goToPrev = useCallback(() => {
    if (slideCount <= 1) return;
    setActiveIndex((prev) => {
      if (prev <= 0) {
        return loop ? slideCount - 1 : prev;
      }
      return prev - 1;
    });
  }, [slideCount, loop]);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Autoplay functionality with stable ref
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up autoplay if conditions are met
    if (autoPlay && !isPaused && slideCount > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          if (prev >= slideCount - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoPlay, autoPlayInterval, isPaused, slideCount, loop]);

  // Style calculations
  const height = styles.height ? `${styles.height}${styles.heightUnit || 'px'}` : '300px';
  const borderRadius = styles.borderRadius ? `${styles.borderRadius}px` : '0';
  const transitionDuration = styles.transitionDuration || '300';
  const transitionTiming = styles.transitionTiming || 'ease';
  const effect = styles.effect || 'slide';

  // Arrow styling
  const arrowSizeMap: Record<string, number> = { small: 28, medium: 36, large: 44 };
  const arrowSize = arrowSizeMap[styles.arrowSize || 'medium'];
  const arrowStyle = styles.arrowStyle || 'circle';
  const arrowBorderRadius = arrowStyle === 'circle' ? '50%' : arrowStyle === 'square' ? '4px' : '0';

  // Dot styling
  const dotSizeMap: Record<string, { w: number; h: number }> = {
    small: { w: 6, h: 6 },
    medium: { w: 8, h: 8 },
    large: { w: 10, h: 10 },
  };
  const dotSize = dotSizeMap[styles.dotSize || 'medium'];
  const dotStyleType = styles.dotStyle || 'circle';

  // Content positioning
  const alignmentMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
  const positionMap: Record<string, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' };

  // Get slide style based on effect
  const getSlideStyle = (index: number): React.CSSProperties => {
    const isActive = index === activeIndex;
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: positionMap[styles.contentPosition || 'center'],
      alignItems: alignmentMap[styles.contentAlignment || 'center'],
      transition: `all ${transitionDuration}ms ${transitionTiming}`,
    };

    switch (effect) {
      case 'fade':
        return {
          ...baseStyle,
          opacity: isActive ? 1 : 0,
          zIndex: isActive ? 1 : 0,
        };
      case 'zoom':
        return {
          ...baseStyle,
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'scale(1)' : 'scale(1.1)',
          zIndex: isActive ? 1 : 0,
        };
      case 'flip':
        return {
          ...baseStyle,
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'rotateY(0deg)' : 'rotateY(90deg)',
          zIndex: isActive ? 1 : 0,
          backfaceVisibility: 'hidden',
        };
      case 'slide':
      default:
        return {
          ...baseStyle,
          transform: `translateX(${(index - activeIndex) * 100}%)`,
          opacity: 1,
        };
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius,
        overflow: 'hidden',
        backgroundColor: styles.backgroundColor || 'hsl(var(--muted))',
      }}
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      {/* Slides Container */}
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <div key={slide.id || index} style={getSlideStyle(index)}>
            {slide.imageUrl && (
              <img
                src={slide.imageUrl}
                alt={slide.altText || slide.title || `Slide ${index + 1}`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            {/* Overlay */}
            {styles.overlayColor && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: styles.overlayColor,
                }}
              />
            )}
            {/* Content */}
            <div
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '24px',
                textAlign: (styles.contentAlignment as React.CSSProperties['textAlign']) || 'center',
              }}
            >
              {slide.title && (
                <h3
                  style={{
                    fontSize: `${styles.titleSize || 24}px`,
                    fontWeight: styles.titleWeight || '600',
                    color: styles.titleColor || 'hsl(var(--foreground))',
                    marginBottom: '8px',
                    margin: 0,
                    marginBlockEnd: '8px',
                  }}
                >
                  {slide.title}
                </h3>
              )}
              {slide.description && (
                <p
                  style={{
                    fontSize: `${styles.subtitleSize || 14}px`,
                    color: styles.subtitleColor || 'hsl(var(--muted-foreground))',
                    marginBottom: slide.buttonText ? '16px' : '0',
                    margin: 0,
                    marginBlockEnd: slide.buttonText ? '16px' : '0',
                  }}
                >
                  {slide.description}
                </p>
              )}
              {slide.buttonText && (
                <a
                  href={isPreviewMode ? slide.buttonLink || '#' : undefined}
                  onClick={!isPreviewMode ? (e) => e.preventDefault() : undefined}
                  style={{
                    display: 'inline-block',
                    padding: '8px 20px',
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {slide.buttonText}
                </a>
              )}
            </div>
            {!slide.imageUrl && !slide.title && (
              <div style={{ color: 'hsl(var(--muted-foreground))', textAlign: 'center' }}>
                Slide {index + 1}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Arrow Controls */}
      {showArrows && arrowStyle !== 'none' && slideCount > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            style={{
              position: 'absolute',
              left: styles.arrowPosition === 'outside' ? '-48px' : '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: arrowSize,
              height: arrowSize,
              borderRadius: arrowBorderRadius,
              backgroundColor: styles.arrowBackground || 'hsl(var(--background) / 0.8)',
              color: styles.arrowColor || 'hsl(var(--foreground))',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'opacity 0.2s',
            }}
            aria-label="Previous slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            style={{
              position: 'absolute',
              right: styles.arrowPosition === 'outside' ? '-48px' : '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: arrowSize,
              height: arrowSize,
              borderRadius: arrowBorderRadius,
              backgroundColor: styles.arrowBackground || 'hsl(var(--background) / 0.8)',
              color: styles.arrowColor || 'hsl(var(--foreground))',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'opacity 0.2s',
            }}
            aria-label="Next slide"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {showDots && dotStyleType !== 'none' && slideCount > 1 && (
        <div
          style={{
            position: styles.dotPosition === 'outside' ? 'relative' : 'absolute',
            bottom: styles.dotPosition === 'top' ? 'auto' : styles.dotPosition === 'outside' ? '-24px' : '12px',
            top: styles.dotPosition === 'top' ? '12px' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            marginTop: styles.dotPosition === 'outside' ? '8px' : '0',
            zIndex: 10,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(i);
              }}
              style={{
                width: dotStyleType === 'line' || dotStyleType === 'dash' ? (dotStyleType === 'line' ? '20px' : '12px') : dotSize.w,
                height: dotStyleType === 'line' || dotStyleType === 'dash' ? '3px' : dotSize.h,
                borderRadius: dotStyleType === 'circle' ? '50%' : dotStyleType === 'square' ? '2px' : '1px',
                backgroundColor:
                  i === activeIndex
                    ? styles.dotActiveColor || 'hsl(var(--primary))'
                    : styles.dotColor || 'hsl(var(--muted-foreground) / 0.5)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {slides.length === 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'hsl(var(--muted-foreground))',
            fontStyle: 'italic',
            fontSize: '14px',
          }}
        >
          No slides. Add slides in the Data tab.
        </div>
      )}
    </div>
  );
};
