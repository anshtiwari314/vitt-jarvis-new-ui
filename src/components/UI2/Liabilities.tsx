import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useData } from "../../context/DataWrapper";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FieldItem {
  field: string;
  value: string | number | null | undefined;
  type?: string;
  placeholder?: string;
  modified_by_agent?: boolean;
}

interface BoxData {
  header: string;
  data: FieldItem[];
}

interface TableData {
  header: string;
  table_header: string[];
  table_values: (string | number | null | undefined)[][];
}

interface Props {
  data: {
    boxA: BoxData;
    boxB: BoxData;
    table: TableData;
  };
  formatCurrency: (num: number) => string;
}


function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = value ?? '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(console.error);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      textArea.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy"
      className="absolute z-10 right-1 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
    >
      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
    </button>
  );
}

function EditableInputField({
  initialValue,
  placeholder,
  className,
  onCommit,
}: {
  initialValue: string;
  placeholder: string;
  className: string;
  onCommit: (value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(initialValue);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const highlightTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const triggerHighlight = () => {
    setIsHighlighted(true);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => setIsHighlighted(false), 10000);
  };

  // Highlight when the value changes from outside (ai_suggestion_res), not on
  // local typing (where localValue already matches the incoming prop).
  React.useEffect(() => {
    if (initialValue !== localValue) {
      triggerHighlight();
      setLocalValue(initialValue);
    }
  }, [initialValue]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={localValue}
        placeholder={placeholder}
        className={`${className} transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''}`}
        onChange={(e) => {
          setLocalValue(e.target.value);
          triggerHighlight();
        }}
        onBlur={() => {
          if (localValue !== initialValue) {
            onCommit(localValue);
          }
        }}
      />
      <CopyButton value={localValue} />
    </div>
  );
}

export default function Liabilities({ data, formatCurrency }: Props) {
  const { updateField } = useData();
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  if (!data) {
    return <div className="p-8 text-sm text-gray-400">Loading liabilities data…</div>;
  }

  const renderValue = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') return '';
    if (typeof value === 'number') return formatCurrency(value).replace(/<[^>]+>/g, '');
    return String(value).replace(/<[^>]+>/g, '');
  };
  const copyCell = (key: string, value: string) => {
    const text = value ?? '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(console.error);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      textArea.remove();
    }
    setCopiedCell(key);
    setTimeout(() => setCopiedCell((prev) => (prev === key ? null : prev)), 1200);
  };

  const renderBox = (box: BoxData, gridClass = "grid-cols-1 sm:grid-cols-2") => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-sky-500">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{box.header}</h3>
      <div className={`grid gap-x-6 gap-y-4 text-sm ${gridClass}`}>
        {(box.data ?? []).map((item, i) => (
          <div key={i} className="relative">
            <div className="mb-1 flex items-center gap-1.5">
              <label className="text-slate-500">{item.field}</label>
            </div>
            <EditableInputField
              initialValue={renderValue(item.value)}
              placeholder={item.placeholder ?? ''}
              className={`w-full p-2 pr-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-sky-200 border-slate-300 bg-slate-50`}
              onCommit={(value) => updateField(item.field, value)}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Monthly Outflow */}
      {renderBox(data.boxA, "grid-cols-1 sm:grid-cols-2")}

      {/* Home Loan Details */}
      {renderBox(data.boxB, "grid-cols-1 sm:grid-cols-2")}

      {/* Other Loans Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-sky-500">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">{data.table?.header}</h3>
        <div className="space-y-3 text-sm">
          <div
            className="grid gap-3 font-medium text-slate-600 px-2"
            style={{ gridTemplateColumns: `repeat(${data.table?.table_header?.length ?? 3}, minmax(0,1fr))` }}
          >
            {(data.table?.table_header ?? []).map((h, i) => (
              <span key={i} className={i === 0 ? '' : 'text-right'}>{h}</span>
            ))}
          </div>
          {(data.table?.table_values ?? []).map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-3 p-3 rounded-md bg-slate-50"
              style={{ gridTemplateColumns: `repeat(${data.table?.table_header?.length ?? 3}, minmax(0,1fr))` }}
            >
              {row?.map((cell, colIdx) => {
                const cellValue =
                  cell === null || cell === undefined || cell === ''
                    ? ''
                    : typeof cell === 'number' && colIdx > 0
                    ? cell
                    : String(cell);
                return (
                  <div key={colIdx} className={`flex items-center gap-2 ${colIdx === 0 ? '' : 'justify-end text-right'}`}>
                    <span dangerouslySetInnerHTML={{ __html: String(cellValue) }} />
                    {String(cellValue) && (
                      <button
                        type="button"
                        onClick={() => copyCell(`liab-${rowIndex}-${colIdx}`, String(cellValue).replace(/<[^>]+>/g, ''))}
                        className="rounded p-1 text-slate-400 hover:text-slate-600"
                        title="Copy"
                      >
                        {copiedCell === `liab-${rowIndex}-${colIdx}` ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
