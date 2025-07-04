import React from "react"
export default function RightPanel(){
    
    return (
        <aside className="w-96 bg-white border-l border-slate-200 flex flex-col p-4 space-y-4 overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-800 text-right">AI Cues</h3>
                        {/* <!-- Cue Type 1: Follow-up Question --> */}
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 flex items-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Follow-up Question
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                                <li>Primary financial goals?</li>
                                <li>Typical month financially?</li>
                            </ul>
                        </div>
                        {/* <!-- Cue Type 2: Answer to Query --> */}
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 flex items-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                                Answer to "Why Term Plan?"
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                                <li>Financial safety net.</li>
                                <li>Covers loans, secures family's future.</li>
                                <li>Most affordable, high-cover option.</li>
                            </ul>
                        </div>
                        {/* <!-- Cue Type 3: Compliance Alert --> */}
                        <div className="bg-amber-50 border border-amber-300 p-4 rounded-lg">
                            <h4 className="font-semibold text-amber-800 flex items-center mb-2">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                Compliance Alert
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-amber-700 text-sm">
                                <li>Disclose commission structures if asked.</li>
                                <li>Avoid guaranteeing returns.</li>
                            </ul>
                        </div>
                    </aside>
    )
}