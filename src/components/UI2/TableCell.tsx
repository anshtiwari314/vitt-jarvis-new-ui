import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';

export type TableCellRaw =
  | string
  | number
  | null
  | undefined
  | {
      value: any;
      is_copyable?: boolean;
      is_editable?: boolean;
      modified_by_agent?: boolean;
    };

interface TableCellProps {
  cell: TableCellRaw;
  rowIndex: number;
  colIndex: number;
  copyCellKey: string;
  copiedCell: string | null;
  onCopy: (key: string, value: string) => void;
  onCommit?: (rowIndex: number, colIndex: number, value: string) => void;
  align?: 'left' | 'right';
}

/**
 * One editable / read-only cell shared by the BasicInfo Family table,
 * the Liabilities table, and the Assets table.
 *
 * ─────────────────────────────────────────────────────────────────────
 * LAYOUT CONTRACT — please read before changing this component
 * ─────────────────────────────────────────────────────────────────────
 *
 * The goal is that, in any given table, the copy icons all line up on a
 * single vertical line per column, AND every cell in the same row has
 * the same height even when one cell wraps onto multiple lines.
 *
 *   1. COLUMN-WISE WIDTH SYNC ── every cell in a column has the same width
 *      ────────────────────────────────────────────────────────────────
 *      This component renders its content inside a wrapper that is
 *      `w-full` (fills the parent <td> / grid cell). The PARENT is
 *      responsible for making the column itself a fixed share of the
 *      table width, so every cell in the column ends up the same width.
 *      Both call sites already do this:
 *        - BasicInfo Family table → `<table className="table-fixed">`
 *          with each `<th style={{ width: 100/N + '%' }}>`. With
 *          `table-fixed`, column widths are determined by the headers
 *          alone, so no single cell can push its column wider than its
 *          siblings.
 *        - Liabilities / Assets   → CSS grid
 *          `grid-template-columns: repeat(N, minmax(0,1fr))`. The
 *          `minmax(0, 1fr)` lower bound of 0 (instead of `auto`) is
 *          critical: it stops a long word in one row from forcing its
 *          column wider than the rest.
 *      Consequence: the copy icon (pinned to the right edge of the
 *      cell's content area) lands on the same x-coordinate in every row
 *      of a column, which is what makes the icons line up vertically.
 *
 *   2. PER-FIELD MAX WIDTH ── content area never grows past 18rem
 *      ────────────────────────────────────────────────────────────────
 *      Inside the cell wrapper we add `max-w-[18rem]`. When the column
 *      itself is narrower than 18rem the field shrinks to fit the
 *      column; when the column is wider, the field caps at 18rem and
 *      any extra column space is empty padding to the right. This is
 *      what the user means by "set a max width to each field" — beyond
 *      18rem the field is not allowed to keep growing horizontally.
 *
 *   3. ROW-WISE HEIGHT SYNC ── content that exceeds max width grows tall
 *      ────────────────────────────────────────────────────────────────
 *      Once content hits the 18rem cap (or the column width, whichever
 *      is smaller), it must wrap onto a new line instead of stretching
 *      the cell wider. Two pieces enforce this:
 *        a) Editable cells use a <textarea> with `resize-none` +
 *           `overflow-hidden` and the `autosize()` effect below grows
 *           the textarea's pixel height to match its scrollHeight, so
 *           wrapped lines remain visible without an inner scrollbar.
 *           A ResizeObserver re-runs `autosize()` when the column
 *           width changes (e.g. window resize), because a wider column
 *           may un-wrap previously wrapped text and a narrower column
 *           may wrap text that previously fit on one line.
 *        b) Non-editable cells use a <div> with the same wrap utility
 *           classes as the textarea, so the wrap point is identical.
 *
 *   4. WRAP STYLE ── word-boundary wrap, hyphenate only when forced
 *      ────────────────────────────────────────────────────────────────
 *      `break-words` alone (= `overflow-wrap: break-word`) gives us the
 *      behaviour the product wants:
 *        - "mukesh thankur pratap" in a field that fits ~10 chars wraps
 *          at the space, becoming "mukesh\nthankur\npratap" — NOT
 *          "mukesh tha\nnkur pratap". Each word stays intact whenever
 *          it can fit on a line by itself.
 *        - "physiotherapy" in the same field is itself wider than the
 *          line, so the same property allows it to break mid-word
 *          ("physiothe\nrapy") to prevent horizontal overflow.
 *      On non-editable cells we additionally apply `hyphens-auto` +
 *      `lang="en"` so that mid-word breaks render with a hyphen mark
 *      ("physio-\ntherapy"). The break point follows the en-US
 *      hyphenation dictionary, not the exact pixel-fit point — that's
 *      a hard constraint of CSS `hyphens: auto`; producing a break at
 *      an arbitrary character would require shipping a JS hyphenator.
 *      `hyphens` is intentionally NOT applied to the editable textarea:
 *      most browsers ignore it there because the underlying string
 *      doesn't contain hyphen characters, so the rendered hyphen would
 *      drift away from the user's actual content on the next keystroke.
 *      A long word inside the textarea will still wrap (via
 *      `break-words`), just without the hyphen mark.
 *      Once one cell in a row grows tall, the row also grows: <table>
 *      <tr> rows and CSS-grid rows both default to "tallest child wins"
 *      (`align-items: stretch`), so siblings stretch to match. Editable
 *      siblings inherit the row height because their <textarea> has
 *      `h-full`. Non-editable siblings inherit it because their wrapper
 *      uses `flex` + `h-full` with the text vertically centered.
 *
 * If you change anything about how the wrapper width or copy-icon
 * position works, re-verify all three properties above.
 */
