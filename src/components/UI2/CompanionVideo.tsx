import React, { useEffect, useRef } from 'react';
import { useVideoContentCorner } from '../../functions/useVideoContentCorner';

export const COMPANION_VIDEO_URL =
  'https://navtalk.s3.us-east-2.amazonaws.com/video/eda4fad9-958e-4052-9894-cb82699c34a8.mp4';

interface CompanionVideoProps {
  className?: string;
  style?: React.CSSProperties;
  /** Idle placeholder stays paused; socket videos replace this via SectionVideoOverlay. */
  autoPlay?: boolean;
  loop?: boolean;
  children?: React.ReactNode;
  /** Pin overlay children to the painted video frame instead of the player box. */
  pinOverlayToVideo?: boolean;
  overlayInset?: number;
}

export default function CompanionVideo({
  className = 'companion-video',
  style,
  autoPlay = false,
  loop = false,
  children,
  pinOverlayToVideo = true,
  overlayInset = 8,
}: CompanionVideoProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayPosition = useVideoContentCorner(
    videoRef,
    playerRef,
    { inset: overlayInset },
  );

  // Keep idle NavTalk clip loaded but not playing (first frame as placeholder).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const freezeAtStart = () => {
      try {
        video.pause();
        if (video.currentTime !== 0) {
          video.currentTime = 0;
        }
      } catch {
        // ignore seek errors before metadata is ready
      }
    };

    if (!autoPlay) {
      freezeAtStart();
      video.addEventListener('loadeddata', freezeAtStart);
      video.addEventListener('play', freezeAtStart);
      return () => {
        video.removeEventListener('loadeddata', freezeAtStart);
        video.removeEventListener('play', freezeAtStart);
      };
    }
  }, [autoPlay]);

  const video = (
    <video
      ref={videoRef}
      className={className}
      style={style}
      src={COMPANION_VIDEO_URL}
      autoPlay={autoPlay}
      loop={loop}
      muted
      playsInline
      preload="metadata"
    />
  );

  if (!children) {
    return video;
  }

  const overlayChild = React.isValidElement(children)
    ? React.cloneElement(
        children as React.ReactElement<{ style?: React.CSSProperties }>,
        {
          style: {
            ...(children.props.style ?? {}),
            ...(pinOverlayToVideo ? overlayPosition : {}),
            position: 'absolute',
          },
        },
      )
    : children;

  /* HTML video cannot contain interactive children; overlay on the player wrapper. */
  return (
    <div
      ref={playerRef}
      className="companion-video-player"
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {video}
      {overlayChild}
    </div>
  );
}
