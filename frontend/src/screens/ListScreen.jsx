import { ShoppingList } from '../components/ShoppingList';
import { TranscriptSheet } from '../components/TranscriptSheet';
import { removeItemFromList } from '../utils/api';

export function ListScreen({ 
  isListening, 
  setIsListening, 
  transcript, 
  setTranscript, 
  parsedResult, 
  setParsedResult,
  isActive,
  items = [],
  loading = false,
  onRefreshList,
   onRemoveItem,
  onMarkBought
}) {
  const safeItems = items || [];
  console.log('📋 ListScreen - items count:', safeItems.length);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItemFromList(itemId);
      if (onRefreshList) {
        await onRefreshList();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // ✅ Add this function
const handleToggleBought = async (itemId) => {
  if (onMarkBought) {
    await onMarkBought(itemId);
  }
};
  
  const screenStyle = {
    transform: isActive ? 'translateX(0)' : 'translateX(100%)',
    opacity: isActive ? 1 : 0,
    transition: 'transform 0.48s cubic-bezier(0.22, 0.85, 0.28, 1), opacity 0.38s ease',
  };

  // ✅ Show loading ONLY if loading AND no items
  if (loading && safeItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={screenStyle}>
        <div className="text-ink-faint">Loading...</div>
      </div>
    );
  }

  // Calculate stats from safeItems
  const activeItems = safeItems.filter(i => !i.isBought) || [];
  const total = activeItems.reduce((sum, i) => sum + (i.price || 0), 0);
  const stats = {
    count: activeItems.length,
    total: Math.round(total * 100) / 100,
    runningLow: 3,
  };

  return (
    <div className="flex flex-col h-full relative" style={screenStyle}>
      <div className="pt-[14px] px-[22px] pb-[14px]">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-baloo text-[20px] font-bold text-ink">Saathi</span>
          <span className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-marigold-deep flex items-center gap-1.5">
            <span className="w-4 h-[2px] bg-marigold-deep inline-block"></span>
            Voice Shopping
          </span>
        </div>

        <div className="flex justify-between items-center mb-[14px]">
          <div>
            <div className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-ink-faint">
              {getGreeting()}
            </div>
            <div className="font-baloo text-[20px] font-bold text-ink mt-0.5">
              Mahi's List
            </div>
          </div>
          <div className="w-[38px] h-[38px] rounded-xl bg-gradient-to-br from-marigold to-tomato flex items-center justify-center text-white font-baloo font-bold text-[15px] flex-shrink-0">
            M
          </div>
        </div>
        
        <div className="flex gap-2.5">
          <div className="flex-1 bg-paper-raised border border-line rounded-[14px] px-3 py-2.5">
            <div className="font-mono text-base font-medium text-ink">{stats.count}</div>
            <div className="text-[10.5px] text-ink-faint mt-0.5">items</div>
          </div>
          <div className="flex-1 bg-paper-raised border border-line rounded-[14px] px-3 py-2.5">
            <div className="font-mono text-base font-medium text-ink">₹{stats.total}</div>
            <div className="text-[10.5px] text-ink-faint mt-0.5">estimated</div>
          </div>
          <div className="flex-1 bg-paper-raised border border-line rounded-[14px] px-3 py-2.5">
            <div className="font-mono text-base font-medium text-ink">{stats.runningLow}</div>
            <div className="text-[10.5px] text-ink-faint mt-0.5">running low</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-[130px]">
        <ShoppingList 
          items={safeItems} 
          onToggleBought={handleToggleBought}
          onRemove={handleRemove}
        />
      </div>

      <TranscriptSheet 
        isListening={isListening}
        transcript={transcript}
        parsedResult={parsedResult}
      />

      <div className="px-[22px] pb-[14px]">
        <div className="text-[11px] tracking-[0.05em] uppercase text-ink-faint font-semibold mb-2">
          For you
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <div className="flex-shrink-0 status-chip low">
            <span>↻</span> Running low: Onions
          </div>
          <div className="flex-shrink-0 status-chip season">
            <span>☀</span> In season: Mangoes
          </div>
          <div className="flex-shrink-0 status-chip suggestion">
            <span>+</span> Goes with milk: Bread
          </div>
        </div>
      </div>
    </div>
  );
}