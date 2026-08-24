import { Plus } from 'lucide-react';

const categoryEmojis = {
  'Produce': '🥬',
  'Dairy': '🥛',
  'Bread & Bakery': '🍞',
  'Meat & Seafood': '🍗',
  'Pantry Staples': '🫘',
  'Beverages': '☕',
  'Snacks': '🍿',
  'Household': '🧹',
  'Personal Care': '🧴',
  'default': '📦'
};

const categoryColors = {
  'Produce': 'bg-tomato-soft',
  'Dairy': 'bg-saffron-soft',
  'Bread & Bakery': 'bg-[#F0E6D3]',
  'Meat & Seafood': 'bg-[#FCE4E0]',
  'Pantry Staples': 'bg-mint-soft',
  'Beverages': 'bg-[#D4E8F0]',
  'Snacks': 'bg-[#FFF3D4]',
  'Household': 'bg-lilac-soft',
  'Personal Care': 'bg-[#F0E6F0]',
  'default': 'bg-line'
};

export function ProductCard({ product, onAdd, index = 0, isSearchResult = false }) {
  const emoji = categoryEmojis[product.category] || categoryEmojis.default;
  const colorClass = categoryColors[product.category] || categoryColors.default;
  const delay = isSearchResult ? 0.07 * (index % 10) : 0;

  return (
    <div
      className={`bg-paper-raised border border-line rounded-[20px] p-3.5 relative overflow-hidden transition-transform duration-350 hover:-translate-y-1.5 ${
        isSearchResult ? 'opacity-0 animate-card-glide' : ''
      }`}
      style={isSearchResult ? { animationDelay: `${delay}s` } : {}}
    >
      <div className={`w-full h-[76px] rounded-[14px] mb-2.5 flex items-center justify-center text-3xl ${colorClass}`}>
        <span className="inline-block animate-float-emoji">{emoji}</span>
      </div>
      <div className="text-[13px] font-semibold text-ink leading-[1.3] truncate">{product.name}</div>
      <div className="text-[11px] text-ink-faint mt-0.5 truncate">{product.brand}</div>
      <div className="flex justify-between items-center mt-2.5">
        <span className="font-mono text-[13px] text-ink font-medium">
          ₹{product.price}/{product.size}{product.unit}
        </span>
        <button
          onClick={() => onAdd(product)}
          className="w-6 h-6 rounded-full bg-mint text-white flex items-center justify-center text-base font-semibold transition-transform active:scale-85 hover:scale-110"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}