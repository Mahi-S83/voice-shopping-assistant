import { List, Search, Sparkles } from 'lucide-react';
import { forwardRef } from 'react';

const tabs = [
  { id: 'list', label: 'List', icon: List, ref: null },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'recs', label: 'For You', icon: Sparkles },
];

export const TabBar = forwardRef(({ activeTab, onTabChange, searchRef, recsRef }, ref) => {
  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  const getTabRef = (tabId) => {
    if (tabId === 'search') return searchRef;
    if (tabId === 'recs') return recsRef;
    return null;
  };

  return (
    <div className="absolute left-4 right-4 bottom-4 z-30 bg-paper-raised border border-line rounded-[22px] p-2 flex gap-1 shadow-[0_16px_30px_-14px_rgba(31,42,36,0.35)]">
      <div
        className="absolute top-2 bottom-[6px] left-2 w-[calc(33.333%-5.33px)] bg-saffron-soft rounded-2xl transition-transform duration-380 ease-[cubic-bezier(.22,.85,.28,1)]"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      ></div>
      {tabs.map((tab, idx) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const tabRef = getTabRef(tab.id);
        return (
          <button
            key={tab.id}
            ref={tabRef}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-0 rounded-2xl relative z-2 font-inter text-[10.5px] font-semibold transition-colors duration-250 ${
              isActive ? 'text-ink' : 'text-ink-faint'
            }`}
          >
            <Icon className="w-[19px] h-[19px]" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
});

TabBar.displayName = 'TabBar';