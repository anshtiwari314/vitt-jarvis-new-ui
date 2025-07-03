import React from "react"




export default function FinancialGoals({ data, formatCurrency }: Props){
    const [expandedGoals, setExpandedGoals] = React.useState<{ [key: string]: boolean }>({});

    const toggleCalculation = (goalId: string) => {
        setExpandedGoals(prevState => ({
            ...prevState,
            [goalId]: !prevState[goalId],
        }));
    };
    //{/* <!-- Financial Goals Page --> */}
    return (
        <div /* Removed id and className */>
        <div className="space-y-6">
            {data.map(goal => (
                <div key={goal.id} className="bg-white rounded-xl shadow-sm">
                    <div className="p-6">
                        <div className="flex justify-between items-start">
                            <h3 className="text-lg font-semibold text-slate-700">{goal.title}</h3>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${goal.priorityClass}`}>{goal.priority}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{goal.description}</p>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div><label className="block text-slate-500">Timeframe</label><p className="font-semibold text-slate-800">{goal.timeframe}</p></div>
                            <div><label className="block text-slate-500">Required Corpus</label><p className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(goal.requiredCorpus) }}></p></div>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 px-6 py-2 flex justify-end">
                        <button
                            className={`toggle-calculation text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1 ${expandedGoals[goal.id] ? 'expanded' : ''}`}
                            onClick={() => toggleCalculation(goal.id)}
                        >
                            Show calculation <svg className={`w-4 h-4 chevron ${expandedGoals[goal.id] ? 'expanded' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                    </div>
                    <div className={`calculation-card bg-slate-50 px-6 border-t border-slate-200 ${expandedGoals[goal.id] ? 'expanded' : ''}`}>
                        <p className="text-sm text-slate-600 font-mono whitespace-pre-wrap">{goal.calculationDetails}</p>
                    </div>
                </div>
            ))}
          </div>
      </div>
    )
}