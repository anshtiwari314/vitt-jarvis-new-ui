import React,{useState, useEffect,useRef} from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';
import { useVad } from '../../context/VadWrapper';
import { setPlanSelected } from '../../reducers/healthManagmentReducer';

export default function SideNavigation() {
  const { salesData, planSelected } = useAppSelector(
    (state) => state.healthManagmentReducer
  );
  const recommendations =salesData.Recommendations;
  const { socket } = useData()
  const [clientName,qpParams] = useAppSelector((state) => [state.healthManagmentReducer.clientName,state.qpReducer])

  const dispatch = useAppDispatch();
  const currentNavigation = useAppSelector(
    (state) => state.healthManagmentReducer.navigation
  );
  const { recommendationsGenerated, pref_language } = useData();
  console.log("recoomendation Genrated--->",recommendationsGenerated);
  
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);

  const handleNavigationClick = (page: string) => {
    dispatch(setNavigation(page));
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

  const iconClass = "w-6 h-6 mr-3 text-sky-500";

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
  console.log(recommendationSubItems,"recommendation sub items---");


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

  const updateDateTime = () => {
    const now = new Date();
    const dateEl = document.getElementById("current-date");
    const timeEl = document.getElementById("current-time");
    if (dateEl)
      dateEl.textContent = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    if (timeEl)
      timeEl.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
   <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:block">

  {/* Top Section */}
  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
    <a
      href="#/lead-management"
      id="home-button"
      className="text-slate-500 hover:text-sky-600"
      onClick={() => handleNavigationClick("basicInfo")}
    >
      <svg className="w-7 h-7 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
    </a>

    <div className="text-right">
      <div id="current-date" className="font-semibold text-slate-700"></div>
      <div id="current-time" className="text-sm text-slate-500"></div>
    </div>
  </div>

  {/* AI Copilot Header */}
  <div className="flex items-center gap-3 p-4 border-b border-slate-200">
    <div className="bg-indigo-600 p-2 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-half">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        <path d="M12 22V2" />
      </svg>
    </div>

    <h1 className="text-lg font-bold text-slate-800">
      {lang.aiCopilot}
    </h1>
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
  <SystemStatus />

</aside>
  );

}


const SystemStatus = () => {
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);
  const currentIndexRef = useRef(-1); // Start with -1 to indicate no items are green initially

  const {VAD2} = useVad()
  // Create refs for each individual indicator DOM element
  const audioRef = useRef(null);
  const transcriptionRef = useRef(null);
  const processingRef = useRef(null);

  // Store the refs in an array for easy iteration
  const indicatorRefs = [audioRef, transcriptionRef, processingRef];

  const startAnimation = () => {
    setIsActive(true);
  };

  const stopAnimation = () => {
    setIsActive(false);
    clearInterval(intervalRef.current);
    currentIndexRef.current = -1; // Reset the index
    // Reset all indicators to gray when stopping
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
        // Increment the index
        currentIndexRef.current = (currentIndexRef.current + 1) % (indicatorRefs.length + 1);

        // Iterate through the refs and update their colors
        indicatorRefs.forEach((ref, index) => {
          if (ref.current) {
            if (index < currentIndexRef.current) {
              // If the indicator's index is less than the current index, make it green
              ref.current.classList.remove('bg-gray-300');
              ref.current.classList.add('bg-green-500');
            } else {
              // Otherwise, make it gray
              ref.current.classList.remove('bg-green-500');
              ref.current.classList.add('bg-gray-300');
            }
          }
        });

        // Special case: if currentIndexRef.current is 3, all are green and we wait for the loop to reset
        // The next cycle (currentIndexRef.current === 0) will then make all gray again
      }, 1000); // Change every 1 second
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  useEffect(()=>{
    if(VAD2?.listening){
        startAnimation()
    }else{
        stopAnimation()
    }       
  },[VAD2])
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

      {/* <div className="mt-4 flex space-x-2">
        <button
          onClick={startAnimation}
          className="px-4 py-2 text-white bg-green-500 rounded-md disabled:bg-gray-400"
          disabled={isActive}
        >
          Start
        </button>
        <button
          onClick={stopAnimation}
          className="px-4 py-2 text-white bg-red-500 rounded-md disabled:bg-gray-400"
          disabled={!isActive}
        >
          Stop
        </button>
      </div> */}
    </div>
  );
};