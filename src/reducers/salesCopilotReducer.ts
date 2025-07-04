import { createSlice,current } from "@reduxjs/toolkit";

// Define types for our data structure for type safety
export interface PfrData {
  basicInfo: {
    clientDetails: { [key: string]: string | number };
    familyStructure: {
      name: string;
      relation: string;
      age: string;
    }[];
  };
  assets: {
    incomeAndSavings: {
      monthlyIncome: number;
      savings: string;
    };
    investmentsAndOther: {
      investments: string;
      otherAssets: string;
    };
    existingLifeInsurance: {
      insurer: string;
      cover: number;
      premium: number;
    }[];
  };
  liabilities: {
    monthlyOutflow: {
      monthlyExpenses: number;
      totalMonthlyEMI: number;
      creditCardDues: number;
    };
    homeLoan: {
      outstanding: number;
      emi: number;
      tenure: number;
    };
    otherLoans: {
      type: string;
      outstanding: number;
      emi: number;
    }[];
  };
  financialGoals: {
    id: string;
    title: string;
    priority: string;
    priorityClass: string;
    description: string;
    timeframe: string;
    requiredCorpus: number;
    calculationDetails: string;
  }[];
  planSummary: {
    lifeCover: {
      outstandingLiabilities: number;
      familyLivingExpenses: number;
      totalRecommendedCover: number;
    };
    goalCorpus: {
      id: string;
      title: string;
      timeframe: string;
      targetYear: string;
      futureCorpus: number;
      calculationDetails: string;
    }[];
  };
  recommendations: {
    id: string;
    title: string;
    description: string;
    cover?: number;
    targetCorpus?: number;
    term?: string;
    premium: number;
    reason: string;
    calculationDetails: string;
    isPrimary: boolean;
  }[];
}

interface SalesCopilotState {
  navigation: string;
  chat: any[];
  pfrData: PfrData;
}

