'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { toggleFinancialGoalCard, updateFinancialGoals } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ColField {
  field: string;
  value: string;
  type?: string;
  placeholder?: string;
  modified_by_agent?: boolean;
}

interface Card {
  id: string;
  header: string;
  sub_header: string;
  modified_by_agent: boolean;
  match: string;
  match_options: string[];
  cols: ColField[];
}

interface GoalSection {
  section: string;
  cards: Card[];
}

// ─── Match key helpers ───────────────────────────────────────────────────────

type MatchKey =
  | 'strongly identified'
  | 'possible fit'
  | 'not identified yet'
  | 'selected by agent'
  | 'ignored by agent';

const normaliseMatch = (raw?: string): MatchKey => {
  const s = (raw ?? '').toLowerCase().trim();
  if (s === 'strongly identified')  return 'strongly identified';
  if (s === 'selected by agent')    return 'selected by agent';
  if (s === 'ignored by agent')     return 'ignored by agent';
  if (s.startsWith('possible'))     return 'possible fit';
  return 'not identified yet';
};

const isVisibleGoalMatch = (raw?: string): boolean => {
  const key = normaliseMatch(raw);
  return key === 'strongly identified' || key === 'possible fit';
};

// ─── Style maps ──────────────────────────────────────────────────────────────
// 'selected by agent' → same look as 'strongly identified'
// 'ignored by agent'  → same look as 'not identified yet'

const CARD_BORDER: Record<MatchKey, string> = {
  'strongly identified': 'border-[#54B8FF] bg-[#F4FBFF]',
  'possible fit':        'border-amber-200 bg-amber-50/70',
  'not identified yet':  'border-slate-200 bg-white',
  'selected by agent':   'border-[#54B8FF] bg-[#F4FBFF]',
  'ignored by agent':    'border-slate-200 bg-white',
};

const BADGE_STYLE: Record<MatchKey, string> = {
  'strongly identified': 'border-blue-200 text-blue-600 bg-blue-50',
  'possible fit':        'border-amber-300 text-amber-600 bg-amber-50',
  'not identified yet':  'border-slate-200 text-slate-500 bg-white',
  'selected by agent':   'border-blue-200 text-blue-600 bg-blue-50',
  'ignored by agent':    'border-slate-200 text-slate-500 bg-white',
};

// Tick circle: filled+coloured when agent has acted on the card
const TICK_STYLE: Record<MatchKey, string> = {
  'strongly identified': 'bg-white border-slate-200 text-slate-300',
  'possible fit':        'bg-white border-amber-300 text-amber-400',
  'not identified yet':  'bg-white border-slate-200 text-slate-300',
  'selected by agent':   'bg-[#2EA9FF] border-[#2EA9FF] text-white',   // filled blue
  'ignored by agent':    'bg-slate-400 border-slate-400 text-white',    // filled grey
};


// ─── Main page ───────────────────────────────────────────────────────────────

