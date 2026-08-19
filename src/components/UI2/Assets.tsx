import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useData } from '../../context/DataWrapper';
import TableCell, { type TableCellRaw } from './TableCell';

// ─── Types ──────────────────────────────────────────────────────────────────

interface SubHeaderField {
  field: string;
  value: string | number | null | undefined;
  type?: string;
  modified_by_agent?: boolean;
  is_copyable?: boolean;
  is_editable?: boolean;
}

// Legacy heading shape kept for backward compatibility with the old payload format.
interface LegacyHeading {
  header: string;
  sub_header: string;
  sub_header_data: number | null | undefined;
  modified_by_agent?: boolean;
}

interface TextArea {
  text_area_header: string;
  text_area_value: string | null | undefined;
  placeholder?: string;
  modified_by_agent?: boolean;
  is_copyable?: boolean;
  is_editable?: boolean;
}

interface TextArea1 {
  text_area_headerA: string;
  text_area_valueA: string | null | undefined;
  placeholder?: string;
  modified_by_agent?: boolean;
  is_copyable?: boolean;
  is_editable?: boolean;
}

interface TextArea2 {
  text_area_headerB: string;
  text_area_valueB: string | null | undefined;
  placeholder?: string;
  modified_by_agent?: boolean;
  is_copyable?: boolean;
  is_editable?: boolean;
}

interface BoxA {
  // New format
  header?: string;
  sub_header?: SubHeaderField | string;
  // Legacy format
  heading?: LegacyHeading;
  text_area: TextArea;
}

interface BoxB {
  header: string;
  text_area_1: TextArea1;
  text_area_2: TextArea2;
}

interface TableData {
  header: string;
  table_header: string[];
  table_values: TableCellRaw[][];
}

interface Props {
  data: {
    boxA: BoxA;
    boxB: BoxB;
    table: TableData;
  };
  formatCurrency: (num: number) => string;
}

function AgentLabel({ label }: { label?: string }) {
  return (
    <div className="mb-1 flex items-center gap-1.5">
      <label className="text-slate-500 text-sm">{label}</label>
    </div>
  );
}

const safeText = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  return String(value).replace(/<[^>]+>/g, '');
};

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

