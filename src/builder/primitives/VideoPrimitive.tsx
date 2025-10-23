import React from 'react';

interface VideoPrimitiveProps {
  instanceId: string;
  src?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
}

export const VideoPrimitive: React.FC<VideoPrimitiveProps> = ({
  instanceId,
  src,
  autoplay = false,
  loop = false,
  muted = true,
  controls = true,
  className = '',
  style = {},
  isSelected = false,
}) => {
  return (
    <video
      data-instance-id={instanceId}
      src={src || 'https://www.w3schools.com/html/mov_bbb.mp4'}
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      controls={controls}
      className={className}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
        ...style,
      }}
    />
  );
};
