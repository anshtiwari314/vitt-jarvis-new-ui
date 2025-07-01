import React from 'react'

interface Props {
    data: {
        incomeAndSavings: {
            monthlyIncome: number;
            savings: string;
        };
        investmentsAndOther: {
            investments: string;
            otherAssets: string;
        };
        existingLifeInsurance: {
            insurer: string;
            cover: number;
            premium: number;
        }[];
    };
    formatCurrency: (num: number) => string;
}

export default function Assets({ data, formatCurrency }: Props){
    //{/* <!-- Assets Page --> */}
    return (
        <div /* Removed id and className */>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Income & Savings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div><label className="block text-slate-500 mb-1">Monthly Income (INR)</label><div className="p-2 font-semibold text-slate-800" dangerouslySetInnerHTML={{ __html: formatCurrency(data.incomeAndSavings.monthlyIncome) }}></div></div>
                    <div className="md:col-span-2"><label className="block text-slate-500 mb-1">Savings (FD, PPF, NSC, etc.)</label><textarea className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" rows={3} defaultValue={data.incomeAndSavings.savings} readOnly></textarea></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Investments & Other Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div><label className="block text-slate-500 mb-1">Investments (Mutual Funds, Equity)</label><textarea className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" rows={3} defaultValue={data.investmentsAndOther.investments} readOnly></textarea></div>
                    <div><label className="block text-slate-500 mb-1">Other Assets (Gold, Land, Property)</label><textarea className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" rows={3} defaultValue={data.investmentsAndOther.otherAssets} readOnly></textarea></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Existing Life Insurance</h3>
                <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-3 font-medium text-slate-600 px-2"><span>Insurer Name</span><span className="text-right">Cover Amount (INR)</span><span className="text-right">Annual Premium (INR)</span></div>
                    {data.existingLifeInsurance.map((policy, index) => (
                        <div key={index} className="grid grid-cols-3 gap-3 p-3 rounded-md bg-slate-50">
                            <span>{policy.insurer}</span>
                            <span className="text-right" dangerouslySetInnerHTML={{ __html: formatCurrency(policy.cover) }}></span>
                            <span className="text-right" dangerouslySetInnerHTML={{ __html: formatCurrency(policy.premium) }}></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    )
}