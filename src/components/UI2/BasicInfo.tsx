import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Target,
  Briefcase,
  Copy,
  Check,
  ChevronDown,
} from 'lucide-react';
import { useData } from '../../context/DataWrapper';
import TableCell, { type TableCellRaw } from './TableCell';

// ─── Types ─────────────────────────────────────────────────────────────────

type FieldItem = {
  field: string;
  value: string;
  type?: string;
  options?: string[];
  placeholder?: string;
  modified_by_agent?: boolean;
  is_copyable?: boolean;
  is_editable?: boolean;
};

type BoxData = {
  header: string;
  data: FieldItem[];
};

type TableData = {
  header: string;
  table_header: string[];
  table_values: TableCellRaw[][];
};

type BasicInfoData = {
  boxA?: BoxData;
  table?: TableData;
  boxB?: BoxData;
  boxC?: BoxData;
  boxD?: BoxData;
};

type BasicInfoProps = {
  data?: BasicInfoData;
};

// ─── Icon map keyed by box header ──────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactNode> = {
  'Client Info':             <Users       size={18} className="text-blue-500"   />,
  'Financial Profile':       <ShieldCheck size={18} className="text-emerald-500"/>,
  'Needs & Risk Assesment':  <Target      size={18} className="text-orange-500" />,
  'Lead & meeting context':  <Briefcase   size={18} className="text-purple-500" />,
};

function getIcon(header: string) {
  return (
    SECTION_ICONS[header] ?? <ShieldCheck size={18} className="text-slate-400" />
  );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function BasicInfo({ data }: BasicInfoProps) {
  const { updateField } = useData();

  if (!data) {
    return (
      <div className="p-8 text-sm text-gray-400">Loading client data…</div>
    );
  }

  const handleCopy = (value: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value ?? '').catch(console.error);
    } else {
      // Fallback for non-secure contexts (HTTP)
      const textArea = document.createElement("textarea");
      textArea.value = value ?? '';
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
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
  };

  const handleBlur = (fieldName: string, value: string) => {
    updateField(fieldName, value);
  };

  const BOX_ORDER = ['boxA', 'table', 'boxB', 'boxC', 'boxD'] as const;

  return (
    <div className="min-w-0 w-full font-sans text-gray-800">
      <div className="flex w-full flex-col gap-4 sm:gap-6 min-w-0">
        <div className="col-span-12 space-y-6 min-w-0">

            {BOX_ORDER.map((key) => {
              if (key === 'table') {
                const table = data.table;
                if (!table) return null;
                return (
                  <Section
                    key="table"
                    icon={<Users size={18} className="text-blue-500" />}
                    title={table.header || 'Family Structure'}
                  >
                    <FamilyTable table={table} />
                  </Section>
                );
              }

              const box = data[key] as BoxData | undefined;
              if (!box || !box.header) return null;

              return (
                <Section
                  key={key}
                  icon={getIcon(box.header)}
                  title={box.header}
                >
                  <DataFields
                    fields={box.data ?? []}
                    onCopy={handleCopy}
                    onBlur={handleBlur}
                  />
                </Section>
              );
            })}

          </div>
        </div>
    </div>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 sm:px-5 sm:py-4">
        {icon}
        <h3 className="text-lg font-semibold text-slate-700">
          {title}
        </h3>
      </div>
      <div className="min-w-0 p-4 sm:p-5">{children}</div>
    </div>
  );
}

// ─── Grid of fields ─────────────────────────────────────────────────────────

