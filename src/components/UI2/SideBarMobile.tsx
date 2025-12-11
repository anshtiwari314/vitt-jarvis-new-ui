import React, { useState, useEffect, useRef, useCallback } from 'react';
// Imports for store and context removed as they caused build errors.
// We will use local state for demonstration.
 import { useAppDispatch, useAppSelector } from '../../store/store';
 import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';
import { setPlanSelected } from '../../reducers/healthManagmentReducer';

export default function SideBarMobile() {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false); // State to manage open/close
   const { salesData, planSelected } = useAppSelector(
      (state) => state.healthManagmentReducer
    );
  // --- Mocked State (replacing Redux and Context) ---
  const [currentNavigation, setCurrentNavigation] = useState('basicInfo');
  const { recommendationsGenerated } = { recommendationsGenerated: true }; // Mock data from useData
  // const dispatch = useAppDispatch(); // Removed
  // const currentNavigation = useAppSelector(state => state.healthManagmentReducer.navigation); // Replaced with local state
  // const { recommendationsGenerated } = useData(); // Replaced with mock data
  // --- End of Mocked State ---
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);

  // --- Draggable Button State ---
  const [position, setPosition] = useState({ x: window.innerWidth - window.innerWidth/3, y: window.innerHeight / 2 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [dragStart, setDragStart] = useState({ pointerX: 0, pointerY: 0, buttonX: 0, buttonY: 0 });
  const buttonRef = useRef(null);
  const recommendations =salesData.Recommendations;

  // Updated handler to close panel on navigation and use local state
  const handleNavigationClick = (page: string) => {
     dispatch(setNavigation(page)); // Removed
    setCurrentNavigation(page); // Use local state
    setIsOpen(false);
  };
  const {  pref_language } = useData();
   const labels = {
    en: {
      basicInfo: "Basic Info",
      healthProfile: "Health Profile",
      recommendations: "Recommendation",
      planSummary: "Plan Summary",
      aiCopilot: "AI Copilot",
      recGenerated: "Recommendations Generated",
      systemStatus: "System Status",
      audioStreaming: "Audio Streaming",
      liveTranscription: "Live Transcription",
      aiProcessing: "AI Processing",
    },
    mr: {
      basicInfo: "मूलभूत माहिती",
      healthProfile: "आरोग्य प्रोफाइल",
      recommendations: "शिफारसी",
      planSummary: "योजनेचा सारांश",
      aiCopilot: "एआय सहाय्यक",
      recGenerated: "शिफारसी तयार झाल्या",
      systemStatus: "प्रणाली स्थिती",
      audioStreaming: "ऑडिओ प्रवाह",
      liveTranscription: "थेट लिप्यंतरण",
      aiProcessing: "एआय प्रक्रिया",
    },
  };
  const lang = pref_language === "mr" ? labels.mr : labels.en;

    const recommendationSubItems = recommendations?.map((rec: any, index: number) => ({
    id: `recommendation_${index + 1}`,
    label: rec.planName?.value || `Recommendation ${index + 1}`,
    planName: rec.planName?.value || "",
  }));
  //console.log(recommendationSubItems,"recommendation sub items---");
  const iconClass = "w-6 h-6 mr-3 text-sky-500";

    const navItems = [
    {
      id: "basicInfo",
      label: lang.basicInfo,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "healthProfile",
      label: lang.healthProfile,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "recommendations",
      label: lang.recommendations,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      subItems: recommendationSubItems,
    },
    {
      id: "planSummary",
      label: lang.planSummary,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];


  // --- Draggable Button Handlers ---

  const handleDragStart = (e) => {
    if (!buttonRef.current) return;
    
    setIsDragging(true);
    setHasDragged(false);

    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    // Get button's current position from state
    setPosition(currentPos => {
      setDragStart({
        pointerX: clientX,
        pointerY: clientY,
        buttonX: currentPos.x,
        buttonY: currentPos.y,
      });
      return currentPos; // No change, just using the callback to get latest state
    });
    
    if (e.type === 'mousedown') {
      e.preventDefault(); // Prevent text selection
    }
  };

  const handleDragMove = useCallback((e) => {
    if (!isDragging || !buttonRef.current) return;
    
    setHasDragged(true); // Mark as dragged

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStart.pointerX;
    const deltaY = clientY - dragStart.pointerY;

    let newX = dragStart.buttonX + deltaX;
    let newY = dragStart.buttonY + deltaY;

    // Constrain to viewport
    const rect = buttonRef.current.getBoundingClientRect();
    newX = Math.max(8, Math.min(newX, window.innerWidth - rect.width - 8)); // 8px padding
    newY = Math.max(8, Math.min(newY, window.innerHeight - rect.height - 8)); // 8px padding

    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, buttonRef]); // Dependencies

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const [clientName,qpParams] = useAppSelector((state) => [state.healthManagmentReducer.clientName,state.qpReducer])
const { socket } = useData()
  // Updated to use mobile-specific IDs
  const updateDateTime = () => {
    const now = new Date();
    const dateEl = document.getElementById('current-date-mobile');
    const timeEl = document.getElementById('current-time-mobile');
    if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };
  const handlePlanClick = (planName: string) => {
      //yaha se planNme ke naam se filter karna hai ki konsaplan hai phir uska context_name bhejna hai backned ko 
     const selectedPlan = recommendations?.find(
    (p: any) => p.planName?.value === planName
  );
              console.log(selectedPlan,"[DEBUG!]---");
      let context_name = selectedPlan?.context_name || "";
      console.log("context_name--->",context_name);
    const pyLoad = {
      roomid: qpParams.roomId,
      context_name: context_name
    }
    console.log("the pyload is",pyLoad);
    
  
    socket && socket.emit('save_user_context', pyLoad)
  
      dispatch(setPlanSelected(planName));
    };
  

  // Effect for initial centering
  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition(prev => ({ ...prev, y: window.innerHeight / 3 - rect.height / 2 }));
    }
  }, []); // On mount

  // Effect for adding/removing global listeners
  useEffect(() => {
    const moveHandler = (e) => {
      // Prevent scrolling while dragging on touch devices
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

  useEffect(() => {
    console.log('sidebar-mobile',isOpen)
    // Only run this effect if the panel is open
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
          if (!hasDragged) { // Only open if it wasn't a drag
            setIsOpen(true);
          }
        }}
        className={`lg:hidden fixed z-[99] bg-white p-2 rounded-lg shadow-lg border border-slate-200 transition-opacity duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Open navigation"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          touchAction: 'none', // Disable default touch behaviors
          cursor: isDragging ? 'grabbing' : 'grab' // Visual feedback
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
            {/* Cross Icon */}
            <svg className="w-7 h-7 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-right">
            {/* Using new mobile-specific IDs */}
            <div id="current-date-mobile" className="font-semibold text-slate-700"></div>
            <div id="current-time-mobile" className="text-sm text-slate-500"></div>
          </div>
        </div>

        {/* AI Copilot Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
              fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" className="lucide lucide-shield-half">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="M12 22V2" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-slate-800">AI Copilot</h1>
        </div>

        {/* Navigation */}
         <nav className="flex-1 p-2 space-y-1">

    {navItems.map((item) => (
      <div key={item.id}>

        {/* MAIN NAV ITEM */}
        <div
          className={`flex items-center justify-between px-3 py-3 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer ${
            currentNavigation === item.id ? "bg-slate-100 text-sky-600" : ""
          }`}
          onClick={() =>
            item.subItems
              ? setRecommendationsOpen((prev) => !prev)
              : handleNavigationClick(item.id)
          }
        >
          <div className="flex items-center">
            {item.icon}
            {item.label}
          </div>

          {item.subItems && (
            <svg
              className={`w-5 h-5 transition-transform ${
                recommendationsOpen ? "rotate-90 text-sky-500" : "text-slate-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>

        {/* SUB ITEMS */}
        {item.subItems && recommendationsOpen && (
          <div className="ml-10 mt-1 space-y-1">
            {item.subItems.map((sub) => (
              <div
                key={sub.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setRecommendationsOpen(true);
                  handleNavigationClick("recommendations");
                  handlePlanClick(sub.planName);
                }}
                className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                  currentNavigation === "recommendations" &&
                  planSelected === sub.planName
                    ? "bg-sky-50 text-sky-700 font-medium"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {sub.label}
              </div>
            ))}
          </div>
        )}

      </div>
    ))}

  </nav>

        {/* Recommendations Status */}
        {recommendationsGenerated && (
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center text-slate-500 text-sm">
              <div className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></div>
              Recommendations Generated
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="p-4 border-t border-slate-200">
          <h3 className="text-sm font-semibold text-slate-600 mb-3">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> Audio Streaming
            </div>
            <div className="flex items-center text-slate-500">
              {/* Corrected a typo in the class name here */}
              <div className="w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> Live Transcription
            </div>
            <div className="flex items-center text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> AI Processing
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}


