import React from 'react';

interface Props {
    data: {
        clientDetails: { [key: string]: string | number };
        familyStructure: {
            name: string;
            relation: string;
            age: string;
        }[];
    }
}

export default function BasicInfo({ data }: Props){
    // Helper function to format the key into a readable label
    const formatLabel = (key: string) => {
        // Add space before capital letters and then capitalize the first letter
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
    };
    // <!-- Basic Info Page --> */}
 
     return (
        <div /* Removed id and className */>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Client Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {Object.entries(data.clientDetails).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-slate-500 mb-1">{formatLabel(key)}</label>
                                <input type="text" defaultValue={value} className="w-full p-2 border border-slate-300 rounded-md bg-slate-50" readOnly/>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">Family Structure</h3>
                    <div className="space-y-3 text-sm">
                        {data.familyStructure.map((member, index) => (
                            <div key={index} className="grid grid-cols-3 gap-3 p-2 rounded-md bg-slate-50">
                                <span>{member.name}</span>
                                <span>{member.relation}</span>
                                <span>{member.age}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}