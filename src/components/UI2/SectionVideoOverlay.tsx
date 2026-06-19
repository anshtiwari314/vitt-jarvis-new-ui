import React, { useEffect, useRef } from 'react';
import { useData } from '../../context/DataWrapper';

function SectionVideoPlayer({
  url,
  onEnd,
}: {
  url: string;
  onEnd: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err: unknown) => console.warn('Section video play failed:', err));
    }
  }, [url]);

  return (
    <div
      className="relative flex min-h-0 w-full flex-1 flex-col touch-none"
      style={{ overscrollBehavior: 'none' }}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <video
          ref={videoRef}
          src={url}
          className="block max-h-full max-w-full h-auto w-auto rounded-xl shadow-sm"
          playsInline
          preload="auto"
          onEnded={onEnd}
          onError={onEnd}
        />
      </div>
    </div>
  );
}

export default function SectionVideoOverlay({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    basicInfoVideoUrl,
    isBasicInfoVideoPlaying,
    isVideoPreloaded,
    startBasicInfoVideo,
    endBasicInfoVideo,
  } = useData();
  const preloadStartedRef = useRef(false);

  const showVideo = isBasicInfoVideoPlaying && !!basicInfoVideoUrl;
  const videoAlreadyCached =
    !!basicInfoVideoUrl &&
    typeof isVideoPreloaded === "function" &&
    isVideoPreloaded(basicInfoVideoUrl);
  const isPreloadingVideo =
    !!basicInfoVideoUrl && !isBasicInfoVideoPlaying && !videoAlreadyCached;

  useEffect(() => {
    if (!isBasicInfoVideoPlaying) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isBasicInfoVideoPlaying]);

  useEffect(() => {
    preloadStartedRef.current = false;
  }, [basicInfoVideoUrl]);

  useEffect(() => {
    if (!basicInfoVideoUrl || isBasicInfoVideoPlaying) return;
    if (typeof isVideoPreloaded !== "function" || !isVideoPreloaded(basicInfoVideoUrl)) return;
    startBasicInfoVideo();
  }, [basicInfoVideoUrl, isBasicInfoVideoPlaying, isVideoPreloaded, startBasicInfoVideo]);

  const handlePreloadReady = () => {
    if (preloadStartedRef.current) return;
    preloadStartedRef.current = true;
    startBasicInfoVideo();
  };

  if (showVideo) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col font-sans text-gray-800">
        <SectionVideoPlayer url={basicInfoVideoUrl} onEnd={endBasicInfoVideo} />
      </div>
    );
  }

  return (
    <>
      {isPreloadingVideo && (
        <video
          key={basicInfoVideoUrl}
          className="hidden"
          src={basicInfoVideoUrl}
          preload="auto"
          playsInline
          onCanPlayThrough={handlePreloadReady}
          onError={endBasicInfoVideo}
        />
      )}
      {children}
    </>
  );
}
