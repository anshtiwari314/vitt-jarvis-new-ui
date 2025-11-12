import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { setNavigation } from "../../reducers/salesCopilotReducer";
import { useData } from "../../context/DataWrapper";
import { setPlanSelected } from "../../reducers/healthManagmentReducer";

export default function SideNavigation() {
  const { salesData, planSelected } = useAppSelector(
    (state) => state.healthManagmentReducer
  );
  const recommendations = [
  {
    "planName": {"heading": "Plan Name", "value": "Arogya Supreme Gold"},
    "sumInsured": {"heading": "Sum Insured", "value": "₹10,00,000"},
    "premium": {"heading": "Premium", "value": "₹12,000/year"},
    "riders": {
      "heading": "Riders",
      "value": [
        {"name": "Infinite Care", "desc": "Get one-time infinite claim amount for your selected claim.", "include": true},
        {"name": "2-hr Hospitalization", "desc": "Medical expenses covered for hospitalisation of 2 hrs or more, like room rent, practitioner fees, ICU charges.", "include": true},
        {"name": "Claim Protector", "desc": "Non-payable items like gloves, cotton, syringes, and masks are covered up to the sum insured.", "include": true},
        {"name": "Power Booster", "desc": "Get a loyalty bonus of 100% every year irrespective of claim for an indefinite period.", "include": true},
        {"name": "Dependent Accommodation Benefit", "desc": "Will pay 1000 per day for a dependent's accommodation if there is a hospitalisation of a minimum 3 consecutive days.", "include": true},
        {"name": "Annual Health Checkups", "desc": "Predefined health checkup package, up to 0.5% of annual sum insured (max ₹5000) on a cashless basis.", "include": true},
        {"name": "Inflation Protector", "desc": "The annual sum insured will increase at renewal based on the previous year's inflation rate.", "include": true},
        {"name": "Durable Medical Equipment", "desc": "Reimbursement for expenses for renting or purchasing listed durable medical equipment up to Rs 5 lakh annually.", "include": true},
        {"name": "Domestic Air Ambulance Cover", "desc": "Cover Air Ambulance expenses up to the annual sum insured.", "include": true},
        {"name": "Nursing At Home", "desc": "Reimburse up to ₹2000 per day for a maximum of 10 days for post-hospitalisation medical services.", "include": true},
        {"name": "Compassionate Visit", "desc": "If hospitalisation exceeds 5 days, we will cover up to 20k per year for an economy class/rail ticket for an immediate family member.", "include": true},
        {"name": "Personal Accident", "desc": "On occurrence of any insured event, we will pay the Annual Sum Insured, up to a maximum of Rs 50 lakhs.", "include": true},
        {"name": "Critical Illness", "desc": "Cover 20 listed Critical Illnesses up to a maximum of 50 lakhs. For adults aged 18 to 50.", "include": true},
        {"name": "Room Modifier", "desc": "Insured can upgrade or downgrade their room category.", "include": true}
      ]
    },
    "reason": {"heading": "Reason", "value": "Recommended for individuals seeking high coverage at moderate cost."},
    "keyFeatures": {"heading": "Key Features", "value": ["Cashless treatment at network hospitals", "No-claim bonus up to 100%", "Coverage for pre-existing diseases after waiting period"]}
  },
  {
    "planName": {"heading": "Plan Name", "value": "Health Secure Silver"},
    "sumInsured": {"heading": "Sum Insured", "value": "₹5,00,000"},
    "premium": {"heading": "Premium", "value": "₹8,500/year"},
    "riders": {
      "heading": "Riders",
      "value": [
        {"name": "Infinite Care", "desc": "Get one-time infinite claim amount for your selected claim.", "include": true},
        {"name": "2-hr Hospitalization", "desc": "Medical expenses covered for hospitalisation of 2 hrs or more, like room rent, practitioner fees, ICU charges.", "include": true},
        {"name": "Claim Protector", "desc": "Non-payable items like gloves, cotton, syringes, and masks are covered up to the sum insured.", "include": true},
        {"name": "Power Booster", "desc": "Get a loyalty bonus of 100% every year irrespective of claim for an indefinite period.", "include": true},
        {"name": "Dependent Accommodation Benefit", "desc": "Will pay 1000 per day for a dependent's accommodation if there is a hospitalisation of a minimum 3 consecutive days.", "include": true},
        {"name": "Annual Health Checkups", "desc": "Predefined health checkup package, up to 0.5% of annual sum insured (max ₹5000) on a cashless basis.", "include": true},
        {"name": "Inflation Protector", "desc": "The annual sum insured will increase at renewal based on the previous year's inflation rate.", "include": true},
        {"name": "Durable Medical Equipment", "desc": "Reimbursement for expenses for renting or purchasing listed durable medical equipment up to Rs 5 lakh annually.", "include": true},
        {"name": "Domestic Air Ambulance Cover", "desc": "Cover Air Ambulance expenses up to the annual sum insured.", "include": true},
        {"name": "Nursing At Home", "desc": "Reimburse up to ₹2000 per day for a maximum of 10 days for post-hospitalisation medical services.", "include": true},
        {"name": "Compassionate Visit", "desc": "If hospitalisation exceeds 5 days, we will cover up to 20k per year for an economy class/rail ticket for an immediate family member.", "include": true},
        {"name": "Personal Accident", "desc": "On occurrence of any insured event, we will pay the Annual Sum Insured, up to a maximum of Rs 50 lakhs.", "include": true},
        {"name": "Critical Illness", "desc": "Cover 20 listed Critical Illnesses up to a maximum of 50 lakhs. For adults aged 18 to 50.", "include": true},
        {"name": "Room Modifier", "desc": "Insured can upgrade or downgrade their room category.", "include": true}
      ]
    },
    "reason": {"heading": "Reason", "value": "Ideal for small families or young professionals starting out."}
  },
  {
    "planName": {"heading": "Plan Name", "value": "Elite Health Platinum"},
    "sumInsured": {"heading": "Sum Insured", "value": "₹25,00,000"},
    "premium": {"heading": "Premium", "value": "₹22,000/year"},
    "riders": {
      "heading": "Riders",
      "value": [
        {"name": "Infinite Care", "desc": "Get one-time infinite claim amount for your selected claim.", "include": true},
        {"name": "2-hr Hospitalization", "desc": "Medical expenses covered for hospitalisation of 2 hrs or more, like room rent, practitioner fees, ICU charges.", "include": true},
        {"name": "Claim Protector", "desc": "Non-payable items like gloves, cotton, syringes, and masks are covered up to the sum insured.", "include": true},
        {"name": "Power Booster", "desc": "Get a loyalty bonus of 100% every year irrespective of claim for an indefinite period.", "include": true},
        {"name": "Dependent Accommodation Benefit", "desc": "Will pay 1000 per day for a dependent's accommodation if there is a hospitalisation of a minimum 3 consecutive days.", "include": true},
        {"name": "Annual Health Checkups", "desc": "Predefined health checkup package, up to 0.5% of annual sum insured (max ₹5000) on a cashless basis.", "include": true},
        {"name": "Inflation Protector", "desc": "The annual sum insured will increase at renewal based on the previous year's inflation rate.", "include": true},
        {"name": "Durable Medical Equipment", "desc": "Reimbursement for expenses for renting or purchasing listed durable medical equipment up to Rs 5 lakh annually.", "include": true},
        {"name": "Domestic Air Ambulance Cover", "desc": "Cover Air Ambulance expenses up to the annual sum insured.", "include": true},
        {"name": "Nursing At Home", "desc": "Reimburse up to ₹2000 per day for a maximum of 10 days for post-hospitalisation medical services.", "include": true},
        {"name": "Compassionate Visit", "desc": "If hospitalisation exceeds 5 days, we will cover up to 20k per year for an economy class/rail ticket for an immediate family member.", "include": true},
        {"name": "Personal Accident", "desc": "On occurrence of any insured event, we will pay the Annual Sum Insured, up to a maximum of Rs 50 lakhs.", "include": true},
        {"name": "Critical Illness", "desc": "Cover 20 listed Critical Illnesses up to a maximum of 50 lakhs. For adults aged 18 to 50.", "include": true},
        {"name": "Room Modifier", "desc": "Insured can upgrade or downgrade their room category.", "include": true}
      ]
    },
    "reason": {"heading": "Reason", "value": "Best suited for high-income individuals or families looking for maximum coverage benefits."}
  }
     ];

  const dispatch = useAppDispatch();
  const currentNavigation = useAppSelector(
    (state) => state.healthManagmentReducer.navigation
  );
  const { recommendationsGenerated, pref_language } = useData();
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);

  const handleNavigationClick = (page: string) => {
    dispatch(setNavigation(page));
  };

  const handlePlanClick = (planName: string) => {
    dispatch(setPlanSelected(planName));
  };

  const iconClass = "w-6 h-6 mr-3 text-sky-500";

  const labels = {
    en: {
      basicInfo: "Basic Info",
      healthProfile: "Health Profile",
      recommendations: "Recommendation",
      planSummary: "Plan Summary",
      aiCopilot: "AI Copilot",
      recGenerated: "Recommendations Generated",
      systemStatus: "System Status",
      audioStreaming: "Audio Streaming",
      liveTranscription: "Live Transcription",
      aiProcessing: "AI Processing",
    },
    mr: {
      basicInfo: "मूलभूत माहिती",
      healthProfile: "आरोग्य प्रोफाइल",
      recommendations: "शिफारसी",
      planSummary: "योजनेचा सारांश",
      aiCopilot: "एआय सहाय्यक",
      recGenerated: "शिफारसी तयार झाल्या",
      systemStatus: "प्रणाली स्थिती",
      audioStreaming: "ऑडिओ प्रवाह",
      liveTranscription: "थेट लिप्यंतरण",
      aiProcessing: "एआय प्रक्रिया",
    },
  };

  const lang = pref_language === "mr" ? labels.mr : labels.en;

  // ✅ Dynamic recommendation list from salesData
  const recommendationSubItems = recommendations?.map((rec: any, index: number) => ({
    id: `recommendation_${index + 1}`,
    label: rec.planName?.value || `Recommendation ${index + 1}`,
    planName: rec.planName?.value || "",
  }));

  const navItems = [
    {
      id: "basicInfo",
      label: lang.basicInfo,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "healthProfile",
      label: lang.healthProfile,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: "recommendations",
      label: lang.recommendations,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      subItems: recommendationSubItems,
    },
    {
      id: "planSummary",
      label: lang.planSummary,
      icon: (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  const updateDateTime = () => {
    const now = new Date();
    const dateEl = document.getElementById("current-date");
    const timeEl = document.getElementById("current-time");
    if (dateEl)
      dateEl.textContent = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    if (timeEl)
      timeEl.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col hidden lg:block">
      {/* Top Section */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <a
          href="#/lead-management"
          id="home-button"
          className="text-slate-500 hover:text-sky-600"
          onClick={() => handleNavigationClick("basicInfo")}
        >
          <svg className="w-7 h-7 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </a>
        <div className="text-right">
          <div id="current-date" className="font-semibold text-slate-700"></div>
          <div id="current-time" className="text-sm text-slate-500"></div>
        </div>
      </div>

      {/* AI Copilot Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-200">
        <div className="bg-indigo-600 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-half">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
            <path d="M12 22V2" />
          </svg>
        </div>
        <h1 className="text-lg font-bold text-slate-800">{lang.aiCopilot}</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <div key={item.id}>
            <div
              className={`flex items-center justify-between px-3 py-3 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-200 cursor-pointer ${
                currentNavigation === item.id ? "bg-slate-100 text-sky-600" : ""
              }`}
              onClick={() =>
                item.subItems ? setRecommendationsOpen((prev) => !prev) : handleNavigationClick(item.id)
              }
            >
              <div className="flex items-center">
                {item.icon}
                {item.label}
              </div>
              {item.subItems && (
                <svg
                  className={`w-5 h-5 transition-transform ${
                    recommendationsOpen ? "rotate-90 text-sky-500" : "text-slate-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>

            {/* Sub-items (Dynamic Plan List) */}
            {item.subItems && recommendationsOpen && (
              <div className="ml-10 mt-1 space-y-1">
                {item.subItems.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      handleNavigationClick("recommendations");
                      handlePlanClick(sub.planName);
                    }}
                    className={`px-3 py-2 text-sm rounded-md cursor-pointer ${
                      currentNavigation === "recommendations" &&
                      planSelected === sub.planName
                        ? "bg-sky-50 text-sky-700 font-medium"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {sub.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Recommendations Status */}
      {recommendationsGenerated && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center text-slate-500 text-sm">
            <div className="w-2.5 h-2.5 mr-2 rounded-full bg-green-400"></div>
            {lang.recGenerated}
          </div>
        </div>
      )}

      {/* System Status */}
      <div className="p-4 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-600 mb-3">{lang.systemStatus}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> {lang.audioStreaming}
          </div>
          <div className="flex items-center text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> {lang.liveTranscription}
          </div>
          <div className="flex items-center text-slate-500">
            <div className="w-2.5 h-2.5 rounded-full mr-2 bg-gray-300"></div> {lang.aiProcessing}
          </div>
        </div>
      </div>
    </aside>
  );
}
