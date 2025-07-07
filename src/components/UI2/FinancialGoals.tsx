import React from "react"
import FinancialToggleCard from "./FinancialToggleCard"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBullseye } from "@fortawesome/free-solid-svg-icons"

interface FinancialGoal {
  id: string
  title: string
  description: string
  priority: string
  priorityClass: string
  timeframe: string
  requiredCorpus: number
  calculationDetails: string
}

interface FinancialGoalsProps {
  data: FinancialGoal[]
  formatCurrency: (value: number) => string
}

export default function FinancialGoals({ data, formatCurrency }: FinancialGoalsProps) {
  const [expandedGoals, setExpandedGoals] = React.useState<{ [key: string]: boolean }>({})

  // console.log("the data taht is  received data", data) 

  const toggleCalculation = (goalId: string) => {
    setExpandedGoals((prevState) => ({
      ...prevState,
      [goalId]: !prevState[goalId],
    }))
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center">
          <FontAwesomeIcon icon={faBullseye} className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Financial Goals Set</h3>
          <p className="text-gray-500">Start planning your financial future by adding your first goal.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4">
      {data.map((goal) => (
        <FinancialToggleCard
          key={goal.id}
          goal={goal}
          formatCurrency={formatCurrency}
          isExpanded={expandedGoals[goal.id] || false}
          onToggle={toggleCalculation}
        />
      ))}
    </div>
  )
}
