import React from "react";
import ToggleableCard from "./ToggleableCard";
 
interface RecommendationsProps {
    data: any[]; // Define a more specific type if possible
    formatCurrency: (value: any) => string;
}

export default function Recommendations({ data, formatCurrency }: RecommendationsProps) {
    const [expandedRecs, setExpandedRecs] = React.useState<{ [key: string]: boolean }>({});

    const toggleCalculation = (recId: string) => {
        setExpandedRecs(prevState => ({
            ...prevState,
            [recId]: !prevState[recId],
        }));
    };

    return (
        <div className="space-y-6">
            {data.map(rec => (
                <ToggleableCard
                    key={rec.id}
                    id={rec.id}
                    title={rec.title}
                    calculationDetails={rec.calculationDetails}
                    expandedState={expandedRecs}
                    toggleFunction={toggleCalculation}
                    headerClassName={rec.isPrimary ? 'text-sky-800' : 'text-slate-700'}
                    cardClassName={rec.isPrimary ? 'ring-1 ring-sky-200' : ''}
                >
                    <p className="text-sm text-slate-600 mb-4">{rec.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        {rec.cover && <div><label className="block text-slate-500">Cover</label><p className="font-bold text-xl text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(rec.cover) }}></p></div>}
                        {rec.targetCorpus && <div><label className="block text-slate-500">Target Corpus</label><p className="font-bold text-xl text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(rec.targetCorpus) }}></p></div>}
                        {rec.term && <div><label className="block text-slate-500">Term</label><p className="font-semibold text-slate-800">{rec.term}</p></div>}
                        <div><label className="block text-slate-500">Est. Annual Premium</label><p className="font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(rec.premium) }}></p></div>
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                        <strong>Reason:</strong> {rec.reason}
                    </div>
                </ToggleableCard>
            ))}
        </div>
    );
}