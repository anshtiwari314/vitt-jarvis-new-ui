import React, { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../store/store';
// import '../css/All.css'
// import '../css/msg.css'
// Import all content components
import BasicInfo from '../components/UI2/BasicInfo';
import Assets from '../components/UI2/Assets'
import Liabilities from '../components/UI2/Liabilities'
import FinancialGoals from '../components/UI2/FinancialGoals';
import PlanSummary from '../components/UI2/PlanSummary'
import Recommendations from '../components/UI2/Recommendations';
import RecommendationCategoryPage from '../components/UI2/RecommendationCategoryPage';
import NewFinancialGoals from '../components/UI2/NewFinancialGoals'

import SideNavigation from '../components/UI2/SideNavigation'
import SideBarMobile from '../components/UI2/SideBarMobile'
import Header, { MobileHeaderControls } from '../components/UI2/Header'
import SectionVideoOverlay from '../components/UI2/SectionVideoOverlay'
import RightPanel from '../components/UI2/RightPanel'
import { useDispatch } from 'react-redux';
import { setQP } from '../reducers/queryparamReducer';
import { resetSalesState } from '../reducers/salesCopilotReducer';
import { useData } from '../context/DataWrapper';

function HotPageLoader() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center w-full min-h-[50vh] py-16 px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
            <p className="text-sm text-slate-500">please wait while we are retrieving the updated info</p>
        </div>
    )
}

/**
 * Transparent toast that appears for 10s whenever `recommendationsGenerated`
 * flips from false → true. Sits above all UI (z-[80]) on both mobile and
 * desktop, and complements the persistent indicator already rendered in the
 * side navigations.
 */
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
            className="fixed bottom-5 left-5 z-[9999] flex items-center gap-3 rounded-lg border px-4 py-3 text-green-900 shadow-md backdrop-blur-sm pointer-events-none"
            style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: 'rgba(34, 197, 94, 0.3)',
            }}
        >
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <div className="flex flex-col">
                <strong className="text-sm font-medium">Recommendations Generated</strong>
            </div>
        </div>
    );
}

