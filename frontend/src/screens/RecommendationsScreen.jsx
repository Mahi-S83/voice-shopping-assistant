import { useState } from 'react';

const recommendationsData = [
  {
    title: 'Running low',
    tag: '3 items',
    items: [
      { emoji: '🧅', name: 'Onions', meta: 'last added 9 days ago' },
      { emoji: '🧄', name: 'Garlic', meta: 'usually every 12 days' },
      { emoji: '🫒', name: 'Cooking oil', meta: 'last added 20 days ago' },
    ],
    bgColor: 'bg-tomato-soft'
  },
  {
    title: 'In season now',
    tag: 'Summer',
    items: [
      { emoji: '🥭', name: 'Mangoes', meta: 'peak season' },
      { emoji: '🍉', name: 'Watermelon', meta: 'peak season' },
      { emoji: '🍈', name: 'Muskmelon', meta: 'peak season' },
    ],
    bgColor: 'bg-saffron-soft'
  },
  {
    title: 'Goes with your list',
    tag: 'Paired',
    items: [
      { emoji: '🍞', name: 'Bread', meta: 'often bought with milk' },
      { emoji: '🥚', name: 'Eggs', meta: 'often bought with bread' },
      { emoji: '🧃', name: 'Juice', meta: 'weekend favourite' },
    ],
    bgColor: 'bg-mint-soft'
  }
];

export function RecommendationsScreen({ isActive }) {
  // Screen slide transition
  const screenStyle = {
    transform: isActive ? 'translateX(0)' : 'translateX(100%)',
    opacity: isActive ? 1 : 0,
    transition: 'transform 0.48s cubic-bezier(0.22, 0.85, 0.28, 1), opacity 0.38s ease',
  };

  return (
    <div className="flex flex-col h-full" style={screenStyle}>
      <div className="pt-[14px] px-[22px] pb-[14px]">
        <div className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-ink-faint">
          Curated for your kitchen
        </div>
        <div className="font-baloo text-xl font-bold text-ink mt-0.5">
          For you
        </div>
      </div>

      {/* Floating Decorations with Drift Animation */}
      <div className="absolute top-[60px] left-[24px] text-2xl opacity-50 pointer-events-none animate-drift">🌿</div>
      <div className="absolute top-[120px] right-[20px] text-2xl opacity-50 pointer-events-none animate-drift" style={{ animationDelay: '1.5s' }}>🍋</div>
      <div className="absolute top-[280px] left-[14px] text-2xl opacity-50 pointer-events-none animate-drift" style={{ animationDelay: '3s' }}>🌶️</div>
      <div className="absolute top-[440px] right-[26px] text-2xl opacity-50 pointer-events-none animate-drift" style={{ animationDelay: '4.5s' }}>🥕</div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-[130px] relative z-10">
        {recommendationsData.map((section, idx) => (
          <div key={idx} className="py-2.5">
            <div className="flex items-center justify-between font-baloo text-[15px] font-bold text-ink mb-2.5">
              {section.title}
              <span className="font-inter text-[10.5px] font-semibold text-ink-faint uppercase tracking-[0.05em]">
                {section.tag}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1.5">
              {section.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex-shrink-0 w-[126px] bg-paper-raised border border-line rounded-[18px] px-3 py-3 text-center transition-transform duration-350 hover:-translate-y-1.5 opacity-0 animate-card-glide"
                  style={{ animationDelay: `${0.07 * (idx * 3 + itemIdx)}s` }}
                >
                  <div
                    className={`w-[52px] h-[52px] rounded-full mx-auto mb-2 flex items-center justify-center text-2xl ${section.bgColor}`}
                  >
                    <span className="inline-block animate-bob" style={{ animationDelay: `${itemIdx * 0.4}s` }}>{item.emoji}</span>
                  </div>
                  <div className="text-xs font-semibold text-ink leading-[1.3]">{item.name}</div>
                  <div className="text-[10.5px] text-ink-faint mt-0.5">{item.meta}</div>
                  <button className="mt-2 text-[11px] font-bold text-mint border-[1.3px] border-mint-soft bg-mint-soft rounded-[14px] py-1.5 px-0 w-full transition-transform active:scale-95 hover:scale-105">
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}