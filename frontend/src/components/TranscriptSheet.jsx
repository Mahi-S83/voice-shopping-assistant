export function TranscriptSheet({ isListening, transcript, parsedResult }) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 bg-[#1F2A24] rounded-t-[26px] px-[22px] pt-5 pb-[118px] transition-transform duration-400 z-15 ${
        isListening ? 'translate-y-0' : 'translate-y-[105%]'
      }`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="font-mono text-[10.5px] tracking-[0.1em] uppercase text-[#8FA396]">
          {isListening ? 'Listening' : 'Ready'}
        </span>
        {isListening && (
          <span className="w-1.5 h-1.5 rounded-full bg-[#D6553F] animate-blink"></span>
        )}
      </div>
      
      {/* ✅ Show actual transcript */}
      <div className="font-baloo text-[19px] leading-[1.5] text-white min-h-[56px]">
        {isListening ? (
          transcript ? (
            <span>{transcript}</span>
          ) : (
            <span className="text-[#8FA396]">Listening...</span>
          )
        ) : (
          <span className="text-[#8FA396]">Tap the mic and start speaking...</span>
        )}
        
        {parsedResult && !isListening && (
          <div className="mt-3.5 inline-flex items-center gap-1.5 bg-[rgba(232,163,61,0.16)] border border-[rgba(232,163,61,0.4)] text-[#E8A33D] rounded-[20px] px-3 py-1.5 text-xs font-semibold opacity-0 animate-[slide-up_0.3s_ease_forwards]">
            <span>✓</span> {parsedResult}
          </div>
        )}
      </div>
    </div>
  );
}