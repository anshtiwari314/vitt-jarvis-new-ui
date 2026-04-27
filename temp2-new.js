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
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Age',
            value:'45',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'gender',
            value:'bibhuti',
            type:'option',
            options:['Male','Female'],
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'martial status',
            value:'married',
            type:'option',
            options:['married','single'],
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'city/tier',
            value:'Banglore/tier1',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'occupation',
            value:'software engineer',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'spouse working ?',
            value:'Unknown',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'number of dependents',
            value:'3',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'primary earning member ?',
            value:'yes',
            type:'option',
            options:['yes','no'],
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
        ]
      },
      table: {
        header: "Family Structure",
        table_header: ["name", "relation", "age", "address"],
        table_values: [
          [
            { value: "roshan Sharma", is_copyable: false },
            { value: "Husband", is_copyable: false },
            { value: "36 yrs", is_copyable: false },
            { value: "Mumbai", is_copyable: true }
          ],
          [
            { value: "Priya Sharma", is_copyable: false },
            { value: "Daughter", is_copyable: false },
            { value: "5 yrs", is_copyable: true }
          ]
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
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Age',
            value:'45',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Existing term insurance ?',
            value:'bibhuti',
            type:'option',
            options:['Unknown','From icici'],
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
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
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Age',
            value:'45',
            type:'text',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Near term major milestone ?',
            value:'bibhuti',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
        ]
      },
      boxD:{
        header: 'Lead & meeting context',
        data:[
          {
            field:'meeting source',
            value:'bibhuti',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Lead compaign tag',
            value:'45',
            type:'text',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Past policy holder',
            value:'bibhuti',
            type:'option',
            options:['Unknown','From icici'],
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          {
            field:'Past Interaction/Meeting Notes',
            value:'bibhuti',
            type:'text-area',
            placeholder:'unknown',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
        ]
      },
    },

    financialReview:{
      assets: {
        boxA: {
          header: "Income and Savings",
          sub_header:{
              field:'Monthly Income (INR)',
              value:'150000',
              type:'text',
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
          },
          text_area:{
            text_area_header: "Savings (FD, PPF, NSC, etc.)",
            text_area_value: "PPF: 5,00,000\nFD with HDFC: 2,00,000",
            modified_by_agent:false,
            is_copyable:true,
            is_editable:true
          }
        },
        boxB: {
  
          header: "Investments and Other Assets",
  
          text_area_1:{
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true,
            placeholder:'unknown',
            text_area_headerA: "Investments (Mutual Funds, Equity)",
            text_area_valueA: "Mutual Funds: 3,00,000\nDirect Equity: 1,50,000",
          },
          text_area_2:{
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true,
            placeholder:'unknown',
            text_area_headerB: "Other Assets (Gold, Land, Property)",
            text_area_valueB: "Digital Gold: 20g"
          }
        },
        table: {
          header: "Existing Life Insurance",
          table_header: ["Insurer Name", "Cover Amount (INR)", "Annual Premium (INR)"],
          table_values: [
            [
              { value: "LIC Jeevan Anand", is_copyable: false },
              { value: 5000000, is_copyable: false },
              { value: 45000, is_copyable: true }
            ],
            [
              { value: "HDFC Click2Protect", is_copyable: false },
              { value: "₹ 1,00,00,000 (1.0 Cr)", is_copyable: false },
              { value: "₹ 18,000", is_copyable: true }
            ]
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
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
            },
            {
              field:'Total Monthly EMI (INR)',
              value:'35K',
              type:'text',
              placeholder:'unknown',
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
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
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
            },
            {
              field:'Outstanding Amount (INR)',
              value:'35K',
              type:'text',
              placeholder:'unknown',
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
            },
          ],
          
        },
        table: {
          header: "Other Loans",
          table_header: ["Loan Type", "Outstanding (INR)", "Monthly EMI (INR)"],
          table_values: [
            [
              { value: "Car Loan", is_copyable: false },
              { value: "₹ 3,50,000 (3.5 Lk)", is_copyable: false },
              { value: "₹ 8,000", is_copyable: true }
            ]
          ]
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
              is_copyable:true,
              is_editable:true,
            match:'strongly identified',
            match_options:['strongly identified','possible fit','not identified yet','selected by agent','ignored by agent'],
            cols: [
              {
                field:'Coverage(years)',
                value:'30',
                type:'text',
                modified_by_agent:false,
              is_copyable:true,
              is_editable:true,
                placeholder:'unknown',
              },
              {
                field:'Coverage(years)',
                value:'2 Cr',
                type:'text',
                modified_by_agent:false,
              is_copyable:true,
              is_editable:true,
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
              is_copyable:true,
              is_editable:true,
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
              is_copyable:true,
              is_editable:true,
            placeholder:'unknown',
          },
          {
            field:"Future Corpus",
            value:"₹ 40,00,000 (40.0 Lk)",
            type:'text',
            modified_by_agent:false,
              is_copyable:true,
              is_editable:true,
            placeholder:'unknown',
          },
        ],
        calculation: {},
        text_area_value: "Future Value based on goal details.",
        reason: ""
      }
    ],

    recommendations: {
      categories: [
        {
          id: "life_cover",
          category: "Immediate Life Cover Analysis",
          title: "Immediate Life Cover Analysis",
          subtitle:
            "Pure protection need identified for family income replacement and liability protection.",
          summary: {
            cover: "71 L",
            term: "20 years",
            budget: "1.06 L / year"
          },
          products: [
            {
              id: "signature_term",
              name: "Kotak Signature Term Plan",
              fit: "Best fit",
              annualPremium: "1.06 L",
              cover: "71 L",
              term: "20 years",
              premiumPayingTerm: "20 years",
              premiumFrequency: "Annual",
              payout: "Lump sum",
              survivalBenefit: "None",
              why: "Strong protection fit with premium aligned to current need.",
              reasons: [
                "Pure protection plan aligned to life cover need",
                "Suitable where family security is the main objective",
                "Current cover and term map cleanly to customer requirement"
              ],
              keyFeatures: [
                "Long-duration pure protection",
                "Higher-end positioning",
                "Useful for larger cover conversations"
              ],
              benefits: [
                { field: "Policy Term", value: "20 years", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Basic Cover", value: "71 L", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Est. Annual Premium", value: "1.06 L", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Premium Paying Term", value: "20 years", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Premium Frequency", value: "Annual", type: "option", options: ["Annual", "Semi-annual", "Monthly"], editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Payout Structure", value: "Lump sum", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true }
              ],
              calculation: [
                "Recommended cover taken from Plan Summary = 71 L",
                "Term = retirement age 60 minus current age 40 = 20 years",
                "Indicative premium provided via insurer pricing API"
              ]
            },
            {
              id: "e_term",
              name: "Kotak e-Term Plan",
              fit: "Strong alternate",
              annualPremium: "0.94 L",
              cover: "71 L",
              term: "20 years",
              premiumPayingTerm: "20 years",
              premiumFrequency: "Annual",
              payout: "Lump sum / income options",
              survivalBenefit: "None",
              why: "Economical pure protection option with flexible payout choices.",
              reasons: [
                "Lower premium can help if affordability is a concern",
                "Flexible payout options support different family needs",
                "Still aligned to same recommended cover and term"
              ],
              keyFeatures: [
                "Competitive premium",
                "Step-up / step-down flexibility",
                "Good fit for cost-sensitive discussion"
              ],
              benefits: [
                { field: "Policy Term", value: "20 years", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Basic Cover", value: "71 L", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Est. Annual Premium", value: "0.94 L", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Premium Paying Term", value: "20 years", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Premium Frequency", value: "Annual", type: "option", options: ["Annual", "Semi-annual", "Monthly"], editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Payout Structure", value: "Lump sum / income", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true }
              ],
              calculation: [
                "Same required cover of 71 L used for premium quote",
                "Term fixed to 20 years based on customer retirement horizon",
                "Illustrative premium pulled from insurer pricing response"
              ]
            }
          ]
        },
        {
          id: "child_education",
          category: "Child Education Fund",
          title: "Child Education Fund",
          subtitle: "Long-term corpus requirement identified for higher studies goal.",
          summary: {
            corpus: "1 Cr",
            horizon: "18 years",
            targetYear: "2043"
          },
          products: [
            {
              id: "e_invest_plus",
              name: "Kotak e-Invest Plus",
              fit: "Best fit",
              annualPremium: "2.35 L",
              cover: "Goal-linked",
              term: "18 years",
              premiumPayingTerm: "18 years",
              premiumFrequency: "Annual",
              payout: "Fund value",
              survivalBenefit: "Fund-linked maturity value",
              why: "Strong fit for child-focused long-horizon market-linked corpus creation.",
              reasons: [
                "Well suited for long-duration child future planning",
                "Can support goal-led investment discussion",
                "Balances corpus creation with insurance wrapper"
              ],
              keyFeatures: [
                "Child-focused optioning",
                "Good long-term market-linked fit",
                "Useful for goal-linked planning narrative"
              ],
              benefits: [
                { field: "Goal Horizon", value: "18 years", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Target Corpus", value: "1 Cr", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Est. Annual Premium", value: "2.35 L", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Premium Paying Term", value: "18 years", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Premium Frequency", value: "Annual", type: "option", options: ["Annual", "Semi-annual", "Monthly"], editable: true, modified_by_agent: false, is_copyable: true, is_editable: true },
                { field: "Survival / Maturity Benefit", value: "Fund value", type: "text", editable: true, modified_by_agent: false, is_copyable: true, is_editable: true }
              ],
              calculation: [
                "Target corpus = 1 Cr from Plan Summary",
                "Time horizon = 18 years, target year = 2043",
                "Premium is indicative and sourced from insurer pricing API / projection engine"
              ]
            }
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
