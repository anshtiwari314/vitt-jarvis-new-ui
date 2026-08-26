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
    speakerEnabled,
  } = useData();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playStartedForUrlRef = useRef<string | null>(null);
  const autoStartTriggeredRef = useRef<string | null>(null);

  const showVideo = isBasicInfoVideoPlaying && !!basicInfoVideoUrl;
  // Speaker off → muted (fillers still play). Speaker on → play with audio.
  const videoMuted = !speakerEnabled;

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

    let targetSrc = basicInfoVideoUrl;
    if (basicInfoVideoUrl.startsWith("blob:") || basicInfoVideoUrl.startsWith("data:")) {
      targetSrc = basicInfoVideoUrl;
    } else {
      try {
        targetSrc = new URL(basicInfoVideoUrl, window.location.href).href;
      } catch (e) {
        targetSrc = basicInfoVideoUrl;
      }
    }

    if (video.src !== targetSrc) {
      video.src = targetSrc;
      video.load();
    }
  }, [basicInfoVideoUrl]);

  // Keep <video> mute in sync with Composer volume (speaker) toggle
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = videoMuted;
  }, [videoMuted, basicInfoVideoUrl, isBasicInfoVideoPlaying]);

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

    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA || video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
      handleReady();
      return;
    }

    video.addEventListener('canplay', handleReady, { once: true });
    video.addEventListener('loadeddata', handleReady, { once: true });
    video.addEventListener('canplaythrough', handleReady, { once: true });
    const fallbackTimer = setTimeout(handleReady, 1000);
    return () => {
      clearTimeout(fallbackTimer);
      video.removeEventListener('canplay', handleReady);
      video.removeEventListener('loadeddata', handleReady);
      video.removeEventListener('canplaythrough', handleReady);
    };
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
      video.muted = videoMuted;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err: unknown) => {
          // Browser may block unmuted autoplay — fall back to muted so video still shows
          if (!video.muted) {
            video.muted = true;
            video.play().catch((retryErr: unknown) => {
              if (playStartedForUrlRef.current === basicInfoVideoUrl) {
                playStartedForUrlRef.current = null;
              }
              console.warn('Section video play failed:', retryErr);
            });
            return;
          }
          if (playStartedForUrlRef.current === basicInfoVideoUrl) {
            playStartedForUrlRef.current = null;
          }
          console.warn('Section video play failed:', err);
        });
      }
    };

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      startPlayback();
      return;
    }

    video.addEventListener('canplay', startPlayback, { once: true });
    video.addEventListener('loadeddata', startPlayback, { once: true });
    video.addEventListener('canplaythrough', startPlayback, { once: true });
    const fallbackTimer = setTimeout(startPlayback, 1000);
    return () => {
      clearTimeout(fallbackTimer);
      video.removeEventListener('canplay', startPlayback);
      video.removeEventListener('loadeddata', startPlayback);
      video.removeEventListener('canplaythrough', startPlayback);
    };
  }, [isBasicInfoVideoPlaying, basicInfoVideoUrl, videoMuted]);

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
              ? 'avatar-video-shell flex min-h-0 w-full flex-1 flex-col font-sans text-gray-800'
              : 'hidden'
          }
        >
          <div
            className="avatar-video-frame relative flex min-h-0 w-full flex-1 flex-col touch-none"
            style={{ overscrollBehavior: 'none' }}
            onTouchMove={(e) => e.preventDefault()}
          >
            <div className="flex min-h-0 w-full flex-1 items-end justify-center overflow-hidden">
              <video
                ref={videoRef}
                className="avatar-video block h-auto max-h-full w-auto max-w-full rounded-xl shadow-sm"
                playsInline
                muted={videoMuted}
                preload="auto"
                onEnded={handleVideoEnd}
                onError={(e) => {
                  console.warn('Section video failed to load:', basicInfoVideoUrl, e);
                  handleVideoEnd();
                }}
              />
            </div>
          </div>
        </div>
      )}
      {!showVideo && children}
    </>
  );
}
