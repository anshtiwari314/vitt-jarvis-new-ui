import React, { useState } from "react";

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
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(() => {
    const saved = localStorage.getItem("uploadedFiles");
    return saved ? JSON.parse(saved) : [];
  });

  const formatLabel = (key: string) =>
    key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

  if (!data || !data.boxA?.data || !data.table) {
    return <div className="p-4 text-slate-500">Loading client data...</div>;
  }

  const DROP_COL_INDEX = 2;

  const rawHeader = data.table.table_header || [];
  const tableHeader =
    rawHeader.length > DROP_COL_INDEX
      ? rawHeader.filter((_, i) => i !== 5)
      : rawHeader;

  const rawRows = data.table.table_data || [];
  const tableRows = rawRows.map((row) =>
    Array.isArray(row) && row.length > DROP_COL_INDEX
      ? row.filter((_, i) => i !== DROP_COL_INDEX)
      : row
  );

  const renderBox = (
    boxData?: { data?: { [key: string]: string | number | null | undefined }; header?: string },
    defaultHeader?: string
  ) => {
    if (!boxData?.data) return null;

    return (
      <div className="bg-white p-4 rounded-xl shadow-sm">
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

  const medicalTest = data.boxB?.data?.AnyMedicalTests || "";
  const shouldShowUpload =
    medicalTest.trim() !== "" &&
    medicalTest.trim().toLowerCase() !== "no medical test";

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(",")[1];

      socketC.emit("document_collection_health", {
        filename: file.name,
        filedata: base64Data,
      });

      const newFiles = [...uploadedFiles, file.name];
      setUploadedFiles(newFiles);
      localStorage.setItem("uploadedFiles", JSON.stringify(newFiles));

      setSuccessMsg("Document submitted successfully...!");
      setTimeout(() => setSuccessMsg(""), 3000);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Success Popup */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {successMsg}
        </div>
      )}

      {renderBox(data.boxA, "Lifestyle & Habits")}
      {renderBox(data.boxB, "Medical History")}

      {/* Upload Section */}
      {shouldShowUpload && (
        <div className="bg-white p-4 rounded-xl shadow-md">
          <p className="text-slate-700 mb-2">
            Please upload the required test documents for verification:
          </p>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="block w-full text-sm text-slate-600
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-slate-100 file:text-slate-700
              hover:file:bg-slate-200"
          />

          {/* Show already uploaded files */}
          {uploadedFiles.length > 0 && (
            <ul className="mt-3 text-sm text-slate-600 list-disc list-inside">
              {uploadedFiles.map((file, idx) => (
                <li key={idx}>{file}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Insurance & Claim History Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
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
