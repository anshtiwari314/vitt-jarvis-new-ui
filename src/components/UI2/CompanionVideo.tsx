import React from 'react';

export const COMPANION_VIDEO_URL =
  'https://navtalk.s3.us-east-2.amazonaws.com/video/eda4fad9-958e-4052-9894-cb82699c34a8.mp4';

interface CompanionVideoProps {
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
  loop?: boolean;
  children?: React.ReactNode;
}

export default function CompanionVideo({
  className = 'companion-video',
  style,
  autoPlay = true,
  loop = true,
  children,
}: CompanionVideoProps) {
  const video = (
    <video
      className={className}
      style={style}
      src={COMPANION_VIDEO_URL}
      autoPlay={autoPlay}
      loop={loop}
      muted
      playsInline
      preload="auto"
    />
  );

  if (!children) {
    return video;
  }

  /* HTML video cannot contain interactive children; overlay on the player wrapper. */
  return (
    <div className="companion-video-player" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {video}
      {children}
    </div>
  );
}
