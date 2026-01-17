import React, { useEffect, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DOMPurify from "dompurify"
interface Rider {
  name: string;
  desc: string;
  include: boolean;
}

interface Field {
  heading: string;
  value: string | number;
}

interface TextField {
  heading: string;
  value: string;
}

interface RidersField {
  heading: string;
  value: Rider[];
}

interface KeyFeature {
  name: string;
  desc: string;

}

interface KeyFeaturesField {
  heading: string;
  value: KeyFeature[];
    open?: boolean;
}

interface PlanProps {
  planName: Field;
  sumInsured: Field;
  premium: Field;
  reason: TextField;
  keyFetures: KeyFeaturesField;
  riders: RidersField;
  context_name?: string;
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
  keyFetures,
  riders: initialRiders,
  context_name
}: PlanProps) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [riders, setRiders] = useState<RidersField>(initialRiders);
  const [keyFeatures, setKeyFeatures] = useState<KeyFeaturesField>(keyFetures);
  useEffect(()=>{
    setRiders(initialRiders);
  },[initialRiders]
)
  useEffect(()=>{
    setKeyFeatures(keyFetures);
  },[keyFetures])
  console.log(riders,"riders---",keyFetures,"key features---");
  // toggle riders
  const handleRiderToggle = (index: number) => {
    const updatedList = riders?.value?.map((r, i) =>
      i === index ? { ...r, include: !r.include } : r
    );
    setRiders({ ...riders, value: updatedList });

    const toggledRider = { ...riders.value[index], include: !riders.value[index].include };

    fetch("/api/update-rider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toggledRider),
    })
      .then((res) => res.json())
      .then((data) => console.log("Backend updated:", data))
      .catch((err) => console.error("API update failed", err));
  };

  // toggle key features
  // const handleFeatureToggle = (index: number) => {
  //   const updated = keyFeatures.value.map((f, i) =>
  //     i === index ? { ...f, include: !f.include } : f
  //   );
  //   setKeyFeatures({ ...keyFeatures, value: updated });

  //   const toggledFeature = { ...keyFeatures.value[index], include: !keyFeatures.value[index].include };

  //   fetch("/api/update-feature", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(toggledFeature),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => console.log("Feature updated:", data))
  //     .catch((err) => console.error("API update failed", err));
  // };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border-2 border-sky-200 hover:border-sky-500 transition-colors duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Recommended Health Plan
        </h2>
        <div className="bg-slate-50 rounded-lg p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border border-sky-200 hover:border-sky-500 transition-colors duration-300">
          <div>
            <p className="text-sm text-slate-500">{planName?.heading}</p>
            <p className="font-semibold text-slate-700">
              {String(planName?.value).toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{sumInsured?.heading}</p>
            <p className="font-semibold text-slate-700">₹{sumInsured?.value}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">{premium?.heading}</p>
            <p className="font-semibold text-green-600">₹{premium?.value}</p>
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
            <h3 className="text-lg font-semibold text-slate-700">
              {reason?.heading}
            </h3>
            {reasonOpen ? (
              <ExpandMoreIcon className="text-slate-600" />
            ) : (
              <ChevronRightIcon className="text-slate-600" />
            )}
          </button>

          {reasonOpen && (
            <ul className="list-disc pl-10 pr-5 pb-4 space-y-2 text-slate-600 leading-relaxed">
              {reason?.value
                .split("<br/>")
                .filter((point) => point.trim())
                .map((point, idx) => (
                  <li
                    key={idx}
                    dangerouslySetInnerHTML={{ __html: point.trim() }}
                  />
                ))}
            </ul>
          )}
        </div>
      )}

   {/* Key Features Section - Dropdown style */}
{/* Key Features Section - simple horizontal style */}
<div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
  <button
    onClick={() =>
      setKeyFeatures((prev) => ({
        ...prev,
        open: !prev?.open,
      }))
    }
    className="w-full flex items-center justify-between px-5 py-3 text-left"
  >
    <h3 className="text-lg font-semibold text-slate-700">
      {keyFeatures?.heading}
    </h3>
    {keyFeatures?.open ? (
      <ExpandMoreIcon className="text-slate-600" />
    ) : (
      <ChevronRightIcon className="text-slate-600" />
    )}
  </button>

  {keyFeatures?.open && (
  <div className="px-6 pb-4 space-y-2">
    {keyFeatures?.value?.length > 0 ? (
      keyFeatures.value.map((feature, idx) => (
        <div key={idx} className="flex items-start gap-2">
          {/* Bullet */}
          <span className="text-blue-600 text-lg leading-6">•</span>

          {/* Content */}
          <div className="text-slate-700 text-md leading-6">
            {/* Feature name */}
            <span className="font-medium mr-1" 
            dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(feature?.name || "", {
                  ALLOWED_TAGS: ["b", "strong"],
                }),
              }}
            />
              

            {/* Feature description (HTML from backend) */}
            <span
              className="[&_b]:font-semibold [&_strong]:font-semibold"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(feature?.desc || "", {
                  ALLOWED_TAGS: ["b", "strong"],
                }),
              }}
            />
          </div>
        </div>
      ))
    ) : (
      <p className="text-slate-500 text-sm">
        No key features available for this plan.
      </p>
    )}
  </div>
)}
</div>



      {/* Riders Section */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          {riders?.heading}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riders?.value?.length > 0 ? (
            riders?.value?.map((rider, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border-2 ${
                  rider?.include
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                } shadow-sm hover:shadow-md hover:border-sky-500 transition-all duration-200`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    className="w-5 h-5"
                    checked={rider.include}
                    onChange={() => handleRiderToggle(idx)}
                  />
                  <span className="font-medium text-slate-800">{rider.name}</span>
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  {riderDescMap[rider.name] || rider.desc}
                </p>
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
// {
//   "Recommendations":[
//     {
//       "planName": {
//         "heading": "Plan Name",
//         "value": "Health Infinity"
//       },
//       "sumInsured": {
//         "heading": "Sum Insured",
//         "value": 1000000
//       },
//       "premium": {
//         "heading": "Premium",
//         "value": 21780
//       },
//       "keyFeatures": {
//         "heading": "Key Features",
//         "value": [
//           {
//             "name": "MORE COVER",
//             "desc": "Your go-to More Benefit now gives you an enhanced cover on every Sum Insured. For eg. You get _x001F_ 1.5 Crores of more cover when you opt for a SI of 5 Crores which means you get a total coverage of 6.5 Crores"
//           },
//           {
//             "name": "MORE TIME",
//             "desc": "This is a cover that stays longer. Have you heard of a policy expiring in 13 months instead of 12 months? Well this one does. We also offer you a 26 months cover when you choose the 24 months plan."
//           },
//           {
//             "name": "MORE GLOBAL",
//             "desc": "Your health cover is no more bounded by boundaries. So, if you are a frequent globetrotter, we will not just cover Global emergencies but even your planned treatments up to defined limits."
//           },
//           {
//             "name": "OPD expenses covered",
//             "desc": "From consultations with Super Specialist to Diagnostic tests, we’ve got your OPD treatment expenses covered. Want more? Well… we’ve made sure your dental treatment, surgical treatment & even your drug prescriptions are taken care of, up to 35% of OPD limit."
//           },
//           {
//             "name": "Maternity Cover begins in just a Year",
//             "desc": "We understand how important it is to have your maternity expenses taken care of, so we have a waiting period of just 1/2 years (as opted) to give you the advantage of getting your cover sooner."
//           },
//           {
//             "name": "Unlimited Restoration of Sum Insured",
//             "desc": "Hospitalisation cannot be budgeted, so if a medical claim exhausts your base sum insured within a policy year, we automatically restore it 100% back for your use. So, if your sum insured was ₹10 Lakhs initially, and you claimed it all, we refill ₹10 Lakhs back, so that you can use 100% of your Sum Insured again in case of a related or unrelated illness/injury"
//           }
//         ]
//       },
//       "riders": {
//         "heading": "ADD-ON/OPTIONS",
//         "value": [
//           {
//             "name": "Consumables Cover",
//             "desc": "Pays for miscellaneous expenses like syringe,gloves etc. up to Sum Insured opted, which are usually non-payable.",
//             "include": true
//           },
//           {
//             "name": "Unlimited Restore Benefit",
//             "desc": "Restore your base Sum Insured unlimited times in a year. You can use it for subsequent claim of related or unrelated illness/injury.",
//             "include": true
//           },
//           {
//             "name": "Super Charger",
//             "desc": "Charge up your policy with an additional SI of either 20% or 33.33% of SI (as opted) at the end of each policy year. (max upto 100% of SI)",
//             "include": true
//           },
//           {
//             "name": "Air Ambulance",
//             "desc": "In an emergency life-threatening condition,get airlifted to the nearest hospital for medically necessary treatment.",
//             "include": true
//           },
//           {
//             "name": "Maternity Cover",
//             "desc": "Covers maternity expenses (Normal & C-section) for _x001F_1 Lakh or _x001F_2 Lakhs depending on the coverage opted.",
//             "include": true
//           },
//           {
//             "name": "Maternity Waiting Period",
//             "desc": "Waiting period of only 1 or 2 years as per selection.",
//             "include": true
//           },
//           {
//             "name": "Newborn Baby and Vaccination Cover",
//             "desc": "Cover your newborn and their vaccination expenses for _x001F_1 Lakh.",
//             "include": true
//           },
//           {
//             "name": "OPD Cover",
//             "desc": "Your OPD consultation with medical practitioners to diagnostic tests, OPD for dental treatment and surgical treatments are covered. Prescription drugs are covered upto 35% of the OPD limit opted.",
//             "include": true
//           },
//           {
//             "name": "Medical Equipment Cover",
//             "desc": "Ever thought that your policy would cover medical equipments too? Well, this one does. The policy covers Durable Medical Equipment up to 5% of SI subject to max _x001F_2.5 Lakhs\nand Small Medical Equipment up to 1% of SI subject to max _x001F_20,000.",
//             "include": true
//           },
//           {
//             "name": "Double Cover",
//             "desc": "Get additional 100% of Sum Insured for the same claim.",
//             "include": true
//           },
//           {
//             "name": "Home Care Treatment",
//             "desc": "Medical expenses related to listed home treatments are covered within SI limits.",
//             "include": true
//           },
//           {
//             "name": "Change In Pre-Existing Waiting Period",
//             "desc": "Change the pre-existing waiting period to 48 months**, 24 months or 12 months.",
//             "include": true
//           },
//           {
//             "name": "Reduction In Specific Illness Waiting Period",
//             "desc": "You can now reduce your waiting period on specific illness to 12 months",
//             "include": true
//           },
//           {
//             "name": "Voluntary Aggregate Deductible",
//             "desc": "Reduce your premium amount by opting for a Voluntary Aggregate Deductible.",
//             "include": true
//           },
//           {
//             "name": "Reduction In Room Rent",
//             "desc": "Change your hospital room category as per your requirement.",
//             "include": true
//           }
//         ]
//       },
//       "reason": {
//         "heading": "Reason",
//         "value": "Generating Reasons"
//       }
//     },
//     {
//       "planName": {
//         "heading": "Plan Name",
//         "value": "Health Gain"
//       },
//       "sumInsured": {
//         "heading": "Sum Insured",
//         "value": 1000000
//       },
//       "premium": {
//         "heading": "Premium",
//         "value": 21780
//       },
//       "keyFeatures": {
//         "heading": "Key Features",
//         "value": [
//           {
//             "name": "Sum Insured Doubled",
//             "desc": "Get 100% base sum-insured over and above, to be used on the same claim."
//           },
//           {
//             "name": "Room rent limits, No limits",
//             "desc": "Increase/Decrease your hospital room rent limits or even upgrade/downgrade your room category as you like."
//           },
//           {
//             "name": "Reduced Waiting Period",
//             "desc": "Waiting period can be reduced from 3 years to 2 years or 1 year."
//           },
//           {
//             "name": "Cash-in-Hand",
//             "desc": "Get daily cash for 30 days in case of normal hospitalisation of beyond 72 hours; in case of ICU hospitalisation get 2x of normal hospitalisation cash for 15 days."
//           },
//           {
//             "name": "Premium On Critical Illness Waived Off",
//             "desc": "Renewal premium is waived off for the first year of detection of any listed critical illness."
//           },
//           {
//             "name": "Voluntary Aggregate Deductible",
//             "desc": "Get a significant discount on your insurance premium when you agree to pay a certain aggregate deductible amount during multiple claims in a policy period."
//           },
//           {
//             "name": "Removal of Co-payment",
//             "desc": "If an insured person buys his first policy at the of age 61 or above, the co-payment can be removed by opting this cover."
//           },
//           {
//             "name": "Intercity Road Ambulance",
//             "desc": "Get Intercity Road Ambulance costs covered up to actuals beyond 100km."
//           }
//         ]
//       },
//       "riders": {
//         "heading": "ADD-ON/OPTIONS",
//         "value": [
//           {
//             "name": "Guaranteed Cumulative Bonus",
//             "desc": "This benefit waives off the condition of decrease in Cumulative Bonus in case of a claim in immediate policy year.",
//             "include": true
//           },
//           {
//             "name": "Unlimited Reinstatement of Base Sum-insured",
//             "desc": "On subsequent claim, unlimited reinstatement of base sum insured on unrelated illness or injury, sub-limit of 100% of base sum insured for related illness/injury",
//             "include": true
//           },
//           {
//             "name": "Consumable Cover",
//             "desc": "Within sum insured (reasonable and customary expenses incurred by the policyholder /insured person, during the policy year, for items which are listed in ‘Annexure A-List 1 as Optional Items’ of policy wordings.",
//             "include": true
//           },
//           {
//             "name": "Double Cover",
//             "desc": "Choosing this cover will provide an additional 100% of base sum-insured on same claim, in single hospitalisation after exhaustion of base sum insured under the policy. This benefit supersedes the base feature of ‘Extra Sum insured’",
//             "include": true
//           },
//           {
//             "name": "Room rent limits",
//             "desc": "PLUS: Category of Room capped to: Twin sharing POWER: Category of Room upgrade to: Actuals ORCategory of Room capped to: Twin sharing PRIME: Category of Room capped to: Single Private A.C room",
//             "include": true
//           },
//           {
//             "name": "Reduction in PED Waiting Period",
//             "desc": "Choose this benefit to reduce the Pre-Existing Waiting Period to 24 months or 12 months",
//             "include": true
//           },
//           {
//             "name": "Voluntary Aggregate Deductible",
//             "desc": "Choose Voluntary Aggregate Deductible from the following options - ₹10,000/ ₹25,000/ ₹50,000/ ₹1,00,000",
//             "include": true
//           },
//           {
//             "name": "Removal of Co-payment",
//             "desc": "This benefit waives off the Co-Payment condition of 20% on the Assessed Claim Amount, applicable on Policies where the Insured age, first time entering into the Policy is >=61 years",
//             "include": true
//           },
//           {
//             "name": "Hospital cash benefit",
//             "desc": "Daily Cash options: ₹1,000, ₹1,500, ₹2,000, ₹2500 max up to 30 days for In-Patient Hospitalisation and 15 days for ICU Hospitalisation. Minimum Hospitalisation of 72 hours",
//             "include": true
//           },
//           {
//             "name": "Change in Pre/Post Hospitalisation Limit benefit",
//             "desc": "The benefit, enhances the Pre-hospitalisation limit to 90 days and Post Hospitalisation limit to 180 days",
//             "include": true
//           },
//           {
//             "name": "Air Ambulance",
//             "desc": "Covers cost up to 7.5% of base sum insured or ₹5 Lakhs whichever is higher",
//             "include": true
//           },
//           {
//             "name": "Radio Taxi",
//             "desc": "Covers expenses up to ₹1,000 per hospitalisation",
//             "include": true
//           },
//           {
//             "name": "Convalescence Cover",
//             "desc": "PLUS: 10,000 lumpsum if the Insured Person is hospitalized for a minimum period of 7 continuous and consecutive days. POWER: 10,000 lumpsum if the Insured Person is hospitalized for a minimum period of 7 continuous and consecutive days. PRIME: 25,000 lumpsum if the insured person is hospitalized for a minimum period of 7 continuous and consecutive days",
//             "include": true
//           },
//           {
//             "name": "Expenses covered for Health Check-up",
//             "desc": "End of every policy year preventive health check-up up to 3,000 can be availed",
//             "include": true
//           },
//           {
//             "name": "Expenses covered for Vaccination",
//             "desc": "PLUS: Annual expenses for vaccination covered up to 2,000 POWER: Annual expenses for vaccination (as listed in policy wording) covered up to 2,000 PRIME: Annual expenses for vaccination (as listed in policy wording) covered up to 3,500",
//             "include": true
//           },
//           {
//             "name": "Modern Treatment Limits",
//             "desc": "PLUS: 100% of base sum insured POWER: 100% of base sum insured PRIME: Not Applicable",
//             "include": true
//           },
//           {
//             "name": "Vision Correction benefit",
//             "desc": "PLUS: Medical expenses covered up to 50,000 for correction of eyesight due to refractive error POWER: Medical expenses covered up to 1,00,000 for correction of eyesight due to refractive error PRIME: Medical expenses covered up to 1,00,000 for correction of eyesight due to refractive error",
//             "include": true
//           },
//           {
//             "name": "Second Opinion benefit",
//             "desc": "PLUS: Expenses up to 3000 is covered towards second opinion from a medical practitioner in India POWER: Expenses up to 3000 is covered towards second opinion from a medical practitioner in India PRIME: Expenses up to 5,000 is covered towards second opinion from a medical practitioner in India",
//             "include": true
//           },
//           {
//             "name": "Home Care Treatment",
//             "desc": "Covered up to 100% of sum insured",
//             "include": true
//           },
//           {
//             "name": "Companion Cover",
//             "desc": "Fixed daily amount of 1,000 towards expenses incurred by the Companion towards accommodation, transportation, food or any other miscellaneous expenses, max up to 30 days. Minimum 72 hours of hospitalisation is required for this benefit to trigger",
//             "include": true
//           },
//           {
//             "name": "Child Care Cover benefit",
//             "desc": "Fixed daily amount of 1,000 towards childcare expenses for any one dependent child covered under the policy up to 12 years of age, for max up to 30 days. Minimum 72 hours of hospitalisation is required for this benefit to trigger.",
//             "include": true
//           }
//         ]
//       },
//       "reason": {
//         "heading": "Reason",
//         "value": "Generating Reasons"
//       }
//     }
//   ],
//   "type": "recommendations"
// }
 
 