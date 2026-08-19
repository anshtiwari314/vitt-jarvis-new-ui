import React from "react"
import ToggleableCard from "./ToggleableCard";


export default function Recommendations({ data, formatCurrency }: Props){
    const [expandedRecs, setExpandedRecs] = React.useState<{ [key: string]: boolean }>({});

    const toggleCalculation = (recId: string) => {
        setExpandedRecs(prevState => ({
            ...prevState,
            [recId]: !prevState[recId],
        }));
    };
    //{/* <!-- Recommendations Page --> */}
    return (
        <div /* Removed id and className */>
        <div className="space-y-6">
            {data.map(rec => (
                <div key={rec.id} className={`bg-white rounded-xl shadow-sm ${rec.isPrimary ? 'ring-1 ring-sky-200' : ''}`}>
                    <div className="p-6">
                        <h3 className={`text-lg font-semibold mb-2 ${rec.isPrimary ? 'text-sky-800' : 'text-slate-700'}`}>{rec.title}</h3>
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
                    </div>
                    <div className="border-t border-slate-200 px-6 py-2 flex justify-end">
                        <button
                            className={`toggle-calculation text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1 ${expandedRecs[rec.id] ? 'expanded' : ''}`}
                            onClick={() => toggleCalculation(rec.id)}
                        >
                            Show calculation <svg className={`w-4 h-4 chevron ${expandedRecs[rec.id] ? 'expanded' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                    </div>
                    <div className={`calculation-card bg-slate-50 px-6 border-t border-slate-200 ${expandedRecs[rec.id] ? 'expanded' : ''}`}>
                        <p className="text-sm text-slate-600 font-mono whitespace-pre-wrap">{rec.calculationDetails}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
    )
}