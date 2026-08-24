import { useState, useEffect } from 'react';
import { ListScreen } from './screens/ListScreen';
import { SearchScreen } from './screens/SearchScreen';
import { RecommendationsScreen } from './screens/RecommendationsScreen';
import { TabBar } from './components/TabBar';
import { MicButton } from './components/MicButton';
import { getShoppingList } from './utils/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  
  // ✅ MOVE items state to App.jsx (single source of truth)
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Load list function - can be called from anywhere
  const loadList = async () => {
  try {
    console.log('🔄 Refreshing shopping list...');
    setLoading(true);
    const data = await getShoppingList();
    const freshItems = data.items || [];
    console.log('📋 Fresh items count:', freshItems.length);
    setItems([...freshItems]);
    setLoading(false);  // ✅ Always set loading to false
    return freshItems;
  } catch (error) {
    console.error('❌ Failed to load shopping list:', error);
    setLoading(false);  // ✅ Always set loading to false
    return [];
  }
};

// ✅ Add this function
const handleRemoveItem = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE}/api/list/${itemId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      await loadList();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing item:', error);
    return false;
  }
};

// ✅ Add this function
const handleMarkBought = async (itemId) => {
  try {
    const response = await fetch(`${API_BASE}/api/list/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBought: true })
    });
    if (response.ok) {
      await loadList();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error marking item:', error);
    return false;
  }
};
  // ✅ Load on mount
  useEffect(() => {
    loadList();
  }, []);


  // ✅ Voice recognition with list refresh
  const startListening = () => {
    if (isListening) return;
    
    setIsListening(true);
    setTranscript('');
    setParsedResult(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setParsedResult('Speech recognition not supported in this browser');
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    let finalTranscript = '';

    recognition.onresult = async (event) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimText += transcriptPart;
        }
      }
      setTranscript(finalTranscript || interimText);
      
      if (event.results[event.results.length - 1].isFinal) {
        try {
          const response = await fetch(`${API_BASE}/api/list/${itemId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: finalTranscript, language: 'en' })
          });
          const data = await response.json();
          
          if (data.result?.success) {
            setParsedResult(data.result.message);
            
            // ✅ CRITICAL: Refresh the list after voice command
            await loadList();
            console.log('✅ List refreshed after voice command!');
            
          } else {
            setParsedResult(data.result?.message || 'Could not understand');
          }
        } catch (error) {
          console.error('Error:', error);
          setParsedResult('Could not connect to server');
        }
        
        setTimeout(() => {
          setIsListening(false);
        }, 3000);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      setParsedResult('Could not hear you. Try again.');
      setIsListening(false);
    };

    recognition.start();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderScreen = () => {
    const isActive = (screen) => activeTab === screen;
    
    switch (activeTab) {
      case 'list':
        return (
         <ListScreen
  isActive={isActive('list')}
  isListening={isListening}
  setIsListening={setIsListening}
  transcript={transcript}
  setTranscript={setTranscript}
  parsedResult={parsedResult}
  setParsedResult={setParsedResult}
  items={items}
  loading={loading}
  onRefreshList={loadList} 
  onRemoveItem={handleRemoveItem} // ✅ Pass refresh function
  onMarkBought={handleMarkBought} // ✅ Pass mark bought function
/>
        );
      case 'search':
        return <SearchScreen isActive={isActive('search')} />;
      case 'recs':
        return <RecommendationsScreen isActive={isActive('recs')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#EDEEE6]"
      style={{
        background: `
          radial-gradient(1200px 600px at 15% -10%, #FBF3E3 0%, transparent 55%),
          radial-gradient(900px 500px at 110% 10%, #E3EFE6 0%, transparent 50%),
          #EDEEE6
        `
      }}
    >
      <div className="w-full max-w-[1080px] flex gap-14 items-start justify-center flex-wrap">
        
        <div className="max-w-[280px] pt-9">
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] uppercase text-marigold-deep mb-3.5">
            <span className="w-4 h-[2px] bg-marigold-deep inline-block"></span>
            Saathi · Voice Shopping
          </div>
          
          <h1 className="font-baloo text-[32px] font-bold leading-[1.14] text-ink mb-4">
            The whole flow, gliding together.
          </h1>
          
          <p className="text-[14.5px] leading-[1.65] text-ink-soft mb-4">
            Three screens sharing one system — List, Search, and For You — 
            connected by soft glide transitions instead of hard cuts, 
            with product cards that drift and float rather than sit static.
          </p>
          
          <div className="flex flex-col gap-2.5 mt-5">
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-[6px] bg-saffron-soft flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">🛒</div>
              <div>
                <strong className="block text-[12.5px] text-ink font-semibold">List</strong>
                <span className="text-[12px] text-ink-faint">Voice-built list, mic dock, live transcript sheet</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-[6px] bg-saffron-soft flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">🔍</div>
              <div>
                <strong className="block text-[12.5px] text-ink font-semibold">Search</strong>
                <span className="text-[12px] text-ink-faint">Filter chips + cards that glide in staggered, icons that hover</span>
              </div>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="w-5 h-5 rounded-[6px] bg-saffron-soft flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5">✨</div>
              <div>
                <strong className="block text-[12.5px] text-ink font-semibold">For You</strong>
                <span className="text-[12px] text-ink-faint">Carousels of nudges, drifting background motifs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="phone-frame">
            <div className="notch"></div>
            <div className="absolute inset-0 pt-[44px] overflow-hidden">
              {renderScreen()}
            </div>

            {activeTab === 'list' && (
              <div className="absolute left-0 right-0 bottom-[92px] flex justify-center z-25 pointer-events-none">
                <div className="pointer-events-auto">
                  <MicButton 
                    isListening={isListening} 
                    onClick={startListening}
                    disabled={isListening}
                  />
                </div>
              </div>
            )}

            <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;