function EditableTextAreaField({
  initialValue,
  placeholder,
  className,
  rows = 3,
  onCommit,
  isEditable = true,
  isCopyable = true,
}: {
  initialValue: string;
  placeholder: string;
  className: string;
  rows?: number;
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
    <div className="relative">
      <textarea
        className={`${className} transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''} ${!isEditable ? 'cursor-default opacity-70' : ''}`}
        rows={rows}
        value={localValue}
        placeholder={placeholder}
        readOnly={!isEditable}
        disabled={!isEditable}
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
    <div className="relative">
      <input
        type="text"
        className={`${className} transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''} ${!isEditable ? 'cursor-default opacity-70' : ''}`}
        value={localValue}
        placeholder={placeholder}
        readOnly={!isEditable}
        disabled={!isEditable}
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

export default function Assets({ data, formatCurrency }: Props) {
  const { updateField, updateTableCell } = useData();
  const [copiedCell, setCopiedCell] = useState<string | null>(null);

  if (!data) {
    return <div className="p-8 text-sm text-gray-400">Loading assets data…</div>;
  }

  const { boxA, boxB, table } = data;
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

  return (
    <div className="space-y-6">

      {/* ── BoxA: Income and Savings ─────────────────────────────────────── */}
      {(() => {
        // Resolve header + sub_header for both new and legacy formats.
        const boxAHeader = boxA?.header ?? boxA?.heading?.header ?? '';
        const subHeaderObj =
          boxA?.sub_header && typeof boxA.sub_header === 'object'
            ? (boxA.sub_header as SubHeaderField)
            : null;
        const subHeaderLabel = subHeaderObj
          ? subHeaderObj.field
          : (typeof boxA?.sub_header === 'string' ? boxA.sub_header : boxA?.heading?.sub_header) ?? '';
        const subHeaderValue = subHeaderObj
          ? subHeaderObj.value
          : boxA?.heading?.sub_header_data;
        const subHeaderEditable = subHeaderObj ? subHeaderObj.is_editable !== false : true;
        const subHeaderCopyable = subHeaderObj ? subHeaderObj.is_copyable !== false : true;
        const textArea = boxA?.text_area;
        const textAreaEditable = textArea?.is_editable !== false;
        const textAreaCopyable = textArea?.is_copyable !== false;

        return (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-sky-500">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">
              {boxAHeader}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">

              {/* Monthly Income */}
              <div>
                <AgentLabel label={subHeaderLabel} />
                <EditableInputField
                  initialValue={
                    typeof subHeaderValue === 'number'
                      ? subHeaderValue.toLocaleString('en-IN')
                      : safeText(subHeaderValue)
                  }
                  placeholder=""
                  className={`w-full p-2 pr-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-sky-200 border-slate-300 bg-slate-50`}
                  onCommit={(value) => updateField(subHeaderLabel, value)}
                  isEditable={subHeaderEditable}
                  isCopyable={subHeaderCopyable}
                />
              </div>

              {/* Savings text area */}
              <div className="md:col-span-2">
                <AgentLabel label={textArea?.text_area_header} />
                <EditableTextAreaField
                  initialValue={safeText(textArea?.text_area_value)}
                  placeholder={textArea?.placeholder ?? ''}
                  className={`w-full p-2 pr-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-sky-200 border-slate-300 bg-slate-50`}
                  onCommit={(value) => updateField(textArea?.text_area_header ?? '', value)}
                  isEditable={textAreaEditable}
                  isCopyable={textAreaCopyable}
                />
              </div>

            </div>
          </div>
        );
      })()}

      {/* ── BoxB: Investments and Other Assets ───────────────────────────── */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-sky-500">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">{boxB?.header}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">

          {/* Investments */}
          <div>
            <AgentLabel label={boxB?.text_area_1?.text_area_headerA} />
            <EditableTextAreaField
              initialValue={safeText(boxB?.text_area_1?.text_area_valueA)}
              placeholder={boxB?.text_area_1?.placeholder ?? ''}
              className={`w-full p-2 pr-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-sky-200 border-slate-300 bg-slate-50`}
              onCommit={(value) => updateField(boxB?.text_area_1?.text_area_headerA, value)}
              isEditable={boxB?.text_area_1?.is_editable !== false}
              isCopyable={boxB?.text_area_1?.is_copyable !== false}
            />
          </div>

          {/* Other Assets */}
          <div>
            <AgentLabel label={boxB?.text_area_2?.text_area_headerB} />
            <EditableTextAreaField
              initialValue={safeText(boxB?.text_area_2?.text_area_valueB)}
              placeholder={boxB?.text_area_2?.placeholder ?? ''}
              className={`w-full p-2 pr-9 border rounded-md focus:outline-none focus:ring-1 focus:ring-sky-200 border-slate-300 bg-slate-50`}
              onCommit={(value) => updateField(boxB?.text_area_2?.text_area_headerB, value)}
              isEditable={boxB?.text_area_2?.is_editable !== false}
              isCopyable={boxB?.text_area_2?.is_copyable !== false}
            />
          </div>

        </div>
      </div>

      {/* ── Table: Existing Life Insurance ──────────────────────────────── */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-sky-500">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">{table?.header}</h3>
        <div className="space-y-3 text-sm">
          <div className="grid gap-3 font-medium text-slate-600 px-2"
            style={{ gridTemplateColumns: `repeat(${table?.table_header?.length ?? 3}, minmax(0,1fr))` }}>
            {(table?.table_header ?? []).map((h, i) => (
              <span key={i} className={i === 0 ? '' : 'text-right'}>{h}</span>
            ))}
          </div>
          {(table?.table_values ?? []).map((row, rowIndex) => (
            <div key={rowIndex}
              // `items-start` anchors all cells in the row to the top.
              // When one cell wraps onto multiple lines (because its
              // content exceeded the per-field max-width inside
              // TableCell), the short cells stay aligned with the first
              // line instead of getting vertically centred.
              // `minmax(0,1fr)` (not `auto`) is what enforces equal
              // column widths so the copy icons line up vertically per
              // column — see the layout contract in TableCell.tsx.
              className="grid items-start gap-3 p-3 rounded-md bg-slate-50"
              style={{ gridTemplateColumns: `repeat(${table?.table_header?.length ?? 3}, minmax(0,1fr))` }}>
              {row.map((cell, colIndex) => (
                <TableCell
                  key={colIndex}
                  cell={cell}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  copyCellKey={`assets-${rowIndex}-${colIndex}`}
                  copiedCell={copiedCell}
                  onCopy={copyCell}
                  onCommit={updateTableCell}
                  align={colIndex === 0 ? 'left' : 'right'}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
