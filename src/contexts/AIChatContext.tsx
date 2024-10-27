import React, { createContext, useContext, useState } from 'react';

interface AIChatContextType {
  isAIChatOpen: boolean;
  toggleAIChat: () => void;
}

const AIChatContext = createContext<AIChatContextType | undefined>(undefined);

export const AIChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const toggleAIChat = () => {
    setIsAIChatOpen(prev => !prev);
  };

  return (
    <AIChatContext.Provider value={{ isAIChatOpen, toggleAIChat }}>
      {children}
    </AIChatContext.Provider>
  );
};

export const useAIChat = () => {
  const context = useContext(AIChatContext);
  if (context === undefined) {
    throw new Error('useAIChat must be used within an AIChatProvider');
  }
  return context;
};

export default AIChatContext;
