import React from "react";
import 

interface FinancialGoalsProps {
    data: any[]; // Define a more specific type if possible
    formatCurrency: (value: any) => string;
}

export default function FinancialGoals({ data, formatCurrency }: FinancialGoalsProps) {
    const [expandedGoals, setExpandedGoals] = React.useState<{ [key: string]: boolean }>({});

    const toggleCalculation = (goalId: string) => {
        setExpandedGoals(prevState => ({
            ...prevState,
            [goalId]: !prevState[goalId],
        }));
    };

    return (
        <div className="space-y-6">
            {data.map(goal => (
                <ToggleableCard
                    key={goal.id}
                    id={goal.id}
                    title={goal.title}
                    calculationDetails={goal.calculationDetails}
                    expandedState={expandedGoals}
                    toggleFunction={toggleCalculation}
                    headerRightContent={
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${goal.priorityClass}`}>
                            {goal.priority}
                        </span>
                    }
                >
                    <p className="text-sm text-slate-600 mt-2">{goal.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div><label className="block text-slate-500">Timeframe</label><p className="font-semibold text-slate-800">{goal.timeframe}</p></div>
                        <div><label className="block text-slate-500">Required Corpus</label><p className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(goal.requiredCorpus) }}></p></div>
                    </div>
                </ToggleableCard>
            ))}
        </div>
    );
}