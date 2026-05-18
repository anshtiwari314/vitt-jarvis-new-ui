import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataWrapper';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MessageAudioPlayer({ messageAudioUrl }: { messageAudioUrl: string }) {
  const { audioUrl, audioRef, isGlobalAudioPlaying, setAudioUrl } = useData();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const isThisAudioActive = audioUrl === messageAudioUrl;
  const isPlaying = isThisAudioActive && isGlobalAudioPlaying;

  // Preload total duration for this message's audio URL
  useEffect(() => {
    const probe = new Audio();
    const onMeta = () => {
      if (Number.isFinite(probe.duration)) {
        setDuration(probe.duration);
      }
    };
    probe.addEventListener('loadedmetadata', onMeta);
    probe.src = messageAudioUrl;
    probe.load();
    return () => {
      probe.removeEventListener('loadedmetadata', onMeta);
      probe.src = '';
    };
  }, [messageAudioUrl]);

  useEffect(() => {
    const audioElem = audioRef?.current;
    if (!audioElem || !isThisAudioActive) {
      setProgress(0);
      if (!isThisAudioActive) {
        setCurrentTime(0);
      }
      return;
    }

    const syncFromPlayer = () => {
      if (Number.isFinite(audioElem.duration)) {
        setDuration(audioElem.duration);
        setProgress((audioElem.currentTime / audioElem.duration) * 100);
      }
      setCurrentTime(audioElem.currentTime);
    };

    const onEnded = () => {
      setCurrentTime(0);
      setProgress(0);
    };

    syncFromPlayer();
    audioElem.addEventListener('timeupdate', syncFromPlayer);
    audioElem.addEventListener('loadedmetadata', syncFromPlayer);
    audioElem.addEventListener('ended', onEnded);

    return () => {
      audioElem.removeEventListener('timeupdate', syncFromPlayer);
      audioElem.removeEventListener('loadedmetadata', syncFromPlayer);
      audioElem.removeEventListener('ended', onEnded);
    };
  }, [isThisAudioActive, audioRef, audioUrl]);

  const togglePlay = () => {
    const audioElem = audioRef?.current;
    if (!audioElem) return;

    if (isThisAudioActive) {
      if (isPlaying) {
        audioElem.pause();
      } else {
        audioElem.play();
      }
    } else {
      setAudioUrl(messageAudioUrl);
    }
  };

  const displayCurrent = isThisAudioActive ? currentTime : 0;

  return (
    <div className="msg-audio-player">
      <button
        type="button"
        className="msg-audio-player__btn"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
      </button>

      <span className="msg-audio-player__time">
        {formatTime(displayCurrent)} / {formatTime(duration)}
      </span>

      <div className="msg-audio-player__progress">
        <div
          className="msg-audio-player__progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
