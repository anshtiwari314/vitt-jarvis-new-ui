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
import NewFinancialGoals from '../components/UI2/NewFinancialGoals'

import SideNavigation from '../components/UI2/SideNavigation'
import SideBarMobile from '../components/UI2/SideBarMobile'
import Header from '../components/UI2/Header'
import RightPanel from '../components/UI2/RightPanel'
import { useDispatch } from 'react-redux';
import { setQP } from '../reducers/queryparamReducer';

export default function App() {
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
    // let filteredRecommendations = [];
    let filteredRecommendations:any = [];

if (RecomendationSelected) {
  const matched = mockData.find(
    (item) => item.planName === RecomendationSelected
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
            return <NewFinancialGoals />
        case 'Assets':
            return <Assets data={salesData.assets} formatCurrency={formatCurrency} />;
        case 'Liabilities':
            return <Liabilities data={salesData.liabilities} formatCurrency={formatCurrency} />;
        // case 'Financial Goals':
        //     return <FinancialGoals data={salesData.financialGoals} formatCurrency={formatCurrency} />;
        case 'Plan Summary':
            return <PlanSummary data={salesData.planSummary} formatCurrency={formatCurrency} />;
        case 'Recommendations':
            return <Recommendations data={filteredRecommendations} formatCurrency={formatCurrency} />;
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
        <div className="flex h-screen overflow-hidden">
            <SideNavigation/>
            <SideBarMobile />
            <div className="flex-1 flex flex-col">
                
                <Header/>
                <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                    {/* <!-- Main Content --> */}
                    <main 
                    className="
                        order-2 flex min-w-0 flex-1 flex-col overflow-y-auto bg-slate-100 px-3 py-1 pb-5 sm:p-6
                        lg:order-1 lg:basis-[62%]
                      "
                    >
                        {renderContent()}
                    </main>

                    {/* <!-- AI Cues Sidebar --> */}
                    <aside 
                    className="
                        order-1 w-full flex-shrink-0 border-slate-200 bg-white
                        lg:order-2 lg:h-full lg:w-[38%] lg:border-l lg:shadow-none
                      "
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
