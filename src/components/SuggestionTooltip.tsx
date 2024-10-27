import React, { useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface SuggestionTooltipProps {
  onAccept: () => void;
  onTryAgain: () => void;
  onDecline: () => void;
  onShortcutUsed: () => void;
  onSuggestionHandled: () => void;
  quill: any;
  suggestedContentRange: { index: number, length: number } | null;
  isVisible: boolean;
}

export default function SuggestionTooltip({ 
  onAccept, 
  onTryAgain, 
  onDecline, 
  onShortcutUsed, 
  onSuggestionHandled,
  quill,
  suggestedContentRange,
  isVisible
}: SuggestionTooltipProps) {
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log('SuggestionTooltip: Component mounted');
    if (isVisible) {
      acceptButtonRef.current?.focus();
    }
    return () => {
      console.log('SuggestionTooltip: Component unmounted');
    };
  }, [isVisible]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (e.shiftKey) {
        onTryAgain();
      } else {
        onAccept();
      }
      onShortcutUsed();
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Escape' || e.key === ' ') {
      e.preventDefault();
      onDecline();
      onShortcutUsed();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onAccept, onTryAgain, onDecline, onShortcutUsed]);

  const handleAccept = () => {
    onAccept();
    onShortcutUsed();
    onSuggestionHandled();
  };

  const handleTryAgain = () => {
    onTryAgain();
    onShortcutUsed();
    onSuggestionHandled();
  };

  const handleDecline = () => {
    onDecline();
    onShortcutUsed();
    onSuggestionHandled();
  };

  return (
    <>
      {/* Invisible div to capture keyboard events when toolbar is hidden */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
      
      {isVisible && (
        <div className="inline-flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-[#131417] dark:border dark:border-[#32353d] px-2 py-[0.2rem] space-x-3">
          <button 
            ref={acceptButtonRef}
            className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center space-x-1 hover:bg-blue-700 transition-colors"
            style={{ fontSize: '0.8rem', outline: 'none' }}
            onClick={handleAccept}
          >
            <span>Godkjenn</span>
            <div className="bg-white bg-opacity-10 rounded p-0.5">
              <ArrowRight className="w-3 h-3" />
            </div>
          </button>
          <button 
            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors text-sm px-2 py-1 whitespace-nowrap flex items-center space-x-2"
            onClick={handleTryAgain}
          >
            <div className="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 flex items-center space-x-1 text-xs">
              <span className="font-semibold">Shift</span>
              <span>+</span>
              <ArrowRight className="w-3 h-3" />
            </div>
            <span>Prøv igjen</span>
          </button>
        </div>
      )}
    </>
  );
}
