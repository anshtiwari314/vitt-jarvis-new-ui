import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { useRef, useEffect, useState } from "react"
import { Copy, Check } from "lucide-react"

interface ColItem {
  heading: string
  value: string | number
}

interface PlanSummaryItem {
  id?: string
  header: string
  sub_header?: string
  cols?: ColItem[] | { [key: string]: string | null | undefined }
  calculation?: any
  text_area_value?: string | null | undefined
  reason?: string | null | undefined
  type?: "lifeCover" | "goalCorpus" | "general"
}

interface PlanSummaryCardProps {
  summaryItem: PlanSummaryItem
  formatCurrency: (value: number) => string
}

export default function PlanSummaryCard({
  summaryItem,
  formatCurrency,
}: PlanSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 🟦 Normalize cols (convert array -> object, supports both 'heading' and 'field' keys)
  const getNormalizedCols = () => {
    if (Array.isArray(summaryItem.cols)) {
      return summaryItem.cols.reduce((acc: any, item: any) => {
        const key = item.heading ?? item.field ?? String(Object.keys(acc).length)
        acc[key] = item.value
        return acc
      }, {})
    }
    return summaryItem.cols || {}
  }

  const cols = getNormalizedCols()

  // 🟦 Extract Recommended Cover (from <p> tag)
  const extractTotalCover = (reasonHtml: string | null | undefined) => {
    if (!reasonHtml) return ""
    const match = reasonHtml.match(/<p[^>]*>(.*?)<\/p>/i)
    return match ? match[1] : reasonHtml
  }

  // 🟦 Detect card type based on header
  const getCardType = () => {
    const header = summaryItem.header ? summaryItem.header.toLowerCase() : ""
    if (header.includes("life cover") || header.includes("cover analysis")) {
      return "lifeCover"
    }
    if (header.includes("goal") || header.includes("corpus") || header.includes("education")) {
      return "goalCorpus"
    }
    return "general"
  }

  const cardType = getCardType()

  const summaryId =
    summaryItem.id || `summary-${summaryItem.header?.replace(/\s+/g, "-").toLowerCase()}`

  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState("0px")

  useEffect(() => {
    if (isExpanded && contentRef.current) {
      setHeight(`${contentRef.current.scrollHeight}px`)

      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 200)
    } else {
      setHeight("0px")
    }
  }, [isExpanded])

  const safeValue = (value: any) =>
    value === null || value === undefined || value === "" ? "" : value
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const copyText = async (key: string, value: string) => {
    const text = value ?? ""
    if (!text) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const ta = document.createElement("textarea")
        ta.value = text
        ta.style.position = "fixed"
        ta.style.left = "-9999px"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        ta.remove()
      }
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1200)
    } catch (err) {
      console.error("copy failed", err)
    }
  }

  // 🟥 LIFE COVER CARD (Special Layout)
  if (cardType === "lifeCover") {
    return (
      <div className="bg-white rounded-xl border border-sky-500 p-4 shadow-sm ring-1 ring-sky-300">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">
          {summaryItem.header}
        </h3>

        {/* COLS AREA */}
        {cols && Object.keys(cols).length > 0 && (
          <div className="space-y-3 mb-3">
            {Object.entries(cols).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center gap-2">
                <span className="text-slate-600">{key}</span>
                <div className="flex items-center gap-2">
                  <span
                    className="font-medium text-slate-800"
                    dangerouslySetInnerHTML={{ __html: safeValue(value) }}
                  />
                  <button
                    type="button"
                    onClick={() => copyText(`life-col-${key}`, String(safeValue(value)).replace(/<[^>]+>/g, ""))}
                    className="rounded p-1 text-slate-400 hover:text-slate-600"
                    title="Copy"
                  >
                    {copiedKey === `life-col-${key}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TOTAL RECOMMENDED COVER */}
        {summaryItem.reason && (
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <span className="text-lg font-semibold text-slate-700">
              Total Recommended Cover:
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-base text-xl font-bold text-sky-600"
                dangerouslySetInnerHTML={{
                  __html: extractTotalCover(summaryItem.reason),
                }}
              />
              <button
                type="button"
                onClick={() => copyText("total-cover", extractTotalCover(summaryItem.reason).replace(/<[^>]+>/g, ""))}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
                title="Copy"
              >
                {copiedKey === "total-cover" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        )}

        <div className="-mx-4 border-t border-gray-200 mt-4 mb-3" />

        {/* EXPANDABLE TEXT AREA */}
        {summaryItem.text_area_value && (
          <div className="mt-2">
            <div className="flex justify-end">
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
              >
                <span className="text-[1.05rem] font-medium tracking-tight">
                  Show calculation
                </span>
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
                  <div className="mb-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => copyText("life-calc", String(safeValue(summaryItem.text_area_value)))}
                      className="rounded p-1 text-slate-400 hover:text-slate-600"
                      title="Copy"
                    >
                      {copiedKey === "life-calc" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                  {safeValue(summaryItem.text_area_value)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 🟦 OTHER CARD TYPES (Retirement / General)
  return (
    <div className="bg-white rounded-2xl border border-sky-500 p-4 shadow-sm ring-1 ring-sky-300">
      <h4 className="text-lg font-semibold text-slate-700 mb-3">
        {summaryItem.header}
      </h4>

      {cols && Object.keys(cols).length > 0 && (
        <div className="grid grid-cols-3 gap-6 mb-3">
          {Object.entries(cols).map(([key, value]) => (
            <div key={key}>
              <p className="text-slate-500 text-sm mb-1">{key}</p>
              <div className="flex items-center gap-2">
                <p className="text-slate-800 font-semibold">
                  {key.toLowerCase().includes("corpus") ? (
                    <span dangerouslySetInnerHTML={{ __html: safeValue(value) }} />
                  ) : (
                    safeValue(value)
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => copyText(`goal-col-${key}`, String(safeValue(value)).replace(/<[^>]+>/g, ""))}
                  className="rounded p-1 text-slate-400 hover:text-slate-600"
                  title="Copy"
                >
                  {copiedKey === `goal-col-${key}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="-mx-4 border-t border-gray-200 mt-4 mb-3" />

      {/* EXPANDABLE CALCULATION */}
      {summaryItem.text_area_value && (
        <div className="mt-2">
          <div className="flex justify-end">
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
            >
              <span className="text-[1.05rem] font-medium tracking-tight">
                Show calculation
              </span>
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
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => copyText("goal-calc", String(safeValue(summaryItem.text_area_value)))}
                    className="rounded p-1 text-slate-400 hover:text-slate-600"
                    title="Copy"
                  >
                    {copiedKey === "goal-calc" ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
                {safeValue(summaryItem.text_area_value)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
