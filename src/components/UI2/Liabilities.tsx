import React from "react";
import { useData } from "../../context/DataWrapper";

interface Props {
  data: {
    boxA: {
      header: string;
      data: { [key: string]: string | number | null | undefined };
    };
    boxB: {
      header: string;
      data: { [key: string]: string | number | null | undefined };
    };
    table: {
      header: string;
      table_header: string[];
      table_values: (string | number | null | undefined)[][];
    };
  };
  formatCurrency: (num: number) => string;
}

export default function Liabilities({ data, formatCurrency }: Props) {

  const {updateField} = useData()

  console.log('liabilities component',data)

  const renderFormattedValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === "") return "";

    if (typeof value === "number") {
      return formatCurrency(value).replace(/<[^>]+>/g, "");
    }

    return String(value).replace(/<[^>]+>/g, "");
  };

  return (
    <div>
      <div className="space-y-6">
        {/* Monthly Outflow */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-b border-t border-l border-r border-sky-500">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {data.boxA.header}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            {Object.entries(data.boxA.data).map(([key, value]) => (
              <div key={key}>
                <label className="block text-slate-500 mb-1">{key}</label>
                <input
                  type="text"
                  defaultValue={renderFormattedValue(value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                  onChange={(e)=>updateField(key,e.target.value)}
                  //readOnly
                />
              </div>
            ))}
          </div>
        </div>

        {/* Home Loan Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-b border-t border-l border-r border-sky-500">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {data.boxB.header}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            {Object.entries(data.boxB.data).map(([key, value]) => (
              <div key={key}>
                <label className="block text-slate-500 mb-1">{key}</label>
                <input
                  type="text"
                  defaultValue={renderFormattedValue(value)}
                  className="w-full p-2 border border-slate-300 rounded-md bg-slate-50"
                  onChange={(e)=>updateField(`${data.boxB.header} ${key}`,e.target.value)}
                  //readOnly
                />
              </div>
            ))}
          </div>
        </div>

        {/* Other Loans Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border-b border-t border-l border-r border-sky-500">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {data.table.header}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-3 font-medium text-slate-600 px-2">
              {data.table.table_header.map((heading, idx) => (
                <span key={idx} className={idx === 0 ? "" : "text-right"}>
                  {heading}
                </span>
              ))}
            </div>
            {data.table.table_values.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-3 gap-3 p-3 rounded-md bg-slate-50"
              >
                {row?.map((cell, colIdx) => {
                  const cellValue =
                    cell === null || cell === undefined || cell === ""
                      ? ""
                      : typeof cell === "number" && colIdx > 0
                      ? cell
                      : String(cell);

                  return (
                    <span
                      key={colIdx}
                      className={colIdx === 0 ? "" : "text-right"}
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
