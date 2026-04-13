import React from 'react';
import {
  Target,
  Users,
  Briefcase,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Plus,
} from 'lucide-react';

type BasicInfoProps = {
  data?: unknown;
};

const App = (_props: BasicInfoProps) => {
  const familyMembers = [
    { name: 'Wife', relation: 'Spouse', age: '0' },
    { name: 'Child 1', relation: 'Child', age: '1' },
    { name: 'Child 2', relation: 'Child', age: '2' },
  ];

  return (
    <div className="w-full bg-gray-50 font-sans text-gray-800">
      <main className="flex min-w-0 flex-col">
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
            <div className="grid grid-cols-12 gap-4 sm:gap-6">
              <div className="col-span-12 space-y-6">
                <Section icon={<Users size={18} className="text-blue-500" />} title="Personal Profile">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InputField label="Customer Name" value="Vibhuti" />
                    <InputField label="Age" type="number" value="40" />
                    <SelectField label="Gender" options={['Male', 'Female', 'Other']} />
                    <SelectField label="Marital Status" options={['Married', 'Single', 'Divorced', 'Widowed']} />
                    <InputField label="City / Tier" value="Bangalore / Tier 1" />
                    <InputField label="Occupation" value="Software Engineer" />
                    <SelectField label="Spouse Working?" options={['Unknown', 'Yes', 'No']} />
                    <InputField label="Number of Dependents" type="number" value="3" />
                    <SelectField label="Primary Earning Member?" options={['Yes', 'No', 'Unknown']} />
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Family Structure
                      </label>
                      <button className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700">
                        <Plus size={12} /> Add Member
                      </button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-blue-100 bg-white shadow-sm">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead className="border-b border-blue-100 bg-[#f1f5f9]">
                          <tr>
                            <th className="px-4 py-2 font-semibold text-gray-600">Name</th>
                            <th className="px-4 py-2 font-semibold text-gray-600">Relation</th>
                            <th className="px-4 py-2 font-semibold text-gray-600">Age</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                          {familyMembers.map((member, i) => (
                            <tr key={i} className="transition-colors hover:bg-blue-50/30">
                              <td className="px-4 py-2.5 text-gray-700">{member.name}</td>
                              <td className="px-4 py-2.5 text-gray-700">{member.relation}</td>
                              <td className="px-4 py-2.5 text-gray-700">{member.age}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Section>

                <Section icon={<ShieldCheck size={18} className="text-emerald-500" />} title="Financial Portfolio">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <InputField label="Monthly Income" placeholder="â‚¹ Amount" />
                    <InputField label="Approx Monthly Savings" placeholder="â‚¹ Amount" />
                    <SelectField label="Existing Term Insurance?" options={['Unknown', 'Yes', 'No']} />
                    <InputField label="Life Cover Amount" placeholder="â‚¹ Sum Assured" />
                    <SelectField label="Existing Regular Invest.?" options={['Unknown', 'Yes', 'No']} />
                    <SelectField label="Existing Liabilities?" options={['No', 'Yes']} />
                    <div className="md:col-span-3">
                      <InputField
                        label="Outstanding Liability Amount (Approx)"
                        placeholder="Enter outstanding debt amount if any"
                      />
                    </div>
                  </div>
                </Section>

                <Section icon={<Target size={18} className="text-orange-500" />} title="Needs & Risk Assessment">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectField label="Risk Appetite" options={['Unknown', 'Low', 'Medium', 'High']} />
                    <SelectField
                      label="Current Investment Preference"
                      options={['Unknown', 'Guaranteed', 'Market-linked', 'Mixed']}
                    />
                    <SelectField
                      label="Near-term Major Milestone"
                      options={['Unknown', 'Child Education', 'Child Marriage', 'Retirement', 'Home Purchase', 'None']}
                    />
                    <SelectField label="Health / Underwriting Sensitivity" options={['Unknown', 'No', 'Yes']} />
                  </div>
                </Section>

                <Section icon={<Briefcase size={18} className="text-purple-500" />} title="Lead & Meeting Context">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SelectField
                      label="Meeting Source"
                      options={[
                        'Unknown',
                        'Referral',
                        'Walk-in',
                        'Existing Customer',
                        'Digital Lead',
                        'Tax Season Lead',
                        'Child Plan Lead',
                        'Retirement Lead',
                        'Savings Lead',
                      ]}
                    />
                    <InputField label="Lead Campaign Tag" placeholder="e.g. FB_Ads_Q1" />
                    <SelectField label="Past Policyholder?" options={['No', 'Yes']} />
                    <InputField label="Existing Insurer Relationship" placeholder="e.g. LIC, HDFC Life" />
                    <InputField label="Prior Product Shown" placeholder="e.g. Sanchay Plus" />
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Previous Interaction / Meeting Notes
                      </label>
                      <textarea
                        className="min-h-[100px] w-full rounded-md border border-gray-200 bg-gray-50 p-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        placeholder="Note down client preferences, meeting objectives, and specific concerns discussed..."
                      />
                    </div>
                  </div>
                </Section>
              </div>
            </div>
          </div>
        </div>

        <footer className="shrink-0 border-t border-gray-200 bg-white px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-stretch sm:justify-end">
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-100 transition-all hover:bg-blue-700 sm:w-auto sm:px-6 sm:py-2">
              Next: Goal Setting
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-gray-50 px-4 py-3 sm:px-5 sm:py-4">
      {icon}
      <h3 className="text-sm font-bold tracking-tight text-slate-700">{title}</h3>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

const InputField = ({ label, type = 'text', value = '', placeholder = '' }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</label>
    <input
      type={type}
      defaultValue={value}
      placeholder={placeholder}
      className="rounded-md border border-gray-200 bg-gray-50 p-2.5 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
    />
  </div>
);

const SelectField = ({ label, options }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</label>
    <div className="group relative">
      <select className="w-full appearance-none cursor-pointer rounded-md border border-gray-200 bg-gray-50 p-2.5 pr-10 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100">
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500">
        <ChevronDown size={16} />
      </div>
    </div>
  </div>
);

export default App;
