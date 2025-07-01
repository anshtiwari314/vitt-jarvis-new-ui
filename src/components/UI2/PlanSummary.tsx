import React from 'react'

interface Props {
    data: {
        lifeCover: {
            outstandingLiabilities: number;
            familyLivingExpenses: number;
            totalRecommendedCover: number;
        };
        goalCorpus: {
            id: string;
            title: string;
            timeframe: string;
            targetYear: string;
            futureCorpus: number;
            calculationDetails: string;
        }[];
    };
    formatCurrency: (num: number) => string;
}

export default function PlanSummary({ data, formatCurrency }: Props){
    const [expandedSummary, setExpandedSummary] = React.useState<{ [key: string]: boolean }>({});

    const toggleCalculation = (summaryId: string) => {
        setExpandedSummary(prevState => ({
            ...prevState,
            [summaryId]: !prevState[summaryId],
        }));
    };
    //{/* <!-- Plan Summary Page --> */}
    return(
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Immediate Life Cover Analysis</h3>
                <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Outstanding Liabilities</span><span dangerouslySetInnerHTML={{ __html: formatCurrency(data.lifeCover.outstandingLiabilities) }}></span></div>
                    <div className="flex justify-between"><span>Family Living Expenses (10x)</span><span dangerouslySetInnerHTML={{ __html: `+ ${formatCurrency(data.lifeCover.familyLivingExpenses)}` }}></span></div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-800">Total Recommended Cover:</span>
                    <span className="text-xl font-bold text-sky-600" dangerouslySetInnerHTML={{ __html: formatCurrency(data.lifeCover.totalRecommendedCover) }}></span>
                </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 pt-4">Goal-Based Corpus Needs</h3>
            {data.goalCorpus.map(goal => (
                <div key={goal.id} className="bg-white rounded-xl shadow-sm">
                    <div className="p-6">
                        <h4 className="font-semibold text-slate-700">{goal.title}</h4>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div><label className="block text-slate-500">Timeframe</label><p className="font-semibold text-slate-800">{goal.timeframe}</p></div>
                            <div><label className="block text-slate-500">Target Year</label><p className="font-semibold text-slate-800">{goal.targetYear}</p></div>
                            <div><label className="block text-slate-500">Future Corpus</label><p className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(goal.futureCorpus) }}></p></div>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 px-6 py-2 flex justify-end">
                        <button
                            className={`toggle-calculation text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1 ${expandedSummary[goal.id] ? 'expanded' : ''}`}
                            onClick={() => toggleCalculation(goal.id)}
                        >
                            Show calculation <svg className={`w-4 h-4 chevron ${expandedSummary[goal.id] ? 'expanded' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                    </div>
                    <div className={`calculation-card bg-slate-50 px-6 border-t border-slate-200 ${expandedSummary[goal.id] ? 'expanded' : ''}`}>
                        <p className="text-sm text-slate-600 font-mono">{goal.calculationDetails}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}