export default function TableCell({
  cell,
  rowIndex,
  colIndex,
  copyCellKey,
  copiedCell,
  onCopy,
  onCommit,
  align = 'left',
}: TableCellProps) {
  const isCellObject = cell !== null && typeof cell === 'object';
  const rawValue: any = isCellObject ? (cell as any).value : cell;
  const isCopyable = isCellObject ? (cell as any).is_copyable !== false : true;
  const isEditable = isCellObject ? (cell as any).is_editable === true : false;

  const propDisplay =
    rawValue === null || rawValue === undefined || rawValue === '' ? '' : String(rawValue);

  const [localValue, setLocalValue] = useState(propDisplay);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const highlightTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ref into the editable <textarea>. The autosize effect reads
  // scrollHeight from this and writes the matching pixel height back so
  // the field renders all its content with no inner scrollbar.
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const triggerHighlight = () => {
    setIsHighlighted(true);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => setIsHighlighted(false), 10000);
  };

  // Resize the textarea so its visible height equals scrollHeight (the
  // height needed to render all wrapped lines). Reset to 'auto' first
  // so the field can also shrink when content is deleted or when a
  // wider column un-wraps previously wrapped text.
  const autosize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (propDisplay !== localValue) {
      triggerHighlight();
      setLocalValue(propDisplay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propDisplay]);

  // Re-size on every keystroke / external value change.
  useEffect(() => {
    autosize();
  }, [localValue]);

  // Re-size when the column itself changes width. Without this, a
  // window resize that narrows the column would leave the textarea at
  // its previous height, hiding the now-wrapped content behind
  // overflow:hidden. ResizeObserver fires synchronously after layout,
  // so the height update lands in the same frame.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => autosize());
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cleanText = localValue.replace(/<[^>]+>/g, '');
  const showCopy = isCopyable && cleanText !== '';
  const alignmentClass = align === 'right' ? 'justify-end text-right' : '';
  const editable = isEditable && typeof onCommit === 'function';

  const handleCommit = () => {
    if (localValue !== propDisplay && onCommit) {
      onCommit(rowIndex, colIndex, localValue);
    }
  };

  if (editable) {
    return (
      // Outer flex sits flush against the cell edges and is responsible
      // only for left/right alignment of the bounded inner field. The
      // `h-full` lets this cell stretch to the row's height when a
      // sibling cell wraps and grows taller (row-wise height sync, §3).
      <div className={`flex h-full w-full ${alignmentClass}`}>
        {/*
          Inner wrapper bounds the visible field. `w-full` makes it fill
          the column for column-wise width sync (§1); `max-w-[18rem]`
          enforces the per-field cap so the field wraps instead of
          growing wider beyond that point (§2). `relative` lets the
          copy button anchor to this box's right edge.
        */}
        <div className="relative w-full max-w-[18rem]">
          <textarea
            ref={textareaRef}
            value={localValue}
            rows={1}
            // cols={1} disables the browser's default ~20-char intrinsic
            // width so width is fully controlled by `w-full` + the
            // parent column. Without this, the textarea has a minimum
            // intrinsic width that can break column-wise sync on narrow
            // viewports.
            cols={1}
            // wrap="soft" is the default; spelled out here so the
            // word-boundary wrapping behaviour described in §4 of the
            // layout contract is explicit. `break-words` is added in
            // the className below to let words longer than the line
            // break instead of overflowing.
            wrap="soft"
            onChange={(e) => {
              setLocalValue(e.target.value);
              triggerHighlight();
            }}
            onBlur={handleCommit}
            // resize-none + overflow-hidden delegate vertical sizing
            // entirely to autosize(). pr-8 reserves space for the
            // absolutely-positioned copy button so the caret never sits
            // under the icon. `break-words` (= overflow-wrap: break-word)
            // is what gives word-boundary wrapping with a fallback
            // mid-word break for words wider than the field — see §4
            // of the layout contract above. `hyphens` is deliberately
            // NOT applied here because most browsers don't honour it on
            // <textarea>.
            className={`block w-full resize-none overflow-hidden break-words rounded-md border bg-white px-2 py-1 text-sm leading-snug outline-none transition-all duration-300 focus:ring-1 focus:ring-sky-200 ${
              showCopy ? 'pr-8' : 'pr-2'
            } ${
              isHighlighted
                ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]'
                : 'border-slate-300'
            } ${align === 'right' ? 'text-right' : ''}`}
          />
          {showCopy && (
            // Pinned to the top-right (NOT vertically centered) so the
            // icon stays anchored when the textarea grows taller from
            // wrapping. `top-0.5` keeps the button visually aligned
            // with the first line of text. This top-right anchor is
            // what makes copy icons across editable + non-editable
            // cells share the same vertical line.
            <button
              type="button"
              onClick={() => onCopy(copyCellKey, cleanText)}
              className="absolute right-1 top-0.5 rounded p-0.5 text-slate-400 hover:text-slate-600"
              title="Copy"
            >
              {copiedCell === copyCellKey ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Non-editable branch ────────────────────────────────────────────
  // Mirrors the editable branch's outer + inner wrapper structure so
  // that:
  //   - the content area takes up the full column width (§1),
  //   - it caps at the same `max-w-[18rem]` (§2),
  //   - the copy icon is anchored to the SAME top-right position as
  //     the editable branch, so a column with a mix of editable and
  //     read-only cells (e.g. the Family table's Relation column,
  //     which is plain text "Husband"/"Daughter"/"Son" while the rest
  //     of the row is editable) still has its copy icons on a single
  //     vertical line.
  // The plain text wraps via `break-words`, providing the same
  // grow-tall-not-wide behaviour as the textarea.
  return (
    <div className={`flex h-full w-full ${alignmentClass}`}>
      <div className="relative w-full max-w-[18rem]">
        {/*
          `break-words` (= overflow-wrap: break-word) gives word-boundary
          wrapping by default and only breaks a word mid-character if
          that single word is wider than the line — see §4 of the
          layout contract. `hyphens-auto` + `lang="en"` then renders a
          hyphen at those forced mid-word breaks; the break point
          follows the en-US hyphenation dictionary. We pair it with
          `[-webkit-hyphens:auto]` for older Safari that still needs
          the prefixed property name.
        */}
        <div
          lang="en"
          className={`block w-full break-words hyphens-auto [-webkit-hyphens:auto] rounded-md py-1 text-sm leading-snug transition-all duration-300 ${
            showCopy ? 'pr-8' : ''
          } ${
            isHighlighted
              ? 'bg-sky-50 px-1.5 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]'
              : ''
          } ${align === 'right' ? 'text-right' : ''}`}
        >
          <span dangerouslySetInnerHTML={{ __html: localValue }} />
        </div>
        {showCopy && (
          // Same top-right anchor as the editable branch — this is the
          // line that fixes the alignment bug shown in
          // incorrect-alignment-of-copy-in-relation.png.
          <button
            type="button"
            onClick={() => onCopy(copyCellKey, cleanText)}
            className="absolute right-1 top-0.5 rounded p-0.5 text-slate-400 hover:text-slate-600"
            title="Copy"
          >
            {copiedCell === copyCellKey ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
