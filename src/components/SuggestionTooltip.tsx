import React, { useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface SuggestionTooltipProps {
  onAccept: () => void;
  onTryAgain: () => void;
  onDecline: () => void;
  onShortcutUsed: () => void;
  onSuggestionHandled: () => void;
  quill: any; // Add this prop
  suggestedContentRange: { index: number, length: number } | null; // Add this prop
}

export default function SuggestionTooltip({ 
  onAccept, 
  onTryAgain, 
  onDecline, 
  onShortcutUsed, 
  onSuggestionHandled,
  quill,
  suggestedContentRange
}: SuggestionTooltipProps) {
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log('SuggestionTooltip: Component mounted');
    acceptButtonRef.current?.focus();
    return () => {
      console.log('SuggestionTooltip: Component unmounted');
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      console.log('SuggestionTooltip: ArrowRight pressed');
      event.preventDefault();
      if (event.shiftKey) {
        onTryAgain();
      } else {
        onAccept();
      }
      onShortcutUsed();
    } else if (event.key === 'Backspace' || event.key === 'Delete' || event.key === 'Escape') {
      console.log(`SuggestionTooltip: ${event.key} pressed`);
      event.preventDefault();
      onDecline();
      onShortcutUsed();
    } else if (event.key === ' ') {
      console.log('SuggestionTooltip: Space pressed');
      event.preventDefault();
      onDecline();
      onShortcutUsed();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        if (quill && suggestedContentRange) {
          const isFullyGenerated = true; // Assume it's fully generated in this context
  
          quill.deleteText(suggestedContentRange.index, suggestedContentRange.length);
          
          // Check if there's an extra character left and remove it if necessary
          const textAfter = quill.getText(suggestedContentRange.index, 1);
          if (textAfter && textAfter !== '\n') {
            quill.deleteText(suggestedContentRange.index, 1);
          }
  
          // Ensure there's an empty line
          const textAfterDeletion = quill.getText(suggestedContentRange.index, 1);
          if (textAfterDeletion !== '\n') {
            quill.insertText(suggestedContentRange.index, '\n');
          }
  
          // Move the cursor to the beginning of the empty line
          quill.setSelection(suggestedContentRange.index, 0);
        }
        onDecline();
        onShortcutUsed();
      } else if (e.key === 'ArrowRight' && e.shiftKey) {
        onTryAgain();
        onShortcutUsed();
      } else if (e.key === 'ArrowRight') {
        onAccept();
        onShortcutUsed();
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDecline, onTryAgain, onShortcutUsed, onAccept, quill, suggestedContentRange]);
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
    <div 
      className="inline-flex items-center bg-white rounded-lg shadow-md p-2 space-x-3"
      onKeyDown={handleKeyDown}
    >
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
        className="text-gray-600 hover:text-gray-800 transition-colors text-sm px-2 py-1 whitespace-nowrap flex items-center space-x-2"
        onClick={handleTryAgain}
      >
        <div className="bg-gray-100 rounded px-2 py-1 flex items-center space-x-1 text-xs">
          <span className="font-semibold">Shift</span>
          <span>+</span>
          <ArrowRight className="w-3 h-3" />
        </div>
        <span>Prøv igjen</span>
      </button>
    </div>
  );
}
