import { useCallback, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';
import { getObjectFitContentRect } from './getObjectFitContentRect';

type Corner = 'top-right';

type Options = {
  corner?: Corner;
  inset?: number;
};

/** Tracks the top-right of the painted video frame and returns absolute overlay offsets. */
export function useVideoContentCorner(
  videoRef: RefObject<HTMLVideoElement | null>,
  containerRef: RefObject<HTMLElement | null>,
  { corner = 'top-right', inset = 8 }: Options = {},
): CSSProperties {
  const [position, setPosition] = useState<CSSProperties>({
    top: inset,
    right: inset,
  });

  const update = useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const contentRect = getObjectFitContentRect(video);
    if (!contentRect) return;

    if (corner === 'top-right') {
      setPosition({
        top: contentRect.top + inset,
        right: video.clientWidth - contentRect.right + inset,
        left: 'auto',
        bottom: 'auto',
      });
    }
  }, [videoRef, containerRef, corner, inset]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    let frameId = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };

    scheduleUpdate();

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(video);
    resizeObserver.observe(container);

    video.addEventListener('loadedmetadata', scheduleUpdate);
    video.addEventListener('loadeddata', scheduleUpdate);
    video.addEventListener('resize', scheduleUpdate);
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      video.removeEventListener('loadedmetadata', scheduleUpdate);
      video.removeEventListener('loadeddata', scheduleUpdate);
      video.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [update]);

  return position;
}