const initialCopilotState= {
  navigation: 'basic-info',
  
  salesData: {
    basicInfo: {
      boxA: { 
        header:'Client Info',
        data:{
        name: "Anjali Sharma",
        age: 34, 
        city: "Mumbai", 
        occupation: "Software Engineer", 
        dependents: 3,
        address:'Mumbai'
        } 
      },
      table:{
        header:'Family Structure',
        table_header:['name','relation','age','address'],
        table_values:[
          ['roshan Sharma','Husband','36 yrs','Mumbai'],
          ['Priya Sharma','Daughter','5 yrs']
          
        ]
      } 
    },
    assets: {
      boxA:{
        header:'Income and Savings',
        sub_header:'Monthly Income (INR)',
        sub_header_data:150000,
        text_area_header:'Savings (FD, PPF, NSC, etc.)',
        text_area_value:'PPF: ~5,00,000\nFD with HDFC: 2,00,000'
      },
      boxB:{
        header:'Investments and Other Assets',
        text_area_headerA:'Investments (Mutual Funds, Equity)',
        text_area_valueA:'Mutual Funds: ~3,00,000 \n Direct Equity: ~1,50,000',
        text_area_headerB:'Other Assets (Gold, Land, Property)',
        text_area_valueB:'20g Digital Gold'
      
      },
      table:{
        header:'Existing Life Insurance',
        table_header:['Insurer Name','Cover Amount (INR)','Annual Premium (INR)'],
        table_values:[
          ['LIC Jeevan Anand',5000000,45000],
          ['HDFC Click2Protect','₹ 1,00,00,000 (1.0 Cr)','₹ 18,000']
          
          
        ]
      } 
     
      
    },
    liabilities: {
      boxA:{
        header:'Monthly Outflow',
        
        data:{
          'Monthly Expenses (INR)':60000,
          'Total Monthly EMI (INR)':38000,
          'Credit Card Dues (if any)':15000
        }
      },
      boxB:{
        header:'Home Loan Details',
        data:{
          'Outstanding Amount (INR)':4500000,
          'Monthly EMI (INR)':30000,
          'Remaining Tenure (Months)':180
      },
    },
      table:{
        header:'Other Loans',
        
        table_header:['Loan Type','Outstanding (INR)','Monthly EMI (INR)'],
        table_values:[
          ['Car Loan','₹ 3,50,000 (3.5 Lk)','₹ 8,000'],

         
          
        ]
      } 
      
    },
    financialGoals: [
      
        {
          id:'unique',
          header:"Daughter's Education",
          sub_header:"Fund 5-year-old daughter's higher education.",
          priority:"High Priority",
          text_area_value:'Current Cost: ₹25,00,000 \n Inflation: 4% annually \n Calculation: 2500000 * (1 + 0.04)^13',
          cols:{
            'TimeFrame':'13 yrs',
            'Required Corpus':'₹40,00,000'
          }
        }
      
      
    ],
    planSummary: [
      {
        header:"Immediate Life Cover Analysis",
        sub_header:"",
        cols:{
          'TimeFrame':'13 yrs',
          'Required Corpus':'₹4,00,000'
        },
        calculation:{
          "Outstanding Liabilities":"₹ 48,50,000 (48.5 Lk)",
          "Family Living Expenses (10x)":"+₹ 72,000 (72 K)"
        },
        text_area_value:'Current Cost: ₹25,00,000 \n Inflation: 4% annually \n Calculation: 2500000 * (1 + 0.04)^13',
        reason:'<h3 style="font-size:3rem">Total Recommended Cover <p style="color:blue">₹ 1,20,50,000 (1.2 Cr)</p></h3>',

      },
      {
        header:"Daughter's Education",
        sub_header:"",
        cols:{
          'TimeFrame':'13 yrs',
          'Target Year':'2038',
          'Future Corpus':'₹ 40,00,000 (40.0 Lk)'
        },
        calculation:{
          
        },
        text_area_value:'Future Value based on goal details.',
        reason:'',

      }
      
    ],
    recommendations: [
      {
        header:"Recommendation 1: Term Plan",
        sub_header:"Pure protection for financial safety net.",
        cols:{
          'Cover':'₹ 1,20,50,000 (1.2 Cr)',
          'Term':'30 Years',
          'Est. Annual Premium':'₹ 22,500'
        },
        calculation:{
          
        },
        text_area_value:'Heuristic: ₹1,500 per year per ₹1L sum assured \n Calculation: (1,20,50,000 / 1,00,000) * 1500',
        reason:'Reason: Settle liabilities, provide for living expenses.',

      }
    
    ],
    followUpQn:{
      header:'Follow-up Question',
      data:[
        {
          id:'unique',
          text:'Primary financial goals?'
        },
        {
          id:'unique',
          text:'Typical month financially?'
        }
      ],
    },
    cues:{
      header:'Answer to "Why Term Plan?',
      data:[
        {
          id:'unique',
          text:'Financial safety net.'
        },
        {
          id:'unique',
          text:"Covers loans, secures family's future."
        },
        {
          id:'unique',
          text:"Most affordable, high-cover option."
        }
      ],
    },
    alert:{
      header:'Compliance Alert',
      data:[
        {
          id:'unique',
          text:'Disclose commission structures if asked.'
        },
        {
          id:'unique',
          text:'Avoid guaranteeing returns.'
        }
      ]
    }
  }
};


const salesCopilotSlice = createSlice({
  name: "salesCopilotReducer", // Changed from "usersReducer" for consistency
  initialState: initialCopilotState,
  reducers: {
    addChat: (state, action) => {
      console.log('add chat triggers', action.payload, current(state));
      // Correct way to add to an array within a Redux Toolkit slice
      state.chat.push(action.payload);
    },
    setNavigation: (state, action) => {
      state.navigation = action.payload;
    }
  },
});

export const { addChat, setNavigation } = salesCopilotSlice.actions;

export default {
  salesCopilotReducer: salesCopilotSlice.reducer,
};