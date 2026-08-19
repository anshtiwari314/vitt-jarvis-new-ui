import React, { useMemo, useState } from "react";

const ICON_STROKE = 1.9;

const needs = [
  {
    id: "life_cover",
    title: "Immediate Life Cover Analysis",
    subtitle: "Pure protection need identified for family income replacement and liability protection.",
    summary: {
      cover: "₹71 L",
      term: "20 years",
      budget: "₹1.06 L / year",
    },
    products: [
      {
        id: "signature_term",
        name: "Kotak Signature Term Plan",
        fit: "Best fit",
        annualPremium: "₹1.06 L",
        cover: "₹71 L",
        term: "20 years",
        premiumPayingTerm: "20 years",
        premiumFrequency: "Annual",
        payout: "Lump sum",
        survivalBenefit: "None",
        why: "Strong protection fit with premium aligned to current need.",
        reasons: [
          "Pure protection plan aligned to life cover need",
          "Suitable where family security is the main objective",
          "Current cover and term map cleanly to customer requirement",
        ],
        keyFeatures: [
          "Long-duration pure protection",
          "Higher-end positioning",
          "Useful for larger cover conversations",
        ],
        benefits: [
          { label: "Policy Term", value: "20 years", editable: true },
          { label: "Basic Cover", value: "₹71 L", editable: true },
          { label: "Est. Annual Premium", value: "₹1.06 L", editable: true },
          { label: "Premium Paying Term", value: "20 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Payout Structure", value: "Lump sum", editable: true },
        ],
        calculation: [
          "Recommended cover taken from Plan Summary = ₹71 L",
          "Term = retirement age 60 minus current age 40 = 20 years",
          "Indicative premium provided via insurer pricing API",
        ],
      },
      {
        id: "e_term",
        name: "Kotak e-Term Plan",
        fit: "Strong alternate",
        annualPremium: "₹0.94 L",
        cover: "₹71 L",
        term: "20 years",
        premiumPayingTerm: "20 years",
        premiumFrequency: "Annual",
        payout: "Lump sum / income options",
        survivalBenefit: "None",
        why: "Economical pure protection option with flexible payout choices.",
        reasons: [
          "Lower premium can help if affordability is a concern",
          "Flexible payout options support different family needs",
          "Still aligned to same recommended cover and term",
        ],
        keyFeatures: [
          "Competitive premium",
          "Step-up / step-down flexibility",
          "Good fit for cost-sensitive discussion",
        ],
        benefits: [
          { label: "Policy Term", value: "20 years", editable: true },
          { label: "Basic Cover", value: "₹71 L", editable: true },
          { label: "Est. Annual Premium", value: "₹0.94 L", editable: true },
          { label: "Premium Paying Term", value: "20 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Payout Structure", value: "Lump sum / income", editable: true },
        ],
        calculation: [
          "Same required cover of ₹71 L used for premium quote",
          "Term fixed to 20 years based on customer retirement horizon",
          "Illustrative premium pulled from insurer pricing response",
        ],
      },
      {
        id: "value_protect",
        name: "Kotak Value Protect",
        fit: "Budget option",
        annualPremium: "₹0.82 L",
        cover: "₹50 L",
        term: "20 years",
        premiumPayingTerm: "20 years",
        premiumFrequency: "Annual",
        payout: "Lump sum",
        survivalBenefit: "None",
        why: "Lower-cost entry option but cover adequacy is weaker vs recommended need.",
        reasons: [
          "Useful only when premium sensitivity is very high",
          "Shows trade-off between affordability and adequacy",
          "Can be discussed as fallback, not primary fit",
        ],
        keyFeatures: [
          "Affordable entry point",
          "Wellbeing services bundled",
          "Useful if premium sensitivity is very high",
        ],
        benefits: [
          { label: "Policy Term", value: "20 years", editable: true },
          { label: "Basic Cover", value: "₹50 L", editable: true },
          { label: "Est. Annual Premium", value: "₹0.82 L", editable: true },
          { label: "Premium Paying Term", value: "20 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Gap vs Need", value: "₹21 L", editable: false },
        ],
        calculation: [
          "Product shown as alternate where customer is premium-constrained",
          "Cover displayed below recommended life cover requirement",
          "Agent should discuss adequacy trade-off before selecting",
        ],
      },
    ],
  },
  {
    id: "child_education",
    title: "Child Education Fund",
    subtitle: "Long-term corpus requirement identified for higher studies goal.",
    summary: {
      corpus: "₹1 Cr",
      horizon: "18 years",
      targetYear: "2043",
    },
    products: [
      {
        id: "e_invest_plus",
        name: "Kotak e-Invest Plus",
        fit: "Best fit",
        annualPremium: "₹2.35 L",
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
          "Balances corpus creation with insurance wrapper",
        ],
        keyFeatures: [
          "Child-focused optioning",
          "Good long-term market-linked fit",
          "Useful for goal-linked planning narrative",
        ],
        benefits: [
          { label: "Goal Horizon", value: "18 years", editable: true },
          { label: "Target Corpus", value: "₹1 Cr", editable: true },
          { label: "Est. Annual Premium", value: "₹2.35 L", editable: true },
          { label: "Premium Paying Term", value: "18 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Survival / Maturity Benefit", value: "Fund value", editable: true },
        ],
        calculation: [
          "Target corpus = ₹1 Cr from Plan Summary",
          "Time horizon = 18 years, target year = 2043",
          "Premium is indicative and sourced from insurer pricing API / projection engine",
        ],
      },
      {
        id: "invest_maxima",
        name: "Kotak Invest Maxima",
        fit: "Strong alternate",
        annualPremium: "₹2.22 L",
        cover: "Fund-linked",
        term: "18 years",
        premiumPayingTerm: "18 years",
        premiumFrequency: "Annual",
        payout: "Fund value + additions",
        survivalBenefit: "Survival units + fund value",
        why: "Competitive long-term investment-led option where customer wants market participation.",
        reasons: [
          "Good fit for long-horizon wealth accumulation",
          "Useful where customer is comfortable with market-linked positioning",
          "May work well if corpus target is the main focus",
        ],
        keyFeatures: [
          "No allocation charge positioning",
          "Long-horizon compounding story",
          "Useful for informed investors",
        ],
        benefits: [
          { label: "Goal Horizon", value: "18 years", editable: true },
          { label: "Target Corpus", value: "₹1 Cr", editable: true },
          { label: "Est. Annual Premium", value: "₹2.22 L", editable: true },
          { label: "Premium Paying Term", value: "18 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Survival / Maturity Benefit", value: "Fund value + additions", editable: true },
        ],
        calculation: [
          "Target corpus and term inherited from goal summary",
          "Illustrative premium based on required annual investment for 18-year horizon",
          "Final value depends on assumed return and insurer illustration",
        ],
      },
      {
        id: "fortune_builder",
        name: "Kotak Guaranteed Fortune Builder",
        fit: "Safer alternate",
        annualPremium: "₹3.10 L",
        cover: "Savings-led",
        term: "18 years",
        premiumPayingTerm: "10 years",
        premiumFrequency: "Annual",
        payout: "Assured maturity / income options",
        survivalBenefit: "Guaranteed additions / maturity value",
        why: "Better fit for lower-risk preference but requires higher premium for same corpus target.",
        reasons: [
          "Suitable where certainty matters more than market upside",
          "Helpful for conservative education-fund conversations",
          "Higher premium is the trade-off for lower volatility",
        ],
        keyFeatures: [
          "Guaranteed-style positioning",
          "Good milestone-led narrative",
          "Useful for conservative customers",
        ],
        benefits: [
          { label: "Goal Horizon", value: "18 years", editable: true },
          { label: "Target Corpus", value: "₹1 Cr", editable: true },
          { label: "Est. Annual Premium", value: "₹3.10 L", editable: true },
          { label: "Premium Paying Term", value: "10 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Survival / Maturity Benefit", value: "Guaranteed maturity value", editable: true },
        ],
        calculation: [
          "Higher premium shown because guarantee-style solution typically lowers expected yield",
          "Corpus target remains ₹1 Cr over 18 years",
          "Exact premium should be validated from insurer pricing service",
        ],
      },
    ],
  },
  {
    id: "wealth_creation",
    title: "Long-Term Wealth Creation",
    subtitle: "Supplementary long-term wealth need identified from growth and disciplined saving goals.",
    summary: {
      target: "₹75 L",
      horizon: "15 years",
      budget: "₹1.65 L / year",
    },
    products: [
      {
        id: "platinum",
        name: "Kotak Platinum",
        fit: "Best fit",
        annualPremium: "₹1.65 L",
        cover: "Market-linked",
        term: "15 years",
        premiumPayingTerm: "15 years",
        premiumFrequency: "Annual",
        payout: "Fund value",
        survivalBenefit: "Survival units + fund value",
        why: "Strong fit for customers seeking long-term wealth creation with flexibility and control.",
        reasons: [
          "Designed for long-term corpus building",
          "Useful where wealth accumulation is a clear objective",
          "Product positioning supports a customizable investment discussion",
        ],
        keyFeatures: [
          "Low allocation charge positioning",
          "Multiple investment strategies",
          "Suitable for substantial long-term corpus building",
        ],
        benefits: [
          { label: "Goal Horizon", value: "15 years", editable: true },
          { label: "Target Corpus", value: "₹75 L", editable: true },
          { label: "Est. Annual Premium", value: "₹1.65 L", editable: true },
          { label: "Premium Paying Term", value: "15 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Survival / Maturity Benefit", value: "Fund value + survival units", editable: true },
        ],
        calculation: [
          "Target wealth corpus taken from Plan Summary / advisor review",
          "Horizon fixed to 15 years from need summary",
          "Indicative annual premium to reach target is sourced from pricing / projection layer",
        ],
      },
      {
        id: "wealth_optima",
        name: "Kotak Wealth Optima Plan",
        fit: "Strong alternate",
        annualPremium: "₹1.88 L",
        cover: "Wealth + life cover",
        term: "15 years",
        premiumPayingTerm: "15 years",
        premiumFrequency: "Annual",
        payout: "Fund value + boosters",
        survivalBenefit: "Yearly additions + wealth boosters",
        why: "Good alternate when customer wants wealth enhancement with stronger long-term positioning.",
        reasons: [
          "Useful for clients wanting wealth enhancement and some protection wrapper",
          "Can work well in long-horizon wealth conversations",
          "Slightly higher premium than primary option",
        ],
        keyFeatures: [
          "Yearly additions and boosters",
          "Long-term wealth enhancement positioning",
          "Useful for affluent customers",
        ],
        benefits: [
          { label: "Goal Horizon", value: "15 years", editable: true },
          { label: "Target Corpus", value: "₹75 L", editable: true },
          { label: "Est. Annual Premium", value: "₹1.88 L", editable: true },
          { label: "Premium Paying Term", value: "15 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Survival / Maturity Benefit", value: "Fund value + boosters", editable: true },
        ],
        calculation: [
          "Target corpus and horizon inherited from long-term wealth need",
          "Premium derived from a higher-value growth-oriented projection",
          "Exact values should be validated with insurer illustration engine",
        ],
      },
      {
        id: "assured_savings",
        name: "Kotak Assured Savings Plan",
        fit: "Safer alternate",
        annualPremium: "₹2.40 L",
        cover: "Guaranteed savings",
        term: "15 years",
        premiumPayingTerm: "10 years",
        premiumFrequency: "Annual",
        payout: "Guaranteed maturity value",
        survivalBenefit: "Guaranteed additions + loyalty addition",
        why: "Useful for a lower-risk wealth discussion where guarantee is valued over upside.",
        reasons: [
          "Useful when customer prefers predictability over market-linked returns",
          "Can support disciplined long-term saving narrative",
          "Higher contribution needed for same target outcome",
        ],
        keyFeatures: [
          "Guaranteed additions",
          "Loyalty addition support",
          "Conservative wealth accumulation positioning",
        ],
        benefits: [
          { label: "Goal Horizon", value: "15 years", editable: true },
          { label: "Target Corpus", value: "₹75 L", editable: true },
          { label: "Est. Annual Premium", value: "₹2.40 L", editable: true },
          { label: "Premium Paying Term", value: "10 years", editable: true },
          { label: "Premium Frequency", value: "Annual", editable: true },
          { label: "Survival / Maturity Benefit", value: "Guaranteed maturity value", editable: true },
        ],
        calculation: [
          "Higher premium shown for a safer / more guaranteed accumulation route",
          "Target wealth need remains ₹75 L over 15 years",
          "Final figures depend on insurer benefit illustration and pricing response",
        ],
      },
    ],
  },
];

