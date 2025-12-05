import React, { useEffect, useState } from 'react';
import { usePrebuiltStore } from '../store/usePrebuiltStore';

interface HoverOverlayProps {
  element: HTMLElement;
  instanceId?: string;
}

export const HoverOverlay: React.FC<HoverOverlayProps> = ({ element, instanceId }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const { isPrebuiltInstance } = usePrebuiltStore();
  
  const isPrebuilt = instanceId ? isPrebuiltInstance(instanceId) : false;
  const borderColor = isPrebuilt ? '#22c55e' : '#3b82f6';
  const bgColor = isPrebuilt ? 'rgba(34, 197, 94, 0.05)' : 'rgba(59, 130, 246, 0.05)';
  
  useEffect(() => {
    const updateRect = () => {
      const newRect = element.getBoundingClientRect();
      setRect(newRect);
    };
    
    updateRect();
    
    const observer = new ResizeObserver(updateRect);
    observer.observe(element);
    
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [element]);
  
  if (!rect) return null;
  
  return (
    <div
      className="fixed pointer-events-none z-[9998]"
      style={{
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      }}
    >
      {/* Dashed border */}
      <div 
        className="absolute inset-0 rounded pointer-events-none" 
        style={{
          border: `2px dashed ${borderColor}`,
          backgroundColor: bgColor,
        }}
      />
    </div>
  );
};
