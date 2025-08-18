import React from "react";

interface PlanProps {
  planName: string;
  sumInsured: string | number;
  premium: string | number;
  riders: { name: string; desc: string; include: boolean }[];
}

export default function RecommendedHealthPlan({
  planName,
  sumInsured,
  premium,
  riders,
}: PlanProps) {
  console.log(
    "RecommendedHealthPlan rendered",
    planName,
    sumInsured,
    premium,
    riders
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Recommended Health Plan
        </h2>
        <div className="bg-slate-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-200">
          <div>
            <p className="text-sm text-slate-500">Plan Name</p>
            <p className="font-semibold text-slate-700">{planName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Sum Insured</p>
            <p className="font-semibold text-slate-700">₹{sumInsured}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Annual Premium</p>
            <p className="font-semibold text-green-600">₹{premium}</p>
          </div>
        </div>
      </div>

      {/* Riders Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Select Add-ons (Riders)
        </h3>
        <div className="space-y-3">
          {riders.length > 0 ? (
            riders.map((rider, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    defaultChecked={rider.include} // tick if include is true
                  />
                  <span className="text-slate-700">{rider.name}</span>
                </label>
                <span className="text-slate-500 text-sm">{rider.desc}</span>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm">
              No add-ons available for this plan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
