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
import Header, { InteractionMode, SessionMode } from '../components/UI2/Header';
import JourneyDrawer from '../components/UI2/JourneyDrawer';
import AvatarStateOverlay, {
  AvatarState,
} from '../components/UI2/AvatarStateOverlay';
import CompanionVideo from '../components/UI2/CompanionVideo';
import SectionVideoOverlay from '../components/UI2/SectionVideoOverlay';
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

/** Edit these inline styles to change video size/layout in Social, Co-present & Canvas modes. */
type SubtitleStyles = {
  container: React.CSSProperties;
  /** Base styles for all subtitle text. `color` applies to spoken + active unless they set their own. */
  text: React.CSSProperties;
  spoken: React.CSSProperties;
  active: React.CSSProperties;
};

/** Mic / listening / speaking indicator pill on the video portrait. */
type StateOverlayStyles = {
  base: React.CSSProperties;
  listening?: React.CSSProperties;
  processing?: React.CSSProperties;
  speaking?: React.CSSProperties;
  muted?: React.CSSProperties;
};

function resolveSubtitleSpanStyle(
  text: React.CSSProperties,
  span: React.CSSProperties,
): React.CSSProperties {
  return {
    ...span,
    color: span.color ?? text.color,
    fontSize: span.fontSize ?? text.fontSize,
    lineHeight: span.lineHeight ?? text.lineHeight,
    textShadow: span.textShadow ?? text.textShadow,
  };
}

function resolveStateOverlayStyle(
  styles: StateOverlayStyles,
  state: AvatarState,
): React.CSSProperties {
  const stateStyle =
    state === 'listening'
      ? styles.listening
      : state === 'processing'
        ? styles.processing
        : state === 'speaking'
          ? styles.speaking
          : styles.muted;
  return { ...styles.base, ...stateStyle };
}

