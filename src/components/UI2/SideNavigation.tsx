import React,{useState,useEffect,useRef} from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';
import { useVad } from '../../context/VadWrapper';

export default function SideNavigation(){
    const dispatch = useAppDispatch();
    const currentNavigation = useAppSelector(state => state.salesCopilotReducer.navigation);

    const {recommendationsGenerated,setRecommendationsGenerated} = useData()

    const handleNavigationClick = (page: string) => {
        dispatch(setNavigation(page));
    };

    // const navItems = [
    //     { id: 'basicInfo', label: 'Basic Info', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> },
    //     { id: 'asset', label: 'Assets', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> },
    //     { id: 'liability', label: 'Liabilities', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> },
    //     { id: 'financialGoals', label: 'Financial Goals', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M12 4v4m0 0l-2-2m2 2l2-2"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18V14m0 4a2 2 0 002-2v-1a2 2 0 00-2-2h-1a2 2 0 00-2 2v1a2 2 0 002 2z"></path></svg> },
    //     { id: 'planSummary', label: 'Plan Summary', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
    //     { id: 'productRec', label: 'Recommendations', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> },
    // ];

    const navItems = [
    { id: 'basicInfo', label: 'Basic Info', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke="#38BDF8"></path></svg> },
    { id: 'asset', label: 'Assets', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" stroke="#38BDF8"></path></svg> },
    { id: 'liability', label: 'Liabilities', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="#38BDF8"></path></svg> },
    { id: 'financialGoals', label: 'Financial Goals', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M12 4v4m0 0l-2-2m2 2l2-2" stroke="#38BDF8"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18V14m0 4a2 2 0 002-2v-1a2 2 0 00-2-2h-1a2 2 0 00-2 2v1a2 2 0 002 2z" stroke="#38BDF8"></path></svg> },
    { id: 'planSummary', label: 'Plan Summary', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#38BDF8"></path></svg> },
    { id: 'productRec', label: 'Recommendations', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke="#38BDF8"></path></svg> },
];
    // Function to update date and time (from index2.html)
    const updateDateTime = () => {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    React.useEffect(() => {
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000 * 30); // Update time every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <a href="#/lead-management" id="home-button" className="text-slate-500 hover:text-sky-600" onClick={() => handleNavigationClick('basicInfo')}>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                    </a>
                    <div className="text-right" style={{display:'flex',alignItems:'center'}}>
                        <div id="current-date" className="font-semibold text-slate-700" style={{marginRight:'0.5rem'}}></div>
                        <div id="current-time" className="text-sm text-slate-500" style={{marginLeft:'0.5rem'}}></div>
                    </div>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(item => (
                        <a
                            key={item.id}
                            //href="#"
                            className={`flex items-center px-3 py-3 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 ${currentNavigation === item.id ? 'active-nav-item' : ''}`}
                            style={{cursor:'default'}}
                            onClick={() => handleNavigationClick(item.id)}
                        >
                            {item.icon}
                            {item.label}
                        </a>
                    ))}
                </nav>

                    {
                        recommendationsGenerated && 
                        <div className="p-4 border-r border-slate-200">
                            <div id="status-audio" className="flex items-center text-slate-500">
                                    <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-green-300 transition-colors"></div> Recommendations Generated
                            </div>
                        </div>
                    }
                
                
                {/* <div className="p-4 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-600 mb-3">System Status</h3>
                    <div className="space-y-2 text-sm">
                        <div id="status-audio" className="flex items-center text-slate-500">
                            <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-gray-300 transition-colors"></div> Audio Streaming
                        </div>
                        <div id="status-transcription" className="flex items-center text-slate-500">
                            <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-gray-300 transition-colors"></div> Live Transcription
                        </div>
                        <div id="status-processing" className="flex items-center text-slate-500">
                            <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-gray-300 transition-colors"></div> AI Processing
                        </div>
                    </div>
                </div> */}
                <SystemStatus/>
            </aside>

    )



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



