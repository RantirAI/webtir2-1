import React, { useEffect, useRef } from 'react';

interface LottiePrimitiveProps {
  instanceId: string;
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
}

export const LottiePrimitive: React.FC<LottiePrimitiveProps> = ({
  instanceId,
  src,
  autoplay = true,
  loop = true,
  className = '',
  style = {},
  isSelected = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !src) return;

    // Dynamically load lottie-web
    const loadLottie = async () => {
      try {
        const lottie = await import('lottie-web');
        
        if (animationRef.current) {
          animationRef.current.destroy();
        }

        animationRef.current = lottie.default.loadAnimation({
          container: containerRef.current!,
          renderer: 'svg',
          loop,
          autoplay,
          path: src,
        });
      } catch (error) {
        console.error('Failed to load Lottie animation:', error);
      }
    };

    loadLottie();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [src, autoplay, loop]);

  return (
    <div
      data-instance-id={instanceId}
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: 'auto',
        minHeight: '200px',
        ...style,
      }}
    />
  );
};