const VIDEO_LAYOUT = {
  social: {
    composition: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'visible',
      //border:'0.1rem solid red'
    } as React.CSSProperties,
    stageStack: {
      width: '60%',
      maxWidth: '720px',
      height: '100%',
      display: 'grid',
      gridTemplateRows: 'minmax(0, 1fr) auto',
      gap: '10px',
      overflow: 'visible',
      boxSizing:'border-box',
      alignSelf: 'center',
      //border:'0.1rem solid green'
    } as React.CSSProperties,
    portrait: {
      width: '100%',
      height: '100%',
      borderRadius: '12px',
      overflow: 'visible',
      boxSizing:'border-box',
      background: 'transparent',
      position: 'relative',
    //border:'0.1rem solid blue',
    padding:'0',
    margin:'0'
    } as React.CSSProperties,
    videoShell: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      //overflow: 'hidden',
      position: 'relative',
      isolation: 'isolate',
      zIndex: 1,
      //border:'0.1rem solid orange',
      padding:'0',
    margin:'0'
    } as React.CSSProperties,
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      objectPosition: 'center',
      borderRadius: '12px',
      position: 'relative',
      zIndex: 1,
      padding:'0',
    
     //border:'0.1rem solid pink'
    } as React.CSSProperties,
    canvasToggle: {
      zIndex: 100,
      width: '32px',
      height: '32px',
      display: 'grid',
      placeItems: 'center',
      padding: 0,
      border: '1px solid rgba(180,202,216,.9)',
      borderRadius: '10px',
      background: 'rgba(255,255,255,.94)',
      color: '#537087',
      boxShadow: '0 6px 16px rgba(38,66,88,.14)',
      cursor: 'pointer',
      pointerEvents: 'auto',
    } as React.CSSProperties,
    composer: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '42px minmax(0, 1fr) 42px 42px',
      alignItems: 'center',
      gap: '6px',
      padding: '6px',
      margin: '0',
      border: '1px solid #cad8e3',
      borderRadius: '15px',
      background: '#fff',
      boxShadow: '0 10px 28px rgba(35,58,80,.12)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
      //border:'0.3rem solid black'
    } as React.CSSProperties,
    subtitle: {
      container: {
        position: 'absolute',
        margin:'0 auto',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        width: '90%',
        //margin: 0,
        padding: '14px 10px',
        border: '0.05rem solid rgba(240,240,240,1)',
        borderRadius: '10px',
        
        background: 'rgba(255,255,255,1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
        pointerEvents: 'none',
      } as React.CSSProperties,
      text: {
        margin: 0,
        color: 'black',
        display: 'block',
        fontSize: '15px',
        lineHeight: 1.4,
        textShadow: 'none',
      } as React.CSSProperties,
      spoken: {
        fontWeight: 500,
      } as React.CSSProperties,
      active: {
        fontWeight: 700,
      } as React.CSSProperties,
    } satisfies SubtitleStyles,
    stateOverlay: {
      base: {
        position: 'absolute',
        left: '50%',
        bottom: '15%',
        transform: 'translateX(-50%)',
        zIndex: 8,
        minWidth: '48px',
        height: '40px',
        padding: '0 13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(174,204,217,.9)',
        borderRadius: '999px',
        background: 'rgba(255,255,255,.9)',
        color: '#168a63',
        boxShadow: '0 7px 20px rgba(28,62,82,.14)',
      } as React.CSSProperties,
      listening: {
        color: '#138e68',
      } as React.CSSProperties,
      processing: {
        color: '#2b76ad',
      } as React.CSSProperties,
      speaking: {
        color: '#188b58',
      } as React.CSSProperties,
      muted: {
        color: '#7a8793',
        background: 'rgba(245,247,248,.94)',
      } as React.CSSProperties,
    } satisfies StateOverlayStyles,
  },
  copresent: {
    avatarAside: {
      height: '80%',
      width: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      justifyContent: 'stretch',
      overflow: 'hidden',
      padding: '12px',
      boxSizing: 'border-box',
      //border:'0.1rem solid red'
    } as React.CSSProperties,
    stageStack: {
      width: '100%',
      maxWidth: '100%',
      height: '60%',
      maxHeight: '100%',
      minHeight: 0,
      flex: 1,
      display: 'grid',
      gridTemplateRows: 'minmax(0, 1fr) auto',
      gap: '10px',
      overflow: 'hidden',
      alignSelf: 'stretch',
      //border:'0.1rem solid blue'
    } as React.CSSProperties,
    portrait: {
      width: '100%',
      height: '90%',
      minHeight: 0,
      maxHeight: '100%',
      borderRadius: '12px',
      overflow: 'hidden',
      background: '#000',
      position: 'relative',
      //border:'0.1rem solid green'
    } as React.CSSProperties,
    videoShell: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
      isolation: 'isolate',
      zIndex: 1,
      //border:'0.1rem solid brown'
    } as React.CSSProperties,
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      borderRadius: '12px',
      position: 'relative',
      zIndex: 1,
    } as React.CSSProperties,
    canvasToggle: {
      zIndex: 50,
      width: '32px',
      height: '32px',
      display: 'grid',
      placeItems: 'center',
      padding: 0,
      border: '1px solid rgba(180,202,216,.9)',
      borderRadius: '10px',
      background: 'rgba(255,255,255,.94)',
      color: '#537087',
      boxShadow: '0 6px 16px rgba(38,66,88,.14)',
      cursor: 'pointer',
      pointerEvents: 'auto',
    } as React.CSSProperties,
    mobileDockAvatar: {
      width: '48px',
      height: '48px',
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#000',
      position: 'relative',
      flexShrink: 0,
    } as React.CSSProperties,
    mobileDockVideo: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
    } as React.CSSProperties,
    composer: {
      width: '100%',
      display: 'grid',
      gridTemplateColumns: '40px minmax(0, 1fr) 40px 40px',
      alignItems: 'center',
      gap: '6px',
      padding: '6px',
      margin: '0',
      border: '1px solid #cad8e3',
      borderRadius: '14px',
      background: '#fff',
      boxShadow: '0 8px 20px rgba(35,58,80,.09)',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
      gridRow: 2,
      alignSelf: 'stretch',
      visibility: 'visible',
    } as React.CSSProperties,
    subtitle: {
      container: {
        position: 'absolute',
        margin:'0 auto',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        width: '90%',
        //margin: 0,
        padding: '14px 10px',
        border: '0.05rem solid rgba(240,240,240,1)',
        borderRadius: '10px',
        
        background: 'rgba(255,255,255,1)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
        pointerEvents: 'none',
      } as React.CSSProperties,
      text: {
        margin: 0,
        display: 'block',
        color:'black',
        fontSize: '14px',
        lineHeight: 1.42,
        textShadow: 'none',
      } as React.CSSProperties,
      spoken: {
        fontWeight: 500,
      } as React.CSSProperties,
      active: {
        fontWeight: 700,
      } as React.CSSProperties,
    } satisfies SubtitleStyles,
    stateOverlay: {
      base: {
        position: 'absolute',
        left: '50%',
        bottom: '15%',
        transform: 'translateX(-50%)',
        zIndex: 8,
        minWidth: '48px',
        height: '40px',
        padding: '0 13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(174,204,217,.9)',
        borderRadius: '999px',
        background: 'rgba(255,255,255,.9)',
        color: '#168a63',
        boxShadow: '0 7px 20px rgba(28,62,82,.14)',
      } as React.CSSProperties,
      listening: {
        color: '#138e68',
      } as React.CSSProperties,
      processing: {
        color: '#2b76ad',
      } as React.CSSProperties,
      speaking: {
        color: '#188b58',
      } as React.CSSProperties,
      muted: {
        color: '#7a8793',
        background: 'rgba(245,247,248,.94)',
      } as React.CSSProperties,
    } satisfies StateOverlayStyles,
    mobileDockSubtitle: {
      container: {
        margin: 0,
        padding: 0,
        background: 'transparent',
        boxShadow: 'none',
        border: 0,
        textAlign: 'left',
      } as React.CSSProperties,
      text: {
        margin: 0,
        fontSize: '12px',
        lineHeight: 1.32,
        textShadow: 'none',
      } as React.CSSProperties,
      spoken: {
        color: '#7b8794',
        fontWeight: 500,
      } as React.CSSProperties,
      active: {
        color: '#1e293b',
        fontWeight: 700,
      } as React.CSSProperties,
    } satisfies SubtitleStyles,
    mobileDockStateOverlay: {
      base: {
        position: 'absolute',
        left: '50%',
        bottom: '2px',
        transform: 'translateX(-50%)',
        zIndex: 8,
        minWidth: '34px',
        height: '18px',
        padding: '0 4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        borderRadius: '999px',
        background: 'rgba(18,49,63,.72)',
        color: '#fff',
        boxShadow: 'none',
      } as React.CSSProperties,
    } satisfies StateOverlayStyles,
  },
  canvas: {
    portrait: {
      width: '68px',
      height: '68px',
      borderRadius: '15px',
      overflow: 'hidden',
      background: '#000',
      flexShrink: 0,
    } as React.CSSProperties,
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
    } as React.CSSProperties,
    stateOverlay: {
      base: {
        position: 'static',
        minWidth: '28px',
        height: '27px',
        padding: '0 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        borderRadius: '999px',
        background: 'transparent',
        color: '#188b58',
        boxShadow: 'none',
        transform: 'none',
      } as React.CSSProperties,
    } satisfies StateOverlayStyles,
    maxToggle: {
      position: 'static',
      width: '22px',
      height: '22px',
      display: 'grid',
      placeItems: 'center',
      padding: 0,
      border: '1px solid rgba(180,202,216,.9)',
      borderRadius: '7px',
      background: 'rgba(255,255,255,.94)',
      color: '#537087',
      boxShadow: '0 3px 8px rgba(38,66,88,.1)',
      cursor: 'pointer',
      flexShrink: 0,
      zIndex: 50,
    } as React.CSSProperties,
  },
  minimized: {
    dock: {
      width: '80px',
      height: '80px',
      borderRadius: '10px',
      overflow: 'hidden',
      background: '#000',
      display: 'block',
    } as React.CSSProperties,
    video: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
    } as React.CSSProperties,
    stateOverlay: {
      base: {
        position: 'static',
        minWidth: '28px',
        height: '27px',
        padding: '0 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 0,
        borderRadius: '999px',
        background: 'transparent',
        color: '#188b58',
        boxShadow: 'none',
        transform: 'none',
      } as React.CSSProperties,
    } satisfies StateOverlayStyles,
  },
};

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
    <div className="journey-section-content min-h-0 min-w-0 w-full">
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
    speakThroughAvatar,
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
  const [canvasReturnMode, setCanvasReturnMode] =
    useState<Extract<InteractionMode, 'social' | 'copresent'>>('social');
  const [sessionMode, setSessionMode] = useState<SessionMode>('assist');
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [journeyOpen, setJourneyOpen] = useState(false);
  const [avatarMinimized, setAvatarMinimized] = useState(false);

  const handleSetInteractionMode = (mode: InteractionMode) => {
    if (
      mode === 'canvas' &&
      (interactionMode === 'social' || interactionMode === 'copresent')
    ) {
      setCanvasReturnMode(interactionMode);
    }
    setInteractionMode(mode);
  };

  const handleEnterCanvasMode = () => {
    setAvatarMinimized(false);
    handleSetInteractionMode('canvas');
  };

  const handleExitCanvasMode = () => {
    setInteractionMode(canvasReturnMode);
  };
  const [manualAvatarState, setManualAvatarState] =
    useState<AvatarState | null>(null);
  /** Greyed/muted avatar until user turns mic on for the first time. */
  const [avatarSessionEngaged, setAvatarSessionEngaged] = useState(false);

  useEffect(() => {
    if (manualVadStatus) {
      setAvatarSessionEngaged(true);
    }
  }, [manualVadStatus]);

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

  const activeAvatarState = !avatarSessionEngaged
    ? 'muted'
    : manualAvatarState ?? derivedAvatarState;

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
    void speakThroughAvatar(text);
  };

  const journeySectionProps = {
    currentNavigation,
    salesData,
    hotPageLoading,
    formatCurrency,
    recommendationCategoryData,
  };

  const renderVideoStageStack = ({
    stackClassName,
    frameClassName,
    portraitClassName,
    captionClassName,
    composerClassName,
    captionSpoken,
    captionActive,
    stageStackStyle,
    portraitStyle,
    videoShellStyle,
    videoStyle,
    composerStyle,
    canvasToggleStyle,
    subtitleStyles,
    stateOverlayStyles,
  }: {
    stackClassName: string;
    frameClassName: string;
    portraitClassName: string;
    captionClassName: string;
    composerClassName: string;
    captionSpoken: string;
    captionActive: string;
    stageStackStyle: React.CSSProperties;
    portraitStyle: React.CSSProperties;
    videoShellStyle: React.CSSProperties;
    videoStyle: React.CSSProperties;
    composerStyle: React.CSSProperties;
    canvasToggleStyle: React.CSSProperties;
    subtitleStyles: SubtitleStyles;
    stateOverlayStyles: StateOverlayStyles;
  }) => (
    <div className={stackClassName} style={stageStackStyle}>
      <div
        className={frameClassName}
        style={{ minHeight: 0, height: '100%', position: 'relative', overflow: 'visible' }}
      >
        <div
          className={`${portraitClassName} avatar-state-visual state-${activeAvatarState}`}
          style={portraitStyle}
        >
          <div className="companion-video-shell" style={videoShellStyle}>
            <SectionVideoOverlay>
              <CompanionVideo style={videoStyle}>
                <button
                  type="button"
                  className="avatar-minimize"
                  style={canvasToggleStyle}
                  onClick={handleEnterCanvasMode}
                  aria-label="Switch to canvas mode"
                  title="Switch to canvas mode"
                >
                  <Minimize2 size={15} strokeWidth={2.2} />
                </button>
              </CompanionVideo>
            </SectionVideoOverlay>
          </div>
          
          <AvatarStateOverlay
            state={activeAvatarState}
            style={resolveStateOverlayStyle(stateOverlayStyles, activeAvatarState)}
          />
        </div>

        

        <div
          className={captionClassName}
          style={subtitleStyles.container}
          aria-live="polite"
        >
          <p style={subtitleStyles.text}>
            <span
              className="caption-spoken"
              style={resolveSubtitleSpanStyle(subtitleStyles.text, subtitleStyles.spoken)}
            >
              {captionSpoken}
            </span>
            <span
              className="caption-active"
              style={resolveSubtitleSpanStyle(subtitleStyles.text, subtitleStyles.active)}
            >
              {captionActive}
            </span>
          </p>
        </div>
      </div>

      <Composer
        className={composerClassName}
        style={composerStyle}
        draft={draft}
        setDraft={setDraft}
        onSend={handleSendMessage}
        voiceOn={speakerEnabled}
        onVoiceToggle={toggleSpeakerPlayback}
        micOn={manualVadStatus}
        onMicToggle={() => setManualVadStatus(!manualVadStatus)}
      />
    </div>
  );

  const renderMinimizedVideoDock = () => (
    <button
      type="button"
      className={`minimized-avatar-dock state-${activeAvatarState}`}
      onClick={() => setAvatarMinimized(false)}
      aria-label="Restore AI video"
      title="Restore video"
    >
      <span className="minimized-video-dock" style={VIDEO_LAYOUT.minimized.dock}>
        <SectionVideoOverlay>
          <CompanionVideo style={VIDEO_LAYOUT.minimized.video} />
        </SectionVideoOverlay>
      </span>
      <AvatarStateOverlay
        state={activeAvatarState}
        style={resolveStateOverlayStyle(VIDEO_LAYOUT.minimized.stateOverlay, activeAvatarState)}
      />
      <Maximize2 size={17} />
    </button>
  );

  const renderSocialStage = () => (
    <div
      className={`social-stage state-${activeAvatarState} ${
        avatarMinimized ? 'avatar-minimized' : ''
      }`}
    >
      <div className="social-composition" style={VIDEO_LAYOUT.social.composition}>
        {avatarMinimized
          ? renderMinimizedVideoDock()
          : renderVideoStageStack({
              stackClassName: 'social-stage-stack',
              frameClassName: 'social-avatar-frame',
              portraitClassName: 'social-avatar',
              captionClassName: 'social-live-caption',
              composerClassName: 'social-composer',
              captionSpoken:
                'We’ve spoken about your family and current financial position. ',
              captionActive:
                'What would financial security for your family mean to you?',
              stageStackStyle: VIDEO_LAYOUT.social.stageStack,
              portraitStyle: VIDEO_LAYOUT.social.portrait,
              videoShellStyle: VIDEO_LAYOUT.social.videoShell,
              videoStyle: VIDEO_LAYOUT.social.video,
              composerStyle: VIDEO_LAYOUT.social.composer,
              canvasToggleStyle: VIDEO_LAYOUT.social.canvasToggle,
              subtitleStyles: VIDEO_LAYOUT.social.subtitle,
              stateOverlayStyles: VIDEO_LAYOUT.social.stateOverlay,
            })}
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
        onMaximize={handleExitCanvasMode}
        portraitStyle={VIDEO_LAYOUT.canvas.portrait}
        videoStyle={VIDEO_LAYOUT.canvas.video}
        stateOverlayStyle={resolveStateOverlayStyle(
          VIDEO_LAYOUT.canvas.stateOverlay,
          activeAvatarState,
        )}
        maxToggleStyle={VIDEO_LAYOUT.canvas.maxToggle}
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
          setInteractionMode={handleSetInteractionMode}
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
                  style={VIDEO_LAYOUT.copresent.avatarAside}
                >
                  {avatarMinimized
                    ? renderMinimizedVideoDock()
                    : renderVideoStageStack({
                        stackClassName: 'copresent-stage-stack',
                        frameClassName: 'copresent-avatar-frame',
                        portraitClassName: 'copresent-portrait',
                        captionClassName: 'copresent-live-caption',
                        composerClassName: 'copresent-composer',
                        captionSpoken:
                          'We have captured your financial details. ',
                        captionActive:
                          "How much of your family's monthly expenses should be protected?",
                        stageStackStyle: VIDEO_LAYOUT.copresent.stageStack,
                        portraitStyle: VIDEO_LAYOUT.copresent.portrait,
                        videoShellStyle: VIDEO_LAYOUT.copresent.videoShell,
                        videoStyle: VIDEO_LAYOUT.copresent.video,
                        composerStyle: VIDEO_LAYOUT.copresent.composer,
                        canvasToggleStyle: VIDEO_LAYOUT.copresent.canvasToggle,
                        subtitleStyles: VIDEO_LAYOUT.copresent.subtitle,
                        stateOverlayStyles: VIDEO_LAYOUT.copresent.stateOverlay,
                      })}
                </aside>

                <section className="copresent-content">
                  <div className="copresent-content-scroll">
                    <JourneySectionContent {...journeySectionProps} />
                  </div>
                </section>

                <aside className="copresent-mobile-dock" aria-label="AI conversation controls">
                  <div className="mobile-dock-caption">
                    <div
                      className={`mobile-dock-avatar state-${activeAvatarState}`}
                      style={VIDEO_LAYOUT.copresent.mobileDockAvatar}
                    >
                      <SectionVideoOverlay>
                        <CompanionVideo style={VIDEO_LAYOUT.copresent.mobileDockVideo} />
                      </SectionVideoOverlay>
                      <AvatarStateOverlay
                        state={activeAvatarState}
                        style={resolveStateOverlayStyle(
                          VIDEO_LAYOUT.copresent.mobileDockStateOverlay,
                          activeAvatarState,
                        )}
                      />
                    </div>
                    <p style={VIDEO_LAYOUT.copresent.mobileDockSubtitle.text}>
                      <span
                        className="caption-spoken"
                        style={resolveSubtitleSpanStyle(
                          VIDEO_LAYOUT.copresent.mobileDockSubtitle.text,
                          VIDEO_LAYOUT.copresent.mobileDockSubtitle.spoken,
                        )}
                      >
                        We have captured your financial details.{' '}
                      </span>
                      <span
                        className="caption-active"
                        style={resolveSubtitleSpanStyle(
                          VIDEO_LAYOUT.copresent.mobileDockSubtitle.text,
                          VIDEO_LAYOUT.copresent.mobileDockSubtitle.active,
                        )}
                      >
                        How much should be protected?
                      </span>
                    </p>
                  </div>
                  <Composer
                    className="copresent-composer"
                    style={VIDEO_LAYOUT.copresent.composer}
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
