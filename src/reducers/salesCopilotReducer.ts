import { createSlice,current } from "@reduxjs/toolkit";

// Define types for our data structure for type safety
interface PfrData {
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

const initialCopilotState: SalesCopilotState = {
  navigation: 'basic-info',
  chat: [], // Assuming chat will be an array of messages
  pfrData: {
    basicInfo: {
      clientDetails: { name: "Anjali Sharma", age: 34, city: "Mumbai", occupation: "Software Engineer", dependents: 3,address:'Mumbai' },
      familyStructure: [
        { name: "Rohan Sharma", relation: "Husband", age: "36 years" },
        { name: "Priya Sharma", relation: "Daughter", age: "5 years" }
      ]
    },
    assets: {
      incomeAndSavings: { monthlyIncome: 150000, savings: "PPF: ~5,00,000\nFD with HDFC: 2,00,000" },
      investmentsAndOther: { investments: "Mutual Funds: ~3,00,000\nDirect Equity: ~1,50,000", otherAssets: "20g Digital Gold" },
      existingLifeInsurance: [
        { insurer: "LIC Jeevan Anand", cover: 5000000, premium: 45000 },
        { insurer: "HDFC Click2Protect", cover: 10000000, premium: 18000 }
      ]
    },
    liabilities: {
      monthlyOutflow: { monthlyExpenses: 60000, totalMonthlyEMI: 38000, creditCardDues: 15000 },
      homeLoan: { outstanding: 4500000, emi: 30000, tenure: 180 },
      otherLoans: [{ type: "Car Loan", outstanding: 350000, emi: 8000 }]
    },
    financialGoals: [
      { id: "goal1", title: "Daughter's Education", priority: "High Priority", priorityClass: "bg-red-100 text-red-800", description: "Fund 5-year-old daughter's higher education.", timeframe: "13 Years", requiredCorpus: 4000000, calculationDetails: "Current Cost: ₹25,00,000\nInflation: 4% annually\nCalculation: 2500000 * (1 + 0.04)^13" },
      { id: "goal2", title: "Retirement Planning", priority: "Medium Priority", priorityClass: "bg-orange-100 text-orange-800", description: "Build a corpus for a comfortable retirement.", timeframe: "~25 Years", requiredCorpus: 50000000, calculationDetails: "Calculation based on future value of current monthly expenses." }
    ],
    planSummary: {
      lifeCover: { outstandingLiabilities: 4850000, familyLivingExpenses: 7200000, totalRecommendedCover: 12050000 },
      goalCorpus: [
        { id: "summary1", title: "Daughter's Education", timeframe: "13 Years", targetYear: "2038", futureCorpus: 4000000, calculationDetails: "Future Value based on goal details." },
        { id: "summary2", title: "Retirement Planning", timeframe: "25 Years", targetYear: "2050", futureCorpus: 50000000, calculationDetails: "Future Value based on goal details." }
      ]
    },
    recommendations: [
      { id: "rec1", title: "Recommendation 1: Term Plan", description: "Pure protection for financial safety net.", cover: 12050000, term: "30 Years", premium: 22500, reason: "Settle liabilities, provide for living expenses.", calculationDetails: "Heuristic: ₹1,500 per year per ₹1L sum assured\nCalculation: (1,20,50,000 / 1,00,000) * 1500", isPrimary: true },
      { id: "rec2", title: "Recommendation 2: Child Plan (for Education)", description: "Savings-oriented plan for daughter's education.", targetCorpus: 4000000, premium: 226000, reason: "Aligns with 13-year timeframe for college.", calculationDetails: "Heuristic: 5% annual compounded return.\nReverse calculation to find premium for corpus.", isPrimary: false },
      { id: "rec3", title: "Recommendation 3: Retirement Plan", description: "Long-term investment for independent retirement.", targetCorpus: 50000000, premium: 1048000, reason: "Long-term wealth creation for lifestyle maintenance.", calculationDetails: "Heuristic: 5% annual compounded return.\nReverse calculation to find premium for corpus.", isPrimary: false }
    ]
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