export default function FinancialGoalsPage() {
  const dispatch     = useAppDispatch();
  const { emitModifiedData } = useData();

  const financialGoals = useAppSelector(
    (state) => state.salesCopilotReducer.salesData.financialGoals as any
  );
  const goals: GoalSection[] = financialGoals?.goals ?? [];

  const visibleGoals = goals
    .map((section, originalIndex) => ({
      ...section,
      originalIndex,
      cards: section.cards.filter((card) => isVisibleGoalMatch(card.match)),
    }))
    .filter((section) => section.cards.length > 0);

  // ── Single card highlight (visual only, no Redux) ──────────────────────
  // Tracks the one card the user has clicked on to highlight it.
  // Stored as "<sectionIndex>-<cardId>" so it spans all sections.
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);

  const makeKey = (sectionIndex: number, cardId: string) =>
    `${sectionIndex}-${cardId}`;

  const handleCardBodyClick = (sectionIndex: number, cardId: string) => {
    const key = makeKey(sectionIndex, cardId);
    // Toggle: click same card again → deselect; click new card → select it
    setHighlightedKey((prev) => (prev === key ? null : key));
  };

  // ── Tick icon click → toggle Redux match ──────────────────────────────
  const handleTickClick = (
    e: React.MouseEvent,
    sectionIndex: number,
    card: Card
  ) => {
    e.stopPropagation(); // don't bubble to card body click

    const currentMatch = normaliseMatch(card.match);
    const isCurrentlySelected = currentMatch === 'selected by agent';
    const nextMatch = isCurrentlySelected ? 'ignored by agent' : 'selected by agent';
    const nextModifiedByAgent = !isCurrentlySelected;

    const updatedFinancialGoals = {
      ...(financialGoals ?? {}),
      goals: goals.map((section, idx) => {
        if (idx !== sectionIndex) return section;
        return {
          ...section,
          cards: section.cards.map((c) =>
            c.id === card.id
              ? {
                  ...c,
                  modified_by_agent: nextModifiedByAgent,
                  match: nextMatch,
                }
              : c
          ),
        };
      }),
    };

    dispatch(
      toggleFinancialGoalCard({
        sectionIndex,
        cardId: card.id,
        modified_by_agent: nextModifiedByAgent,
        match: nextMatch,
      })
    );

    // Tick action should also push full financial goals payload to backend.
    emitModifiedData({ 'Financial Goals': updatedFinancialGoals });
  };

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

  const handleFieldBlur = (
    sectionIndex: number,
    cardId: string,
    colIndex: number,
    value: string
  ) => {
    const currentValue =
      goals?.[sectionIndex]?.cards?.find((c) => c.id === cardId)?.cols?.[colIndex]?.value ?? '';
    if (String(currentValue) === String(value ?? '')) {
      return;
    }
    const updatedFinancialGoals = {
      ...(financialGoals ?? {}),
      goals: goals.map((section, sIdx) => {
        if (sIdx !== sectionIndex) return section;
        return {
          ...section,
          cards: section.cards.map((card) => {
            if (card.id !== cardId) return card;
            return {
              ...card,
              cols: (card.cols ?? []).map((col, cIdx) =>
                cIdx === colIndex
                  ? { ...col, value, modified_by_agent: true }
                  : col
              ),
            };
          }),
        };
      }),
    };

    dispatch(updateFinancialGoals(updatedFinancialGoals));
    emitModifiedData({ 'Financial Goals': updatedFinancialGoals });
  };

  // ── Empty state ───────────────────────────────────────────────────────
  if (goals.length === 0) {
    return (
      <div className="w-full text-slate-800">
        <p className="text-sm text-slate-400">No financial goals loaded yet.</p>
      </div>
    );
  }

  if (visibleGoals.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full text-slate-800"
      onClick={() => setHighlightedKey(null)}
    >
      <div className="space-y-8">
          {visibleGoals.map((section) => {
            const sectionIndex = section.originalIndex;
            return (
              <div key={sectionIndex}>
                <div className="mb-3 text-lg font-semibold">{section.section}</div>
                <div className="space-y-4">
                  {section.cards.map((card) => {
                    const key        = makeKey(sectionIndex, card.id);
                    const highlighted = highlightedKey === key;

                    return (
                      <GoalCard
                        key={card.id}
                        card={card}
                        sectionIndex={sectionIndex}
                        highlighted={highlighted}
                        onCardBodyClick={handleCardBodyClick}
                        onTickClick={handleTickClick}
                        onCopy={handleCopy}
                        onFieldBlur={handleFieldBlur}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}


// ─── Individual goal card ────────────────────────────────────────────────────

interface GoalCardProps {
  card: Card;
  sectionIndex: number;
  highlighted: boolean;
  onCardBodyClick: (sectionIndex: number, cardId: string) => void;
  onTickClick: (e: React.MouseEvent, sectionIndex: number, card: Card) => void;
  onCopy: (v: string) => void;
  onFieldBlur: (
    sectionIndex: number,
    cardId: string,
    colIndex: number,
    value: string
  ) => void;
}

function GoalCard({
  card,
  sectionIndex,
  highlighted,
  onCardBodyClick,
  onTickClick,
  onCopy,
  onFieldBlur,
}: GoalCardProps) {
  const matchKey = normaliseMatch(card.match);

  return (
    <div
      className={[
        'rounded-[20px] border p-4 sm:p-6 cursor-pointer transition-all duration-200',
        CARD_BORDER[matchKey],
        // Card-body highlight: a distinct inset ring when this card is selected
        highlighted ? 'ring-2 ring-offset-1 ring-blue-500 shadow-lg' : '',
      ].join(' ')}
      onClick={() => onCardBodyClick(sectionIndex, card.id)}
    >
      {/* ── Header row ───────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        {/* Left Section (Desktop) / Top 2 rows (Mobile) */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Icon and Title Container */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E7F6FF] text-[#1E9BF0]">
              <ShieldIcon className="h-5 w-5" />
            </div>
            {/* Title only here on mobile, hidden on desktop */}
            <div className="text-lg font-semibold md:hidden">{card.header}</div>
            
            {/* Desktop grouping of Title + Subtitle */}
            <div className="hidden md:flex flex-col">
              <div className="text-lg font-semibold leading-tight">{card.header}</div>
              {card.sub_header && (
                <div className="text-sm text-slate-500 mt-0.5">
                  {card.sub_header}
                </div>
              )}
            </div>
          </div>

          {/* Subtitle only here on mobile, hidden on desktop */}
          {card.sub_header && (
            <div className="text-sm text-slate-500 md:hidden">
              {card.sub_header}
            </div>
          )}
        </div>

        {/* Match badge and Tick icon */}
        <div className="flex items-center justify-between md:justify-end gap-4">
          <span
            className={`rounded-full border px-3 py-1 text-xs whitespace-nowrap ${BADGE_STYLE[matchKey]}`}
          >
            {card.match ?? 'Not identified yet'}
          </span>

          <button
            type="button"
            title={
              matchKey === 'selected by agent'
                ? 'Unmark (ignore)'
                : 'Mark as selected by agent'
            }
            className={[
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
              TICK_STYLE[matchKey],
            ].join(' ')}
            onClick={(e) => onTickClick(e, sectionIndex, card)}
          >
            ✓
          </button>
        </div>
      </div>

      {/* ── Column fields ─────────────────────────────────────────────── */}
      <div
        className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        onClick={(e) => e.stopPropagation()} // typing shouldn't toggle card highlight
      >
        {(card.cols ?? []).map((col, colIndex) => (
          <ColFieldCell
            key={colIndex}
            col={col}
            onCopy={onCopy}
            onBlur={(value) => onFieldBlur(sectionIndex, card.id, colIndex, value)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Column field inside a card ──────────────────────────────────────────────

function ColFieldCell({
  col,
  onCopy,
  onBlur,
}: {
  col: ColField;
  onCopy: (v: string) => void;
  onBlur: (v: string) => void;
}) {
  const [localValue, setLocalValue] = useState(col.value ?? '');
  const [copied, setCopied]         = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const highlightTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const triggerHighlight = () => {
    setIsHighlighted(true);
    if (highlightTimeout.current) clearTimeout(highlightTimeout.current);
    highlightTimeout.current = setTimeout(() => setIsHighlighted(false), 10000);
  };

  // Highlight when the value changes from outside (ai_suggestion_res), not on
  // local typing (where localValue already matches the incoming prop).
  useEffect(() => {
    const next = col.value ?? '';
    if (next !== localValue) {
      triggerHighlight();
      setLocalValue(next);
    }
  }, [col.value]);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(localValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const handleBlur = () => {
    if (String(localValue ?? '') !== String(col.value ?? '')) {
      onBlur(localValue);
    }
  };

  return (
    <div className="flex h-full flex-col group relative">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          {col.field}
        </div>
      </div>
      <div className="flex flex-1 min-w-0 relative">
        <input
          value={localValue}
          placeholder={col.placeholder ?? ''}
          onChange={(e) => {
            setLocalValue(e.target.value);
            triggerHighlight();
          }}
          onBlur={handleBlur}
          className={`flex-1 min-w-0 rounded-lg border px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-1 focus:ring-sky-200 border-slate-200 bg-gray-50 transition-all duration-300 ${isHighlighted ? 'border-sky-400 ring-1 ring-sky-200 shadow-[0_0_4px_rgba(56,189,248,0.2)]' : ''}`}
        />
        <button
          type="button"
          onClick={handleCopyClick}
          title="Copy"
          className="absolute z-10 right-1 p-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}

// ─── SVG icon ────────────────────────────────────────────────────────────────

const ICON_STROKE = 1.9;

function SvgIcon({
  children,
  className = 'h-5 w-5',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function ShieldIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6Z" />
    </SvgIcon>
  );
}
