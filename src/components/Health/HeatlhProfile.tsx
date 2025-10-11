import React, { useState, useEffect } from "react";

interface Props {
  data: {
    boxA?: {
      data?: { [key: string]: string | number | null | undefined };
      header?: string;
    };
    boxB?: {
      data?: { [key: string]: string | number | null | undefined };
      header?: string;
    };
    table?: {
      header?: string;
      table_header?: string[];
      table_data?: (string | number | null | undefined)[][];
    };
  };
  socketC: any;
}

export default function HealthProfile({ data, socketC }: Props) {
  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  if (!data || !data.boxA?.data || !data.table) {
    return <div className="p-4 text-slate-500">Loading client data...</div>;
  }

  const DROP_COL_INDEX = 2;

  const rawHeader = data.table.table_header || [];
  const tableHeader =
    rawHeader.length > DROP_COL_INDEX
      ? rawHeader.filter((_, i) => i !== DROP_COL_INDEX)
      : rawHeader;

  const rawRows = data.table.table_data || [];
  const tableRows = rawRows.map((row) =>
    Array.isArray(row) && row.length > DROP_COL_INDEX
      ? row.filter((_, i) => i !== DROP_COL_INDEX)
      : row
  );

  const medicalTest = data.boxB?.data?.AnyMedicalTests || "";
  const hasMedicalTest =
    medicalTest.trim() !== "" &&
    medicalTest.trim().toLowerCase() !== "no medical test";

  useEffect(() => {
    if (hasMedicalTest) {
      socketC.emit("compliance_alert", {
        alertType: "MedicalTestDetected",
        message:
          "Client has undergone medical tests, please review for compliance.",
        clientData: data.boxB?.data || {},
      });
    }
  }, [hasMedicalTest, socketC]);

  const renderBox = (
    boxData?: {
      data?: { [key: string]: string | number | null | undefined };
      header?: string;
    },
    defaultHeader?: string
  ) => {
    if (!boxData?.data) return null;

    return (
      <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-sky-200 hover:border-sky-500 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">
          {boxData.header || defaultHeader}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {Object.entries(boxData.data).map(([key, value]) => (
            <div key={key}>
              <label className="block text-slate-500 mb-1">
                {formatLabel(key)}
              </label>
              <input
                type="text"
                defaultValue={value ?? ""}
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
      {renderBox(data.boxA, "Lifestyle & Habits")}
      {renderBox(data.boxB, "Medical History")}

      <div className="bg-white p-6 rounded-xl shadow-sm border-2 border-sky-200 hover:border-sky-500 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          {data.table.header || "Insurance & Claim History"}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                {tableHeader.map((header, idx) => (
                  <th key={idx} className="px-4 py-2">
                    {formatLabel(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {tableHeader.map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-2">
                      {row[colIndex] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
