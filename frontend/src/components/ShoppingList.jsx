const categoryColors = {
  'Produce': '#D6553F',
  'Dairy': '#E8A33D',
  'Bread & Bakery': '#D4A373',
  'Meat & Seafood': '#D6553F',
  'Pantry Staples': '#2F6B4F',
  'Beverages': '#4A90D9',
  'Snacks': '#E8A33D',
  'Household': '#8567AD',
  'Personal Care': '#9B6B9B',
  'Other': '#8A9086',
  'default': '#8A9086'
};

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
  'Other': '📦',
  'default': '📦'
};

export function ShoppingList({ items = [], onToggleBought, onRemove }) {
  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-4 animate-float-emoji">🛒</span>
        <h3 className="font-baloo text-xl text-ink">Your list is empty</h3>
        <p className="text-sm text-ink-faint mt-2">Try saying "add milk" or "I need bread"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <div className="flex items-center gap-2 font-baloo text-[13.5px] font-semibold text-ink-soft mb-2">
            <span 
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: categoryColors[category] || categoryColors.default }}
            ></span>
            {categoryEmojis[category] || categoryEmojis.default} {category}
          </div>
          {categoryItems.map((item, index) => (
            <div
              key={item.id || `item-${index}`}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E4E3D9',
                borderRadius: '16px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
                opacity: item.isBought ? 0.6 : 1,
              }}
            >
              <button
                onClick={() => onToggleBought(item.id || item._id || `item-${index}`)}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '7px',
                  border: item.isBought ? '2px solid #2F6B4F' : '2px solid #E4E3D9',
                  background: item.isBought ? '#2F6B4F' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  cursor: 'pointer'
                }}
              >
                {item.isBought && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1F2A24' }}>
                  {item.productName}
                </div>
                <div style={{ fontSize: '12px', color: '#8A9086', marginTop: '2px' }}>
                  {item.quantity} × {item.unit}
                  {item.brand && ` · ${item.brand}`}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.price !== undefined && item.price > 0 && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px', color: '#5B6459' }}>
                    ₹{item.price}
                  </span>
                )}
                <button
                  onClick={() => onRemove(item.id || item._id || `item-${index}`)}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#F6E1DC',
                    color: '#D6553F',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}