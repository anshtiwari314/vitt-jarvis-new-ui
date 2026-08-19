/**
 * Socket event: questions_loader_res
 * Must be FULL reducer state because initSalesState returns action.payload directly.
 */

const old_json_qn_loader = {
    navigation: "Basic Info",
    pref_language: "English",
    language_ids: ["English", "Hindi", "Marathi"],
    RecomendationSelected: "",
    chat: [],
    clientName: "Ajay",
  
    salesData: {
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
          table_values: [
            ["Spouse", "Wife", "38 yrs", "Pune"],
            ["Child", "Son", "8 yrs", "Pune"]
          ]
        }
      },
  
      assets: {
        boxA: {
          header: "Income and Savings",
          sub_header: "Monthly Income (INR)",
          sub_header_data: 150000,
          text_area_header: "Savings (FD, PPF, NSC, etc.)",
          text_area_value: "PPF: 5,00,000\nFD: 2,00,000"
        },
        boxB: {
          header: "Investments and Other Assets",
          text_area_headerA: "Investments (Mutual Funds, Equity)",
          text_area_valueA: "Mutual Funds: 3,00,000",
          text_area_headerB: "Other Assets (Gold, Land, Property)",
          text_area_valueB: "Gold: 20g"
        },
        table: {
          header: "Existing Life Insurance",
          table_header: ["Insurer Name", "Cover Amount (INR)", "Annual Premium (INR)"],
          table_values: [["LIC Jeevan Anand", 5000000, 45000]]
        }
      },
  
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
  
      financialGoals: [],
      planSummary: [],
  
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
              text_area_value:
                "Fallback text for show calculation if calculationDetails missing"
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
  
      followUpQn: {
        header: "Follow-up Questions",
        data: []
      },
  
      cues: {
        header: "ai cues",
        cards: []
      },
  
      alert: {
        header: "Alerts",
        data: []
      }
    }
  }
  
  module.exports = old_json_qn_loader