const fitTone = {
  "Best fit": "bg-[#EEF8FF] text-[#1689DA] border-[#B8E3FF]",
  "Strong alternate": "bg-amber-50 text-amber-700 border-amber-200",
  "Budget option": "bg-slate-50 text-slate-700 border-slate-200",
  "Safer alternate": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function RecommendationsPageMockup() {
  const [selectedByNeed, setSelectedByNeed] = useState(
    Object.fromEntries(needs.map((need) => [need.id, need.products[0].id]))
  );
  const [showCalcByNeed, setShowCalcByNeed] = useState(
    Object.fromEntries(needs.map((need) => [need.id, false]))
  );
  const [draftValues, setDraftValues] = useState(() => {
    const state = {};
    needs.forEach((need) => {
      state[need.id] = {};
      need.products.forEach((product) => {
        state[need.id][product.id] = Object.fromEntries(product.benefits.map((b) => [b.label, b.value]));
      });
    });
    return state;
  });

  const updateBenefit = (needId, productId, label, value) => {
    setDraftValues((prev) => ({
      ...prev,
      [needId]: {
        ...prev[needId],
        [productId]: {
          ...prev[needId][productId],
          [label]: value,
        },
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC] text-slate-800">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
        <aside className="hidden border-r border-slate-200 bg-white p-6 lg:block">
          <div className="mb-6 text-lg font-semibold text-slate-800">Navigation</div>
          <div className="space-y-2 text-[15px]">
            <SidebarItem label="Basic Info" />
            <SidebarItem label="Assets" />
            <SidebarItem label="Liabilities" />
            <SidebarItem label="Financial Goals" />
            <SidebarItem label="Plan Summary" />
            <SidebarItem label="Recommendations" active />
          </div>
        </aside>

        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[22px] font-semibold text-slate-800">
                Recommendations <span className="font-normal text-slate-500">| Client: Kotak</span>
              </div>
              <div className="mt-1 text-sm text-slate-500">
                Compare multiple product options for each customer need, then select the most suitable one before proposal generation.
              </div>
            </div>
            <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
              <RefreshIcon className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="space-y-7">
            {needs.map((need, index) => {
              const selectedProduct = need.products.find((p) => p.id === selectedByNeed[need.id]) || need.products[0];
              const showCalc = showCalcByNeed[need.id];
              return (
                <NeedSection
                  key={need.id}
                  need={need}
                  index={index + 1}
                  selectedProduct={selectedProduct}
                  showCalc={showCalc}
                  draftValues={draftValues[need.id][selectedProduct.id]}
                  onSelectProduct={(productId) =>
                    setSelectedByNeed((prev) => ({ ...prev, [need.id]: productId }))
                  }
                  onToggleCalc={() =>
                    setShowCalcByNeed((prev) => ({ ...prev, [need.id]: !prev[need.id] }))
                  }
                  onUpdateBenefit={(productId, label, value) => updateBenefit(need.id, productId, label, value)}
                />
              );
            })}
          </div>
        </main>

        <aside className="border-t border-slate-200 bg-[#F7FBF8] p-4 lg:border-l lg:border-t-0 lg:p-6">
          <div className="space-y-5">
            <RightPanelCard
              title="Review of this UI"
              points={[
                "Comparison-first still works well, but on phones the table should collapse into stacked product cards.",
                "Selected-option details are more useful when every commercial field is editable in place.",
                "Key reasons for fit are more useful than abstract fit scores in advisor conversations.",
              ]}
            />
            <RightPanelCard
              title="Field coverage"
              points={[
                "The UI now includes term / horizon, cover or corpus, estimated premium, premium paying term, premium frequency, and survival / maturity benefit where relevant.",
                "This is usually enough for first-level recommendation review before proposal generation.",
                "Riders can be added later if the insurer wants a second-level recommendation view for add-ons.",
              ]}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function NeedSection({ need, index, selectedProduct, showCalc, onSelectProduct, onToggleCalc, draftValues, onUpdateBenefit }) {
  return (
    <section className="rounded-[24px] border border-[#54B8FF] bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EEF8FF] text-sm font-semibold text-[#1689DA]">
                {index}
              </span>
              <h2 className="text-[18px] font-semibold text-slate-800">{need.title}</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">{need.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:text-right">
            {Object.entries(need.summary).map(([key, value]) => (
              <div key={key}>
                <div className="text-slate-500">{toLabel(key)}</div>
                <div className="mt-1 font-semibold text-slate-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold text-slate-700">Compare top product options</div>
          <div className="text-xs text-slate-500">Select one primary option for this need</div>
        </div>

        <div className="hidden overflow-hidden rounded-[18px] border border-slate-200 bg-white lg:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Fit</th>
                <th className="px-4 py-3 font-medium">Annual Premium</th>
                <th className="px-4 py-3 font-medium">Cover / Benefit</th>
                <th className="px-4 py-3 font-medium">Term</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {need.products.map((product) => {
                const isSelected = selectedProduct.id === product.id;
                return (
                  <tr key={product.id} className={isSelected ? "bg-[#F7FBFF]" : "bg-white"}>
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold text-slate-800">{product.name}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${fitTone[product.fit] || fitTone["Strong alternate"]}`}>
                        {product.fit}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top font-medium text-slate-800">{product.annualPremium}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{product.cover}</td>
                    <td className="px-4 py-4 align-top text-slate-700">{product.term}</td>
                    <td className="px-4 py-4 align-top">
                      <button
                        onClick={() => onSelectProduct(product.id)}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          isSelected
                            ? "border-[#54B8FF] bg-[#EEF8FF] text-[#1689DA]"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <CheckIcon className="h-4 w-4" />
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 lg:hidden">
          {need.products.map((product) => {
            const isSelected = selectedProduct.id === product.id;
            return (
              <div key={product.id} className={`rounded-[18px] border p-4 ${isSelected ? "border-[#54B8FF] bg-[#F7FBFF]" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">{product.name}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${fitTone[product.fit] || fitTone["Strong alternate"]}`}>
                        {product.fit}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectProduct(product.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "border-[#54B8FF] bg-[#EEF8FF] text-[#1689DA]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <CheckIcon className="h-4 w-4" />
                    {isSelected ? "Selected" : "Select"}
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <MiniMetric label="Annual Premium" value={product.annualPremium} />
                  <MiniMetric label="Cover / Benefit" value={product.cover} />
                  <MiniMetric label="Term" value={product.term} />
                  <MiniMetric label="Payout" value={product.payout} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-5 sm:px-6">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-700">Selected option details</div>
            <div className="mt-1 text-xs text-slate-500">Review the selected product, edit values if needed, and use the reasons below to support advisor discussion.</div>
          </div>
          <div className="rounded-full border border-[#B8E3FF] bg-[#EEF8FF] px-3 py-1 text-xs font-medium text-[#1689DA]">
            Primary option for this need
          </div>
        </div>

        <div className="rounded-[20px] border border-[#CBEAFF] bg-[#F9FCFF] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[18px] font-semibold text-slate-800">{selectedProduct.name}</div>
              <p className="mt-2 text-sm leading-6 text-slate-500">{selectedProduct.why}</p>
            </div>
            <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${fitTone[selectedProduct.fit] || fitTone["Strong alternate"]}`}>
              {selectedProduct.fit}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {selectedProduct.benefits.map((item) => (
              <EditableMetricCard
                key={item.label}
                label={item.label}
                value={draftValues[item.label]}
                editable={item.editable}
                onChange={(value) => onUpdateBenefit(selectedProduct.id, item.label, value)}
              />
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-[16px] border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-700">Key features</div>
              <div className="space-y-2">
                {selectedProduct.keyFeatures.map((feature) => (
                  <div key={feature} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1689DA]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[16px] border border-slate-200 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-slate-700">Why this product seems fit</div>
              <div className="space-y-2">
                {selectedProduct.reasons.map((reason) => (
                  <div key={reason} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <button onClick={onToggleCalc} className="flex items-center gap-2 text-sm font-medium text-[#1689DA] hover:underline">
              Show calculation
              <ChevronDownIcon className={`h-4 w-4 transition ${showCalc ? "rotate-180" : ""}`} />
            </button>
            {showCalc ? (
              <div className="mt-4 rounded-[16px] border border-slate-200 bg-white p-4">
                <div className="mb-2 text-sm font-semibold text-slate-700">Calculation steps</div>
                <div className="space-y-2 text-sm text-slate-600">
                  {selectedProduct.calculation.map((line) => (
                    <div key={line} className="flex gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function EditableMetricCard({ label, value, editable, onChange }) {
  return (
    <div className="rounded-[16px] border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      {editable ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-[15px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2EA9FF]"
        />
      ) : (
        <div className="mt-2 text-[16px] font-semibold text-slate-800">{value}</div>
      )}
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-800">{value}</div>
    </div>
  );
}

function SidebarItem({ label, active = false }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 font-medium transition ${
        active ? "bg-[#EEF8FF] text-[#1689DA]" : "text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </div>
  );
}

function RightPanelCard({ title, points }) {
  return (
    <div className="rounded-[20px] border border-emerald-200 bg-[#EEF9F1] p-5">
      <div className="mb-3 text-[16px] font-semibold text-emerald-900">{title}</div>
      <div className="space-y-2">
        {points.map((point) => (
          <div key={point} className="flex gap-2 text-sm leading-6 text-emerald-900/85">
            <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function toLabel(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase());
}

function SvgIcon({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m5 12 5 5L19 8" />
    </SvgIcon>
  );
}

function ChevronDownIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="m6 9 6 6 6-6" />
    </SvgIcon>
  );
}

function RefreshIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </SvgIcon>
  );
}
