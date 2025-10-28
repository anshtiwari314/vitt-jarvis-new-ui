import React, { useEffect,useState } from 'react'
import { useAppSelector } from '../store/store';
// import '../css/All.css'
// import '../css/msg.css'
// Import all content components
//import BasicInfo from '../components/Health/BasicInfo';
import Assets from '../components/UI2/Assets'
import Liabilities from '../components/UI2/Liabilities'
import FinancialGoals from '../components/UI2/FinancialGoals';
// import PlanSummary from '../components/UI2/PlanSummary'
import Recommendations from '../components/UI2/Recommendations';

import SideNavigation from '../components/UI2/SideNavigation'
import SideBarMobile from '../components/UI2/SideBarMobile'
import Header from '../components/UI2/Header'
import RightPanel from '../components/UI2/RightPanel'
import { useDispatch } from 'react-redux';
import { setQP } from '../reducers/queryparamReducer';
import HealthProfile from '../components/Health/HeatlhProfile';
import RecommendedHealthPlan from '../components/Health/Recomendation';
import PlanSummary from '../components/Health/PlanSummary';
import BasicInfoH from '../components/Health/BasicInfo';
import { useData } from '../context/DataWrapper';
//import BasicInfoH from '../components/UI2/BasicInfo';

export default function App() {
    const {socket}=useData()
     const {salesData,navigation:currentNavigation} = useAppSelector((state) => state.healthManagmentReducer)
     //console.log('salesData', salesData.Recommendations)
//   console.log(currentNavigation,"basic sales data is ",salesData.liabilities);

     const qpState = useAppSelector((state) => state.qpReducer);
     const dispatch = useDispatch();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Handlers
    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);

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
        console.log('sales data',salesData)
    switch (currentNavigation) {
        case 'Basic Info':
            return <BasicInfoH data={salesData.basicInfo} />;
        case 'Health Profile':
            return <HealthProfile data={salesData.HealthProfile} socketC={socket}/>;
        case 'Recommendations':
            return <RecommendedHealthPlan planName={salesData.Recommendations?.planName} sumInsured={salesData.Recommendations?.sumInsured} riders={salesData.Recommendations?.riders} premium={salesData.Recommendations?.premium} reason={salesData.Recommendations.reason} />;
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
        <div className="flex h-screen overflow-scroll" style={{}}>
            <SideNavigation/>
            <SideBarMobile />
            <div className="flex-1 flex flex-col w-full">
                
                <Header/>
                <div className="flex flex-col lg:flex-row flex-1 overflow-y-scroll">
                    {/* <!-- Main Content --> */}
                    <main 
        className="flex-1 flex flex-col bg-slate-100 px-2 py-1 sm:p-6 lg:px-8 
                   order-2 lg:order-1 min-w-0 overflow-x-auto overflow-y-auto pb-5 w-full 
                   lg:w-4/6 lg:mx-8
                    "
                    >
                        {renderContent()}
                    </main>

                    {/* <!-- AI Cues Sidebar --> */}
                    <aside 
        className="w-full
                    lg:w-2/6
                   
                   order-1 lg:order-2 
                   bg-white border-l border-slate-200 
                    lg:shadow-none lg:h-full 
                   flex-shrink-0" // Added overflow-y-auto here for the aside element
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