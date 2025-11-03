import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';
import { useVad } from '../../context/VadWrapper';

export default function SideBarMobile() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false); // State to manage open/close

  // --- Real State (from SideNavigation) ---
  const currentNavigation = useAppSelector(state => state.salesCopilotReducer.navigation);
  const { recommendationsGenerated } = useData();
  // --- End of Real State ---

  // --- Draggable Button State ---
  const [position, setPosition] = useState({ x: 16, y: window.innerHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ pointerX: 0, pointerY: 0, buttonX: 0, buttonY: 0 });
  const buttonRef = useRef(null);

  // --- Merged Handler (from SideNavigation logic + SideBarMobile logic) ---
  const handleNavigationClick = (page: string) => {
    dispatch(setNavigation(page)); // Real logic from SideNavigation
    setIsOpen(false); // Logic from SideBarMobile (to close panel)
  };

  // --- Nav Items (from SideNavigation) ---
  const navItems = [
    { id: 'basicInfo', label: 'Basic Info', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="#38BDF8"></path></svg> },
    { id: 'asset', label: 'Assets', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke="#38BDF8"></path></svg> },
    { id: 'liability', label: 'Liabilities', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="#38BDF8"></path></svg> },
    { id: 'financialGoals', label: 'Financial Goals', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M12 4v4m0 0l-2-2m2 2l2-2" stroke="#38BDF8"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18V14m0 4a2 2 0 002-2v-1a2 2 0 00-2-2h-1a2 2 0 00-2 2v1a2 2 0 002 2z" stroke="#38BDF8"></path></svg> },
    { id: 'planSummary', label: 'Plan Summary', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#38BDF8"></path></svg> },
    { id: 'productRec', label: 'Recommendations', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke="#38BDF8"></path></svg> },
  ];


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
      setPosition(prev => ({ ...prev, y: window.innerHeight / 2 - rect.height / 2 }));
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
      {/* --- Hamburger Trigger Button --- */}
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
        <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* --- Mobile Sidebar Panel --- */}
      <aside
        className={`fixed top-0 left-0 z-40 w-screen h-screen bg-white flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}
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
  stroke-width="2" 
  stroke-linecap="round" 
  stroke-linejoin="round"
>
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  <path d="M12 11.1c-1.9-1.8-4.6-.9-4.6 1.4 0 1.9 4.6 4.1 4.6 4.1s4.6-2.2 4.6-4.1c0-2.3-2.7-3.2-4.6-1.4z"/>
</svg>
          </div>
          <h1 className="text-lg font-bold text-slate-800">Life Ins AI Copilot</h1>
        </div>

        {/* Navigation (Using real navItems and handler) */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <a
              key={item.id}
              className={`flex items-center px-3 py-3 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 ${currentNavigation === item.id ? 'bg-slate-100 text-sky-600' : ''}`}
              onClick={() => handleNavigationClick(item.id)} // Will close panel
              style={{cursor: 'pointer'}} // Add cursor pointer
            >
              {item.icon}
              {item.label}
            </a>
          ))}
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