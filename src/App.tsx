import React from 'react'
import { useAppSelector } from './store/store';
// import './css/All.css'
// import './css/msg.css'
// Import all content components
import BasicInfo from './components/UI2/BasicInfo';
import Assets from './components/UI2/Assets'
import Liabilities from './components/UI2/Liabilities'
import FinancialGoals from './components/UI2/FinancialGoals';
import PlanSummary from './components/UI2/PlanSummary'
import Recommendations from './components/UI2/Recommendations';

import SideNavigation from './components/UI2/SideNavigation'
import Header from './components/UI2/Header'
import RightPanel from './components/UI2/RightPanel'

export default function App() {
   const { navigation: currentNavigation, salesData } = useAppSelector((state) => state.salesCopilotReducer)
  console.log(currentNavigation,"basic sales data is ",salesData.liabilities);


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
            case 'basicInfo':
                return <BasicInfo data={salesData.basicInfo} />;
            case 'asset':
                return <Assets data={salesData.assets} formatCurrency={formatCurrency} />;
            case 'liability':
                return <Liabilities data={salesData.liabilities} formatCurrency={formatCurrency} />;
            case 'financialGoals':
                return <FinancialGoals data={salesData.financialGoals} formatCurrency={formatCurrency} />;
            case 'planSummary':
                return <PlanSummary data={salesData.planSummary} formatCurrency={formatCurrency} />;
            case 'productRec':
                return <Recommendations data={salesData.recommendations} formatCurrency={formatCurrency} />;
            default:
                return <BasicInfo data={salesData.basicInfo} />; // Default to Basic Info
        }
    };

  return (
    
    <body className="bg-slate-50 text-slate-800 antialiased">
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
    </body>
    
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