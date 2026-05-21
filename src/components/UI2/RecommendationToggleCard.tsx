import { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { Copy, Check, ChevronDown } from "lucide-react"
import { useData } from "../../context/DataWrapper"

type ColField = {
  field: string
  value: string
  type?: string
  options?: string[]
  placeholder?: string
  modified_by_agent?: boolean
}

interface RecommendationItem {
  id?: string
  header?: string
  sub_header?: string
  title?: string
  description?: string
  cols?: ColField[] | { [key: string]: string | null | undefined }
  calculation?: { [key: string]: string | null | undefined }
  calculationDetails?: string
  text_area_value?: string
  reason?: string
}

interface Props {
  recommendation: RecommendationItem
  formatCurrency: (value: number) => string
}

const safe = (v: any) => (v === null || v === undefined ? "" : String(v))

export default function RecommendationToggleCard({ recommendation, formatCurrency }: Props) {
  void formatCurrency
  const { updateField } = useData()
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [highlighted, setHighlighted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Click outside removes highlight
  useEffect(() => {
    if (!highlighted) return
    function onDocClick(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setHighlighted(false)
      }
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [highlighted])

  const colsArray: ColField[] = Array.isArray(recommendation.cols)
    ? recommendation.cols
    : Object.entries(recommendation.cols || {}).map(([k, v]) => ({
        field: k,
        value: safe(v),
        type: "text",
        modified_by_agent: false,
      }))

  const calculation = recommendation.calculation || {}
  const calculationText = safe(recommendation.calculationDetails || recommendation.text_area_value)

  const copy = async (key: string, value: string) => {
    if (!value) return
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value)
      } else {
        const ta = document.createElement("textarea")
        ta.value = value
        ta.style.position = "fixed"
        ta.style.left = "-9999px"
        document.body.appendChild(ta)
        ta.select()
        document.execCommand("copy")
        ta.remove()
      }
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((cur) => (cur === key ? null : cur)), 1500)
    } catch (err) {
      console.error("copy failed", err)
    }
  }

  return (
    <div
      ref={cardRef}
      onClick={() => setHighlighted(true)}
      className={`bg-white rounded-2xl border p-4 shadow-sm transition-all duration-200 ${
        highlighted ? "border-sky-500 ring-2 ring-sky-300" : "border-slate-200"
      }`}
    >
      <h3 className="text-xl font-semibold text-slate-800 mb-1">
        {safe(recommendation.header || recommendation.title)}
      </h3>

      {(recommendation.sub_header || recommendation.description) && (
        <p className="text-slate-600 text-sm mb-3">
          {safe(recommendation.sub_header || recommendation.description)}
        </p>
      )}

      {colsArray.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 items-stretch mb-3">
          {colsArray.map((col, idx) => (
            <ColCell
              key={`${col.field}-${idx}`}
              col={col}
              copiedKey={copiedKey}
              onCopy={copy}
              onCommit={(v) => updateField(col.field, v)}
            />
          ))}
        </div>
      )}

      {recommendation.reason && (
        <div className="bg-slate-50 p-3 rounded mb-2 border border-slate-100">
          <span className="text-slate-700 text-sm">
            <strong>Reason:</strong> {safe(recommendation.reason)}
          </span>
        </div>
      )}

      <div className="-mx-4 border-t border-slate-200 my-3" />

      <div className="flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded((p) => !p)
          }}
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 text-sm font-medium"
        >
          <span className="text-[1.05rem] tracking-tight">Show calculation</span>
          <FontAwesomeIcon
            icon={isExpanded ? faChevronUp : faChevronDown}
            className={`w-3 h-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-500 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          {Object.keys(calculation).length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-slate-700 mb-2">Calculation Breakdown:</h5>
              <div className="space-y-2 bg-slate-50 rounded p-3 border">
                {Object.entries(calculation).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="w-40 shrink-0 text-slate-600">{key}:</span>
                    <span className="font-medium text-slate-800">{safe(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {calculationText && (
            <div className="rounded border bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">Calculation Notes</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    copy("calculation-notes", calculationText)
                  }}
                  className="rounded p-1 text-slate-400 hover:text-slate-600"
                  title="Copy"
                >
                  {copiedKey === "calculation-notes" ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-line font-mono">
                {calculationText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ColCell({
  col,
  copiedKey,
  onCopy,
  onCommit,
}: {
  col: ColField
  copiedKey: string | null
  onCopy: (key: string, value: string) => void
  onCommit: (value: string) => void
}) {
  const [local, setLocal] = useState(safe(col.value))
  const [copiedLocal, setCopiedLocal] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerHighlight = () => {
    setIsHighlighted(true)
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current)
    highlightTimeout.current = setTimeout(() => setIsHighlighted(false), 10000)
  }

  useEffect(() => {
    const next = safe(col.value)
    if (next !== local) {
      triggerHighlight()
      setLocal(next)
    }
  }, [col.value])

  const baseInputClass =
    "w-full min-w-0 flex-1 rounded-md border p-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-50"
  const inputClass = `${baseInputClass} border-gray-200 bg-gray-50 transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''}`

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCopy(col.field, local)
    setCopiedLocal(true)
    setTimeout(() => setCopiedLocal(false), 1500)
  }
  const handleCommit = (next: string) => {
    if (String(next ?? "") !== String(col.value ?? "")) {
      onCommit(next)
    }
  }
  void copiedKey

  return (
    <div className="flex h-full min-w-0 flex-col gap-1" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <label className="truncate text-sm text-slate-500">{col.field}</label>
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 group">
        {col.type === "text-area" ? (
          <textarea
            value={local}
            rows={4}
            placeholder={col.placeholder ?? ""}
            onChange={(e) => {
              setLocal(e.target.value)
              triggerHighlight()
            }}
            onBlur={() => handleCommit(local)}
            className={`${inputClass} pr-9 min-h-[100px] resize-none`}
          />
        ) : col.type === "option" ? (
          <div className="relative flex-1 min-w-0">
            <select
              value={local}
              onChange={(e) => {
                setLocal(e.target.value)
                triggerHighlight()
              }}
              onBlur={() => handleCommit(local)}
              className={`${inputClass} cursor-pointer appearance-none pr-9`}
            >
              {(col.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2EA9FF]">
              <ChevronDown size={14} />
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={local}
            placeholder={col.placeholder ?? ""}
            onChange={(e) => {
              setLocal(e.target.value)
              triggerHighlight()
            }}
            onBlur={() => handleCommit(local)}
            className={`${inputClass} pr-9`}
          />
        )}

        {col.type !== "option" && (
          <button
            type="button"
            onClick={handleCopyClick}
            title="Copy"
            className={`absolute z-10 right-1 p-2 text-gray-400 hover:text-gray-600 transition-colors ${
              col.type === "text-area" ? "top-1" : "top-1/2 -translate-y-1/2"
            }`}
          >
            {copiedLocal ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}
