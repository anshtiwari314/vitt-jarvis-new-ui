import React, { useEffect, useState } from 'react';
import { PanelRightClose, Sparkles } from 'lucide-react';
import { useAppSelector } from '../../store/store';
import { useData } from '../../context/DataWrapper';
import { useDispatch } from 'react-redux';
import { updateSalesCopilotState } from '../../reducers/salesCopilotReducer';
import ReactHtmlParser from 'react-html-parser';
import { SessionMode } from './Header';

export type TranscriptMessage = {
  id: number | string;
  speaker: 'ai' | 'customer';
  text: string;
  time: string;
};

const CUE_COLOR_STYLES: Record<string, { card: string; heading: string; body: string }> = {
  blue: {
    card: 'bg-blue-50 border border-blue-200',
    heading: 'text-blue-800',
    body: 'text-blue-700',
  },
  green: {
    card: 'bg-green-50 border border-green-200',
    heading: 'text-green-800',
    body: 'text-green-700',
  },
  orange: {
    card: 'bg-orange-50 border border-orange-200',
    heading: 'text-orange-800',
    body: 'text-orange-700',
  },
};

function NotificationCardItem({ card }: { card: any }) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const { socket } = useData();
  const { roomId, name } = useAppSelector((state) => state.qpReducer);
  const dispatch = useDispatch();

  function handleOption(option: string) {
    const isYes = option.toLowerCase() === 'yes';
    const data = {
      selected_option: option,
      rendered_json: isYes ? card.new_json_raw : card.old_json_raw,
      roomid: roomId,
      jobid: 'abcde',
      agentid: '1234',
      name,
    };
    const updated_json = isYes ? card.new_json : card.old_json;
    socket?.emit('user_feedback_ins_v2', data);
    setSelectedOption(option);
    dispatch(updateSalesCopilotState(updated_json));
  }

  return (
    <div className="cue-card notification-card bg-slate-50 border border-slate-300">
      <h4 className="cue-card-heading text-slate-700">
        <Sparkles className="w-4 h-4 flex-shrink-0 text-sky-500" />
        Suggested Change
      </h4>
      <div className="cue-card-body text-sm text-slate-700">
        {ReactHtmlParser(card.text || '')}
      </div>
      <div className="cue-card-actions">
        {!selectedOption &&
          card.options?.map((option: string, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleOption(option)}
              className={`px-4 py-2 text-xs font-bold text-white ${
                option.toLowerCase() === 'yes' ? 'bg-sky-600 hover:bg-sky-700' : 'bg-red-500 hover:bg-red-600'
              } rounded-lg shadow-sm transition transform hover:scale-105 active:scale-100`}
            >
              {option}
            </button>
          ))}
        {selectedOption && (
          <div
            className={`px-4 py-2 text-xs font-bold text-white ${
              selectedOption.toLowerCase() === 'yes' ? 'bg-sky-700' : 'bg-red-600'
            } rounded-lg shadow-sm`}
          >
            Selection: {selectedOption}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationPanelProps {
  collapsed: boolean;
  onToggle: () => void;
  messages?: TranscriptMessage[];
  sessionMode?: SessionMode;
}

export default function ConversationPanel({
  collapsed,
  onToggle,
  messages = [],
  sessionMode = 'assist',
}: ConversationPanelProps) {
  const cues = useAppSelector(
    (state) => state.salesCopilotReducer.salesData.cues
  );
  const showTranscriptTab = sessionMode === 'direct';
  const [activeTab, setActiveTab] = useState<'cues' | 'transcript'>('cues');

  useEffect(() => {
    if (!showTranscriptTab && activeTab === 'transcript') {
      setActiveTab('cues');
    }
  }, [showTranscriptTab, activeTab]);

  return (
    <>
      {!collapsed && (
        <button
          className="conversation-scrim"
          onClick={onToggle}
          aria-label="Close conversation history"
        />
      )}

      <aside
        className={`prompt-panel conversation-panel ${
          collapsed ? 'collapsed' : ''
        }`}
      >
        {collapsed && (
          <button
            className="panel-toggle"
            onClick={onToggle}
            aria-label="Open conversation history"
            title="Open conversation history"
          >
            <PanelRightClose size={20} />
          </button>
        )}

        {!collapsed && (
          <>
            <header className="conversation-header">
              <div className="conversation-header-row">
                <div className="conversation-header-copy">
                  <h2>Session Insights</h2>
                  <span>
                    <i /> Live assist active
                  </span>
                </div>
                <div className="conversation-header-toolbar">
                  <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setActiveTab('cues')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                        activeTab === 'cues'
                          ? 'bg-white text-sky-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      AI Cues
                    </button>
                    {showTranscriptTab && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('transcript')}
                        className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                          activeTab === 'transcript'
                            ? 'bg-white text-sky-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Transcript
                      </button>
                    )}
                  </div>
                  <button
                    className="panel-toggle conversation-close"
                    onClick={onToggle}
                    aria-label="Close conversation history"
                    title="Close conversation history"
                  >
                    <PanelRightClose size={20} />
                  </button>
                </div>
              </div>
            </header>

            <div
              className={`conversation-log ${
                activeTab === 'cues'
                  ? 'conversation-log-cues'
                  : 'conversation-log-transcript'
              }`}
              aria-live="polite"
            >
              {activeTab === 'cues' ? (
                cues?.cards && cues.cards.length > 0 ? (
                  cues.cards.map((card: any, index: number) => {
                    const colorClass = (card?.color || 'blue').toLowerCase();
                    const colorStyles =
                      CUE_COLOR_STYLES[colorClass] ?? CUE_COLOR_STYLES.blue;

                    if (card.card_type === 'notification_card') {
                      return (
                        <NotificationCardItem key={card.id || index} card={card} />
                      );
                    }

                    return (
                      <div
                        key={index}
                        className={`cue-card ${colorStyles.card}`}
                      >
                        <h4
                          className={`cue-card-heading ${colorStyles.heading}`}
                        >
                          <Sparkles className="w-4 h-4 mr-2 flex-shrink-0" />
                          {card?.header}
                        </h4>
                        <ul className={`cue-card-list ${colorStyles.body}`}>
                          {card.data?.map((item: any, subIndex: number) => (
                            <li key={subIndex}>
                              {ReactHtmlParser(item?.text ?? '')}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    No active AI cues logged yet.
                  </div>
                )
              ) : (
                messages.map((message) => (
                  <article
                    className={`transcript-entry ${message.speaker}`}
                    key={message.id}
                  >
                    <div className="speaker-row">
                      <span>
                        {message.speaker === 'ai' ? 'VITT AI' : 'Customer'}
                      </span>
                      <time>{message.time}</time>
                    </div>
                    <p>{message.text}</p>
                  </article>
                ))
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
