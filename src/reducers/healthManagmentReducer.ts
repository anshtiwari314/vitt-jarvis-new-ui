import { createSlice,current } from "@reduxjs/toolkit";


export interface HealthData {
  basicInfo: {
    PersonalInformation: { [key: string]: string | number };
    FinancialProfile:{ [key: string]: string | number };
    ClientRequirements:{ [key: string]: string | number };
  };
  HealthProfile: {
    LifeStyleAndHabit: { [key: string]: string | number };
    MedicalHistory: { [key: string]: string | number };
    InsuranceAndClaimHistory: {
      CompanyName: string;
      SumAssured: number;
      status: boolean;
      previousClaims: { date: string; amount: number }[];
    }[];
  };
  Recommendations: {
    planName: string;
    sumInsured: string | number;
    premium: string | number;
    riders: { name: string; price: string | number }[];
  };
  
  planSummary: {
    summary:{

    }[];
  }
}

interface SalesCopilotState {
  navigation: string;
  chat: any[];
  pfrData: HealthData;
}

const initialCopilotLoadState= {
  navigation: 'Basic Info',
  chat:[
    "hi how are you",
    "hello"
  ],
  
  salesData: {
    basicInfo: {
      boxA: { 
        header:'Client Info',
        data:{
        name: "Anjali Sharma",
        city:"Tier 1",
        age: 34,
        coverageFor: "Self",
        } 
      },
      boxB: { 
        header:'Financial Profile',
        data:{
        AvgMonthlyIncome:120000,
        AvgMonltyEmi:25000
        } 
      },
      boxC: { 
        header:'Client Requirments',
        data:{
        ProductPreference:"Maternity Cover,OPD benefits",
        ExpectedSumInsured: "₹ 50,00,000"
        } 
      },
       "table": {
        "header": "Family Structure",
        "table_header": ["Name","Age","Relationship"],
        "table_values": [["Anjali","34","Self"
        ],["Rohan","20","Brother"]
        ],
      }
    },
    HealthProfile: {
      boxA:{
        header:'Lifestyle & Habits',
        data:{
            consumeAlcholo:"No",
            FamilyMedicalHistory:"No major issues",
        }
      },
      boxB:{
        header:'Medical History',
        data:{
            PreexistingMedicalConditions:"None Reported",
            AnyRecentMedicalTests:"Yes, standard annual checkup. Reports available.",
        }
      },
      table:{
        header:'Insurance &Claim History',
        table_header:['Company Name','Sum Assured','State',"Previous Claims"],
        table_values:[
          ['ABC',5000000,"Active","None"],
          ['XYZ',500000,"Closed","None"],
        ]
      } 
    },
    Recommendations:{
    planName:"",
    sumInsured:0,
    premium:0,
    riders:[
        {name:"Critical Illness Cover",price:5000},
        {name:"Maternity Cover",price:3000},
        {name:"OPD Benefits",price:2000}
    ] 
    },
    PlanSummary:{
        summary:{
            header:"Final Plan Summary",
            data:[
                {"text":"","price":0},
                {"text":"Total Monthly Premium","price":0},
                {"text":"Total Annual Premium","price":0},
                {"text":"Total Sum Assured","price":0}
            ]
        }
    },

    // planSummary: [
    //   {
    //     header:"Immediate Life Cover Analysis",
    //     sub_header:"",
    //     cols:{
    //       'TimeFrame':'13 yrs',
    //       'Required Corpus':'₹4,00,000'
    //     },
    //     calculation:{
    //       "Outstanding Liabilities":"₹ 48,50,000 (48.5 Lk)",
    //       "Family Living Expenses (10x)":"+₹ 72,000 (72 K)"
    //     },
    //     text_area_value:'',
    //     reason:'<h3 style="font-size:3rem">Total Recommended Cover <p style="color:blue">₹ 1,20,50,000 (1.2 Cr)</p></h3>',

    //   },
    //   {
    //     header:"Daughter's Education",
    //     sub_header:"",
    //     cols:{
    //       'TimeFrame':'13 yrs',
    //       'Target Year':'2038',
    //       'Future Corpus':'₹ 40,00,000 (40.0 Lk)'
    //     },
    //     calculation:{
          
    //     },
    //     text_area_value:'Future Value based on goal details.',
    //     reason:'',

    //   }
      
    // ],
    
    // 'planSummary': [
    //   {'header': 
    //     'Immediate Life Cover Analysis', 
    //     'sub_header': '', 
    //     'cols': {'Required Corpus': '15 lakhs'}, 
    //     'calculation': {'Outstanding Liabilities': '15 lakhs', 'Annual Expenses': '24 lakhs'}, 
    //     'text_area_value': '', 
    //     'reason': '<h3 style="font-size:3rem">Total Recommended Cover <p style="color:blue">255 lakhs</p></h3>'
    //   }, 
    //   {'header': None, 
    //     'sub_header': None, 
    //     'cols': {'Time Frame': None, 'Target Year': None, 'Required Corpus': None}, 
    //     'calculation': '', 
    //     'text_area_value': 'Inflation rate percent: 6%'
    //   }
    // ],
   
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

const initialCopilotState = {
  "navigation": "",
  "chat": [],
  "clientName":"",
  "salesData": {
    "basicInfo": {
      "boxA": {
        "header": "",
        "data": {
          // "name": "",
          // "age": 0,
          // "city": "",
          // "occupation": "",
          // "dependents": 0,
          // "address": ""
        }
      },
        "boxB":{
            "header":"",
            "data":{

            }
        },
        "boxC":{
            "header":"",
            "data":{

            }
        },
         "table": {
        "header": "",
        "table_header": [],
        "table_values": []
      }
    },
    "HealthProfile": {
      "boxA": {
        "header": "",
       "data":{}
      },
      "boxB": {
        "header": "",
       "data":{}
      },
      "table": {
        "header": "",
        "table_header": [],
        "table_values": []
      }
    },
    "Recommendations": {
      "planName": "",
      "sumInsured": 0,
      "premium": 0,
      "riders": [
        // { "name": "", "price": 0 },
        // { "name": "", "price": 0 },
        // { "name": "", "price": 0 }
      ]
    },
    "PlanSummary":{
        "summary":[]
    },

   
   
    // "followUpQn": {
    //   "header": "",
    //   "data": []
    // },
    // "cues": {
    //   "header": "",
    //   "data": []
    // },
    // "alert": {
    //   "header": "",
    //   "data": []
    // }
     "followUpQn": {
           "header": 'Follow-up Question',
           "data": [
               {
                   "id": 'unique1',
                   "text": ''
               },
               {
                   "id": 'unique2',
                   "text": ''
               }
           ],
       },
       "cues": {
           "header": 'User Cues',
           "data": [
               {
                   "id": 'unique1',
                   "text": ''
               },
               {
                   "id": 'unique2',
                   "text": ''
               }
           ],
       },
       "alert": {
           "header": 'Compliance Alert',
           "data": [
              //  {
              //      "id": 'unique1',
              //      "text": 'Disclose commission structures if asked.'
              //  },
              //  {
              //      "id": 'unique2',
              //      "text": 'Avoid guaranteeing returns.'
              //  }
           ]
       }
  }
}


const healthReducerSlice = createSlice({
  name: "salesCopilotReducer", // Changed from "usersReducer" for consistency
  initialState: initialCopilotState,
  reducers: {
    initSalesState:(state,action)=>{
      console.log('action payload',action.payload)
      //state = {...state,...action.payload};
      //state.
      return action.payload;
    },
    updateBasicInfo: (state, action) => {
      console.log('add chat triggers', action.payload, current(state));
      // Correct way to add to an array within a Redux Toolkit slice
      // state.chat.push(action.payload);
      console.log("in the reducer[DEBUG00]",action.payload);
      state.salesData.basicInfo={
        ...state.salesData.basicInfo,
        ...action.payload
      }
      // console.log("afyter update",state.salesData.basicInfo,"Debug")
    },
    updateHeathProfile: (state, action) => {
      console.log("health profile data that came",action.payload);
      state.salesData.HealthProfile={
        ...state.salesData.HealthProfile,
        ...action.payload
      }
      console.log("health profile data that got updated",state.salesData.HealthProfile);
    },
    updatePlanSummary: (state, action) => {
      console.log("plan summary data that came",action.payload);
      state.salesData.PlanSummary={ 
        ...state.salesData.PlanSummary,
        ...action.payload
      }
      console.log("plan summary data that got updated",state.salesData.PlanSummary);
    },
    updateRecommendation: (state, action) => {
      console.log("recommendation data that came",action.payload);
      state.salesData.Recommendations = {
        ...state.salesData.Recommendations,
        ...action.payload
      };
      console.log("recommendation data that got updated",state.salesData.Recommendations);
    },
    updateFollowUpQn:(state,action)=>{
      console.log("follow up question that came",action.payload);
      state.salesData.followUpQn={
        ...state.salesData.followUpQn,
        ...action.payload
      }
      console.log("follow up question that got updated",state.salesData.followUpQn);
    },
    updateCues: (state, action) => {
      console.log(action.payload)
      state.salesData.cues = {
        ...state.salesData.cues,
        ...action.payload,
      };
      console.log(state.salesData.cues,"cues after adding")
    },
    updateAlerts: (state, action) => {
      state.salesData.alert = {
        ...state.salesData.alert,
        ...action.payload,
      };
    },

   setNavigation: (state, action) => {
        console.log("it got hitted");

        const navMap = {
          basicInfo: "Basic Info",
          healthProfile: "Health Profile",
          recommendations: "Recommendations",
          planSummary: "Plan Summary", 
        };

      const readableName = navMap[action.payload] || action.payload; 
      state.navigation = readableName;
    },
  },
});
export const { initSalesState,
  updateBasicInfo,
  updateFollowUpQn,updateCues,updateAlerts,updateHeathProfile,updatePlanSummary,updateRecommendation,
  setNavigation } = healthReducerSlice.actions;

export default {
  healthReducerSlice: healthReducerSlice.reducer,
};