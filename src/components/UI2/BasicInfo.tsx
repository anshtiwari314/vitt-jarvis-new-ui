import React from 'react';

interface Props {
  data: {
    boxA?: {
      data?: { [key: string]: string | number };
      header?: string;
    };
    table?: {
      header?: string;
      table_header?: string[];
      table_values?: string[][];
    };
  };
}

export default function BasicInfo({ data }: Props) {
  const formatLabel = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  if (!data || !data.boxA?.data || !data.table) {
    return <div className="p-4 text-slate-500">Loading client data...</div>;
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Client Info */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">
            {data?.boxA?.header || 'Client Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {Object.entries(data?.boxA?.data || {}).map(([key, value]) => (
              <div key={key}>
                <label className="block text-slate-500 mb-1">{formatLabel(key)}</label>
                <input
                  type="text"
                  defaultValue={value}
                  className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                  readOnly
                />
              </div>
            ))}
          </div>
        </div>

        {/* Family Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {data?.table?.header || 'Family Structure'}
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  {(data.table.table_header || []).map((header, idx) => (
                    <th key={idx} className="px-4 py-2">
                      {formatLabel(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data.table.table_values || []).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b">
                    {(data?.table.table_header || []).map((_, colIndex) => (
                      <td key={colIndex} className="px-4 py-2">
                        {row[colIndex] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
