import React, { useEffect, useRef, useState, FormEvent } from 'react';
import {
  UserRound,
  UsersRound,
  ShieldCheck,
  Target,
  WalletCards,
  Users,
  MessageSquareText,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/store';
import BasicInfo from '../components/UI2/BasicInfo';
import PlanSummary from '../components/UI2/PlanSummary';
import RecommendationCategoryPage from '../components/UI2/RecommendationCategoryPage';
import NewFinancialGoals from '../components/UI2/NewFinancialGoals';
import SectionVideoOverlay from '../components/UI2/SectionVideoOverlay';
import Header, { InteractionMode, SessionMode } from '../components/UI2/Header';
import JourneyDrawer from '../components/UI2/JourneyDrawer';
import AvatarStateOverlay, {
  AvatarState,
} from '../components/UI2/AvatarStateOverlay';
import Composer from '../components/UI2/Composer';
import ConversationPanel, {
  TranscriptMessage,
} from '../components/UI2/ConversationPanel';
import CanvasAvatarChip from '../components/UI2/CanvasAvatarChip';
import { setQP } from '../reducers/queryparamReducer';
import { resetSalesState, setNavigation } from '../reducers/salesCopilotReducer';
import { useData } from '../context/DataWrapper';
import { useVad } from '../context/VadWrapper';
import { useWakeLock } from '../functions/useWakeLock';

function HotPageLoader() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center w-full min-h-[40vh] py-12 px-4 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3588e9] mb-4"></div>
      <p className="text-sm font-semibold text-[#637590]">
        Retrieving updated information…
      </p>
    </div>
  );
}

function RecommendationsGeneratedToast() {
  const { recommendationsGenerated } = useData();
  const [visible, setVisible] = useState(false);
  const prevRef = useRef(false);

  useEffect(() => {
    if (recommendationsGenerated && !prevRef.current) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 10000);
      prevRef.current = recommendationsGenerated;
      return () => clearTimeout(timer);
    }
    prevRef.current = recommendationsGenerated;
  }, [recommendationsGenerated]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-5 z-[9999] flex items-center gap-3 rounded-xl border border-green-300 bg-green-50/95 px-4 py-3 text-green-900 shadow-lg backdrop-blur-sm pointer-events-none"
    >
      <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
      </span>
      <div className="flex flex-col">
        <strong className="text-sm font-bold">Recommendations Generated</strong>
      </div>
    </div>
  );
}

// ─── Shared journey section content (Understanding / Priorities / Recommendations) ─
function JourneySectionContent({
  currentNavigation,
  salesData,
  hotPageLoading,
  formatCurrency,
  recommendationCategoryData,
}: {
  currentNavigation: string;
  salesData: any;
  hotPageLoading: any;
  formatCurrency: (num: number) => any;
  recommendationCategoryData: any;
}) {
  if (currentNavigation === 'Plan Summary') {
    return hotPageLoading?.['Plan Summary'] ? (
      <HotPageLoader />
    ) : (
      <PlanSummary
        data={salesData.planSummary}
        formatCurrency={formatCurrency}
      />
    );
  }

  if (
    typeof currentNavigation === 'string' &&
    currentNavigation.startsWith('Recommendations::')
  ) {
    return (
      <RecommendationCategoryPage
        category={recommendationCategoryData}
      />
    );
  }

  if (currentNavigation === 'Recommendations') {
    return <HotPageLoader />;
  }

  return (
    <div className="space-y-6">
      <BasicInfo data={salesData.basicInfo} />
      {hotPageLoading?.['Data Retrieval'] &&
      !(salesData.financialGoals?.goals?.length) ? (
        <HotPageLoader />
      ) : (
        <NewFinancialGoals />
      )}
    </div>
  );
}

