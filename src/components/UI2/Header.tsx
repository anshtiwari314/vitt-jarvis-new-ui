'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Menu,
  MoreHorizontal,
  Clock3,
  Languages,
  Signal,
  Flag,
  Settings2,
  LogOut,
  ChevronDown,
  PanelRightClose,
  MessageSquareText,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { useVad } from '../../context/VadWrapper';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataWrapper';
import { updatePref_language } from '../../reducers/salesCopilotReducer';
import {
  useConnectionQuality,
  defaultHealthUrl,
} from './NetworkMonitor';
import FlagModal from './FlagModal';
import { AvatarState } from './AvatarStateOverlay';

export type InteractionMode = 'social' | 'copresent' | 'canvas';

interface HeaderProps {
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
  avatarState: AvatarState;
  setManualAvatarState?: (state: AvatarState) => void;
  onOpenJourney: () => void;
  panelCollapsed: boolean;
  onTogglePanel: () => void;
}

export default function Header({
  interactionMode,
  setInteractionMode,
  avatarState,
  setManualAvatarState,
  onOpenJourney,
  panelCollapsed,
  onTogglePanel,
}: HeaderProps) {
  const {
    socket,
    isSocketConnected,
    startLanguageChangeLoading,
    isAudioPlayingState,
    isBasicInfoVideoPlaying,
  } = useData();
  const dispatch = useAppDispatch();
  //@ts-ignore
  const { setCurrentUser } = useAuth();
  //@ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad();

  const currentNavigation = useAppSelector(
    (state) => state.salesCopilotReducer.navigation
  );
  const pref_language = useAppSelector(
    (state) => state.salesCopilotReducer.pref_language
  );
  const allLanguageOptions = useAppSelector(
    (state) => state.salesCopilotReducer.language_ids
  );
  const qpParams = useAppSelector((state) => state.qpReducer);

  const [timerSeconds, setTimerSeconds] = useState(0);
  const [flagOpen, setFlagOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  const networkStatus = useConnectionQuality(defaultHealthUrl(), 15000);

  // Timer counter tied to listening VAD
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (VAD2 && VAD2.listening) {
      interval = setInterval(() => setTimerSeconds((prev) => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [VAD2]);

  // Click outside to close overflow menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        overflowRef.current &&
        !overflowRef.current.contains(event.target as Node)
      ) {
        setOverflowOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const minutes = Math.floor(timerSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (timerSeconds % 60).toString().padStart(2, '0');

  const handleLogout = () => {
    localStorage.removeItem('insurance-auth');
    setCurrentUser(null);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let selectedLang = e.target.value;
    dispatch(updatePref_language(selectedLang));
    selectedLang =
      selectedLang.charAt(0).toUpperCase() + selectedLang.slice(1);
    startLanguageChangeLoading();
    socket?.emit('switch_pref_language_li', {
      roomid: qpParams.roomId,
      pref_language: selectedLang,
    });
  };

  const handleAvatarStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as AvatarState;
    if (val === 'listening') {
      setManualVadStatus(true);
    } else if (val === 'muted') {
      setManualVadStatus(false);
    }
    if (setManualAvatarState) {
      setManualAvatarState(val);
    }
  };

  return (
    <>
      <header className="topbar simplified-topbar">
        <div className="topbar-context">
          <button
            className="journey-trigger"
            onClick={onOpenJourney}
            aria-label="Open client journey"
          >
            <Menu size={20} />
            <span>Journey</span>
          </button>
        </div>

        <div className="meeting-controls">
          <div className="prototype-cluster">
            {/* Mode selector */}
            <label className="mode-selector">
              <span>View</span>
              <select
                value={interactionMode}
                onChange={(e) =>
                  setInteractionMode(e.target.value as InteractionMode)
                }
                aria-label="Interaction mode"
              >
                <option value="social">Social</option>
                <option value="copresent">Co-present</option>
                <option value="canvas">Canvas</option>
              </select>
              <ChevronDown size={14} />
            </label>

            {/* Avatar State Selector */}
            <label className="mode-selector avatar-state-selector">
              <span>Avatar</span>
              <select
                value={avatarState}
                onChange={handleAvatarStateChange}
                aria-label="Avatar state"
              >
                <option value="listening">Listening</option>
                <option value="processing">Processing</option>
                <option value="speaking">Speaking</option>
                <option value="muted">Muted</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>

          {/* Mobile / Small Screen Chat History Trigger */}
          <button
            type="button"
            className="mobile-history-trigger"
            onClick={onTogglePanel}
            aria-label={panelCollapsed ? 'Open session insights' : 'Close session insights'}
            title="Session insights & chat history"
          >
            <MessageSquareText size={20} />
          </button>

          {/* Three-Dot Overflow Menu */}
          <div className="overflow-wrap" ref={overflowRef}>
            <button
              className="overflow-trigger"
              onClick={() => setOverflowOpen((prev) => !prev)}
              aria-label="More session controls"
              aria-expanded={overflowOpen}
            >
              <MoreHorizontal size={23} />
            </button>

            {overflowOpen && (
              <div className="overflow-menu" role="menu">
                <div className="overflow-summary">
                  <Clock3 size={18} />
                  <span>Session time</span>
                  <strong>
                    {minutes}:{seconds}
                  </strong>
                </div>

                <div className="overflow-summary">
                  <Languages size={18} />
                  <span>Language</span>
                  <select
                    value={pref_language}
                    onChange={handleLanguageChange}
                    className="bg-transparent font-bold text-xs outline-none cursor-pointer text-slate-800"
                  >
                    {allLanguageOptions?.map((lang: string) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-summary">
                  <Signal size={18} />
                  <span>Connection</span>
                  <strong
                    className={
                      isSocketConnected ? 'good-status' : 'text-red-500 font-bold'
                    }
                  >
                    {isSocketConnected ? 'Good' : 'Reconnecting'}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOverflowOpen(false);
                    setFlagOpen(true);
                  }}
                >
                  <Flag size={18} />
                  <span>Flag session</span>
                  <strong className="text-slate-400">Report</strong>
                </button>

                <div className="technical-menu">
                  <span>
                    <Settings2 size={16} /> Technical status
                  </span>
                  <small>
                    <i
                      className={
                        VAD2 !== undefined && VAD2.loading === false
                          ? 'bg-emerald-500'
                          : 'bg-amber-400'
                      }
                    />
                    Audio {VAD2?.listening ? 'active' : 'ready'}
                  </small>
                  <small>
                    <i className="bg-emerald-500" /> Transcription active
                  </small>
                  <small>
                    <i
                      className={
                        isAudioPlayingState || isBasicInfoVideoPlaying
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-emerald-500'
                      }
                    />
                    AI processing {isAudioPlayingState ? 'speaking' : 'active'}
                  </small>
                </div>

                <button
                  type="button"
                  className="logout-menu font-bold"
                  onClick={handleLogout}
                >
                  <LogOut size={18} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {flagOpen && <FlagModal onClose={() => setFlagOpen(false)} />}
    </>
  );
}

export function MobileHeaderControls() {
  return null;
}
