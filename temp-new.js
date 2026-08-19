const aiSuggestionResponseExamples = {
  // Media playback uses dedicated WebSocket routes (not ai_suggestion_res):
  // route_type: "video_playback_res" → { video_url, activate_speaker?, keep_button_active? }
  // route_type: "audio_playback_res" → { audio_url | audiobase64, activate_speaker?, keep_button_active? }
  // activate_speaker: true → turns speaker on and plays even when playback btn is off
  // keep_button_active: true → keeps speaker on after this clip finishes (default: auto-off)
  video_playback_res_example: {
    route_type: "video_playback_res",
    video_url:
      "https://navtalk.s3.us-east-2.amazonaws.com/video/eda4fad9-958e-4052-9894-cb82699c34a8.mp4",
    activate_speaker: true,
    keep_button_active: false,
  },
  audio_playback_res_example: {
    route_type: "audio_playback_res",
    id: "qna_answer",
    audio_url: null,
    audiobase64: "BASE64_MP3_DATA",
    activate_speaker: true,
    keep_button_active: false,
  },
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
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
            },
            {
              field:'occupation',
              value:'software engineer',
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
            },
            {
              field:'spouse working ?',
              value:'Unknown',
              type:'text',
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true
            },
            {
              field:'number of dependents',
              value:'3',
              type:'text',
              options:['married','single'],
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
          table_header: ["Name", "Relation", "Age", "Address"],
          table_values: [
            [
              { value: "Rohan Sharma", is_copyable: false },
              { value: "Husband", is_copyable: false },
              { value: "36 yrs", is_copyable: false },
              { value: "Mumbai", is_copyable: true }
            ],
            [
              { value: "Priya Sharma", is_copyable: false },
              { value: "Daughter", is_copyable: false },
              { value: "5 yrs", is_copyable: false },
              { value: "Mumbai", is_copyable: true }
            ]
          ]
        }
      },
    },
    {
      
      type:'financial-review',
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
              text_area_headerA: "Investments (Mutual Funds, Equity)",
              text_area_valueA: "Mutual Funds: 3,00,000\nDirect Equity: 1,50,000",
            },
            text_area_2:{
              modified_by_agent:false,
              is_copyable:true,
              is_editable:true,
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
                modified_by_agent:false,
              is_copyable:true,
              is_editable:true
              },
              {
                field:'Total Monthly EMI (INR)',
                value:'35K',
                type:'text',
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
                modified_by_agent:false,
              is_copyable:true,
              is_editable:true
              },
              {
                field:'Outstanding Amount (INR)',
                value:'35K',
                type:'text',
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
          }
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
              is_editable:true
                },
                {
                  field:'Coverage(years)',
                  value:'2 Cr',
                  type:'text',
                  modified_by_agent:false,
              is_copyable:true,
              is_editable:true
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
      audio_url: "https://example.com/audio/plan-summary.mp3"
    },
    {
      type: "recommendations",
      recommendations: {
        categories: [
          {
            id: "life_cover",
            category: "Immediate Life Cover Analysis",
            title: "Mera Life Cover Analysis",
            subtitle:
              "Pure protection need identified for family income replacement and liability protection.",
            summary: {
              cover: "71 L",
              term: "20 years",
              budget: "1.06 L / year"
            },
            product_table_left_header: "Compare top product options",
            product_table_right_header: "Select one primary option for this need",
            product_table: {
              table_header: ["Product", "Fit", "Annual Premium", "Cover/Benefit", "Term", "Action"],
              table_values: [
                [
                  { value: "Kotak Signature Term Plan" },
                  { value: "Best fit" },
                  { value: "1.06L" },
                  { value: "71L" },
                  { value: "20 years" }
                ],
                [
                  { value: "Kotak e-Term Plan" },
                  { value: "Strong alternate" },
                  { value: "0.94" },
                  { value: "71L" },
                  { value: "20 years" }
                ]
              ]
            },
            advantages_header: "Key Advantages",
            reasons_fit_header: "why this product seems fit",
            selected_box_header: "Selected option details",
            selected_box_sub_header:
              "Review the selected product, edit values if needed, and use the reasons below to support advisor discussion.",
            products: [
              {
                id: "signature_term",
                name: "Kotak Signature Term Plan",
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
            product_table_left_header: "Compare top product options",
            product_table_right_header: "Select one primary option for this need",
            product_table: {
              table_header: ["Product", "Fit", "Annual Premium", "Cover/Benefit", "Term", "Action"],
              table_values: [
                [
                  { value: "Kotak e-Invest Plus" },
                  { value: "Best fit" },
                  { value: "2.35L" },
                  { value: "Goal-linked" },
                  { value: "18 years" }
                ]
              ]
            },
            advantages_header: "Key Advantages",
            reasons_fit_header: "why this product seems fit",
            selected_box_header: "Selected option details",
            selected_box_sub_header:
              "Review the selected product, edit values if needed, and use the reasons below to support advisor discussion.",
            products: [
              {
                id: "e_invest_plus",
                name: "Kotak e-Invest Plus",
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
      audio_url: null,
      audiobase64: "BASE64_MP3_DATA_FOR_RECOMMENDATIONS"
    },
    {
       "type": "add-cues",
       "card_id": "2026-04-16 16:15:31",
      "header": "Key Advantages of Invest Maxima",
      "color": "green",
      "data": [
          {
              "id": "unique_1",
              "text": "<div class='dots'><span></span><span></span><span></span></div><style>.dots{display:flex;gap:6px;justify-content:center}.dots span{width:8px;height:8px;background:#111;border-radius:50%;animation:bounce 1.4s infinite ease-in-out}.dots span:nth-child(2){animation-delay:.2s}.dots span:nth-child(3){animation-delay:.4s}@keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}</style>"
          }
      ],
      
     
  },
    {
      "type": "update-cues",
      "card_id": "2026-04-16 16:06:22",
      "header": "Maturity Benefits",
      "color": "green",
      "data": [
          {
              "id": "unique_0",
              "text": "Maturity benefit equals Fund Value in Main Account (including Survival Units, if any) plus Fund Value in Top-Up Accounts (if any)."
          },
          {
              "id": "unique_1",
              "text": "Take your maturity proceeds as an immediate lump sum payout."
          },
          {
              "id": "unique_2",
              "text": "Alternatively, choose a part lump sum and part installments through the Settlement Option for up to five years."
          },
          {
              "id": "unique_3",
              "text": "You can also opt to receive the whole amount in installments over a maximum period of five years."
          }
      ],
      
      
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