export default function App() {
   const { isSocketConnected, hotPageLoading, languageChangeLoading, isBasicInfoVideoPlaying } = useData();
   const { navigation: currentNavigation, salesData ,RecomendationSelected} = useAppSelector((state) => state.salesCopilotReducer)
   console.log("Current Navigation:", currentNavigation);
   console.log("Sales Datain main page:", salesData.recommendations);
//    [{},{},{}]---->aise me dikha dega lekin kuch select karna padega phir vo dikgeaga                                 
//   console.log(currentNavigation,"basic sales data is ",salesData.liabilities);
   const mockData = salesData.recommendations

const mock2=[

    {

        "header": "Immediate Life Cover Analysis",

        "sub_header": "",

        "cols": [

            {

                "heading": "Outstanding Liabilities",

                "value": "10.00 lac"

            },

            {

                "heading": "Annual Expenses",

                "value": "18.00 lac"

            },

            {

                "heading": "Required Corpus",

                "value": "1.90 cr"

            }

        ],

        "calculation": {},

        "text_area_value": "",

        "reason": "<h3 style=\"font-size:3rem\">Total Recommended Cover <p style=\"color:blue\">1.90 cr</p></h3>"

    },

    {

        "header": "Retirement Savings",

        "sub_header": "I want to save and require retirement purpose like 20 crores.",

        "calculation": "",

        "text_area_value": "Inflation rate percent: 6%",

        "cols": [

            {

                "heading": "Time Frame",

                "value": 13

            },

            {

                "heading": "Target Year",

                "value": 2038

            },

            {

                "heading": "Required Corpus",

                "value": "20.00 cr"

            }

        ]

    }

]
 
console.log(salesData.planSummary,"the plan summarey in main page");

 
    //based on RecomendationSelected we will filter data
    let filteredRecommendations:any = [];
    let recommendationCategoryData: any = null;

    if (typeof currentNavigation === 'string' && currentNavigation.startsWith('Recommendations::')) {
      const parts = currentNavigation.split('::');
      const categoryKey = parts[1] || null;
      const cats = (mockData as any)?.categories || [];
      recommendationCategoryData = cats.find((c: any) => c.category === categoryKey) || null;
    } else if (RecomendationSelected && Array.isArray(mockData)) {
      const matched = mockData.find(
        (item: any) => item.planName === RecomendationSelected
      );
      if (matched) {
        filteredRecommendations = matched.planDetails;
      }
    }

console.log("Filtered Recommendations:", filteredRecommendations);
    
    console.log(filteredRecommendations,"---------",RecomendationSelected);
    
    //yaha pe filter karna padega mock data se ki konsa select hua hai r1,r2  yaa y3 

    const qpState = useAppSelector((state) => state.qpReducer);
    const dispatch = useDispatch();
    // Helper function for currency formatting (moved from index2.html)
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

        return `₹ ${formattedNum} <span class="text-slate-500 font-normal text-xs">${shorthand}</span>`;
    };

    const renderContent = () => {
    switch (currentNavigation) {
        case 'Basic Info':
            return <BasicInfo data={salesData.basicInfo} />;
        case 'Financial Goals':
            return hotPageLoading?.['Financial Goals'] ? <HotPageLoader /> : <NewFinancialGoals />
        case 'Assets':
            return <Assets data={(salesData as any).financialReview?.assets} formatCurrency={formatCurrency} />;
        case 'Liabilities':
            return <Liabilities data={(salesData as any).financialReview?.liabilities} formatCurrency={formatCurrency} />;
        // case 'Financial Goals':
        //     return <FinancialGoals data={salesData.financialGoals} formatCurrency={formatCurrency} />;
        case 'Plan Summary':
            return hotPageLoading?.['Plan Summary']
                ? <HotPageLoader />
                : <PlanSummary data={salesData.planSummary} formatCurrency={formatCurrency} />;
        case 'Recommendations':
            return hotPageLoading?.['Recommendations']
                ? <HotPageLoader />
                : <Recommendations data={filteredRecommendations} formatCurrency={formatCurrency} />;
        default:
            if (typeof currentNavigation === 'string' && currentNavigation.startsWith('Recommendations::')) {
                return <RecommendationCategoryPage category={recommendationCategoryData} />;
            }
            return <BasicInfo data={salesData.basicInfo} />; // Default to Basic Info
    }
};


    useEffect(()=>{
              function getMeetingInfo(){
              const query = window.location.href.split('?')[1];
              const parts = query.split("&");
              const roomParam = parts[0] || "";
              //const candidParam = parts[1] || "";
              const name = parts[1] || "";
             let  language = parts?.[2] || "english"
      
              //http://localhost:5173/?anuj-anuj-anuj&cid_7761
              //new URLSearchParams(window.location.href)[1]
              console.log('query params',roomParam,name,query)
              const qParams = {
              roomId: roomParam,
             // candid: candidParam,
             // agentId,
              //isHost: login.isAuthenticated,
              name,
              pref_language:language
              //meetingIsLegit: true,
            };
      
              dispatch(resetSalesState());
              dispatch(setQP(qParams))
          } 
              getMeetingInfo()
          },[window.location.href])

   

    useEffect(()=>{
        console.log('qpState',qpState)
    },[qpState])

    const sectionKey =
      typeof currentNavigation === 'string' &&
      currentNavigation.startsWith('Recommendations::')
        ? 'Recommendations'
        : currentNavigation;
    const isLanguageLoading = sectionKey !== 'Recommendations' && !!languageChangeLoading?.[sectionKey as string];
    const lockMainScroll = isBasicInfoVideoPlaying;

  return (
    
    <div className="bg-slate-50 text-slate-800 antialiased" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        <RecommendationsGeneratedToast />
        {!isSocketConnected && (
          <div
            role="alert"
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            disconnected to server &amp; reconnecting ...
          </div>
        )}
        <div className="flex lg:h-full lg:overflow-hidden" style={{ width: '100%', height: '100%' }}>
            <SideNavigation/>
            <SideBarMobile />
            <div
              className={`flex-1 flex flex-col min-w-0 h-full thin-scrollbar lg:overflow-hidden ${
                lockMainScroll ? 'overflow-hidden' : 'overflow-y-auto'
              }`}
            >

                {/* Mobile/tablet sticky wrapper that bundles the title bar (Header),
                    the mobile icons strip and the AI Cues panel so they stick together
                    as one unit and don't overlap.
                    On desktop (lg+): wrapper becomes static; mobile-only children hide
                    themselves; Header remains visible and handles its own stickiness. */}
                <div className="sticky top-0 z-40 bg-white shadow-sm lg:static lg:z-auto lg:shadow-none">
                    <Header/>
                    <div className="lg:hidden">
                        <MobileHeaderControls/>
                        <div className="border-b border-slate-200 bg-white">
                            <RightPanel/>
                        </div>
                    </div>
                </div>

                <div
                  className={`flex flex-1 flex-col lg:flex-row lg:overflow-hidden ${
                    lockMainScroll ? 'min-h-0' : ''
                  }`}
                >
                    {/* <!-- Main Content -->
                        `z-0` makes main its own stacking context at z-0, so the
                        loading overlay and any fields/content inside main can never
                        paint above the sticky wrapper (z-40) holding the header,
                        icons strip and AI Cues panel. */}
                    <main
                    className={`
                        relative z-0 flex min-w-0 w-full flex-1 flex-col overflow-x-hidden bg-slate-100 px-3 py-1 pb-5 sm:p-6
                        lg:order-1 lg:basis-[62%] thin-scrollbar
                        ${isLanguageLoading || lockMainScroll ? 'min-h-0 overflow-hidden' : 'lg:overflow-y-auto'}
                        ${lockMainScroll ? 'flex flex-col' : ''}
                      `}
                    >
                        {isLanguageLoading && (
                            <div
                              className="
                                fixed inset-0 lg:absolute lg:inset-0 z-30 bg-white/60 backdrop-blur-sm
                                flex flex-col items-center justify-center px-4 text-center
                              "
                            >
                              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500 mb-4"></div>
                              <p className="text-sm text-slate-500">changing language, please wait</p>
                            </div>
                        )}
                        <SectionVideoOverlay>
                          {renderContent()}
                        </SectionVideoOverlay>
                    </main>

                    {/* <!-- AI Cues Sidebar (Desktop only — on mobile this renders inside the sticky header above) --> */}
                    <aside
                    className="
                        hidden flex-shrink-0 border-slate-200 bg-white overflow-x-hidden
                        lg:flex lg:order-2 lg:h-full lg:w-[38%] lg:border-l lg:shadow-none lg:overflow-y-auto thin-scrollbar
                      "
                    >
                    <RightPanel/>
                    </aside>
                </div>
            </div>
        </div>
    </div>
    
  )
}

// {/* <AuthContext>
//       {/* <DataWrapper> */}
//           <Router>
//             <Routing/>
//           </Router>
//       {/* </DataWrapper> */}
//     </AuthContext> */}
//plan summarty,recoomendation(d),finacial (d)!!!imp
