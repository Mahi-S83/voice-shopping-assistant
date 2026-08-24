import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Coachmarks({ steps, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [targetRect, setTargetRect] = useState(null);
  const step = steps[currentStep];

  useEffect(() => {
    if (step && step.targetRef && step.targetRef.current) {
      const rect = step.targetRef.current.getBoundingClientRect();
      // Get the phone frame position
      const phoneRect = document.querySelector('.phone-frame')?.getBoundingClientRect() || { top: 0, left: 0 };
      
      setTargetRect(rect);
      setPosition({
        top: rect.top - phoneRect.top - 10,
        left: rect.left - phoneRect.left + rect.width / 2,
      });
    }
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!step || !targetRect) return null;

  return (
    <div className="absolute inset-0 z-50">
      {/* Dark scrim */}
      <div className="absolute inset-0 bg-black/60"></div>
      
      {/* Spotlight cutout using box-shadow */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          top: targetRect.top - 30,
          left: targetRect.left - 30,
          width: targetRect.width + 60,
          height: targetRect.height + 60,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          border: '3px solid var(--color-marigold)',
          borderRadius: '50%',
        }}
      ></div>

      {/* Tooltip */}
      <div 
        className="absolute max-w-[260px] bg-ink rounded-2xl p-4 pointer-events-auto"
        style={{
          top: targetRect.bottom + 20,
          left: targetRect.left + targetRect.width / 2 - 130,
        }}
      >
        {/* Arrow */}
        <div 
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-ink rotate-45"
        ></div>
        
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 text-ink-faint hover:text-paper transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h3 className="font-baloo text-base font-bold text-marigold mb-1 pr-6">
          {step.title}
        </h3>
        <p className="text-sm text-paper/80 leading-[1.5]">
          {step.description}
        </p>
        
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-paper/10">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <span 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-marigold' : 'bg-paper/30'
                }`}
              ></span>
            ))}
          </div>
          <button
            onClick={handleNext}
            className="font-inter text-xs font-semibold text-marigold hover:text-marigold-deep transition-colors px-3 py-1 rounded-lg hover:bg-marigold/10"
          >
            {currentStep === steps.length - 1 ? 'Got it' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}