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
import { normalizeRecommendationData } from '../functions/normalisedRecomendationData';
//import BasicInfoH from '../components/UI2/BasicInfo';

export default function App() {

     const {socket}=useData()
     const {salesData,navigation:currentNavigation} =useAppSelector((state) => state.healthManagmentReducer)
     console.log('salesData', salesData.Recommendations)
  //    const mockData=[
  // {
  //   "planName": {"heading": "Plan Name", "value": "Arogya Supreme Gold"},
  //   "sumInsured": {"heading": "Sum Insured", "value": "10,00,000"},
  //   "premium": {"heading": "Premium", "value": "12,000/year"},
  //   "riders": {
  //     "heading": "Riders",
  //     "value": [
  //       {"name": "Infinite Care", "desc": "Get one-time infinite claim amount for your selected claim.", "include": true},
  //       {"name": "2-hr Hospitalization", "desc": "Medical expenses covered for hospitalisation of 2 hrs or more, like room rent, practitioner fees, ICU charges.", "include": true},
  //       {"name": "Claim Protector", "desc": "Non-payable items like gloves, cotton, syringes, and masks are covered up to the sum insured.", "include": true},
  //       {"name": "Power Booster", "desc": "Get a loyalty bonus of 100% every year irrespective of claim for an indefinite period.", "include": true},
  //       {"name": "Dependent Accommodation Benefit", "desc": "Will pay 1000 per day for a dependent's accommodation if there is a hospitalisation of a minimum 3 consecutive days.", "include": true},
  //       {"name": "Annual Health Checkups", "desc": "Predefined health checkup package, up to 0.5% of annual sum insured (max ₹5000) on a cashless basis.", "include": true},
  //       {"name": "Inflation Protector", "desc": "The annual sum insured will increase at renewal based on the previous year's inflation rate.", "include": true},
  //       {"name": "Durable Medical Equipment", "desc": "Reimbursement for expenses for renting or purchasing listed durable medical equipment up to Rs 5 lakh annually.", "include": true},
  //       {"name": "Domestic Air Ambulance Cover", "desc": "Cover Air Ambulance expenses up to the annual sum insured.", "include": true},
  //       {"name": "Nursing At Home", "desc": "Reimburse up to ₹2000 per day for a maximum of 10 days for post-hospitalisation medical services.", "include": true},
  //       {"name": "Compassionate Visit", "desc": "If hospitalisation exceeds 5 days, we will cover up to 20k per year for an economy class/rail ticket for an immediate family member.", "include": true},
  //       {"name": "Personal Accident", "desc": "On occurrence of any insured event, we will pay the Annual Sum Insured, up to a maximum of Rs 50 lakhs.", "include": true},
  //       {"name": "Critical Illness", "desc": "Cover 20 listed Critical Illnesses up to a maximum of 50 lakhs. For adults aged 18 to 50.", "include": true},
  //       {"name": "Room Modifier", "desc": "Insured can upgrade or downgrade their room category.", "include": true}
  //     ]
  //   },
  //   "reason": {"heading": "Reason", "value": "Recommended for individuals seeking high coverage at moderate cost."},
  //   "keyFeatures": {"heading": "Key Features", "value": ["Cashless treatment at network hospitals", "No-claim bonus up to 100%", "Coverage for pre-existing diseases after waiting period"]}
  // },
  // {
  //   "planName": {"heading": "Plan Name", "value": "Health Secure Silver"},
  //   "sumInsured": {"heading": "Sum Insured", "value": "₹5,00,000"},
  //   "premium": {"heading": "Premium", "value": "₹8,500/year"},
  //   "riders": {
  //     "heading": "Riders",
  //     "value": [
  //       {"name": "Infinite Care", "desc": "Get one-time infinite claim amount for your selected claim.", "include": true},
  //       {"name": "2-hr Hospitalization", "desc": "Medical expenses covered for hospitalisation of 2 hrs or more, like room rent, practitioner fees, ICU charges.", "include": true},
  //       {"name": "Claim Protector", "desc": "Non-payable items like gloves, cotton, syringes, and masks are covered up to the sum insured.", "include": true},
  //       {"name": "Power Booster", "desc": "Get a loyalty bonus of 100% every year irrespective of claim for an indefinite period.", "include": true},
  //       {"name": "Dependent Accommodation Benefit", "desc": "Will pay 1000 per day for a dependent's accommodation if there is a hospitalisation of a minimum 3 consecutive days.", "include": true},
  //       {"name": "Annual Health Checkups", "desc": "Predefined health checkup package, up to 0.5% of annual sum insured (max ₹5000) on a cashless basis.", "include": true},
  //       {"name": "Inflation Protector", "desc": "The annual sum insured will increase at renewal based on the previous year's inflation rate.", "include": true},
  //       {"name": "Durable Medical Equipment", "desc": "Reimbursement for expenses for renting or purchasing listed durable medical equipment up to Rs 5 lakh annually.", "include": true},
  //       {"name": "Domestic Air Ambulance Cover", "desc": "Cover Air Ambulance expenses up to the annual sum insured.", "include": true},
  //       {"name": "Nursing At Home", "desc": "Reimburse up to ₹2000 per day for a maximum of 10 days for post-hospitalisation medical services.", "include": true},
  //       {"name": "Compassionate Visit", "desc": "If hospitalisation exceeds 5 days, we will cover up to 20k per year for an economy class/rail ticket for an immediate family member.", "include": true},
  //       {"name": "Personal Accident", "desc": "On occurrence of any insured event, we will pay the Annual Sum Insured, up to a maximum of Rs 50 lakhs.", "include": true},
  //       {"name": "Critical Illness", "desc": "Cover 20 listed Critical Illnesses up to a maximum of 50 lakhs. For adults aged 18 to 50.", "include": true},
  //       {"name": "Room Modifier", "desc": "Insured can upgrade or downgrade their room category.", "include": true}
  //     ]
  //   },
  //   "reason": {"heading": "Reason", "value": "Ideal for small families or young professionals starting out."}
  // },
  // {
  //   "planName": {"heading": "Plan Name", "value": "Elite Health Platinum"},
  //   "sumInsured": {"heading": "Sum Insured", "value": "₹25,00,000"},
  //   "premium": {"heading": "Premium", "value": "₹22,000/year"},
  //   "riders": {
  //     "heading": "Riders",
  //     "value": [
  //       {"name": "Infinite Care", "desc": "Get one-time infinite claim amount for your selected claim.", "include": true},
  //       {"name": "2-hr Hospitalization", "desc": "Medical expenses covered for hospitalisation of 2 hrs or more, like room rent, practitioner fees, ICU charges.", "include": true},
  //       {"name": "Claim Protector", "desc": "Non-payable items like gloves, cotton, syringes, and masks are covered up to the sum insured.", "include": true},
  //       {"name": "Power Booster", "desc": "Get a loyalty bonus of 100% every year irrespective of claim for an indefinite period.", "include": true},
  //       {"name": "Dependent Accommodation Benefit", "desc": "Will pay 1000 per day for a dependent's accommodation if there is a hospitalisation of a minimum 3 consecutive days.", "include": true},
  //       {"name": "Annual Health Checkups", "desc": "Predefined health checkup package, up to 0.5% of annual sum insured (max ₹5000) on a cashless basis.", "include": true},
  //       {"name": "Inflation Protector", "desc": "The annual sum insured will increase at renewal based on the previous year's inflation rate.", "include": true},
  //       {"name": "Durable Medical Equipment", "desc": "Reimbursement for expenses for renting or purchasing listed durable medical equipment up to Rs 5 lakh annually.", "include": true},
  //       {"name": "Domestic Air Ambulance Cover", "desc": "Cover Air Ambulance expenses up to the annual sum insured.", "include": true},
  //       {"name": "Nursing At Home", "desc": "Reimburse up to ₹2000 per day for a maximum of 10 days for post-hospitalisation medical services.", "include": true},
  //       {"name": "Compassionate Visit", "desc": "If hospitalisation exceeds 5 days, we will cover up to 20k per year for an economy class/rail ticket for an immediate family member.", "include": true},
  //       {"name": "Personal Accident", "desc": "On occurrence of any insured event, we will pay the Annual Sum Insured, up to a maximum of Rs 50 lakhs.", "include": true},
  //       {"name": "Critical Illness", "desc": "Cover 20 listed Critical Illnesses up to a maximum of 50 lakhs. For adults aged 18 to 50.", "include": true},
  //       {"name": "Room Modifier", "desc": "Insured can upgrade or downgrade their room category.", "include": true}
  //     ]
  //   },
  //   "reason": {"heading": "Reason", "value": "Best suited for high-income individuals or families looking for maximum coverage benefits."}
  // }
  //    ]
     const planSelected=useAppSelector((state)=>state.healthManagmentReducer.planSelected)
     console.log(planSelected,"plan selected");
     const mockData=salesData.Recommendations;
     console.log('mockData', mockData);//currently it is array isliye isme find karna possible nahi hi 
     //isi ke basis pe filter karna hai

     //i will filter here which recommendtion to show based on plan name ....and send it to normalize function and hence evrytime someone clicks on any 
     //recommendtion i will capture tht pln name 
    console.log("the selected plan is ",planSelected);
    
    const selectedPlan = mockData?.find(
            (p: any) => p.planName?.value === planSelected
            );
            console.log(selectedPlan,"selected plan---");

// then normalize that single plan
     const normalisdSalesData = normalizeRecommendationData(selectedPlan);
     console.log('normalisdSalesData', normalisdSalesData);
     const {pref_language,setPref_language} = useData()
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
            return <RecommendedHealthPlan context_name={normalisdSalesData?.context_name} planName={normalisdSalesData?.planName} keyFetures={normalisdSalesData?.keyFeatures} sumInsured={normalisdSalesData?.sumInsured} riders={normalisdSalesData?.riders} premium={normalisdSalesData?.premium} reason={normalisdSalesData.reason} />;
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
              let  language = parts?.[2] || "english"
              //language = language.charAt(0).toUpperCase() + language.slice(1)

              //http://localhost:5173/?anuj-anuj-anuj&cid_7761
              //new URLSearchParams(window.location.href)[1]
              console.log('query params',roomParam,name,language)
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
              //setPref_language(language)
          } 
              getMeetingInfo()
          },[])

   

    useEffect(()=>{
        console.log('qpState',qpState)
    },[qpState])


    useEffect(()=>{
        let last = Date.now();

        let intervalId 
        let lock

        intervalId=setInterval(() => {
            const now = Date.now();
            if (now - last > 2000) {
                console.log("System possibly slept or lid closed");
            }
            last = now;
        }, 1000);

        function visibilitychange() {
            if (document.hidden) {
                console.log("Page hidden or lid closed");
            } else {
            console.log("Page visible");
            }
        }
        document.addEventListener("visibilitychange", visibilitychange);


        function release(){
            console.log("Wake lock released — likely lid closed or screen off");
        }

        try {
            //lock = navigator.wakeLock.request("screen");
            //lock.addEventListener("release", release);
        } catch (e) {
           // console.log("Wake lock failed:", e);
        }

        
        return ()=>{
            intervalId && clearInterval(intervalId)
            document.removeEventListener('visibilitychange',visibilitychange)
            //lock && lock.removeEventListener("release", release)
        }
    },[])



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
        className="flex-1 flex flex-col bg-slate-100 py-1 sm:p-6 pb-5
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