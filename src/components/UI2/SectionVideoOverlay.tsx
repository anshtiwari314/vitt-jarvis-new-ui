import React, { useEffect, useRef } from 'react';
import { useData } from '../../context/DataWrapper';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const playStartedForUrlRef = useRef<string | null>(null);
  const autoStartTriggeredRef = useRef<string | null>(null);

  const showVideo = isBasicInfoVideoPlaying && !!basicInfoVideoUrl;

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
    autoStartTriggeredRef.current = null;
    playStartedForUrlRef.current = null;
  }, [basicInfoVideoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!basicInfoVideoUrl || !video) return;

    const absoluteUrl = new URL(basicInfoVideoUrl, window.location.href).href;
    if (video.src !== absoluteUrl) {
      video.src = basicInfoVideoUrl;
      video.load();
    }
  }, [basicInfoVideoUrl]);

  useEffect(() => {
    if (!basicInfoVideoUrl || isBasicInfoVideoPlaying) return;

    if (typeof isVideoPreloaded === 'function' && isVideoPreloaded(basicInfoVideoUrl)) {
      if (autoStartTriggeredRef.current === basicInfoVideoUrl) return;
      autoStartTriggeredRef.current = basicInfoVideoUrl;
      startBasicInfoVideo();
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const handleReady = () => {
      if (autoStartTriggeredRef.current === basicInfoVideoUrl) return;
      autoStartTriggeredRef.current = basicInfoVideoUrl;
      startBasicInfoVideo();
    };

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      handleReady();
      return;
    }

    video.addEventListener('canplaythrough', handleReady, { once: true });
    return () => video.removeEventListener('canplaythrough', handleReady);
  }, [basicInfoVideoUrl, isBasicInfoVideoPlaying, isVideoPreloaded, startBasicInfoVideo]);

  useEffect(() => {
    if (!isBasicInfoVideoPlaying || !basicInfoVideoUrl) return;

    const video = videoRef.current;
    if (!video) return;
    if (playStartedForUrlRef.current === basicInfoVideoUrl) return;

    const startPlayback = () => {
      if (playStartedForUrlRef.current === basicInfoVideoUrl) return;
      if (!video.paused && video.currentTime > 0) {
        playStartedForUrlRef.current = basicInfoVideoUrl;
        return;
      }

      playStartedForUrlRef.current = basicInfoVideoUrl;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err: unknown) => {
          if (playStartedForUrlRef.current === basicInfoVideoUrl) {
            playStartedForUrlRef.current = null;
          }
          console.warn('Section video play failed:', err);
        });
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      startPlayback();
      return;
    }

    video.addEventListener('canplaythrough', startPlayback, { once: true });
    return () => video.removeEventListener('canplaythrough', startPlayback);
  }, [isBasicInfoVideoPlaying, basicInfoVideoUrl]);

  const handleVideoEnd = () => {
    playStartedForUrlRef.current = null;
    autoStartTriggeredRef.current = null;
    endBasicInfoVideo();
  };

  return (
    <>
      {basicInfoVideoUrl && (
        <div
          className={
            showVideo
              ? 'flex min-h-0 w-full flex-1 flex-col font-sans text-gray-800'
              : 'hidden'
          }
        >
          <div
            className="relative flex min-h-0 w-full flex-1 flex-col touch-none"
            style={{ overscrollBehavior: 'none' }}
            onTouchMove={(e) => e.preventDefault()}
          >
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
              <video
                ref={videoRef}
                className="block max-h-full max-w-full h-auto w-auto rounded-xl shadow-sm"
                playsInline
                preload="auto"
                onEnded={handleVideoEnd}
                onError={handleVideoEnd}
              />
            </div>
          </div>
        </div>
      )}
      {!showVideo && children}
    </>
  );
}
