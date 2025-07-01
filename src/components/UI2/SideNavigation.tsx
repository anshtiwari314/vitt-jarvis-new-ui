import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';

export default function SideNavigation(){
    const dispatch = useAppDispatch();
    const currentNavigation = useAppSelector(state => state.salesCopilotReducer.navigation);

    const handleNavigationClick = (page: string) => {
        dispatch(setNavigation(page));
    };

    const navItems = [
        { id: 'basicInfo', label: 'Basic Info', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> },
        { id: 'asset', label: 'Assets', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg> },
        { id: 'liability', label: 'Liabilities', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> },
        { id: 'financialGoals', label: 'Financial Goals', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h1a2 2 0 002-2v-1a2 2 0 012-2h1.945M12 4v4m0 0l-2-2m2 2l2-2"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18V14m0 4a2 2 0 002-2v-1a2 2 0 00-2-2h-1a2 2 0 00-2 2v1a2 2 0 002 2z"></path></svg> },
        { id: 'planSummary', label: 'Plan Summary', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> },
        { id: 'productRec', label: 'Recommendations', icon: <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg> },
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
                    <a href="#" id="home-button" className="text-slate-500 hover:text-sky-600" onClick={() => handleNavigationClick('basicInfo')}>
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    </a>
                    <div className="text-right">
                        <div id="current-date" className="font-semibold text-slate-700"></div>
                        <div id="current-time" className="text-sm text-slate-500"></div>
                    </div>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(item => (
                        <a
                            key={item.id}
                            href="#"
                            className={`flex items-center px-3 py-3 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 ${currentNavigation === item.id ? 'active-nav-item' : ''}`}
                            onClick={() => handleNavigationClick(item.id)}
                        >
                            {item.icon}
                            {item.label}
                        </a>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200">
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
                </div>
            </aside>

    )
}