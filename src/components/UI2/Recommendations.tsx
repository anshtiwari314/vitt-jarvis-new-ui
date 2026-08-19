import RecommendationToggleCard from "./RecommendationToggleCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLightbulb } from "@fortawesome/free-solid-svg-icons"

interface RecommendationsProps {
  data: any[]
  formatCurrency: (value: number) => string
}

export default function Recommendations({ data, formatCurrency }: RecommendationsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <FontAwesomeIcon icon={faLightbulb} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Recommendations Available</h3>
          <p className="text-gray-500">Recommendations will appear here based on your financial profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((rec: any, idx: number) => {
        const realId = rec.id || `rec-${idx}`
        return (
          <RecommendationToggleCard
            key={realId}
            recommendation={rec}
            formatCurrency={formatCurrency}
          />
        )
      })}
    </div>
  )
}
