import React from 'react';
import { useData } from '../../context/DataWrapper';

interface Props {
  data: {
    boxA: {
      header: string;
      sub_header: string;
      sub_header_data: number | null | undefined;
      text_area_header: string;
      text_area_value: string | null | undefined;
    };
    boxB: {
      header: string;
      text_area_headerA: string;
      text_area_valueA: string | null | undefined;
      text_area_headerB: string;
      text_area_valueB: string | null | undefined;
    };
    table: {
      header: string;
      table_header: string[];
      table_values: (string | number | null | undefined)[][];
    };
  };
  formatCurrency: (num: number) => string;
}

export default function Assets({ data, formatCurrency }: Props) {

  const {updateField} = useData()

  const safeText = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return '';
    return String(value).replace(/<[^>]+>/g, '');
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-b border-t border-l border-r border-sky-500">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{data.boxA.header}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <label className="block text-slate-500 mb-1">{data.boxA.sub_header}</label>
              <div
                className="p-2 font-semibold text-slate-800"
                dangerouslySetInnerHTML={{
                  __html:
                    typeof data.boxA.sub_header_data === 'number'
                      ? data.boxA.sub_header_data
                      : data.boxA.sub_header_data,
                }}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-500 mb-1">{data.boxA.text_area_header}</label>
              <textarea
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                rows={3}
                defaultValue={safeText(data.boxA.text_area_value)}
                onChange={(e)=>updateField(data.boxA.text_area_header,e.target.value)}
                // readOnly
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-b border-t border-l border-r border-sky-500">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{data.boxB.header}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <label className="block text-slate-500 mb-1">{data.boxB.text_area_headerA}</label>
              <textarea
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                rows={3}
                defaultValue={safeText(data.boxB.text_area_valueA)}
                onChange={(e)=>updateField(data.boxB.text_area_headerA,e.target.value)}
                //readOnly
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">{data.boxB.text_area_headerB}</label>
              <textarea
                className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                rows={3}
                defaultValue={safeText(data.boxB.text_area_valueB)}
                onChange={(e)=>updateField(data.boxB.text_area_headerB,e.target.value)}
                //readOnly
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border-b border-t border-l border-r border-sky-500">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{data.table.header}</h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-3 font-medium text-slate-600 px-2">
              {data.table.table_header.map((heading, i) => (
                <span key={i} className={i === 0 ? '' : 'text-right'}>
                  {heading}
                </span>
              ))}
            </div>
            {data.table.table_values.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-3 gap-3 p-3 rounded-md bg-slate-50">
                {row.map((cell, colIndex) => {
                  let cellValue = '';
                  if (typeof cell === 'number' && colIndex > 0) {
                    cellValue = cell;
                  } else if (cell !== null && cell !== undefined && cell !== '') {
                    cellValue = String(cell).replace(/<[^>]+>/g, '');
                  }
                  return (
                    <span
                      key={colIndex}
                      className={colIndex === 0 ? '' : 'text-right'}
                      dangerouslySetInnerHTML={{ __html: cellValue }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
