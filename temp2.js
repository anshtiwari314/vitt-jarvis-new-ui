/**
 * Socket.IO event: questions_loader_res
 * (Client listens in DataWrapper: tempSocket.on('questions_loader_res', initialisationSalesState))
 *
 * Handler: initialisationSalesState(data) -> dispatch(initSalesState(data))
 *
 * Reducer (salesCopilotReducer): initSalesState returns action.payload as the NEW entire state.
 * So this payload must be a complete salesCopilotReducer root object — not a partial patch.
 *
 * Top-level fields used elsewhere in the app include:
 * - navigation, clientName, pref_language, language_ids, RecomendationSelected, chat, salesData
 */

const questionsLoaderResExample = {
  navigation: "Basic Info",
  pref_language: "English",
  language_ids: ["English", "Hindi", "Marathi"],
  RecomendationSelected: "",
  chat: ["hi how are you", "hello"],
  clientName: "Anjali Sharma",

  salesData: {
    basicInfo: {
      boxA: {
        header: "Client Info",
        data:[
          {
            field:'customer name',
            value:'bibhuti',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'Age',
            value:'45',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'gender',
            value:'bibhuti',
            type:'option',
            options:['Male','Female'],
            modified_by_agent:false
          },
          {
            field:'martial status',
            value:'married',
            type:'option',
            options:['married','single'],
            modified_by_agent:false
          },
          {
            field:'city/tier',
            value:'Banglore/tier1',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'occupation',
            value:'software engineer',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'spouse working ?',
            value:'Unknown',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'number of dependents',
            value:'3',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'primary earning member ?',
            value:'yes',
            type:'option',
            options:['yes','no'],
            modified_by_agent:false
          },
        ]
      },
      table: {
        header: "Family Structure",
        table_header: ["name", "relation", "age", "address"],
        table_values: [
          ["roshan Sharma", "Husband", "36 yrs", "Mumbai"],
          ["Priya Sharma", "Daughter", "5 yrs"]
        ]
      },
      boxB:{
        header: 'Financial Profile',
        data:[
          {
            field:'monthly income',
            value:'bibhuti',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'Age',
            value:'45',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'Existing term insurance ?',
            value:'bibhuti',
            type:'option',
            options:['Unknown','From icici'],
            modified_by_agent:false
          },
        ]
      },
      boxC:{
        header: 'Needs & Risk Assesment',
        data:[
          {
            field:'Risk Appetite',
            value:'',
            type:'option',
            options:['high','low'],
            modified_by_agent:false
          },
          {
            field:'Age',
            value:'45',
            type:'text',
            modified_by_agent:false
          },
          {
            field:'Near term major milestone ?',
            value:'bibhuti',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
        ]
      },
      boxB:{
        header: 'Lead & meeting context',
        data:[
          {
            field:'meeting source',
            value:'bibhuti',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'Lead compaign tag',
            value:'45',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false
          },
          {
            field:'Past policy holder',
            value:'bibhuti',
            type:'option',
            options:['Unknown','From icici'],
            modified_by_agent:false
          },
          {
            field:'Past Interaction/Meeting Notes',
            value:'bibhuti',
            type:'text-area',
            placeholder:'unknown',
            modified_by_agent:false
          },
        ]
      },
    },

    financialReview:{
      assets: {
        boxA: {
            
          heading:{
            header: "Income and Savings",
            sub_header: "Monthly Income (INR)",
            sub_header_data: 150000,
            
            modified_by_agent:false
          },
          text_area:{
            text_area_header: "Savings (FD, PPF, NSC, etc.)",
            text_area_value: "PPF: 5,00,000\nFD with HDFC: 2,00,000",
            placeholder:'unknown',
            modified_by_agent:false
          }
        },
        boxB: {
  
          header: "Investments and Other Assets",
  
          text_area_1:{
            modified_by_agent:false,
            placeholder:'unknown',
            text_area_headerA: "Investments (Mutual Funds, Equity)",
            text_area_valueA: "Mutual Funds: 3,00,000\nDirect Equity: 1,50,000",
          },
          text_area_2:{
            modified_by_agent:false,
            placeholder:'unknown',
            text_area_headerB: "Other Assets (Gold, Land, Property)",
            text_area_valueB: "Digital Gold: 20g"
          }
        },
        table: {
          header: "Existing Life Insurance",
          table_header: ["Insurer Name", "Cover Amount (INR)", "Annual Premium (INR)"],
          table_values: [
            ["LIC Jeevan Anand", 5000000, 45000],
            ["HDFC Click2Protect", "₹ 1,00,00,000 (1.0 Cr)", "₹ 18,000"]
          ]
        }
      },
  
      liabilities: {
        boxA: {
          header: "Monthly Outflow",
          data:[
            {
              field:'Monthly Expenses(INR)',
              //can be number also
              value:'60k',
              type:'text',
              placeholder:'unknown',
              modified_by_agent:false
            },
            {
              field:'Total Monthly EMI (INR)',
              value:'35K',
              type:'text',
              placeholder:'unknown',
              modified_by_agent:false
            },
          ]
          
        },
        boxB: {
          header: "Home Loan Details",
          data:[
            {
              field:'Monthly Emi (INR)',
              //can be number also
              value:'60k',
              type:'text',
              placeholder:'unknown',
              modified_by_agent:false
            },
            {
              field:'Outstanding Amount (INR)',
              value:'35K',
              type:'text',
              placeholder:'unknown',
              modified_by_agent:false
            },
          ],
          
        },
        table: {
          header: "Other Loans",
          table_header: ["Loan Type", "Outstanding (INR)", "Monthly EMI (INR)"],
          table_values: [["Car Loan", "₹ 3,50,000 (3.5 Lk)", "₹ 8,000"]]
        }
      }

    }
    ,
    financialGoals:{
      goals:[
        {
          section:'Protection Goals',
          cards:[{
            id: "unique",
            header: "Income Protection",
            sub_header: "Protect Family in case of any uncertainity",
            modified_by_agent:false,
            match:['strongly identified'],
            match_options:['strongly identified','possiblr fit','not identified yet'],
            cols: [
              {
                field:'Coverage(years)',
                value:'30',
                type:'text',
                modified_by_agent:false,
                placeholder:'unknown',
              },
              {
                field:'Coverage(years)',
                value:'2 Cr',
                type:'text',
                modified_by_agent:false,
                placeholder:'unknown',
              }
            ]
          }
        ]
        }
      ]
    },
    planSummary: [
      {
        id: "life-cover-1",
        type: "lifeCover",
        header: "Immediate Life Cover Analysis",
        sub_header: "",
        cols: [
          {
            field:"Required Corpus",
            value:"₹ 1,20,50,000 (1.2 Cr)",
            type:'text',
            modified_by_agent:false,
            placeholder:'unknown',
          },
        ],
        calculation: {
          "Outstanding Liabilities": "₹ 48,50,000 (48.5 Lk)",
          "Family Living Expenses (10x)": "+₹ 72,000 (72 K)"
        },
        text_area_value: "",
        reason:
          '<h3 style="font-size:3rem">Total Recommended Cover <p style="color:blue">₹ 1,20,50,000 (1.2 Cr)</p></h3>'
      },
      {
        id: "goal-corpus-1",
        type: "goalCorpus",
        header: "Daughter's Education",
        sub_header: "",
        cols: [
          {
            field:"TimeFrame",
            value:"13 yrs",
            type:'text',
            modified_by_agent:false,
            placeholder:'unknown',
          },
          {
            field:"Future Corpus",
            value:"₹ 40,00,000 (40.0 Lk)",
            type:'text',
            modified_by_agent:false,
            placeholder:'unknown',
          },
        ],
        calculation: {},
        text_area_value: "Future Value based on goal details.",
        reason: ""
      }
    ],

    recommendations: {
      
        categories:[
        {
          category:'ulip',
          comparison:{

          },
          plans:[
            {
              planName:'ulip_plan1',
              planDetails:[
                {
                  header: "Recommendation 1: Term Plan",
                  sub_header: "Pure protection for financial safety net.",
                  cols: [
                    {
                      field:'cover',
                      value:"₹ 1,20,50,000 (1.2 Cr)",
                      type:'text',
                      modified_by_agent:false
                    },
                    {
                      field:'term',
                      value: "30 Years",
                      type:'text',
                      modified_by_agent:false
                    }
                  ],
                  calculation: {
                    "Total liabilities": "27 lakhs",
                    "Monthly expenses": "60k",
                    "Multiplier": "120",
                    "Recommended cover": "99 lakhs"
                  },
                  "calculationDetails": "Total liabilities (27 lakhs) + (Monthly expenses 60k * 120) = 99 lakhs",
                  text_area_value:
                    "Heuristic: ₹1,500 per year per ₹1L sum assured \n Calculation: (1,20,50,000 / 1,00,000) * 1500",
                  reason: "Reason: Settle liabilities, provide for living expenses."
                }
              ]
              
            },
            
          ]
        }
      ]
    },

    followUpQn: {
      header: "Follow-up Questions",
      data: []
    },

    cues: {
      header: "ai cues",
      cards: [
        {
          header: "Follow-up Question",
          card_type: "notification_card",
          options: ["true", "false"],
          text: "Sample cue card text for the agent."
        }
      ]
    },

    alert: {
      header: "Alerts",
      data: []
    }
  }
}

/**
 * Minimal empty shell (matches initialCopilotState shape). Use when backend has no prefilled PFR yet.
 */
const questionsLoaderResMinimalExample = {
  navigation: "",
  pref_language: "English",
  language_ids: ["English", "Hindi", "Marathi"],
  RecomendationSelected: "",
  chat: [],
  clientName: "",
  salesData: {
    basicInfo: {
      boxA: { header: "", data: {} },
      table: { header: "", table_header: [], table_values: [] }
    },
    assets: {
      boxA: {
        header: "",
        sub_header: "",
        sub_header_data: 0,
        text_area_header: "",
        text_area_value: ""
      },
      boxB: {
        header: "",
        text_area_headerA: "",
        text_area_valueA: "",
        text_area_headerB: "",
        text_area_valueB: ""
      },
      table: { header: "", table_header: [], table_values: [] }
    },
    liabilities: {
      boxA: { header: "", data: {} },
      boxB: { header: "", data: {} },
      table: { header: "", table_header: [], table_values: [] }
    },
    financialGoals: [],
    planSummary: [],
    recommendations: [],
    cues: { header: "", cards: [] }
  }
}

module.exports = {
  /** Emit this object on event: questions_loader_res */
  questionsLoaderResExample,
  questionsLoaderResMinimalExample
}
