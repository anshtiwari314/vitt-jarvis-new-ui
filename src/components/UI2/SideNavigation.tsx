import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';

export default function SideNavigation() {
    const dispatch = useAppDispatch();
    const currentNavigation = useAppSelector(state => state.healthManagmentReducer.navigation);

    const {recommendationsGenerated,setRecommendationsGenerated} = useData()


    const handleNavigationClick = (page: string) => {
        dispatch(setNavigation(page));
    };

    const navItems = [
        { id: 'basicInfo', label: 'Basic Info', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> },
        {
            id: 'healthProfile',
            label: 'Health Profile',
            icon: (
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
            )
        },
        {
            id: 'recommendations',
            label: 'Recommendation',
            icon: (
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
            )
        },
        { id: 'planSummary', label: 'Plan Summary', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
    ];

    const updateDateTime = () => {
        const now = new Date();
        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        if (timeEl) timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    React.useEffect(() => {
        updateDateTime();
        const interval = setInterval(updateDateTime, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
            {/* Top Section with Date & Back Button */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <a
                    href="#/lead-management"
                    id="home-button"
                    className="text-slate-500 hover:text-sky-600"
                    onClick={() => handleNavigationClick('basicInfo')}
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-half">
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                        <path d="M12 22V2"/>
                    </svg>
                </div>
                <h1 className="text-lg font-bold text-slate-800">AI Copilot</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1">
                {navItems.map(item => (
                    <a
                        key={item.id}
                        className={`flex items-center px-3 py-3 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 ${currentNavigation === item.id ? 'active-nav-item' : ''}`}
                        style={{ cursor: 'default' }}
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
                            <div id="status-audio" className="flex items-center text-slate-500" style={{fontSize:'0.85rem'}}>
                                    <div className="status-indicator w-2.5 h-2.5 mr-2 rounded-full bg-green-300 transition-colors"></div> Recommendations Generated
                            </div>
                        </div>
                    }
            {/* System Status */}
            <div className="p-4 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-600 mb-3">System Status</h3>
                <div className="space-y-2 text-sm">
                    <div id="status-audio" className="flex items-center text-slate-500">
                        <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> Audio Streaming
                    </div>
                    <div id="status-transcription" className="flex items-center text-slate-500">
                        <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> Live Transcription
                    </div>
                    <div id="status-processing" className="flex items-center text-slate-500">
                        <div className="status-indicator w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> AI Processing
                    </div>
                </div>
            </div>
        </aside>
    );
}
