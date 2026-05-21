import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Copy, Check } from "lucide-react"
import { useData } from "../../context/DataWrapper"

type Benefit = {
  field: string
  value: string
  type?: string
  options?: string[]
  editable?: boolean
  modified_by_agent?: boolean
}

type Product = {
  id: string
  name: string
  fit?: string
  annualPremium?: string
  cover?: string
  term?: string
  payout?: string
  why?: string
  reasons?: string[]
  keyFeatures?: string[]
  benefits?: Benefit[]
  calculation?: string[]
}

type Category = {
  id: string
  category?: string
  title?: string
  subtitle?: string
  summary?: Record<string, string>
  products: Product[]
}

const fitTone: Record<string, string> = {
  "Best fit": "bg-[#EEF8FF] text-[#1689DA] border-[#B8E3FF]",
  "Strong alternate": "bg-amber-50 text-amber-700 border-amber-200",
  "Budget option": "bg-slate-50 text-slate-700 border-slate-200",
  "Safer alternate": "bg-emerald-50 text-emerald-700 border-emerald-200",
}

function toLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
}

interface Props {
  category: Category | undefined | null
}

export default function RecommendationCategoryPage({ category }: Props) {
  if (!category || !category.products || category.products.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 mb-2">No recommendations</h2>
        <p className="text-sm text-slate-500">This category has no products yet.</p>
      </div>
    )
  }

  const [selectedId, setSelectedId] = useState<string>(category.products[0].id)
  const [showCalc, setShowCalc] = useState<boolean>(false)
  const [copiedCalc, setCopiedCalc] = useState(false)

  useEffect(() => {
    setSelectedId(category.products[0].id)
    setShowCalc(false)
  }, [category.id])

  const selected = useMemo(
    () => category.products.find((p) => p.id === selectedId) || category.products[0],
    [category.products, selectedId]
  )
  const copyCalculation = () => {
    const content = (selected.calculation ?? []).join("\n")
    if (!content) return
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content).catch(console.error)
    } else {
      const ta = document.createElement("textarea")
      ta.value = content
      ta.style.position = "fixed"
      ta.style.left = "-999999px"
      ta.style.top = "-999999px"
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      try {
        document.execCommand("copy")
      } catch (err) {
        console.error("Fallback copy failed", err)
      }
      ta.remove()
    }
    setCopiedCalc(true)
    setTimeout(() => setCopiedCalc(false), 1200)
  }

  return (
    <div className="text-slate-800">
      <section className="rounded-[24px] border border-[#54B8FF] bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-slate-200 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-[18px] font-semibold text-slate-800">
                  {category.title || category.category}
                </h2>
              </div>
              {category.subtitle && (
                <p className="mt-2 text-sm text-slate-500">{category.subtitle}</p>
              )}
            </div>
            {category.summary && (
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3 lg:text-right">
                {Object.entries(category.summary).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-slate-500">{toLabel(key)}</div>
                    <div className="mt-1 font-semibold text-slate-800">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product comparison table */}
        <div className="px-4 py-5 sm:px-6">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm font-semibold text-slate-700">Compare top product options</div>
            <div className="text-xs text-slate-500">Select one primary option for this need</div>
          </div>

          {/* Desktop table */}
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
                {category.products.map((product) => {
                  const isSelected = selected.id === product.id
                  return (
                    <tr
                      key={product.id}
                      className={isSelected ? "bg-[#F7FBFF]" : "bg-white"}
                    >
                      <td className="px-4 py-4 align-top">
                        <div className="font-semibold text-slate-800">{product.name}</div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                            fitTone[product.fit || ""] || fitTone["Strong alternate"]
                          }`}
                        >
                          {product.fit}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top font-medium text-slate-800">
                        {product.annualPremium}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-700">{product.cover}</td>
                      <td className="px-4 py-4 align-top text-slate-700">{product.term}</td>
                      <td className="px-4 py-4 align-top">
                        <button
                          onClick={() => setSelectedId(product.id)}
                          title={isSelected ? "Selected" : "Select"}
                          className={`inline-flex items-center justify-center rounded-xl border p-2 transition ${
                            isSelected
                              ? "border-[#54B8FF] bg-[#EEF8FF] text-[#1689DA]"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {category.products.map((product) => {
              const isSelected = selected.id === product.id
              return (
                <div
                  key={product.id}
                  className={`rounded-[18px] border p-4 ${
                    isSelected ? "border-[#54B8FF] bg-[#F7FBFF]" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-800">{product.name}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                            fitTone[product.fit || ""] || fitTone["Strong alternate"]
                          }`}
                        >
                          {product.fit}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedId(product.id)}
                      title={isSelected ? "Selected" : "Select"}
                      className={`inline-flex items-center justify-center rounded-xl border p-2 transition ${
                        isSelected
                          ? "border-[#54B8FF] bg-[#EEF8FF] text-[#1689DA]"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <MiniMetric label="Annual Premium" value={product.annualPremium} />
                    <MiniMetric label="Cover / Benefit" value={product.cover} />
                    <MiniMetric label="Term" value={product.term} />
                    <MiniMetric label="Payout" value={product.payout} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Selected option details */}
        <div className="border-t border-slate-200 px-4 py-5 sm:px-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-700">Selected option details</div>
              <div className="mt-1 text-xs text-slate-500">
                Review the selected product, edit values if needed, and use the reasons below to
                support advisor discussion.
              </div>
            </div>
            <div className="rounded-full border border-[#B8E3FF] bg-[#EEF8FF] px-3 py-1 text-xs font-medium text-[#1689DA]">
              Primary option for this need
            </div>
          </div>

          <div className="rounded-[20px] border border-[#CBEAFF] bg-[#F9FCFF] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[18px] font-semibold text-slate-800">{selected.name}</div>
                {selected.why && (
                  <p className="mt-2 text-sm leading-6 text-slate-500">{selected.why}</p>
                )}
              </div>
              <span
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                  fitTone[selected.fit || ""] || fitTone["Strong alternate"]
                }`}
              >
                {selected.fit}
              </span>
            </div>

            {/* Benefits */}
            {selected.benefits && selected.benefits.length > 0 && (
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {selected.benefits.map((b, idx) => (
                  <BenefitCell key={`${b.field}-${idx}`} benefit={b} />
                ))}
              </div>
            )}

            {/* Key features + reasons */}
            <div className="mt-5 flex flex-col gap-5">
              {selected.keyFeatures && selected.keyFeatures.length > 0 && (
                <div className="w-full rounded-[16px] border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-700">Key Advantages</div>
                  <div className="space-y-2">
                    {selected.keyFeatures.map((feature) => (
                      <div key={feature} className="flex gap-2 text-sm text-slate-600">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#1689DA]" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected.reasons && selected.reasons.length > 0 && (
                <div className="w-full rounded-[16px] border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-700">
                    Why this product seems fit
                  </div>
                  <div className="space-y-2">
                    {selected.reasons.map((reason) => (
                      <div key={reason} className="flex gap-2 text-sm text-slate-600">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Calculation */}
            {selected.calculation && selected.calculation.length > 0 && (
              <div className="mt-5 border-t border-slate-200 pt-4">
                <button
                  onClick={() => setShowCalc((p) => !p)}
                  className="flex items-center gap-2 text-sm font-medium text-[#1689DA] hover:underline"
                >
                  Show calculation
                  <ChevronDown
                    className={`h-4 w-4 transition ${showCalc ? "rotate-180" : ""}`}
                  />
                </button>
                {showCalc && (
                  <div className="mt-4 rounded-[16px] border border-slate-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-700">Calculation steps</div>
                      <button
                        type="button"
                        onClick={copyCalculation}
                        className="rounded p-1 text-slate-400 hover:text-slate-600"
                        title="Copy"
                      >
                        {copiedCalc ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      {selected.calculation.map((line) => (
                        <div key={line} className="flex gap-2">
                          <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                          <span>{line}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function BenefitCell({ benefit }: { benefit: Benefit }) {
  const { updateField } = useData()
  const [local, setLocal] = useState<string>(benefit.value ?? "")
  const [copied, setCopied] = useState(false)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const triggerHighlight = () => {
    setIsHighlighted(true)
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current)
    highlightTimeout.current = setTimeout(() => setIsHighlighted(false), 10000)
  }

  useEffect(() => {
    const next = benefit.value ?? ""
    if (next !== local) {
      triggerHighlight()
      setLocal(next)
    }
  }, [benefit.value])

  const editable = benefit.editable !== false

  const baseInputClass =
    "w-full min-w-0 rounded-md border p-2 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-50"
  const inputClass = `${baseInputClass} border-slate-200 bg-white transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''}`

  const wrapperClass = `rounded-[16px] border p-4 border-slate-200 bg-white`
  const handleCopy = async () => {
    const text = local ?? ""
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
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch (err) {
      console.error("copy failed", err)
    }
  }
  const commitIfChanged = (next: string) => {
    if (String(next ?? "") !== String(benefit.value ?? "")) {
      updateField(benefit.field, next)
    }
  }

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
        <div className="text-xs text-slate-500">{benefit.field}</div>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded p-1 text-slate-400 hover:text-slate-600"
          title="Copy"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
      </div>
      {editable ? (
        benefit.type === "option" ? (
          <div className="relative mt-2">
            <select
              value={local}
              onChange={(e) => {
                setLocal(e.target.value)
                triggerHighlight()
              }}
              onBlur={() => commitIfChanged(local)}
              className={`${inputClass} cursor-pointer appearance-none pr-8`}
            >
              {(benefit.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
              <ChevronDown size={14} />
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={local}
            onChange={(e) => {
              setLocal(e.target.value)
              triggerHighlight()
            }}
            onBlur={() => commitIfChanged(local)}
            className={`${inputClass} mt-2`}
          />
        )
      ) : (
        <div className="mt-2 text-[16px] font-semibold text-slate-800">{benefit.value}</div>
      )}
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-slate-800">{value}</div>
    </div>
  )
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m5 12 5 5L19 8" />
    </svg>
  )
}
