import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useData } from "../../context/DataWrapper";
import TableCell, { type TableCellRaw } from "./TableCell";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FieldItem {
  field: string;
  value: string | number | null | undefined;
  type?: string;
  placeholder?: string;
  modified_by_agent?: boolean;
  is_copyable?: boolean;
  is_editable?: boolean;
}

interface BoxData {
  header: string;
  data: FieldItem[];
}

interface TableData {
  header: string;
  table_header: string[];
  table_values: TableCellRaw[][];
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
  isEditable = true,
  isCopyable = true,
}: {
  initialValue: string;
  placeholder: string;
  className: string;
  onCommit: (value: string) => void;
  isEditable?: boolean;
  isCopyable?: boolean;
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
        readOnly={!isEditable}
        disabled={!isEditable}
        className={`${className} transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''} ${!isEditable ? 'cursor-default opacity-70' : ''}`}
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
      {isCopyable && <CopyButton value={localValue} />}
    </div>
  );
}

export default function Liabilities({ data, formatCurrency }: Props) {
  const { updateField, updateTableCell } = useData();
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
              isEditable={item.is_editable !== false}
              isCopyable={item.is_copyable !== false}
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
              // `items-start` anchors all cells in the row to the top.
              // When one cell wraps onto multiple lines (because its
              // content exceeded the per-field max-width inside
              // TableCell), the short cells stay aligned with the first
              // line instead of getting vertically centred.
              // `minmax(0,1fr)` (not `auto`) is what enforces equal
              // column widths so the copy icons line up vertically per
              // column — see the layout contract in TableCell.tsx.
              className="grid items-start gap-3 p-3 rounded-md bg-slate-50"
              style={{ gridTemplateColumns: `repeat(${data.table?.table_header?.length ?? 3}, minmax(0,1fr))` }}
            >
              {row?.map((cell, colIdx) => (
                <TableCell
                  key={colIdx}
                  cell={cell}
                  rowIndex={rowIndex}
                  colIndex={colIdx}
                  copyCellKey={`liab-${rowIndex}-${colIdx}`}
                  copiedCell={copiedCell}
                  onCopy={copyCell}
                  onCommit={updateTableCell}
                  align={colIdx === 0 ? 'left' : 'right'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
