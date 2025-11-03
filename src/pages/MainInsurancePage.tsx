import React, { useEffect } from 'react'
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

import SideNavigation from '../components/UI2/SideNavigation'
import SideBarMobile from '../components/UI2/SideBarMobile'
import Header from '../components/UI2/Header'
import RightPanel from '../components/UI2/RightPanel'
import { useDispatch } from 'react-redux';
import { setQP } from '../reducers/queryparamReducer';

export default function App() {
   const { navigation: currentNavigation, salesData } = useAppSelector((state) => state.salesCopilotReducer)
//   console.log(currentNavigation,"basic sales data is ",salesData.liabilities);

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
        case 'Assets':
            return <Assets data={salesData.assets} formatCurrency={formatCurrency} />;
        case 'Liabilities':
            return <Liabilities data={salesData.liabilities} formatCurrency={formatCurrency} />;
        case 'Financial Goals':
            return <FinancialGoals data={salesData.financialGoals} formatCurrency={formatCurrency} />;
        case 'Plan Summary':
            return <PlanSummary data={salesData.planSummary} formatCurrency={formatCurrency} />;
        case 'Recommendations':
            return <Recommendations data={salesData.recommendations} formatCurrency={formatCurrency} />;
        default:
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
      
              dispatch(setQP(qParams))
          } 
              getMeetingInfo()
          },[])

   

    useEffect(()=>{
        console.log('qpState',qpState)
    },[qpState])
  return (
    
    <div className="bg-slate-50 text-slate-800 antialiased">
        <div className="flex h-screen overflow-scroll">
            <SideNavigation/>
            <SideBarMobile />
            <div className="flex-1 flex flex-col">
                
                <Header/>
                <div className="flex flex-col lg:flex-row flex-1 overflow-y-scroll ">
                    {/* <!-- Main Content --> */}
                    <main 
                    className="
                        flex-1 flex flex-col bg-slate-100 py-1 sm:p-6 pb-5
                        order-2 lg:order-1 
                        min-w-0 overflow-y-auto 
                        
                        {/* FIX 3: Your 99% width request. */}
                        w-[94vw] mx-auto    {/* <-- ADDED */}
                        lg:w-4/6 lg:mx-8 {/* <-- 'lg:mx-8' will override mx-auto on large screens */}
                      "
                    >
                        {renderContent()}
                    </main>

                    {/* <!-- AI Cues Sidebar --> */}
                    <aside 
                    className="
                        w-[99vw] lg:w-2/6
                        order-1 lg:order-2 
                        bg-white border-l border-slate-200 
                        lg:shadow-none lg:h-full 
                        flex-shrink-0
                      " // Added overflow-y-auto here for the aside element
                    style={{overflow:'hidden'}}>
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