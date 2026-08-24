import { Mic, MicOff } from 'lucide-react';

export function MicButton({ isListening, onClick, disabled }) {
  return (
    <div className="relative flex items-center justify-center w-[70px] h-[70px]">
      {/* 3 Staggered Ripple Rings - Only show when listening */}
      {isListening && (
        <>
          <div className="absolute rounded-full border-[1.5px] border-tomato opacity-0 animate-ripple w-[70px] h-[70px]"></div>
          <div className="absolute rounded-full border-[1.5px] border-tomato opacity-0 animate-ripple w-[70px] h-[70px] [animation-delay:0.5s]"></div>
          <div className="absolute rounded-full border-[1.5px] border-tomato opacity-0 animate-ripple w-[70px] h-[70px] [animation-delay:1s]"></div>
        </>
      )}
      <button
        onClick={onClick}
        disabled={disabled}
        className={`relative z-10 w-[60px] h-[60px] rounded-full border-3 border-paper flex items-center justify-center transition-all duration-200 active:scale-94 ${
          isListening
            ? 'bg-gradient-to-br from-tomato to-[#B33F2C] shadow-[0_10px_24px_-8px_rgba(214,85,63,0.55)]'
            : 'bg-gradient-to-br from-marigold to-marigold-deep shadow-[0_10px_24px_-8px_rgba(199,127,31,0.55)] hover:shadow-[0_14px_28px_-8px_rgba(199,127,31,0.7)]'
        }`}
      >
        {isListening ? (
          <MicOff className="w-5 h-5 text-white" />
        ) : (
          <Mic className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );
}