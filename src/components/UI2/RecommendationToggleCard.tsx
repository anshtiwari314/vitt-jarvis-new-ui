import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

interface Recommendation {
  id: string
  title: string
  description: string
  calculationDetails: string | null | undefined
  isPrimary?: boolean
  cover?: number
  targetCorpus?: number
  term?: string
  premium: number
  reason: string | null | undefined
  header?: string
  sub_header?: string
  text_area_value?: string | null | undefined
  cols?: { [key: string]: string | null | undefined }
  calculation?: { [key: string]: string | null | undefined }
}

interface RecommendationToggleCardProps {
  recommendation: Recommendation
  formatCurrency: (value: number) => string
  isExpanded: boolean
  onToggle: (recId: string) => void
}

export default function RecommendationToggleCard({
  recommendation,
  formatCurrency,
  isExpanded,
  onToggle,
}: RecommendationToggleCardProps) {
  const parseCorpusValue = (corpusString: string | null | undefined): number => {
    if (!corpusString) return 0
    let cleanString = corpusString.replace(/₹|\s/g, "")
    cleanString = cleanString.replace(/,/g, "")
    return Number.parseInt(cleanString, 10) || 0
  }

  const safeValue = (val: string | null | undefined) =>
    val === null || val === undefined || val === "" ? "" : val

  const cols = recommendation?.cols
  const calculation = recommendation?.calculation

  return (
    <div className="bg-white rounded-2xl border-b border-t border-l border-r border-sky-500 p-3 shadow-sm ring-2 ring-sky-600">
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {safeValue(recommendation?.header || recommendation?.title)}
      </h3>

      <p className="text-slate-600 text-sm mb-3">
        {safeValue(recommendation?.sub_header || recommendation?.description)}
      </p>

      {/* map of the cols */}
      {cols && Object.keys(cols).length > 0 && (
        <div className="grid grid-cols-3 gap-6 mb-3">
          {Object.entries(cols).map(([key, value]) => {
            console.log(key,' ',value)
            return <div key={key}>
              <p className="text-slate-500 text-md mb-1">{key}</p>
              <p className="text-slate-800 font-semibold text-lg">
                {key.toLowerCase().includes("premium") ||
                key.toLowerCase().includes("cover") ||
                key.toLowerCase().includes("corpus") ? (
                  <span
                    // dangerouslySetInnerHTML={{
                    //   __html: formatCurrency(parseCorpusValue(safeValue(value))),
                    // }}
                    
                  >{safeValue(value)}</span>
                ) : (
                  safeValue(value)
                 //value
                )}
              </p>
            </div>
})}
        </div>
      )}

      {recommendation.reason && (
        <div className="bg-gray-50 p-3 rounded mb-2">
          <span className="text-slate-700 text-sm">
            <strong>Reason:</strong> {safeValue(recommendation.reason)}
          </span>
        </div>
      )}

      <div className="-mx-4 border-t border-gray-200 my-3" />

      {/* Show calculation toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => onToggle(recommendation.id)}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
        >
          <span className="text-[1.06rem] font-medium tracking-tight">Show calculation</span>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className={`w-3 h-3 transition-transform duration-[1500ms] ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* Expandable calculation details */}
      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-[3000ms] ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          {/* Calculation breakdown object if it exists */}
          {calculation && Object.keys(calculation).length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-slate-700 mb-2">
                Calculation Breakdown:
              </h5>
              <div className="space-y-2 bg-gray-50 rounded p-3 border">
                {Object.entries(calculation).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">{key}:</span>
                    <span className="font-medium text-slate-800">
                      {safeValue(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text area fallback */}
          <div className="text-sm text-slate-700 whitespace-pre-line font-mono bg-gray-50 p-3 rounded border">
            {safeValue(recommendation.calculationDetails || recommendation.text_area_value)}
          </div>
        </div>
      </div>
    </div>
  )
}
