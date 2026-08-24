import { useState, useEffect } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { addItemToList, searchProductsWithFilters } from '../utils/api';

export function SearchScreen({ isActive }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearchListening, setIsSearchListening] = useState(false);
  const [parsedQuery, setParsedQuery] = useState(null);
  const [addedMessage, setAddedMessage] = useState(null);
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);
  
  const [filters, setFilters] = useState({
    brand: null,
    maxPrice: null,
    minPrice: null,
    size: null,
    organic: false,
  });

  // ✅ FIXED: useEffect that respects voice search
  useEffect(() => {
  // ✅ If voice search just ran, skip completely
  if (isVoiceSearch) {
    console.log('⏭️ Skipping useEffect - voice search just ran');
    setIsVoiceSearch(false);
    return;
  }

  // ✅ Don't search if query is too short
  if (query.length <= 1) {
    setResults([]);
    return;
  }

  // ✅ Use parsed query if available, otherwise use raw query
  const searchQuery = parsedQuery?.query || query;
  
  // ✅ Skip if query is a natural language filter string
  if (searchQuery.includes('under') || searchQuery.includes('between') || searchQuery.includes('than')) {
    return;
  }

  performSearch(searchQuery);
}, [query, filters, isVoiceSearch, parsedQuery]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const data = await searchProductsWithFilters(searchQuery, filters);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    setIsSearchListening(true);
    setParsedQuery(null);

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = async (event) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      
      if (finalText) {
  console.log('🎤 Voice search text:', finalText);
  setIsSearchListening(false);
  
  // ✅ Add this line
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  try {
    setLoading(true);
    const response = await fetch(`${API_BASE}/api/search/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: finalText })
    });
          const data = await response.json();
          
          console.log('📦 Voice search response:', data);
          
          if (data.success) {
  const parsedData = data.parsed || {};
  setParsedQuery(parsedData);
  setResults(data.results || []);
  setIsVoiceSearch(true);
  
  // ✅ Clean filter setting with null checks
  const newFilters = { ...filters };
  if (parsedData.brand) newFilters.brand = parsedData.brand;
  if (parsedData.minPrice !== null && parsedData.minPrice !== undefined) newFilters.minPrice = parsedData.minPrice;
  if (parsedData.maxPrice !== null && parsedData.maxPrice !== undefined) newFilters.maxPrice = parsedData.maxPrice;
  if (parsedData.size) newFilters.size = parsedData.size;
  if (parsedData.organic) newFilters.organic = true;
  setFilters(newFilters);
  
  // ✅ Set query LAST
  setQuery(finalText);
} else {
            setQuery(finalText);
            performSearch(finalText);
          }
        } catch (error) {
          console.error('❌ Voice search error:', error);
          setQuery(finalText);
          performSearch(finalText);
        } finally {
          setLoading(false);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setIsSearchListening(false);
    };

    recognition.onend = () => {
      setIsSearchListening(false);
    };

    recognition.start();
  };

  const handleAdd = async (product) => {
    try {
      const response = await addItemToList(product.name, 1, product.unit);
      if (response.success) {
        setAddedMessage(`${product.name} added to list! ✅`);
        setTimeout(() => setAddedMessage(null), 2000);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const clearFilters = () => {
    setFilters({ brand: null, maxPrice: null, minPrice: null, size: null, organic: false });
  };

  const screenStyle = {
    transform: isActive ? 'translateX(0)' : 'translateX(-100%)',
    opacity: isActive ? 1 : 0,
    transition: 'transform 0.48s cubic-bezier(0.22, 0.85, 0.28, 1), opacity 0.38s ease',
  };

  const activeFilterLabels = [];
  if (filters.brand) activeFilterLabels.push(`Brand: ${filters.brand}`);
  if (filters.maxPrice) activeFilterLabels.push(`≤ ₹${filters.maxPrice}`);
  if (filters.minPrice) activeFilterLabels.push(`≥ ₹${filters.minPrice}`);
  if (filters.size) activeFilterLabels.push(filters.size);
  if (filters.organic) activeFilterLabels.push('🌱 Organic');

  return (
    <div className="flex flex-col h-full" style={screenStyle}>
      {addedMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-mint text-white px-4 py-3 rounded-xl shadow-lg font-medium text-sm animate-slide-up">
          {addedMessage}
        </div>
      )}

      <div className="pt-[16px] px-[22px] pb-[10px]">
        <div className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-ink-faint">
          Find something
        </div>
        <div className="font-baloo text-xl font-bold text-ink mb-3">
          Search & filter
        </div>
        
        <div className="flex items-center gap-2.5 bg-paper-raised border border-line rounded-[18px] px-3.5 py-3 shadow-[0_6px_16px_-10px_rgba(31,42,36,0.2)]">
          <Search className="w-4 h-4 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find organic apples under ₹300…"
            className="flex-1 border-none outline-none bg-transparent font-inter text-sm text-ink placeholder:text-ink-faint"
          />
          <div 
            className={`w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-300 ${
              isSearchListening 
                ? 'bg-gradient-to-br from-tomato to-[#B33F2C] shadow-[0_0_20px_rgba(214,85,63,0.5)] animate-pulse' 
                : 'bg-gradient-to-br from-marigold to-marigold-deep hover:shadow-lg'
            }`}
            onClick={handleVoiceSearch}
          >
            <Mic className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${isSearchListening ? 'scale-110' : ''}`} />
          </div>
        </div>

        {isSearchListening && (
          <div className="mt-3 rounded-xl bg-tomato-soft px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tomato animate-blink"></span>
              <span className="text-sm font-semibold text-tomato">Listening...</span>
            </div>
            <p className="text-sm text-ink-soft mt-1">
              Say something like "Find organic apples under ₹300"
            </p>
          </div>
        )}

        {parsedQuery && (
          <div className="mt-3 rounded-xl bg-saffron-soft px-4 py-3">
            <div className="text-xs text-ink-faint font-semibold">You searched for:</div>
            <div className="flex flex-wrap gap-2 mt-1">
              <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-ink">
                {parsedQuery.query || query}
              </span>
              {parsedQuery.brand && (
                <span className="bg-white px-3 py-1 rounded-full text-sm text-ink-soft">
                  Brand: {parsedQuery.brand}
                </span>
              )}
              {parsedQuery.maxPrice && (
                <span className="bg-white px-3 py-1 rounded-full text-sm text-ink-soft">
                  ≤ ₹{parsedQuery.maxPrice}
                </span>
              )}
              {parsedQuery.minPrice && (
                <span className="bg-white px-3 py-1 rounded-full text-sm text-ink-soft">
                  ≥ ₹{parsedQuery.minPrice}
                </span>
              )}
              {parsedQuery.size && (
                <span className="bg-white px-3 py-1 rounded-full text-sm text-ink-soft">
                  {parsedQuery.size}
                </span>
              )}
              {parsedQuery.organic && (
                <span className="bg-white px-3 py-1 rounded-full text-sm text-ink-soft">
                  🌱 Organic
                </span>
              )}
            </div>
          </div>
        )}

        {activeFilterLabels.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilterLabels.map((label, idx) => (
              <span key={idx} className="bg-ink text-paper px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                {label}
                <button onClick={clearFilters} className="hover:text-tomato transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-[130px]">
        {loading ? (
          <div className="text-center text-ink-faint py-8">Searching...</div>
        ) : results.length === 0 ? (
          query.length > 1 ? (
            <div className="text-center py-8">
              <span className="text-3xl block mb-3">🔍</span>
              <p className="text-ink-soft font-medium">No products found</p>
              <p className="text-ink-faint text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <span className="text-3xl block mb-3 animate-float-emoji">🛒</span>
              <p className="text-ink-soft font-medium">Search for products</p>
              <p className="text-ink-faint text-sm mt-1">Type or say what you're looking for</p>
            </div>
          )
        ) : (
          <>
            <div className="text-sm text-ink-faint mb-3">
              Found {results.length} product{results.length > 1 ? 's' : ''}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {results.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAdd}
                  index={index}
                  isSearchResult={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}