// ─── Main Application Component ────────────────────────────────────────────
export default function App() {
  const dispatch = useAppDispatch();
  const {
    isSocketConnected,
    hotPageLoading,
    isBasicInfoVideoPlaying,
    isAudioPlayingState,
    speakerEnabled,
    toggleSpeakerPlayback,
  } = useData();

  //@ts-ignore
  const { manualVadStatus, setManualVadStatus, VAD2 } = useVad();

  const { navigation: currentNavigation, salesData } = useAppSelector(
    (state) => state.salesCopilotReducer
  );
  const { roomId, name: clientName } = useAppSelector(
    (state) => state.qpReducer
  );

  useWakeLock(true);

  // Unified Workspace State
  const [interactionMode, setInteractionMode] =
    useState<InteractionMode>('social');
  const [sessionMode, setSessionMode] = useState<SessionMode>('assist');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [avatarMinimized, setAvatarMinimized] = useState(false);
  const [manualAvatarState, setManualAvatarState] =
    useState<AvatarState | null>(null);

  // Composer Draft & Transcript
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<TranscriptMessage[]>([
    {
      id: 1,
      speaker: 'ai',
      text: 'Hi James, before we look at plans, I’d like to understand what financial security means for your family.',
      time: '05:08 PM',
    },
    {
      id: 2,
      speaker: 'customer',
      text: 'I want to make sure my family can manage their regular expenses if something happens to me.',
      time: '05:08 PM',
    },
    {
      id: 3,
      speaker: 'ai',
      text: 'That makes sense. Roughly how many years would you want their income protected?',
      time: '05:09 PM',
    },
  ]);

  // Derived avatar state from video / audio events only
  let derivedAvatarState: AvatarState = 'muted';
  if (isBasicInfoVideoPlaying || isAudioPlayingState) {
    derivedAvatarState = 'speaking';
  } else if (VAD2?.loading) {
    derivedAvatarState = 'processing';
  } else if (manualVadStatus || VAD2?.listening) {
    derivedAvatarState = 'listening';
  } else {
    derivedAvatarState = 'muted';
  }

  const activeAvatarState = manualAvatarState ?? derivedAvatarState;

  useEffect(() => {
    if (isBasicInfoVideoPlaying || isAudioPlayingState) {
      setManualAvatarState(null);
    }
  }, [isBasicInfoVideoPlaying, isAudioPlayingState]);

  // Query Params init
  useEffect(() => {
    function getMeetingInfo() {
      const query = window.location.href.split('?')[1];
      if (!query) return;
      const parts = query.split('&');
      const roomParam = parts[0] || '';
      const nameParam = parts[1] || '';
      const langParam = parts[2] || 'english';

      const qParams = {
        roomId: roomParam,
        name: nameParam,
        pref_language: langParam,
      };

      dispatch(resetSalesState());
      dispatch(setQP(qParams));
    }
    getMeetingInfo();
  }, [dispatch]);

  // Recommendations categories lookup
  const mockData = salesData.recommendations;
  const recCategories: { category: string; title: string }[] = Array.isArray(
    mockData
  )
    ? []
    : (mockData as any)?.categories?.map((c: any) => ({
        category: c.category,
        title: c.title || c.category,
      })) ?? [];

  useEffect(() => {
    if (currentNavigation === 'Recommendations' && recCategories.length > 0) {
      dispatch(
        setNavigation(`Recommendations::${recCategories[0].category}`)
      );
    }
  }, [currentNavigation, recCategories, dispatch]);

  let recommendationCategoryData: any = null;
  if (
    typeof currentNavigation === 'string' &&
    currentNavigation.startsWith('Recommendations::')
  ) {
    const parts = currentNavigation.split('::');
    const categoryKey = parts[1] || null;
    const cats = (mockData as any)?.categories || [];
    recommendationCategoryData =
      cats.find((c: any) => c.category === categoryKey) || null;
  }

  const formatCurrency = (num: number) => {
    if (isNaN(num)) return '₹ 0';
    const crores = num / 10000000;
    const lakhs = num / 100000;
    let shorthand = '';

    if (crores >= 1) {
      shorthand = `(${crores.toFixed(1)} Cr)`;
    } else if (lakhs >= 1) {
      shorthand = `(${lakhs.toFixed(1)} Lk)`;
    }

    const formattedNum = new Intl.NumberFormat('en-IN').format(num);
    return `₹ ${formattedNum} <span className="text-[#637590] font-normal text-xs">${shorthand}</span>`;
  };

  const handleSendMessage = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), speaker: 'customer', text, time: 'Now' },
    ]);
    setDraft('');
  };

  const journeySectionProps = {
    currentNavigation,
    salesData,
    hotPageLoading,
    formatCurrency,
    recommendationCategoryData,
  };

  const renderSocialStage = () => (
    <div
      className={`social-stage state-${activeAvatarState} ${
        avatarMinimized ? 'avatar-minimized' : ''
      }`}
    >
      <div className="social-aura" />
      <div className="social-composition">
        {avatarMinimized ? (
          <button
            type="button"
            className={`minimized-avatar-dock state-${activeAvatarState}`}
            onClick={() => setAvatarMinimized(false)}
            aria-label="Restore AI avatar"
            title="Restore avatar"
          >
            <span>
              <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
            </span>
            <AvatarStateOverlay state={activeAvatarState} />
            <Maximize2 size={17} />
          </button>
        ) : (
          <div
            className={`social-avatar avatar-state-visual state-${activeAvatarState}`}
          >
            <button
              type="button"
              className="avatar-minimize"
              onClick={() => setAvatarMinimized(true)}
              aria-label="Minimize AI avatar"
              title="Minimize avatar"
            >
              <Minimize2 size={17} />
            </button>

            <div className="avatar-media-shell">
              <SectionVideoOverlay>
                <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
              </SectionVideoOverlay>
            </div>

            <AvatarStateOverlay state={activeAvatarState} />
          </div>
        )}

        <div className="social-live-caption" aria-live="polite">
          <p>
            <span className="caption-spoken">
              We’ve spoken about your family and current financial position.{' '}
            </span>
            <span className="caption-active">
              What would financial security for your family mean to you?
            </span>
          </p>
        </div>

        <Composer
          className="social-composer"
          draft={draft}
          setDraft={setDraft}
          onSend={handleSendMessage}
          voiceOn={speakerEnabled}
          onVoiceToggle={toggleSpeakerPlayback}
          micOn={manualVadStatus}
          onMicToggle={() => setManualVadStatus(!manualVadStatus)}
        />
      </div>
    </div>
  );

  const renderCanvasView = () => (
    <div className="mode-canvas">
      <div className="canvas-scroll">
        <JourneySectionContent {...journeySectionProps} />
      </div>
      <CanvasAvatarChip
        state={activeAvatarState}
        onClick={() => setInteractionMode('social')}
      />
    </div>
  );

  const getBasicFieldValue = (fieldName: string, fallback: string) => {
    const basicInfo = salesData.basicInfo;
    if (!basicInfo) return fallback;
    const boxes = [
      basicInfo.boxA,
      basicInfo.boxB,
      basicInfo.boxC,
      basicInfo.boxD,
    ];
    for (const box of boxes) {
      if (box?.data) {
        const item = box.data.find(
          (f: any) =>
            f.field?.toLowerCase().includes(fieldName.toLowerCase()) ||
            fieldName.toLowerCase().includes(f.field?.toLowerCase() || '')
        );
        if (item && item.value) return item.value;
      }
    }
    return fallback;
  };

  return (
    <main className="app-shell ai-led-shell">
      <RecommendationsGeneratedToast />

      {/* Disconnect Alert */}
      {!isSocketConnected && (
        <div
          role="alert"
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-red-700 bg-red-100/95 border-b border-red-200"
        >
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          disconnected to server &amp; reconnecting …
        </div>
      )}

      {/* Journey Drawer */}
      <JourneyDrawer
        open={journeyOpen}
        onClose={() => setJourneyOpen(false)}
      />

      <section className="main-zone">
        {/* Topbar Header */}
        <Header
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          avatarState={activeAvatarState}
          setManualAvatarState={setManualAvatarState}
          sessionMode={sessionMode}
          setSessionMode={setSessionMode}
          onOpenJourney={() => setJourneyOpen(true)}
          panelCollapsed={panelCollapsed}
          onTogglePanel={() => setPanelCollapsed((prev) => !prev)}
        />

        {/* Content Workspace Grid */}
        <div
          className={`content-grid ${panelCollapsed ? 'panel-hidden' : ''}`}
        >
          <section
            className={`data-panel mode-${interactionMode}`}
            aria-label={`${currentNavigation} – ${interactionMode} mode`}
          >
            {/* 1. SOCIAL MODE */}
            {interactionMode === 'social' ? (
              renderSocialStage()
            ) : interactionMode === 'copresent' ? (
              /* 2. CO-PRESENT MODE */
              <div className={`copresent-stage state-${activeAvatarState}`}>
                <aside
                  className={`copresent-avatar ${
                    avatarMinimized ? 'avatar-minimized' : ''
                  }`}
                >
                  {avatarMinimized ? (
                    <button
                      type="button"
                      className={`minimized-avatar-dock state-${activeAvatarState}`}
                      onClick={() => setAvatarMinimized(false)}
                      aria-label="Restore AI avatar"
                      title="Restore avatar"
                    >
                      <span>
                        <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
                      </span>
                      <AvatarStateOverlay state={activeAvatarState} />
                      <Maximize2 size={17} />
                    </button>
                  ) : (
                    <div
                      className={`copresent-portrait avatar-state-visual state-${activeAvatarState}`}
                    >
                      <button
                        type="button"
                        className="avatar-minimize"
                        onClick={() => setAvatarMinimized(true)}
                        aria-label="Minimize AI avatar"
                        title="Minimize avatar"
                      >
                        <Minimize2 size={17} />
                      </button>
                      <div className="avatar-media-shell">
                        <SectionVideoOverlay>
                          <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
                        </SectionVideoOverlay>
                      </div>
                      <AvatarStateOverlay state={activeAvatarState} />
                    </div>
                  )}

                  <div className="copresent-live-caption" aria-live="polite">
                    <p>
                      <span className="caption-spoken">
                        We have captured your financial details.{' '}
                      </span>
                      <span className="caption-active">
                        How much of your family's monthly expenses should be protected?
                      </span>
                    </p>
                  </div>

                  <Composer
                    className="copresent-composer"
                    draft={draft}
                    setDraft={setDraft}
                    onSend={handleSendMessage}
                    voiceOn={speakerEnabled}
                    onVoiceToggle={toggleSpeakerPlayback}
                    micOn={manualVadStatus}
                    onMicToggle={() => setManualVadStatus(!manualVadStatus)}
                  />
                </aside>

                <section className="copresent-content">
                  <JourneySectionContent {...journeySectionProps} />
                </section>

                <aside className="copresent-mobile-dock" aria-label="AI conversation controls">
                  <div className="mobile-dock-caption">
                    <div className={`mobile-dock-avatar state-${activeAvatarState}`}>
                      <img className="avatar-image" src="/avatar-vitt-refined.png" alt="VITT AI Companion" />
                      <AvatarStateOverlay state={activeAvatarState} />
                    </div>
                    <p>
                      <span className="caption-spoken">We have captured your financial details. </span>
                      <span className="caption-active">How much should be protected?</span>
                    </p>
                  </div>
                  <Composer
                    className="copresent-composer"
                    draft={draft}
                    setDraft={setDraft}
                    onSend={handleSendMessage}
                    voiceOn={speakerEnabled}
                    onVoiceToggle={toggleSpeakerPlayback}
                    micOn={manualVadStatus}
                    onMicToggle={() => setManualVadStatus(!manualVadStatus)}
                  />
                </aside>
              </div>
            ) : (
              /* 3. CANVAS MODE — form full width */
              renderCanvasView()
            )}
          </section>

          {/* Right-Side Conversation & AI Cues Drawer */}
          <ConversationPanel
            collapsed={panelCollapsed}
            onToggle={() => setPanelCollapsed((prev) => !prev)}
            messages={messages}
            sessionMode={sessionMode}
          />
        </div>
      </section>
    </main>
  );
}
