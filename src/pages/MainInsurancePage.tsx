import React, { useEffect } from 'react'
import { useAppSelector } from '../store/store';
// import '../css/All.css'
// import '../css/msg.css'
// Import all content components
import BasicInfo from '../components/Health/BasicInfo';
import Assets from '../components/UI2/Assets'
import Liabilities from '../components/UI2/Liabilities'
import FinancialGoals from '../components/UI2/FinancialGoals';
// import PlanSummary from '../components/UI2/PlanSummary'
import Recommendations from '../components/UI2/Recommendations';

import SideNavigation from '../components/UI2/SideNavigation'
import Header from '../components/UI2/Header'
import RightPanel from '../components/UI2/RightPanel'
import { useDispatch } from 'react-redux';
import { setQP } from '../reducers/queryparamReducer';
import HealthProfile from '../components/Health/HeatlhProfile';
import RecommendedHealthPlan from '../components/Health/Recomendation';
import PlanSummary from '../components/Health/PlanSummary';
import BasicInfoH from '../components/Health/BasicInfo';
import { useData } from '../context/DataWrapper';
import { normalizeRecommendationData } from '../functions/normalisedRecomendationData';
//import BasicInfoH from '../components/UI2/BasicInfo';

export default function App() {
    const {socket}=useData()
     const {salesData,navigation:currentNavigation} = useAppSelector((state) => state.healthManagmentReducer)
     console.log('salesData', salesData.Recommendations)
     const normalisdSalesData = normalizeRecommendationData(salesData.Recommendations);
     console.log('normalisdSalesData', normalisdSalesData);
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
            return <BasicInfoH data={salesData.basicInfo} />;
        case 'Health Profile':
            return <HealthProfile data={salesData.HealthProfile} socketC={socket}/>;
        case 'Recommendations':
            return <RecommendedHealthPlan planName={normalisdSalesData?.planName} sumInsured={normalisdSalesData?.sumInsured} riders={normalisdSalesData?.riders} premium={normalisdSalesData?.premium} reason={normalisdSalesData.reason} />;
        case 'Plan Summary':
            return  <BasicInfoH data={salesData.basicInfo} />;
      
        default:
            return <BasicInfoH data={salesData.basicInfo} />; 
    }
};


    useEffect(()=>{
              function getMeetingInfo(){
              const query = window.location.href?.split('?')[1];
              const parts = query?.split("&");
              const roomParam = parts?.[0] || "";
              //const candidParam = parts[1] || "";
              const name = parts?.[1] || "";
      
      
              //http://localhost:5173/?anuj-anuj-anuj&cid_7761
              //new URLSearchParams(window.location.href)[1]
              console.log('query params',roomParam,name,query)
              const qParams = {
              roomId: roomParam,
             // candid: candidParam,
             // agentId,
              //isHost: login.isAuthenticated,
              name
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
        <div className="flex h-screen overflow-hidden">
            <SideNavigation/>
            <div className="flex-1 flex flex-col">
                
                <Header/>
                <div className="flex-1 flex overflow-hidden">
                    {/* <!-- Main Content --> */}
                    <main className="flex-1 flex flex-col bg-slate-100 overflow-y-auto p-6 md:p-8">
                        {renderContent()}
                    </main>

                    {/* <!-- AI Cues Sidebar --> */}
                    <RightPanel/>
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