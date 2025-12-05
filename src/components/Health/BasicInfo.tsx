

interface Props {
  data: 
  {
    boxA?: {
      data?: { [key: string]: string | number | null | undefined };
      header?: string;
    };
    boxB?: {
      data?: { [key: string]: string | number | null | undefined };
      header?: string;
    };
    boxC?: {
      data?: { [key: string]: string | number | null | undefined };
      header?: string;
    };
    table?:{
      header?: string;
      table_header?: string[];
      table_data?: (string | number | null | undefined)[][];
    }
  };
}

export default function BasicInfoH({ data }: Props) {
  console.log('BasicInfoH data:', data);
  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  if (!data) {
    return <div className="p-4 text-slate-500">Loading client data...</div>;
  }

  const renderBox = (
    boxData?: { data?: { [key: string]: string | number | null | undefined }; header?: string },
    defaultHeader?: string
  ) => {
   // console.log('boxData', boxData);
    if (!boxData?.data) return null;

    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-sky-200 hover:border-sky-500 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">
          {boxData.header || defaultHeader}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(boxData.data).map(([key, value]) => (
            <div key={key}>
              <label className="block text-slate-500 mb-1">{formatLabel(key)}</label>
              <input
                type="text"
                value={value ?? ''}
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                readOnly
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderBox(data.boxA, 'Personal Information')}
      <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-sky-200 hover:border-sky-500 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          {data?.table?.header || 'Family Structure'}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                {(data?.table?.table_header || []).map((header, idx) => (
                  <th key={idx} className="px-4 py-2">
                    {formatLabel(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.table?.table_data || []).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {(data.table?.table_header || []).map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-2">
                      {row[colIndex] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {renderBox(data.boxB, 'Financial Profile')}
      {renderBox(data.boxC, 'Client Requirements')}
    </div>
  );
}
