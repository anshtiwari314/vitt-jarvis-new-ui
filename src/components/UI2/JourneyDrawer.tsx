import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronRight, BookmarkCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setNavigation } from '../../reducers/salesCopilotReducer';
import { useData } from '../../context/DataWrapper';

interface JourneyDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectMode?: (mode: 'canvas') => void;
}

export default function JourneyDrawer({
  open,
  onClose,
  onSelectMode,
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
    if (onSelectMode) {
      onSelectMode('canvas');
    }
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
            className="p-2 rounded-lg hover:bg-slate-100 transition text-slate-500"
          >
            <X size={20} />
          </button>
        </header>

        <nav className="space-y-2">
          {/* 01 Understanding You */}
          <button
            className={isProfile ? 'active' : ''}
            onClick={() => handleSelect('Data Retrieval')}
          >
            <span className="journey-number">01</span>
            <span>
              <strong>Understanding you</strong>
              <small>Profile, family and financial picture</small>
            </span>
          </button>

          {/* 02 Priorities Identified */}
          <button
            className={isSummary ? 'active' : ''}
            onClick={() => handleSelect('Plan Summary')}
          >
            <span className="journey-number">02</span>
            <span>
              <strong>Priorities identified</strong>
              <small>Protection and retirement needs</small>
            </span>
          </button>

          {/* 03 Recommendations Dropdown */}
          <div className="space-y-1">
            <button
              className={`w-full ${isRecs ? 'active' : ''}`}
              onClick={handleRecommendationsClick}
            >
              <span className="journey-number">03</span>
              <span className="flex-1 text-left">
                <strong>Recommendation</strong>
                <small>Suitable plans and rationale</small>
              </span>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-200 ${
                  recsExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {recsExpanded && recCategories.length > 0 && (
              <div className="ml-6 pl-4 border-l-2 border-slate-200 space-y-1 py-1">
                {recCategories.map((cat) => {
                  const catNavKey = `Recommendations::${cat.category}`;
                  const isCatActive = currentNavigation === catNavKey;
                  return (
                    <button
                      key={cat.category}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-all ${
                        isCatActive
                          ? 'bg-sky-100 text-sky-800 border border-sky-300 font-bold shadow-sm'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                      onClick={() => handleSelect(catNavKey)}
                    >
                      <span className="flex items-center gap-2">
                        <BookmarkCheck
                          size={15}
                          className={isCatActive ? 'text-sky-600' : 'text-slate-400'}
                        />
                        {cat.title}
                      </span>
                      <ChevronRight
                        size={14}
                        className={isCatActive ? 'text-sky-600' : 'text-slate-400'}
                      />
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
