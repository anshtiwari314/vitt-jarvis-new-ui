import React,{useState,useEffect,useRef} from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';
import { useVad } from '../../context/VadWrapper';

export default function SideNavigation(){
    const dispatch = useAppDispatch();
    const currentNavigation = useAppSelector(state => state.salesCopilotReducer.navigation);
    const salesData = useAppSelector(state => state.salesCopilotReducer.salesData);

    const { recommendationsGenerated, emitSelectedTopic } = useData()
    const [financialReviewOpen, setFinancialReviewOpen] = useState(false);
    const [recommendationsOpen, setRecommendationsOpen] = useState(false);

    const handleNavigationClick = (page: string) => {
        console.log("clicked on---->", page);
        dispatch(setNavigation(page));
        emitSelectedTopic(page);
    };

    const handleRecommendationsClick = () => {
        setRecommendationsOpen(true);
        emitSelectedTopic('Recommendations');
        if (recCategories.length > 0) {
            dispatch(setNavigation(recNavKey(recCategories[0].category)));
        } else {
            dispatch(setNavigation('Recommendations'));
        }
    };

    const handleCategoryNavigation = (categoryKey: string) => {
        dispatch(setNavigation(categoryKey));
    };

    const isRecommendationsActive =
        currentNavigation === 'Recommendations' ||
        (typeof currentNavigation === 'string' && currentNavigation.startsWith('Recommendations::'));

    const mockData = salesData.recommendations;
    // recommendations can be an array (old format) or { categories: [...] } (new format)
    const recCategories: { category: string; title: string }[] = Array.isArray(mockData)
      ? []
      : (mockData as any)?.categories?.map((c: any) => ({
          category: c.category,
          title: c.title || c.category,
        })) ?? [];

    const recNavKey = (cat: string) => `Recommendations::${cat}`;

    const updateDateTime = () => {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    React.useEffect(() => {
        updateDateTime();
        const interval = setInterval(updateDateTime, 1000 * 30);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (currentNavigation === 'Assets' || currentNavigation === 'Liabilities') {
            setFinancialReviewOpen(true);
        }
        if (
            currentNavigation === 'Recommendations' ||
            (typeof currentNavigation === 'string' && currentNavigation.startsWith('Recommendations::'))
        ) {
            setRecommendationsOpen(true);
        }
    }, [currentNavigation]);

    const iconClass = "w-5 h-5 shrink-0";
    const ICON_COLOR = "#60A5FA";

    const navItemClass = (active: boolean) =>
        `flex items-center gap-3 w-full px-3 py-2.5 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 text-sm ${active ? 'active-nav-item' : ''}`;

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:block">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <a href="#/lead-management" id="home-button" className="text-slate-500 hover:text-sky-600" onClick={() => handleNavigationClick('Data Retrieval')}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                </a>
                <div className="flex items-center gap-2">
                    <div id="current-date" className="font-semibold text-slate-700 text-sm"></div>
                    <div id="current-time" className="text-sm text-slate-500"></div>
                </div>
            </div>
            <nav className="overflow-y-auto px-3 py-4" style={{ height: '50vh' }}>
                <div className="space-y-1">

                    {/* Client Info */}
                    <button
                        className={navItemClass(currentNavigation === 'Data Retrieval')}
                        onClick={() => handleNavigationClick('Data Retrieval')}
                    >
                        <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                        Client Info
                    </button>

                    {/* Financial Review — dropdown toggle only (hidden for now)
                    <div>
                        <button
                            className={navItemClass(currentNavigation === 'Assets' || currentNavigation === 'Liabilities')}
                            onClick={() => setFinancialReviewOpen(prev => !prev)}
                        >
                            <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            <span className="flex-1 text-left">Financial Review</span>
                            <svg
                                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${financialReviewOpen ? 'rotate-90' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        {financialReviewOpen && (
                            <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-100 pl-3">
                                <button
                                    className={navItemClass(currentNavigation === 'Assets')}
                                    onClick={() => handleNavigationClick('Assets')}
                                >
                                    <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                    Assets
                                </button>
                                <button
                                    className={navItemClass(currentNavigation === 'Liabilities')}
                                    onClick={() => handleNavigationClick('Liabilities')}
                                >
                                    <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a2 2 0 00-2 2v8a3 3 0 003 3z"/></svg>
                                    Liabilities
                                </button>
                            </div>
                        )}
                    </div>
                    */}

                    {/* Plan Summary */}
                    <button
                        className={navItemClass(currentNavigation === 'Plan Summary')}
                        onClick={() => handleNavigationClick('Plan Summary')}
                    >
                        <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/></svg>
                        Plan Summary
                    </button>

                    {/* Recommendations — dropdown */}
                    <div>
                        <button
                            className={navItemClass(isRecommendationsActive)}
                            onClick={handleRecommendationsClick}
                        >
                            <svg className={iconClass} fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
                            <span className="flex-1 text-left">Recommendations</span>
                            <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${recommendationsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
                        {recommendationsOpen && (
                            <div className="mt-1 ml-4 space-y-1 border-l-2 border-slate-100 pl-3">
                                {recCategories.length === 0 && (
                                    <div className="px-3 py-2 text-xs text-slate-400">No recommendations yet</div>
                                )}
                                {recCategories.map(cat => (
                                    <button
                                        key={cat.category}
                                        className={navItemClass(currentNavigation === recNavKey(cat.category))}
                                        onClick={() => handleCategoryNavigation(recNavKey(cat.category))}
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke={ICON_COLOR} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                                        <span className="flex-1 text-left">{cat.title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </nav>

            {recommendationsGenerated &&
                <div className="p-4 border-t border-slate-200">
                    <div id="status-audio" className="flex items-center text-slate-500 text-sm">
                        <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-green-300 transition-colors"></div> Recommendations Generated
                    </div>
                </div>
            }
            
            <SystemStatus/>
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
        </div>
    );
};
