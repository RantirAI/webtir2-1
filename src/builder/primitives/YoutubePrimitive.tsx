import React from 'react';

interface YoutubePrimitiveProps {
  instanceId: string;
  videoId?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  style?: React.CSSProperties;
  isSelected?: boolean;
}

export const YoutubePrimitive: React.FC<YoutubePrimitiveProps> = ({
  instanceId,
  videoId = 'dQw4w9WgXcQ',
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  className = '',
  style = {},
  isSelected = false,
}) => {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    loop: loop ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: controls ? '1' : '0',
    playlist: loop ? videoId : '',
  });

  return (
    <div
      data-instance-id={instanceId}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        ...style,
      }}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?${params.toString()}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </div>
  );
};
