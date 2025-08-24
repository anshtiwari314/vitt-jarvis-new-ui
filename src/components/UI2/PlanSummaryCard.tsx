import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { useRef, useEffect, useState } from "react"

interface PlanSummaryItem {
  id?: string
  header: string
  sub_header?: string
  cols?: { [key: string]: string | null | undefined }
  calculation?: { [key: string]: string | null | undefined }
  text_area_value?: string | null | undefined
  reason?: string | null | undefined
  type?: "lifeCover" | "goalCorpus" | "general"
}

interface PlanSummaryCardProps {
  summaryItem: PlanSummaryItem
  formatCurrency: (value: number) => string
  isExpanded: boolean
  onToggle: (summaryId: string) => void
}

export default function PlanSummaryCard({
  summaryItem,
  formatCurrency,
  isExpanded,
  onToggle,
}: PlanSummaryCardProps) {
  const parseCorpusValue = (corpusString: string): number => {
    if (!corpusString) return 0
    const cleanString = corpusString.replace(/₹|\s/g, "").replace(/,/g, "")
    return Number.parseInt(cleanString, 10) || 0
  }

  const extractTotalCover = (reasonHtml: string | null | undefined) => {
    if (!reasonHtml) return ""
    const match = reasonHtml.match(/<p[^>]*>(.*?)<\/p>/i)
    return match ? match[1] : reasonHtml
  }

  const getCardType = () => {
    const header = summaryItem.header ? summaryItem.header?.toLowerCase() : '' 
    if (header.includes("life cover") || header.includes("cover analysis")) {
      return "lifeCover"
    }
    if (header.includes("goal") || header.includes("corpus") || header.includes("education")) {
      return "goalCorpus"
    }
    return "general"
  }

  const cardType = getCardType()
  const cols = summaryItem?.cols
  const calculation = summaryItem?.calculation
  const summaryId =
    summaryItem.id || `summary-${summaryItem.header?.replace(/\s+/g, "-").toLowerCase()}`

  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState("0px")

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setHeight(`${contentRef.current.scrollHeight}px`)

      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 200)
    } else {
      setHeight("0px")
    }
  }, [isExpanded])

  const safeValue = (value: string | null | undefined) =>
    value === null || value === undefined || value === "" ? "" : value

  if (cardType === "lifeCover") {
    return (
      <div className="bg-white rounded-xl border-b border-t border-l border-r border-sky-500 p-4 shadow-sm ring-1 ring-sky-300">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">{summaryItem.header}</h3>

        {calculation && Object.keys(calculation).length > 0 && (
          <div className="space-y-3 mb-3">
            {Object.entries(calculation).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-slate-600">{key}</span>
                <span
                  className="font-medium text-slate-800"
                  dangerouslySetInnerHTML={{ __html: safeValue(value) }}
                />
              </div>
            ))}
          </div>
        )}

        {summaryItem.reason && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-lg font-semibold text-slate-800">
              Total Recommended Cover:
            </span>
            <span
              className="text-base text-xl font-bold text-sky-600"
              dangerouslySetInnerHTML={{ __html: extractTotalCover(summaryItem.reason) }}
            />
          </div>
        )}

        <div className="-mx-4 border-t border-gray-200 mt-2 mb-1" />

        {summaryItem.text_area_value && (
          <div>
            <div className="flex justify-end">
              <button
                onClick={() => onToggle(summaryId)}
                className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                <span className="text-[1.05rem] font-medium tracking-tight">Show calculation</span>
                <FontAwesomeIcon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                  className={`w-3 h-3 transition-transform duration-500 ${
                    isExpanded ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
            </div>

            <div
              style={{ height }}
              className="transition-all duration-[1500ms] ease-in-out overflow-hidden"
            >
              <div ref={contentRef} className="pt-3">
                <div className="text-sm text-slate-700 whitespace-pre-line font-mono bg-gray-50 p-3 rounded border">
                  {safeValue(summaryItem.text_area_value)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-b border-t border-l border-r border-sky-500 p-4 shadow-sm ring-1 ring-sky-300">
      <h4 className="text-lg font-semibold text-slate-800 mb-3">{summaryItem.header}</h4>

      {cols && Object.keys(cols).length > 0 && (
        <div className="grid grid-cols-3 gap-6 mb-3">
          {Object.entries(cols).map(([key, value]) => (
            <div key={key}>
              <p className="text-slate-500 text-md mb-1">{key}</p>
              <p className="text-slate-800 font-semibold">
                {key.toLowerCase().includes("corpus") ? (
                  <span dangerouslySetInnerHTML={{ __html: safeValue(value) }} />
                ) : (
                  safeValue(value)
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="-mx-4 border-t border-gray-200 mt-2 mb-1" />

      {summaryItem.text_area_value && (
        <div>
          <div className="flex justify-end">
            <button
              onClick={() => onToggle(summaryId)}
              className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              <span className="text-[1.05rem] font-medium tracking-tight">Show calculation</span>
              <FontAwesomeIcon
                icon={isExpanded ? faChevronUp : faChevronDown}
                className={`w-3 h-3 transition-transform duration-500 ${
                  isExpanded ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>
          </div>

          <div
            style={{ height }}
            className="transition-all duration-[1500ms] ease-in-out overflow-hidden"
          >
            <div ref={contentRef} className="pt-3">
              <div className="text-sm text-slate-700 whitespace-pre-line font-mono bg-gray-50 p-3 rounded border">
                {safeValue(summaryItem.text_area_value)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
