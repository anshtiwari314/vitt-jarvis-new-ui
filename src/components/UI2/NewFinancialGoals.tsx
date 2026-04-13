'use client';

import React from 'react';

const ICON_STROKE = 1.9;

interface StatusStyle {
  [key: string]: string;
}

interface BadgeLabel {
  [key: string]: string;
}

const STATUS_STYLE: StatusStyle = {
  active: 'border-[#54B8FF] bg-[#F4FBFF]',
  candidate: 'border-amber-200 bg-amber-50/70',
  inactive: 'border-slate-200 bg-white opacity-70',
};

const BADGE: BadgeLabel = {
  active: 'Strongly identified',
  candidate: 'Possible fit',
  inactive: 'Not identified yet',
};

interface GoalInput {
  label: string;
  value: string;
}

interface Goal {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'active' | 'candidate' | 'inactive';
  inputs: GoalInput[];
}

interface Category {
  title: string;
  goals: Goal[];
}

const categories: Category[] = [
  {
    title: 'Protection Goals',
    goals: [
      {
        name: 'Income Protection',
        description: 'Protect family income in case of uncertainty.',
        icon: ShieldIcon,
        status: 'active',
        inputs: [
          { label: 'Coverage (Years)', value: '30' },
          { label: 'Cover Amount', value: '2 Cr' },
        ],
      },
      {
        name: 'Large Life Cover',
        description: 'Assess need for higher cover based on responsibilities.',
        icon: LifeCoverIcon,
        status: 'candidate',
        inputs: [
          { label: 'Coverage (Years)', value: '30' },
          { label: 'Cover Amount', value: '' },
        ],
      },
      {
        name: 'Loan Protection',
        description: 'Ensure liabilities do not burden family.',
        icon: HomeIcon,
        status: 'inactive',
        inputs: [
          { label: 'Loan Cover', value: '' },
          { label: 'Tenure', value: '' },
        ],
      },
    ],
  },
  {
    title: 'Specific Goals',
    goals: [
      {
        name: 'Child Education',
        description: 'Create corpus for education expenses.',
        icon: GraduationCapIcon,
        status: 'active',
        inputs: [
          { label: 'Timeframe (Years)', value: '15' },
          { label: 'Corpus', value: '40 L' },
        ],
      },
      {
        name: 'Child Marriage',
        description: 'Plan for future family milestones.',
        icon: HeartIcon,
        status: 'inactive',
        inputs: [
          { label: 'Timeframe', value: '' },
          { label: 'Corpus', value: '' },
        ],
      },
    ],
  },
  {
    title: 'Savings & Wealth',
    goals: [
      {
        name: 'Wealth Creation',
        description: 'Grow money over long term.',
        icon: TrendingUpIcon,
        status: 'inactive',
        inputs: [
          { label: 'Timeframe', value: '' },
          { label: 'Investment', value: '' },
        ],
      },
      {
        name: 'Guaranteed Savings',
        description: 'Safe and predictable savings.',
        icon: PiggyBankIcon,
        status: 'inactive',
        inputs: [
          { label: 'Timeframe', value: '' },
          { label: 'Amount', value: '' },
        ],
      },
      {
        name: 'Regular Income',
        description: 'Build a future income stream.',
        icon: WalletIcon,
        status: 'candidate',
        inputs: [
          { label: 'Start After', value: '' },
          { label: 'Income', value: '' },
        ],
      },
    ],
  },
  {
    title: 'Retirement & Legacy',
    goals: [
      {
        name: 'Retirement Planning',
        description: 'Maintain lifestyle post retirement.',
        icon: UmbrellaIcon,
        status: 'candidate',
        inputs: [
          { label: 'Timeframe (Years)', value: '20' },
          { label: 'Corpus', value: '1 Cr' },
        ],
      },
      {
        name: 'Legacy Planning',
        description: 'Leave wealth for next generation.',
        icon: LandmarkIcon,
        status: 'inactive',
        inputs: [
          { label: 'Corpus', value: '' },
          { label: 'Timeframe', value: '' },
        ],
      },
    ],
  },
  {
    title: 'Other Goals',
    goals: [
      {
        name: 'Tax Saving',
        description: 'Tax-efficient investment planning.',
        icon: ReceiptIcon,
        status: 'candidate',
        inputs: [
          { label: 'Annual Investment', value: '' },
          { label: 'Section', value: '80C' },
        ],
      },
      {
        name: 'Disciplined Saving',
        description: 'Build structured saving habit.',
        icon: CalendarIcon,
        status: 'inactive',
        inputs: [
          { label: 'Monthly Saving', value: '' },
          { label: 'Timeframe', value: '' },
        ],
      },
    ],
  },
];

