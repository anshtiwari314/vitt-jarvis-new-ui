import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"

interface FinancialGoal {
  id: string
  title: string
  description: string
  priority: string
  priorityClass: string
  timeframe: string
  requiredCorpus: number
  calculationDetails: string
  header?: string
  sub_header?: string
  text_area_value?: string
  cols?: { [key: string]: string | null | undefined }
}

interface FinancialToggleCardProps {
  goal: FinancialGoal
  formatCurrency: (value: number) => string
}

export default function FinancialToggleCard({
  goal,
  formatCurrency,
}: FinancialToggleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high priority":
        return "bg-red-100 text-red-700 border-red-200"
      case "medium priority":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "low priority":
        return "bg-green-100 text-green-700 border-green-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const parseCorpusValue = (corpusString: string | null | undefined): number => {
    if (!corpusString) return 0
    let cleanString = corpusString.replace(/₹|\s/g, "")
    cleanString = cleanString.replace(/,/g, "")
    return Number.parseInt(cleanString, 10) || 0
  }

  const safeValue = (val: string | null | undefined): string =>
    val === null || val === undefined || val === "" ? "" : val

  const cols = goal?.cols

  return (
    <div className="bg-white rounded-2xl border-b border-t border-l border-r border-sky-500 p-4 shadow-sm ring-1 ring-sky-200">
      {/* Header with title and priority */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-slate-800">
          {safeValue(goal?.header || goal?.title)}
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityStyle(
            goal.priority
          )}`}
        >
          {safeValue(goal.priority)}
        </span>
      </div>

      <p className="text-slate-600 text-sm mb-4">
        {safeValue(goal?.sub_header || goal?.description)}
      </p>

      {cols && Object.keys(cols).length > 0 && (
        <div className="grid grid-cols-2 gap-6 mb-4">
          {Object.entries(cols).map(([key, value]) => (
            <div key={key}>
              <p className="text-gray-450 text-md mb-0.5">{key}</p>
              <p className="text-slate-800 font-semibold text-sm">
                {key.toLowerCase().includes("corpus") ? (
                  // <span
                  //   dangerouslySetInnerHTML={{
                  //     __html: formatCurrency(parseCorpusValue(safeValue(value))),
                  //   }}
                  // />
                  <span>{safeValue(value)}</span>
                ) : (
                  safeValue(value)
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="-mx-4 mt-2 mb-1 border-t border-gray-200" />

      <div className="flex justify-end">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center gap-2 text-sky-500 hover:text-sky-600 text-sm font-medium"
        >
          <span className="text-lg">Show calculation</span>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className={`w-3 h-3 transition-transform duration-500 ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-[2000ms] ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="text-sm text-slate-700 whitespace-pre-line font-mono bg-gray-50 p-3 rounded border">
            {safeValue(goal.calculationDetails || goal.text_area_value)}
          </div>
        </div>
      </div>
    </div>
  )
}
