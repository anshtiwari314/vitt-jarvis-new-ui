import React from "react"

interface Props {
    data: {
        monthlyOutflow: {
            monthlyExpenses: number;
            totalMonthlyEMI: number;
            creditCardDues: number;
        };
        homeLoan: {
            outstanding: number;
            emi: number;
            tenure: number;
        };
        otherLoans: {
            type: string;
            outstanding: number;
            emi: number;
        }[];
    };
    formatCurrency: (num: number) => string;
}

export default function Liabilities({ data, formatCurrency }: Props){
    //{/* <!-- Liabilities Page --> */}
    return (
        <div /* Removed id and className */>
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Monthly Outflow</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div><label className="block text-slate-500 mb-1">Approx. Monthly Expenses (INR)</label><input type="text" defaultValue={new Intl.NumberFormat('en-IN').format(data.monthlyOutflow.monthlyExpenses)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" readOnly/></div>
                    <div><label className="block text-slate-500 mb-1">Total Monthly EMI (INR)</label><input type="text" defaultValue={new Intl.NumberFormat('en-IN').format(data.monthlyOutflow.totalMonthlyEMI)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50 font-semibold" readOnly/></div>
                    <div><label className="block text-slate-500 mb-1">Credit Card Dues (if any)</label><input type="text" defaultValue={new Intl.NumberFormat('en-IN').format(data.monthlyOutflow.creditCardDues)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" readOnly/></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Home Loan Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                    <div><label className="block text-slate-500 mb-1">Outstanding Amount (INR)</label><input type="text" defaultValue={new Intl.NumberFormat('en-IN').format(data.homeLoan.outstanding)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" readOnly/></div>
                    <div><label className="block text-slate-500 mb-1">Monthly EMI (INR)</label><input type="text" defaultValue={new Intl.NumberFormat('en-IN').format(data.homeLoan.emi)} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" readOnly/></div>
                    <div><label className="block text-slate-500 mb-1">Remaining Tenure (Months)</label><input type="text" defaultValue={data.homeLoan.tenure} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" readOnly/></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Other Loans</h3>
                <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-3 font-medium text-slate-600 px-2"><span>Loan Type</span><span className="text-right">Outstanding (INR)</span><span className="text-right">Monthly EMI (INR)</span></div>
                    {data.otherLoans.map((loan, index) => (
                        <div key={index} className="grid grid-cols-3 gap-3 p-3 rounded-md bg-slate-50">
                            <span>{loan.type}</span>
                            <span className="text-right" dangerouslySetInnerHTML={{ __html: formatCurrency(loan.outstanding) }}></span>
                            <span className="text-right" dangerouslySetInnerHTML={{ __html: formatCurrency(loan.emi) }}></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
    )
}