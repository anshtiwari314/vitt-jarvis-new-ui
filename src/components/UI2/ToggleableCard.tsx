import React from "react";

// --- Helper Functions and Mocks ---
// This would typically come from a shared utility file
const formatCurrency = (value) => {
    // Assuming value can be a string like "₹ 4,00,000" or a number
    // If it's already a formatted string, we return it as is.
    // If it's a number, we format it.
    if (typeof value === 'string' && value.startsWith('₹')) {
        return value;
    }
    // Basic number formatting (you'd use a more robust solution like Intl.NumberFormat)
    return `₹ ${new Intl.NumberFormat('en-IN').format(value)}`;
};

const getPriorityClass = (priority) => {
    switch (priority) {
        case 'High Priority': return 'bg-red-100 text-red-800';
        case 'Medium Priority': return 'bg-yellow-100 text-yellow-800';
        case 'Low Priority': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Helper to extract numeric value from formatted strings (for totalRecommendedCover)
const extractNumericValue = (htmlString) => {
    if (!htmlString) return '';
    // This is a basic regex. For robust parsing, consider a dedicated library.
    const match = htmlString.match(/₹\s*([\d,.]+)\s*(\(.*\))?/);
    if (match && match[1]) {
        return `₹ ${match[1].trim()}`; // Return just the formatted number
    }
    return htmlString; // Fallback
};

// --- Common Components ---

interface ToggleableCardProps {
    id: string;
    title: string;
    children: React.ReactNode;
    calculationDetails: string;
    expandedState: { [key: string]: boolean };
    toggleFunction: (id: string) => void;
    headerRightContent?: React.ReactNode;
    headerClassName?: string;
    cardClassName?: string;
    calculationDetailsMonospace?: boolean; // New prop for font-mono
}

export default function ToggleableCard({
    id,
    title,
    children,
    calculationDetails,
    expandedState,
    toggleFunction,
    headerRightContent,
    headerClassName = "text-slate-700",
    cardClassName = "",
    calculationDetailsMonospace = true, // Default to true as seen in original code
}: ToggleableCardProps) {
    const isExpanded = expandedState[id];

    return (
        <div key={id} className={`bg-white rounded-xl shadow-sm ${cardClassName}`}>
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <h3 className={`text-lg font-semibold ${headerClassName}`}>{title}</h3>
                    {headerRightContent}
                </div>
                {children}
            </div>
            <div className="border-t border-slate-200 px-6 py-2 flex justify-end">
                <button
                    className={`toggle-calculation text-sm font-medium text-sky-600 hover:text-sky-800 flex items-center gap-1 ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleFunction(id)}
                >
                    Show calculation <svg className={`w-4 h-4 chevron ${isExpanded ? 'expanded' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
            </div>
            {isExpanded && (
                <div className="calculation-card bg-slate-50 px-6 border-t border-slate-200">
                    <p className={`text-sm text-slate-600 ${calculationDetailsMonospace ? 'font-mono' : ''} whitespace-pre-wrap`}>
                        {calculationDetails}
                    </p>
                </div>
            )}
        </div>
    );
}