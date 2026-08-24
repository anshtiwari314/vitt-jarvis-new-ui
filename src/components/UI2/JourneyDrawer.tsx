import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  UserRound,
  PieChart,
  Archive,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';

interface JourneyDrawerProps {
  open: boolean;
  onClose: () => void;
}

const REC_SUB_ICON_COLOR = '#60A5FA';

function RecSubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke={REC_SUB_ICON_COLOR}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

export default function JourneyDrawer({
  open,
  onClose,
}: JourneyDrawerProps) {
  const dispatch = useAppDispatch();
  const { socket } = useData();

  const currentNavigation = useAppSelector(
    (state) => state.salesCopilotReducer.navigation
  );
  const clientName = useAppSelector(
    (state) => state.salesCopilotReducer.clientName || state.qpReducer.name
  );
  const qpParams = useAppSelector((state) => state.qpReducer);
  const salesData = useAppSelector(
    (state) => state.salesCopilotReducer.salesData
  );

  const [recsExpanded, setRecsExpanded] = useState(true);

  const mockData = salesData.recommendations;
  const recCategories: { category: string; title: string }[] = Array.isArray(
    mockData
  )
    ? mockData.map((item: any) => ({
        category: item.header || item.title || item.category || 'Recommendation',
        title: item.header || item.title || item.category || 'Recommendation',
      }))
    : (mockData as any)?.categories?.map((c: any) => ({
        category: c.category,
        title: c.title || c.category,
      })) ?? [
        { category: 'Immediate Life Cover', title: 'Immediate Life Cover' },
        { category: 'Retirement Planning', title: 'Retirement Planning' },
      ];

  const isProfile =
    currentNavigation === 'Data Retrieval' ||
    currentNavigation === 'Client Info';
  const isSummary = currentNavigation === 'Plan Summary';
  const isRecs =
    currentNavigation === 'Recommendations' ||
    (typeof currentNavigation === 'string' &&
      currentNavigation.startsWith('Recommendations::'));

  useEffect(() => {
    if (isRecs) {
      setRecsExpanded(true);
    }
  }, [isRecs]);

  if (!open) return null;

  const emitTopicReq = (topic: string) => {
    socket?.emit('ai_suggestion_req', {
      roomid: qpParams.roomId,
      topic,
    });
  };

  const handleSelect = (navKey: string) => {
    dispatch(setNavigation(navKey));
    emitTopicReq(navKey);
    onClose();
  };

  const handleRecommendationsClick = () => {
    setRecsExpanded((prev) => !prev);
    if (!isRecs && recCategories.length > 0) {
      const firstCatKey = `Recommendations::${recCategories[0].category}`;
      dispatch(setNavigation(firstCatKey));
      emitTopicReq(firstCatKey);
    }
  };

  return (
    <>
      <button
        className="journey-scrim"
        onClick={onClose}
        aria-label="Close journey drawer"
      />
      <aside className="journey-drawer" aria-label="Client journey">
        <header>
          <div>
            <span>Client journey</span>
            <strong>{clientName || 'Client'}</strong>
          </div>
          <button
            onClick={onClose}
            aria-label="Close journey"
            className="journey-close"
          >
            <X size={20} />
          </button>
        </header>

        <nav>
          <button
            type="button"
            className={`journey-item ${isProfile ? 'active' : ''}`}
            onClick={() => handleSelect('Data Retrieval')}
          >
            <span className="journey-icon" aria-hidden="true">
              <UserRound size={18} />
            </span>
            <span className="journey-copy">
              <strong>Understanding you</strong>
              <small>Profile, family and financial picture</small>
            </span>
          </button>

          <button
            type="button"
            className={`journey-item ${isSummary ? 'active' : ''}`}
            onClick={() => handleSelect('Plan Summary')}
          >
            <span className="journey-icon" aria-hidden="true">
              <PieChart size={18} />
            </span>
            <span className="journey-copy">
              <strong>Priorities identified</strong>
              <small>Protection and retirement needs</small>
            </span>
          </button>

          <div className="journey-group">
            <button
              type="button"
              className={`journey-item journey-item-expandable ${
                isRecs ? 'active' : ''
              }`}
              onClick={handleRecommendationsClick}
            >
              <span className="journey-icon" aria-hidden="true">
                <Archive size={18} />
              </span>
              <span className="journey-copy">
                <strong>Recommendation</strong>
                <small>Suitable plans and rationale</small>
              </span>
              <ChevronRight
                size={18}
                className={`journey-chevron ${recsExpanded ? 'expanded' : ''}`}
                aria-hidden="true"
              />
            </button>

            {recsExpanded && recCategories.length > 0 && (
              <div className="journey-sublist ml-6 pl-4 border-l-2 border-slate-200 space-y-1 py-1">
                {recCategories.map((cat) => {
                  const catNavKey = `Recommendations::${cat.category}`;
                  const isCatActive = currentNavigation === catNavKey;
                  return (
                    <button
                      key={cat.category}
                      type="button"
                      className={`journey-rec-subitem ${
                        isCatActive ? 'active' : ''
                      }`}
                      onClick={() => handleSelect(catNavKey)}
                    >
                      <RecSubIcon className="journey-rec-subitem-icon" />
                      <span className="journey-rec-subitem-label">{cat.title}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
