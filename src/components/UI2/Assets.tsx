import React from 'react';

interface Props {
  data: {
    boxA: {
      header: string;
      sub_header: string;
      sub_header_data: number;
      text_area_header: string;
      text_area_value: string;
    };
    boxB: {
      header: string;
      text_area_headerA: string;
      text_area_valueA: string;
      text_area_headerB: string;
      text_area_valueB: string;
    };
    table: {
      header: string;
      table_header: string[];
      table_values: (string | number)[][];
    };
  };
  formatCurrency: (num: number) => string;
}

export default function Assets({ data, formatCurrency }: Props) {
  return (
    <div>
      <div className="space-y-6">
        {/* Income & Savings */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{data.boxA.header}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <label className="block text-slate-500 mb-1">{data.boxA.sub_header}</label>
              <div
                className="p-2 font-semibold text-slate-800"
                dangerouslySetInnerHTML={{ __html: formatCurrency(data.boxA.sub_header_data) }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-500 mb-1">{data.boxA.text_area_header}</label>
              <textarea
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                rows={3}
                defaultValue={data.boxA.text_area_value}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Investments & Other Assets */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{data.boxB.header}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <label className="block text-slate-500 mb-1">{data.boxB.text_area_headerA}</label>
              <textarea
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                rows={3}
                defaultValue={data.boxB.text_area_valueA}
                readOnly
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">{data.boxB.text_area_headerB}</label>
              <textarea
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                rows={3}
                defaultValue={data.boxB.text_area_valueB}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Existing Life Insurance Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{data.table.header}</h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-3 font-medium text-slate-600 px-2">
              {data.table.table_header.map((heading, i) => (
                <span
                  key={i}
                  className={i === 0 ? '' : 'text-right'}
                >
                  {heading}
                </span>
              ))}
            </div>
            {data.table.table_values.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-3 p-3 rounded-md bg-slate-50">
                {row.map((cell, colIndex) => (
                  <span
                    key={colIndex}
                    className={colIndex === 0 ? '' : 'text-right'}
                    dangerouslySetInnerHTML={{
                      __html:
                        typeof cell === 'number' && colIndex > 0
                          ? formatCurrency(cell)
                          : String(cell),
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
