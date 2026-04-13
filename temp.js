const aiSuggestionResponseExamples = {
  // One payload per supported "type" in updateSalesState()
  // You can emit any one of these from backend on "ai_suggestion_res".
  ai_suggestion_res_examples: [
    {
      type: "basic-info",
      basicInfo: {
        boxA: {
          header: "Client Info",
          data:[
            {
              field:'customer name',
              value:'bibhuti',
              type:'text',
              modified_by_agent:false
            },
            {
              field:'Age',
              value:'45',
              type:'text',
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
              modified_by_agent:false
            },
            {
              field:'occupation',
              value:'software engineer',
              modified_by_agent:false
            },
            {
              field:'spouse working ?',
              value:'Unknown',
              type:'text',
              modified_by_agent:false
            },
            {
              field:'number of dependents',
              value:'3',
              type:'text',
              options:['married','single'],
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
          table_header: ["Name", "Relation", "Age", "Address"],
          table_values: [
            ["Rohan Sharma", "Husband", "36 yrs", "Mumbai"],
            ["Priya Sharma", "Daughter", "5 yrs", "Mumbai"]
          ]
        }
      },
      audio_url: "https://example.com/audio/basic-info.mp3",
      audiobase64: null
    },
    {
      type:'financial-review',
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
            modified_by_agent:false
          }
        },
        boxB: {
  
          header: "Investments and Other Assets",
  
          text_area_1:{
            modified_by_agent:false,
            text_area_headerA: "Investments (Mutual Funds, Equity)",
            text_area_valueA: "Mutual Funds: 3,00,000\nDirect Equity: 1,50,000",
          },
          text_area_2:{
            modified_by_agent:false,
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
              modified_by_agent:false
            },
            {
              field:'Total Monthly EMI (INR)',
              value:'35K',
              type:'text',
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
              modified_by_agent:false
            },
            {
              field:'Outstanding Amount (INR)',
              value:'35K',
              type:'text',
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
    },
   
    {
      type: "financial-goals",
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
                  modified_by_agent:false
                },
                {
                  field:'Coverage(years)',
                  value:'2 Cr',
                  type:'text',
                  modified_by_agent:false
                }
              ]
            }
          ]
          }
        ]
      },
      audio_url: null,
      audiobase64: null
    },
    {
      type: "plan-summary",
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
      audio_url: "https://example.com/audio/plan-summary.mp3"
    },
    {
      type: "recommendations",
      recommendations: [
        {

        }
        {
          header: "Recommendation 1: Term Plan",
          sub_header: "Pure protection for financial safety net",
          cols: {
            Cover: "1,20,50,000",
            Term: "30 Years",
            "Est. Annual Premium": "22,500"
          },
          calculation: {},
          text_area_value: "Heuristic premium estimate",
          reason: "Settle liabilities and protect family cashflow."
        },
        {
          header: "Recommendation 2: Child Goal Plan",
          sub_header: "Dedicated corpus for education goal",
          cols: {
            "Target Corpus": "40,00,000",
            TimeFrame: "13 Years",
            "Est. Annual Premium": "58,000"
          },
          calculation: {},
          text_area_value: "SIP and inflation adjusted estimate",
          reason: "Ensures goal funding even in uncertainty."
        }
      ],
      audio_url: null,
      audiobase64: "BASE64_MP3_DATA_FOR_RECOMMENDATIONS"
    },
    {
      type: "follow-up-qn",
      followUpQn: {
        header: "Follow-up Questions",
        data: [
          "Do you want to increase life cover to include future goals?",
          "Should we include critical illness rider options?"
        ]
      },
      audio_url: "https://example.com/audio/followup.mp3"
    },
    {
      type: "add-cues",
      header: "Follow-up Question",
      card_type: "notification_card",
      options: ["yes", "no"],
      text: "Client asked whether premium can be reduced with a lower cover.",
      audio_url: null,
      audiobase64: null
    },
    {
      type: "alert",
      alert: {
        header: "Compliance Alert",
        data: [
          "Do not guarantee returns.",
          "Disclose exclusions and waiting period clearly."
        ]
      },
      audio_url: "https://example.com/audio/alert.mp3"
    },
    {
      type: "value-modified",
      text: "Monthly Income changed from 120000 to 150000. Confirm?",
      options: ["yes", "no"],
      old_json: { monthlyIncome: 120000 },
      new_json: { monthlyIncome: 150000 },
      old_json_raw: { field: "monthlyIncome", value: 120000 },
      new_json_raw: { field: "monthlyIncome", value: 150000 },
      audio_url: null,
      audiobase64: "BASE64_MP3_DATA_FOR_VALUE_MODIFIED"
    }
  ],

  // This is a different socket event in DataWrapper: "notifications"
  notifications_example: {
    status: "completed",
    msg: "Product Recommendation ready"
  }
}

module.exports = aiSuggestionResponseExamples