function DataFields({
  fields,
  onCopy,
  onBlur,
}: {
  fields: FieldItem[];
  onCopy: (v: string) => void;
  onBlur: (name: string, v: string) => void;
}) {
  if (!fields || fields.length === 0) {
    return <p className="text-sm text-gray-400">No data available.</p>;
  }

  return (
    // CSS grid: items in the same row automatically share the tallest height
    <div className="grid min-w-0 grid-cols-1 gap-4 items-stretch sm:grid-cols-2 md:grid-cols-3">
      {fields.map((field, i) => (
        <div
          key={i}
          className={field.type === 'text-area' ? 'col-span-1 sm:col-span-2 md:col-span-3' : ''}
        >
          <FieldCell
            field={field}
            onCopy={onCopy}
            onBlur={onBlur}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Individual field cell ───────────────────────────────────────────────────

function FieldCell({
  field,
  onCopy,
  onBlur,
}: {
  field: FieldItem;
  onCopy: (v: string) => void;
  onBlur: (name: string, v: string) => void;
}) {
  const [localValue, setLocalValue] = useState(field.value ?? '');
  const [copied, setCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const highlightTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const triggerHighlight = () => {
    setIsHighlighted(true);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => setIsHighlighted(false), 10000);
  };

  // Sync if the Redux value changes from the backend; highlight when the
  // incoming value differs from the value already shown locally (i.e. the
  // change came from ai_suggestion_res, not from the user's own typing).
  useEffect(() => {
    const next = field.value ?? '';
    if (next !== localValue) {
      triggerHighlight();
      setLocalValue(next);
    }
  }, [field.value]);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(localValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleBlur = () => {
    onBlur(field.field, localValue);
  };

  const isEditable = field.is_editable !== false;
  const isCopyable = field.is_copyable !== false;

  const baseInputClass =
    'w-full min-w-0 flex-1 rounded-md border p-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-50';

  const inputClass = `${baseInputClass} border-gray-200 bg-gray-50 transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''} ${!isEditable ? 'cursor-default opacity-70' : ''}`;

  return (
    // h-full + flex col ensures cell stretches to row height
    <div className="flex h-full min-w-0 flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <label className="truncate text-sm text-slate-500">
            {field.field}
          </label>
        </div>
      </div>

      {/* Input — flex-1 so it fills all remaining height */}
      <div className="relative flex min-w-0 flex-1 group">
        {field.type === 'text-area' ? (
          <textarea
            value={localValue}
            rows={5}
            placeholder={field.placeholder ?? ''}
            readOnly={!isEditable}
            disabled={!isEditable}
            onChange={(e) => {
              setLocalValue(e.target.value);
              triggerHighlight();
            }}
            onBlur={handleBlur}
            className={`${inputClass} pr-9 min-h-[120px] resize-none`}
          />
        ) : field.type === 'option' ? (
          <div className="relative flex-1 min-w-0">
            <select
              value={localValue}
              disabled={!isEditable}
              onChange={(e) => {
                setLocalValue(e.target.value);
                triggerHighlight();
                onBlur(field.field, e.target.value);
              }}
              className={`${inputClass} cursor-pointer appearance-none pr-9`}
            >
              {(field.options ?? []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2EA9FF]">
              <ChevronDown size={14} />
            </div>
          </div>
        ) : (
          <input
            type="text"
            value={localValue}
            placeholder={field.placeholder ?? ''}
            readOnly={!isEditable}
            disabled={!isEditable}
            onChange={(e) => {
              setLocalValue(e.target.value);
              triggerHighlight();
            }}
            onBlur={handleBlur}
            className={`${inputClass} pr-9`}
          />
        )}

        {/* Copy button */}
        {field.type !== 'option' && isCopyable && (
          <button
            type="button"
            onClick={handleCopyClick}
            title="Copy"
            className={`absolute z-10 right-1 p-2 text-gray-400 hover:text-gray-600 transition-colors ${
              field.type === 'text-area' ? 'top-1' : 'top-1/2 -translate-y-1/2'
            }`}
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Family structure table ──────────────────────────────────────────────────

function FamilyTable({ table }: { table: TableData }) {
  const { updateTableCell } = useData();
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
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
    <div>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-1 flex items-center justify-between gap-1">
            <label className="text-sm text-slate-500">
              Members
            </label>
          </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white shadow-sm">
        {/*
          `table-fixed` + an explicit `width: 100/N %` per <th> divides
          the table into N equal-width columns. This is the contract that
          TableCell relies on for column-wise width sync (see the docblock
          at the top of TableCell.tsx) — every editable field in the same
          column ends up identical width, so copy icons align vertically.
        */}
        <table className="w-full min-w-[420px] table-fixed text-left text-sm">
          <thead className="border-b border-blue-100 bg-[#f1f5f9]">
            <tr>
              {(table.table_header ?? []).map((h, i, arr) => (
                <th
                  key={i}
                  style={{ width: `${100 / arr.length}%` }}
                  className="px-4 py-2 font-semibold capitalize text-gray-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50">
            {(table.table_values ?? []).map((row, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-blue-50/30"
              >
                {row.map((cell, j) => (
                  // `align-top` anchors short-content cells to the top
                  // of the row so they line up with the first line of a
                  // wrapped neighbour. Without this, <td>'s default
                  // `vertical-align: middle` would center short cells
                  // against the tallest wrapped cell — copy icons would
                  // still align horizontally, but the rows would look
                  // ragged. (See height-sync §3 in TableCell.tsx.)
                  <td key={j} className="px-4 py-2.5 align-top text-gray-700">
                    <TableCell
                      cell={cell}
                      rowIndex={i}
                      colIndex={j}
                      copyCellKey={`basic-${i}-${j}`}
                      copiedCell={copiedCell}
                      onCopy={copyCell}
                      onCommit={updateTableCell}
                      align="left"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
