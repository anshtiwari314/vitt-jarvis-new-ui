import PlanSummaryCard from "./PlanSummaryCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faChartLine } from "@fortawesome/free-solid-svg-icons"

interface PlanSummaryItem {
  id?: string
  header: string
  sub_header?: string
  cols?: { [key: string]: string }
  calculation?: { [key: string]: string }
  text_area_value?: string
  reason?: string
  type?: "lifeCover" | "goalCorpus" | "general"
}

interface PlanSummaryProps {
  data: PlanSummaryItem[]
  formatCurrency: (value: number) => string
}

export default function PlanSummary({ data, formatCurrency }: PlanSummaryProps) {
  console.log("PlanSummary data in its component:", data)

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <FontAwesomeIcon icon={faChartLine} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Plan Summary Available</h3>
          <p className="text-gray-500">Plan summary will appear here based on your financial analysis.</p>
        </div>
      </div>
    )
  }

  let goalCorpusHeadingShown = false

  return (
    <div className="space-y-6">
      {data.map((item, index) => {
        const summaryId = item.id || `summary-${index}`
        const isGoalCorpus = item.type === "goalCorpus"
        const showHeading = isGoalCorpus && !goalCorpusHeadingShown

        if (showHeading) {
          goalCorpusHeadingShown = true 
        }

        return (
          <div key={summaryId}>
            {showHeading && (
              <h2 className="text-lg font-semibold text-slate-700 mb-2">
                Goal-Based Corpus Needs
              </h2>
            )}

            <PlanSummaryCard
              summaryItem={{ ...item, id: summaryId }}
              formatCurrency={formatCurrency}
            />
          </div>
        )
      })}
    </div>
  )
}
