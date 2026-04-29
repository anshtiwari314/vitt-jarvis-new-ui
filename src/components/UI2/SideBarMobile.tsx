import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';
import { useVad } from '../../context/VadWrapper';
import playSound from '../../assets/sound-play.gif';
import { AudioLines } from 'lucide-react';

export default function SideBarMobile() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false); // State to manage open/close

  // --- Real State (from SideNavigation) ---
  const currentNavigation = useAppSelector(state => state.salesCopilotReducer.navigation);
  const { recommendationsGenerated } = useData();
  // @ts-ignore — VadContext is loosely typed
  const { VAD2, manualVadStatus } = useVad();
  // --- End of Real State ---
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);
  const [financialReviewOpen, setFinancialReviewOpen] = useState(false);
  const [speakGifLoaded, setSpeakGifLoaded] = useState(false);
  // --- Draggable Button State ---
  const [position, setPosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth - 60 : 16, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ pointerX: 0, pointerY: 0, buttonX: 0, buttonY: 0 });
  const buttonRef = useRef(null);
      const salesData = useAppSelector(state => state.salesCopilotReducer.salesData); 
  
  const mockData = salesData.recommendations;
  const recCategories: { category: string; title: string }[] = Array.isArray(mockData)
    ? []
    : (mockData as any)?.categories?.map((c: any) => ({
        category: c.category,
        title: c.title || c.category,
      })) ?? [];

  const recNavKey = (cat: string) => `Recommendations::${cat}`;

  useEffect(() => {
    if (typeof currentNavigation === 'string' && currentNavigation.startsWith('Recommendations::')) {
      setRecommendationsOpen(true);
    }
    if (currentNavigation === 'Assets' || currentNavigation === 'Liabilities') {
      setFinancialReviewOpen(true);
    }
  }, [currentNavigation]);

  // --- Merged Handler ---
  const handleNavigationClick = (page: string) => {
    dispatch(setNavigation(page));
    setIsOpen(false);
  };

  const ICON_COLOR = "#38BDF8";
  const iconClass = "w-5 h-5 shrink-0";


  // --- Draggable Button Handlers (from SideBarMobile) ---

  const handleDragStart = (e) => {
    if (!buttonRef.current) return;
    
    setIsDragging(true);
    setHasDragged(false);

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    setPosition(currentPos => {
      setDragStart({
        pointerX: clientX,
        pointerY: clientY,
        buttonX: currentPos.x,
        buttonY: currentPos.y,
      });
      return currentPos;
    });
    
    if (e.type === 'mousedown') {
      e.preventDefault();
    }
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !buttonRef.current) return;
    
    setHasDragged(true);

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStart.pointerX;
    const deltaY = clientY - dragStart.pointerY;

    let newX = dragStart.buttonX + deltaX;
    let newY = dragStart.buttonY + deltaY;

    const rect = buttonRef.current.getBoundingClientRect();
    newX = Math.max(8, Math.min(newX, window.innerWidth - rect.width - 8));
    newY = Math.max(8, Math.min(newY, window.innerHeight - rect.height - 8));

    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, buttonRef]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // --- Date/Time Handler (from SideBarMobile, using mobile-specific IDs) ---
  const updateDateTime = () => {
    const now = new Date();
    const dateEl = document.getElementById('current-date-mobile');
    const timeEl = document.getElementById('current-time-mobile');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // --- Effects (from SideBarMobile) ---
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Position at the right edge, just below the header
      setPosition({ 
        x: window.innerWidth - rect.width - 16, 
        y: 80 
      });
    }
  }, []);

  useEffect(() => {
    const moveHandler = (e) => {
      if (e.type === 'touchmove' && isDragging) {
        e.preventDefault(); 
      }
      handleDragMove(e);
    };
    
    if (isDragging) {
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('touchmove', moveHandler, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Only update time if the panel is open
  useEffect(() => {
    if (isOpen) {
      updateDateTime();
      const interval = setInterval(updateDateTime, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  return (
    <div>
      {/* --- Hamburger Trigger Button (with VAD speaking icon to its left) --- */}
      <button
        ref={buttonRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={() => {
          if (!hasDragged) {
            setIsOpen(true);
          }
        }}
        className={`lg:hidden fixed z-50 bg-white p-2 rounded-lg shadow-lg border border-slate-200 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Open navigation"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {VAD2?.userSpeaking && manualVadStatus === true && (
          <>
            {!speakGifLoaded && (
              <AudioLines className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-8 h-8 text-sky-500 animate-pulse pointer-events-none" />
            )}
            <img
              src={playSound}
              alt="User Speaking"
              onLoad={() => setSpeakGifLoaded(true)}
              className={`absolute right-full top-1/2 -translate-y-1/2 mr-2 w-16 h-8 object-contain pointer-events-none ${speakGifLoaded ? '' : 'hidden'}`}
            />
          </>
        )}
        <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* --- Mobile Sidebar Panel ---
          h-dvh (dynamic viewport height) instead of h-screen so the panel
          never extends under the mobile browser's address bar — otherwise
          the bottom (System Status) gets cropped. */}
      <aside
        className={`fixed top-0 left-0 z-40 w-screen h-dvh bg-white flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}
      >
        {/* Top Section with Close Button & Date */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-500 hover:text-sky-600"
            aria-label="Close navigation"
          >
            <svg className="w-7 h-7 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-right">
            <div id="current-date-mobile" className="font-semibold text-slate-700"></div>
            <div id="current-time-mobile" className="text-sm text-slate-500"></div>
          </div>
        </div>

        {/* AI Copilot Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200">
          <div className="bg-blue-500 p-2 rounded-lg">
            <svg
  xmlns="http://www.w3.org/2000/svg"
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="white"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  <path d="M12 11.1c-1.9-1.8-4.6-.9-4.6 1.4 0 1.9 4.6 4.1 4.6 4.1s4.6-2.2 4.6-4.1c0-2.3-2.7-3.2-4.6-1.4z"/>
</svg>
          </div>
          <h1 className="text-lg font-bold text-slate-800">Life Ins AI Copilot</h1>
        </div>

        {/* Navigation — scrolls when content overflows so SystemStatus stays
            visible at the bottom. min-h-0 lets the flex item shrink. */}
        <nav className="flex-1 min-h-0 overflow-y-auto thin-scrollbar p-2 space-y-1">
            {/* Basic Info */}
            <button
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm ${currentNavigation === 'Basic Info' ? 'active-nav-item' : ''}`}
                onClick={() => handleNavigationClick('Basic Info')}
            >
                <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                Basic Info
            </button>

            {/* Financial Goals */}
            <button
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm ${currentNavigation === 'Financial Goals' ? 'active-nav-item' : ''}`}
                onClick={() => handleNavigationClick('Financial Goals')}
            >
                <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Financial Goals
            </button>

            {/* Financial Review — dropdown */}
            <div>
                <button
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm ${currentNavigation === 'Assets' || currentNavigation === 'Liabilities' ? 'active-nav-item' : ''}`}
                    onClick={() => setFinancialReviewOpen(prev => !prev)}
                >
                    <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span className="flex-1 text-left">Financial Review</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${financialReviewOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
                {financialReviewOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                        <button
                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 text-sm ${currentNavigation === 'Assets' ? 'active-nav-item' : ''}`}
                            onClick={() => handleNavigationClick('Assets')}
                        >
                            <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                            Assets
                        </button>
                        <button
                            className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 text-sm ${currentNavigation === 'Liabilities' ? 'active-nav-item' : ''}`}
                            onClick={() => handleNavigationClick('Liabilities')}
                        >
                            <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a2 2 0 00-2 2v8a3 3 0 003 3z"/></svg>
                            Liabilities
                        </button>
                    </div>
                )}
            </div>

            {/* Plan Summary */}
            <button
                className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm ${currentNavigation === 'Plan Summary' ? 'active-nav-item' : ''}`}
                onClick={() => handleNavigationClick('Plan Summary')}
            >
                <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
                Plan Summary
            </button>

            {/* Recommendations — dropdown */}
            <div>
                <button
                    className={`flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm ${typeof currentNavigation === 'string' && currentNavigation.startsWith('Recommendations::') ? 'active-nav-item' : ''}`}
                    onClick={() => setRecommendationsOpen(prev => !prev)}
                >
                    <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                    <span className="flex-1 text-left">Recommendations</span>
                    <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${recommendationsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                {recommendationsOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-100 pl-3">
                        {recCategories.length === 0 && (
                            <div className="px-3 py-2 text-xs text-slate-400">No recommendations yet</div>
                        )}
                        {recCategories.map(cat => (
                            <button
                                key={cat.category}
                                className={`flex items-center gap-3 w-full px-3 py-2 text-slate-600 font-medium rounded-lg hover:bg-slate-100 text-sm ${currentNavigation === recNavKey(cat.category) ? 'active-nav-item' : ''}`}
                                onClick={() => handleNavigationClick(recNavKey(cat.category))}
                            >
                                <span className="flex-1 text-left">{cat.title}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </nav>

        {/* Recommendations Status (Using real data) */}
        {recommendationsGenerated && (
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center text-slate-500 text-sm">
              <div className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></div>
              Recommendations Generated
            </div>
          </div>
        )}

        {/* System Status (Using real component) */}
        <SystemStatus />

      </aside>
    </div>
  );
}


// --- SystemStatus Component (Copied from SideNavigation) ---
// This component now has access to the useVad hook provided by its parent's context
const SystemStatus = () => {
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);
  const currentIndexRef = useRef(-1);

  const { VAD2 } = useVad();
  
  const audioRef = useRef(null);
  const transcriptionRef = useRef(null);
  const processingRef = useRef(null);

  const indicatorRefs = [audioRef, transcriptionRef, processingRef];

  const startAnimation = () => {
    setIsActive(true);
  };

  const stopAnimation = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    currentIndexRef.current = -1;
    indicatorRefs.forEach(ref => {
      if (ref.current) {
        ref.current.classList.remove('bg-green-500');
        ref.current.classList.add('bg-gray-300');
      }
    });
  };

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        currentIndexRef.current = (currentIndexRef.current + 1) % (indicatorRefs.length + 1);

        indicatorRefs.forEach((ref, index) => {
          if (ref.current) {
            if (index < currentIndexRef.current) {
              ref.current.classList.remove('bg-gray-300');
              ref.current.classList.add('bg-green-500');
            } else {
              ref.current.classList.remove('bg-green-500');
              ref.current.classList.add('bg-gray-300');
            }
          }
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  useEffect(() => {
    if (VAD2?.listening) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }, [VAD2]);
  
  return (
    <div className="p-4 border-t border-slate-200">
      <h3 className="text-sm font-semibold text-slate-600 mb-3">System Status</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center text-slate-500">
          <div
            ref={audioRef}
            className="status-indicator w-2.5 h-2.5 rounded-full mr-2 transition-colors bg-gray-300"
          ></div>
          Audio Streaming
        </div>
        <div className="flex items-center text-slate-500">
          <div
            ref={transcriptionRef}
            className="status-indicator w-2.5 h-2.5 rounded-full mr-2 transition-colors bg-gray-300"
          ></div>
          Live Transcription
        </div>
        <div className="flex items-center text-slate-500">
          <div
            ref={processingRef}
            className="status-indicator w-2.5 h-2.5 rounded-full mr-2 transition-colors bg-gray-300"
          ></div>
          AI Processing
        </div>
      </div>
    </div>
  );
};