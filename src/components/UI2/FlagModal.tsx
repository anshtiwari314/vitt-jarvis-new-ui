import React, { useState } from 'react';
import { X, Flag } from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { useData } from '../../context/DataWrapper';

interface FlagModalProps {
  onClose: () => void;
}

export default function FlagModal({ onClose }: FlagModalProps) {
  const { socket } = useData();

  const currentNavigation = useAppSelector(
    (state) => state.salesCopilotReducer.navigation
  );
  const qpParams = useAppSelector((state) => state.qpReducer);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const options = [
    'System Not Responding',
    'Incorrect Data Captured',
    'Incorrect Q/A',
    'Latency is High',
    'Others',
  ];

  const handleSubmit = () => {
    if (!inputText.trim() && selectedOption !== 'Others') return;

    const comment = inputText.trim();
    const flagMessage =
      selectedOption === 'Others'
        ? comment || 'Others'
        : comment
        ? `${selectedOption}: ${comment}`
        : selectedOption;

    const agentNameObj = JSON.parse(
      localStorage.getItem('agent_name') || '{}'
    );
    const agent_name = agentNameObj?.agent_name || '';

    const payload = {
      roomid: qpParams.roomId,
      topic: currentNavigation,
      report_message: flagMessage,
      type: 'LI',
      agent_name,
    };

    socket?.emit('save_flags_data', payload);
    alert(`Flag submitted successfully: ${selectedOption}`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flag-modal-title"
    >
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <Flag size={20} />
          </div>
          <div>
            <h3 id="flag-modal-title" className="text-lg font-bold text-slate-800">
              Flag Session Issue
            </h3>
            <p className="text-xs text-slate-500">
              Report an issue with the AI during this session
            </p>
          </div>
        </div>

        {selectedOption ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-100 p-3 border border-slate-200 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {selectedOption}
              </span>
              <button
                type="button"
                onClick={() => setSelectedOption(null)}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label htmlFor="flag-comments" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Comments / Additional Details
              </label>
              <textarea
                id="flag-comments"
                placeholder="Describe what went wrong in detail…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[110px] w-full resize-none rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-slate-800"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedOption(null);
                  setInputText('');
                }}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!inputText.trim() && selectedOption !== 'Others'}
                className="flex-1 rounded-xl bg-sky-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Submit Flag
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              Select the category of the issue:
            </p>
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedOption(option)}
                className="w-full text-left rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:text-sky-700 transition"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
