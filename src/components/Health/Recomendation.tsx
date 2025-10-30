import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

interface Rider {
  name: string;
  desc: string;
  include: boolean;
}

interface PlanProps {
  planName: string;
  sumInsured: string | number;
  premium: string | number;
  reason: string;
  riders: Rider[];
}

const riderDescMap: Record<string, string> = {
  "Infinite Care": "Get one-time infinite claim amount for your selected claim.",
  "2-hr Hospitalization":
    "Medical expenses covered for hospitalisation of 2 hrs or more, like room rent, practitioner fees, ICU charges.",
  "Claim Protector":
    "Non-payable items like gloves, cotton, syringes, and masks are covered up to the sum insured.",
  "Power Booster":
    "Get a loyalty bonus of 100% every year irrespective of claim for an indefinite period.",
  "Dependent Accommodation Benefit":
    "Will pay 1000 per day for a dependent's accommodation if there is a hospitalisation of a minimum 3 consecutive days.",
  "Annual Health Checkups":
    "Predefined health checkup package, up to 0.5% of annual sum insured (max ₹5000) on a cashless basis.",
  "Inflation Protector":
    "The annual sum insured will increase at renewal based on the previous year's inflation rate.",
  "Durable Medical Equipment":
    "Reimbursement for expenses for renting or purchasing listed durable medical equipment up to Rs 5 lakh annually.",
  "Domestic Air Ambulance Cover":
    "Cover Air Ambulance expenses up to the annual sum insured.",
  "Nursing At Home":
    "Reimburse up to ₹2000 per day for a maximum of 10 days for post-hospitalisation medical services.",
  "Compassionate Visit":
    "If hospitalisation exceeds 5 days, we will cover up to 20k per year for an economy class/rail ticket for an immediate family member.",
  "Personal Accident":
    "On occurrence of any insured event, we will pay the Annual Sum Insured, up to a maximum of Rs 50 lakhs.",
  "Critical Illness":
    "Cover 20 listed Critical Illnesses up to a maximum of 50 lakhs. For adults aged 18 to 50.",
  "Room Modifier": "Insured can upgrade or downgrade their room category.",
};

export default function RecommendedHealthPlan({
  planName,
  sumInsured,
  premium,
  reason,
  riders: initialRiders,
}: PlanProps) {
  console.log({ planName, sumInsured, premium, reason, initialRiders },"from Recomendation");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [riders, setRiders] = useState<Rider[]>(initialRiders);

  
  const handleToggle = (index: number) => {
    const updatedRiders = riders.map((r, i) =>
      i === index ? { ...r, include: !r.include } : r
    );
    setRiders(updatedRiders);

    const toggledRider = { ...riders[index], include: !riders[index].include };

    fetch("/api/update-rider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toggledRider),
    })
      .then((res) => res.json())
      .then((data) => console.log("Backend updated:", data))
      .catch((err) => console.error("API update failed", err));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border-2 border-sky-200 hover:border-sky-500 transition-colors duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Recommended Health Plan
        </h2>
        <div className="bg-slate-50 rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-sky-200 hover:border-sky-500 transition-colors duration-300">
          <div>
            <p className="text-sm text-slate-500">{planName.heading}</p>
            <p className="font-semibold text-slate-700">
              {planName.value.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{sumInsured.heading}</p>
            <p className="font-semibold text-slate-700">₹{sumInsured.value}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{premium.heading}</p>
            <p className="font-semibold text-green-600">₹{premium.value}</p>
          </div>
        </div>
      </div>

      {/* Reason Section */}
      {reason && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl shadow-sm">
          <button
            onClick={() => setReasonOpen(!reasonOpen)}
            className="w-full flex items-center justify-between px-5 py-3 text-left"
          >
            <h3 className="text-lg font-semibold text-slate-700">{reason?.heading}</h3>
            {reasonOpen ? (
              <ExpandMoreIcon className="text-slate-600" />
            ) : (
              <ChevronRightIcon className="text-slate-600" />
            )}
          </button>

          {reasonOpen && (
            <ul className="list-disc pl-10 pr-5 pb-4 space-y-2 text-slate-600 leading-relaxed">
              {reason.value
                .split("<br/>")
                .filter((point) => point.trim())
                .map((point, idx) => (
                  <li key={idx} dangerouslySetInnerHTML={{ __html: point.trim() }} />
                ))}
            </ul>
          )}
        </div>
      )}

      {/* Riders Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          {riders.heading}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riders.value?.length > 0 ? (
            riders.value.map((rider, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${
                  rider.include
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                } shadow-sm hover:shadow-md hover:border-sky-500 transition-all duration-200`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={rider.include}
                    onChange={() => handleToggle(idx)}
                  />
                  <span className="font-medium text-slate-800">{rider.name}</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {riderDescMap[rider.name] || "Description not available"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">No add-ons available for this plan.</p>
          )}
        </div>
      </div>
    </div>
  );
}
