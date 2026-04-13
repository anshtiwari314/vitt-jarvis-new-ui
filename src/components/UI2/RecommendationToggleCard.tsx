import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { useData } from "../../context/DataWrapper"

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
}

export default function RecommendationToggleCard({
  recommendation,
  formatCurrency,
}: RecommendationToggleCardProps) {
  const { updateField } = useData()
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const safeValue = (val: string | null | undefined) =>
    val === null || val === undefined || val === "" ? "" : val

  const getDisplayValue = (key: string, value: string | null | undefined) => {
    const normalizedValue = safeValue(value)

    if (!normalizedValue) {
      return ""
    }

    if (
      key.toLowerCase().includes("premium") ||
      key.toLowerCase().includes("cover") ||
      key.toLowerCase().includes("corpus")
    ) {
      return normalizedValue
    }

    return normalizedValue
  }

  const cols = recommendation?.cols
  const calculation = recommendation?.calculation
  const [editableCols, setEditableCols] = useState<Record<string, string>>({})
  const [editableCalculation, setEditableCalculation] = useState<Record<string, string>>({})
  const [calculationText, setCalculationText] = useState("")

  useEffect(() => {
    const nextCols = Object.fromEntries(
      Object.entries(cols || {}).map(([key, value]) => [key, getDisplayValue(key, value)])
    )

    setEditableCols(nextCols)
  }, [cols])

  useEffect(() => {
    const nextCalculation = Object.fromEntries(
      Object.entries(calculation || {}).map(([key, value]) => [key, safeValue(value)])
    )

    setEditableCalculation(nextCalculation)
  }, [calculation])

  useEffect(() => {
    setCalculationText(
      safeValue(recommendation.calculationDetails || recommendation.text_area_value)
    )
  }, [recommendation.calculationDetails, recommendation.text_area_value])

  const copyValue = async (fieldKey: string, value: string) => {
    if (!value) {
      return
    }

    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(fieldKey)
      window.setTimeout(() => {
        setCopiedField((currentField) => (currentField === fieldKey ? null : currentField))
      }, 1500)
    } catch (error) {
      console.error("Failed to copy recommendation value", error)
    }
  }

  void formatCurrency

  return (
    <div className="bg-white rounded-2xl border-b border-t border-l border-r border-sky-500 p-3 shadow-sm ring-2 ring-sky-600">
      <h3 className="text-xl font-semibold text-slate-800 mb-2">
        {safeValue(recommendation?.header || recommendation?.title)}
      </h3>

      <p className="text-slate-600 text-sm mb-3">
        {safeValue(recommendation?.sub_header || recommendation?.description)}
      </p>

      {cols && Object.keys(cols).length > 0 && (
        <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(cols).map(([key, value]) => (
            <div key={key}>
              <label className="mb-1 block text-sm font-medium text-slate-500">
                {key}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editableCols[key] ?? getDisplayValue(key, value)}
                  onChange={(e) => {
                    const nextValue = e.target.value
                    setEditableCols((prev) => ({ ...prev, [key]: nextValue }))
                    updateField(
                      `${safeValue(recommendation?.header || recommendation?.title)} ${key}`,
                      nextValue
                    )
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2EA9FF]"
                />
                <button
                  type="button"
                  onClick={() => copyValue(key, editableCols[key] ?? getDisplayValue(key, value))}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-800"
                >
                  {copiedField === key ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ))}
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

      <div className="flex justify-end">
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
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

      <div
        className={`grid transition-[grid-template-rows,opacity,margin-top] duration-[3000ms] ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          {calculation && Object.keys(calculation).length > 0 && (
            <div className="mb-3">
              <h5 className="text-sm font-semibold text-slate-700 mb-2">
                Calculation Breakdown:
              </h5>
              <div className="space-y-2 bg-gray-50 rounded p-3 border">
                {Object.entries(calculation).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="w-40 shrink-0 text-slate-600">{key}:</span>
                    <input
                      type="text"
                      value={editableCalculation[key] ?? safeValue(value)}
                      onChange={(e) => {
                        const nextValue = e.target.value
                        setEditableCalculation((prev) => ({ ...prev, [key]: nextValue }))
                        updateField(
                          `${safeValue(recommendation?.header || recommendation?.title)} calculation ${key}`,
                          nextValue
                        )
                      }}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2EA9FF]"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyValue(key, editableCalculation[key] ?? safeValue(value))
                      }
                      className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-800"
                    >
                      {copiedField === key ? "Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded border bg-gray-50 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">Calculation Notes</span>
              <button
                type="button"
                onClick={() => copyValue("calculation-notes", calculationText)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-800"
              >
                {copiedField === "calculation-notes" ? "Copied" : "Copy"}
              </button>
            </div>
            <textarea
              value={calculationText}
              onChange={(e) => {
                const nextValue = e.target.value
                setCalculationText(nextValue)
                updateField(
                  `${safeValue(recommendation?.header || recommendation?.title)} calculation notes`,
                  nextValue
                )
              }}
              rows={4}
              className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2EA9FF]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
