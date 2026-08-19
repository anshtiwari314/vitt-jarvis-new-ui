/**
 * Socket event: ai_suggestion_res
 * One payload per message, based on `type`.
 */

const old_json_ai_suggestion = {
    examples: [
      {
        type: "basic-info",
        basicInfo: {
          boxA: {
            header: "Client Info",
            data: {
              name: "Ajay",
              age: 40,
              city: "Pune",
              occupation: "Engineer",
              dependents: 2,
              address: "Pune"
            }
          },
          table: {
            header: "Family Structure",
            table_header: ["name", "relation", "age", "address"],
            table_values: [["Child", "Son", "8 yrs", "Pune"]]
          }
        },
        audio_url: "https://example.com/audio/basic-info.mp3",
        audiobase64: null
      },
  
      {
        type: "assets",
        assets: {
          boxA: {
            header: "Income and Savings",
            sub_header: "Monthly Income (INR)",
            sub_header_data: 150000,
            text_area_header: "Savings",
            text_area_value: "PPF: 5,00,000"
          },
          boxB: {
            header: "Investments and Other Assets",
            text_area_headerA: "Investments",
            text_area_valueA: "Mutual Funds: 3,00,000",
            text_area_headerB: "Other Assets",
            text_area_valueB: "Gold: 20g"
          },
          table: {
            header: "Existing Life Insurance",
            table_header: ["Insurer Name", "Cover Amount (INR)", "Annual Premium (INR)"],
            table_values: [["LIC Jeevan Anand", 5000000, 45000]]
          }
        },
        audio_url: null,
        audiobase64: "BASE64_MP3_DATA"
      },
  
      {
        type: "liabilities",
        liabilities: {
          boxA: {
            header: "Monthly Outflow",
            data: {
              "Monthly Expenses (INR)": 60000,
              "Total Monthly EMI (INR)": 38000,
              "Credit Card Dues (if any)": 15000
            }
          },
          boxB: {
            header: "Home Loan Details",
            data: {
              "Outstanding Amount (INR)": 4500000,
              "Monthly EMI (INR)": 30000,
              "Remaining Tenure (Months)": 180
            }
          },
          table: {
            header: "Other Loans",
            table_header: ["Loan Type", "Outstanding (INR)", "Monthly EMI (INR)"],
            table_values: [["Car Loan", 350000, 8000]]
          }
        },
        audio_url: "https://example.com/audio/liabilities.mp3"
      },
  
      {
        type: "financial-goals",
        financialGoals: [
          {
            id: "goal-1",
            header: "Child Education",
            sub_header: "Fund higher education",
            priority: "High Priority",
            text_area_value: "Current Cost: 25,00,000\nInflation: 4% annually",
            cols: { TimeFrame: "13 yrs", "Required Corpus": "40,00,000" }
          }
        ],
        audio_url: null
      },
  
      {
        type: "plan-summary",
        planSummary: [
          {
            id: "life-cover-1",
            type: "lifeCover",
            header: "Immediate Life Cover Analysis",
            sub_header: "",
            cols: { "Required Corpus": "1,20,50,000" },
            calculation: {
              "Outstanding Liabilities": "48,50,000",
              "Family Living Expenses (10x)": "72,00,000"
            },
            text_area_value: "",
            reason: "Total Recommended Cover: 1.2 Cr"
          }
        ],
        audio_url: "https://example.com/audio/plan-summary.mp3"
      },
  
      {
        type: "recommendations",
        recommendations: [
          {
            planName: "Smart Shield Plus",
            planDetails: [
              {
                id: "ssp-1",
                header: "Recommendation 1: Term Plan",
                sub_header: "Financial safety for family.",
                cols: {
                  Term: "20",
                  Cover: "99 lakhs",
                  "Est. Annual Premium": "1,485"
                },
                reason: "Covers liabilities and family expenses.",
                calculation: {
                  "Total liabilities": "27 lakhs",
                  "Monthly expenses": "60k",
                  "Multiplier": "120",
                  "Recommended cover": "99 lakhs"
                },
                calculationDetails:
                  "Total liabilities (27 lakhs) + (Monthly expenses 60k * 120) = 99 lakhs",
                text_area_value: "Fallback calculation text"
              }
            ]
          },
          {
            planName: "eWealth Plus",
            planDetails: [
              {
                id: "ewp-1",
                header: "Recommendation 2: Wealth Plan",
                sub_header: "Long-term wealth plan.",
                cols: {
                  "Target Corpus": "40 lakhs",
                  TimeFrame: "13 years",
                  "Est. Annual Premium": "58,000"
                },
                reason: "Goal-based corpus building.",
                calculation: {
                  "Current cost": "25,00,000",
                  Inflation: "4%",
                  Time: "13 years",
                  "Future corpus": "40,00,000"
                },
                calculationDetails: "2500000 * (1 + 0.04)^13 ≈ 40,00,000"
              }
            ]
          }
        ],
        audio_url: null,
        audiobase64: "BASE64_MP3_DATA_FOR_RECOMMENDATIONS"
      },
  
      {
        type: "follow-up-qn",
        followUpQn: {
          header: "Follow-up Questions",
          data: ["Do you want rider benefits?"]
        },
        audio_url: "https://example.com/audio/follow-up-qn.mp3"
      },
  
      {
        type: "add-cues",
        header: "Follow-up Question",
        card_type: "notification_card",
        options: ["yes", "no"],
        text: "Do you want to include riders?",
        audio_url: null
      },
  
      {
        type: "alert",
        alert: {
          header: "Compliance Alert",
          data: ["Do not guarantee returns."]
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
    ]
  }
  
  module.exports = old_json_ai_suggestion