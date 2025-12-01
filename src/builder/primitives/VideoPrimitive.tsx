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

// Helper to detect and parse video URLs
const parseVideoUrl = (url: string): { type: 'youtube' | 'vimeo' | 'direct'; id?: string } => {
  if (!url) return { type: 'direct' };
  
  // YouTube patterns
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return { type: 'youtube', id: youtubeMatch[1] };
  }
  
  // Vimeo patterns
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return { type: 'vimeo', id: vimeoMatch[1] };
  }
  
  return { type: 'direct' };
};

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
  const videoInfo = parseVideoUrl(src || '');
  
  // YouTube embed
  if (videoInfo.type === 'youtube' && videoInfo.id) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: loop ? '1' : '0',
      mute: muted ? '1' : '0',
      controls: controls ? '1' : '0',
      playlist: loop ? videoInfo.id : '',
    });
    
    return (
      <div
        data-instance-id={instanceId}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%',
          ...style,
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/${videoInfo.id}?${params.toString()}`}
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
  }
  
  // Vimeo embed
  if (videoInfo.type === 'vimeo' && videoInfo.id) {
    const params = new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      loop: loop ? '1' : '0',
      muted: muted ? '1' : '0',
      controls: controls ? '1' : '0',
    });
    
    return (
      <div
        data-instance-id={instanceId}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%',
          ...style,
        }}
      >
        <iframe
          src={`https://player.vimeo.com/video/${videoInfo.id}?${params.toString()}`}
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
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
  }
  
  // Direct video file
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
