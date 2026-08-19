interface PlanSummaryProps {
    data: any; // Define a more specific type if possible
    formatCurrency: (value: any) => string;
}

export function PlanSummary({ data, formatCurrency }: PlanSummaryProps) {
    const [expandedSummary, setExpandedSummary] = React.useState<{ [key: string]: boolean }>({});

    const toggleCalculation = (summaryId: string) => {
        setExpandedSummary(prevState => ({
            ...prevState,
            [summaryId]: !prevState[summaryId],
        }));
    };

    return (
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
                <ToggleableCard
                    key={goal.id}
                    id={goal.id}
                    title={goal.title}
                    calculationDetails={goal.calculationDetails}
                    expandedState={expandedSummary}
                    toggleFunction={toggleCalculation}
                    calculationDetailsMonospace={false} // PlanSummary has font-mono only on calculation, not whitespace-pre-wrap
                >
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div><label className="block text-slate-500">Timeframe</label><p className="font-semibold text-slate-800">{goal.timeframe}</p></div>
                        <div><label className="block text-slate-500">Target Year</label><p className="font-semibold text-slate-800">{goal.targetYear}</p></div>
                        <div><label className="block text-slate-500">Future Corpus</label><p className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(goal.futureCorpus) }}></p></div>
                    </div>
                </ToggleableCard>
            ))}
        </div>
    );
}