export default function FinancialGoalsPage() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] text-slate-800">
      <div className="min-h-screen">
        <main className="px-8 py-6">
          <div className="mb-6 text-[22px] font-semibold">
            Financial Goals{' '}
            <span className="text-slate-500 font-normal">| Client: Test</span>
          </div>

          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category.title}>
                <div className="mb-3 text-lg font-semibold">
                  {category.title}
                </div>
                <div className="space-y-4">
                  {[...category.goals]
                    .sort((a, b) => {
                      const order = { active: 0, candidate: 1, inactive: 2 };
                      return order[a.status] - order[b.status];
                    })
                    .map((goal) => (
                      <GoalRow key={goal.name} goal={goal} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

interface GoalRowProps {
  goal: Goal;
}

function GoalRow({ goal }: GoalRowProps) {
  const Icon = goal.icon;
  return (
    <div className={`rounded-[20px] border p-6 ${STATUS_STYLE[goal.status]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-[#E7F6FF] flex items-center justify-center text-[#1E9BF0]">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">{goal.name}</div>
            <div className="text-sm text-slate-500">{goal.description}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs px-3 py-1 rounded-full border bg-white">
            {BADGE[goal.status]}
          </span>
          <div
            className={`h-6 w-6 rounded-full border flex items-center justify-center ${
              goal.status === 'active'
                ? 'bg-[#2EA9FF] text-white'
                : 'bg-white'
            }`}
          >
            ✓
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {goal.inputs.map((input) => (
          <InputField key={input.label} input={input} />
        ))}
      </div>
    </div>
  );
}

interface InputFieldProps {
  input: GoalInput;
}

function InputField({ input }: InputFieldProps) {
  return (
    <div>
      <div className="text-sm text-slate-500 mb-1">{input.label}</div>
      <input
        defaultValue={input.value}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2EA9FF]"
      />
    </div>
  );
}

interface SvgIconProps {
  children: React.ReactNode;
  className?: string;
}

function SvgIcon({ children, className = 'h-5 w-5' }: SvgIconProps) {
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

function GraduationCapIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="m2 9 10-5 10 5-10 5Z" />
    </SvgIcon>
  );
}

function UmbrellaIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M3 12a9 9 0 0 1 18 0" />
    </SvgIcon>
  );
}

function LifeCoverIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6Z" />
    </SvgIcon>
  );
}

function HomeIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="m3 11 9-7 9 7" />
    </SvgIcon>
  );
}

function HeartIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M12 21s-6-4.5-9-8.5S5.5 3 12 8s9-2 9 4.5S12 21 12 21Z" />
    </SvgIcon>
  );
}

function TrendingUpIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M4 16 10 10l4 4 6-7" />
    </SvgIcon>
  );
}

function PiggyBankIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M18 11a6 6 0 0 0-6-5H8" />
    </SvgIcon>
  );
}

function WalletIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M4 8h16v8H4z" />
    </SvgIcon>
  );
}

function LandmarkIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M3 9l9-5 9 5" />
    </SvgIcon>
  );
}

function ReceiptIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M7 3h10v18l-2-1-2 1-2-1-2 1-2-1-2 1z" />
    </SvgIcon>
  );
}

function CalendarIcon(props: { className?: string }) {
  return (
    <SvgIcon {...props}>
      <path d="M3 5h18v16H3z" />
    </SvgIcon>
  );
}
