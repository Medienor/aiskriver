import React, { createContext, useState, useContext, useCallback } from 'react';

interface Source {
  id: string;
  fullCitation: string;
}

interface SourcesContextType {
  sources: Source[];
  addSource: (source: Source) => void;
  removeSource: (id: string) => void;
}

const SourcesContext = createContext<SourcesContextType | undefined>(undefined);

export const SourcesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sources, setSources] = useState<Source[]>([]);

  const addSource = useCallback((source: Source) => {
    setSources(prev => {
      if (!prev.some(s => s.id === source.id)) {
        return [...prev, source];
      }
      return prev;
    });
  }, []);

  const removeSource = useCallback((id: string) => {
    setSources(prev => prev.filter(source => source.id !== id));
  }, []);

  return (
    <SourcesContext.Provider value={{ sources, addSource, removeSource }}>
      {children}
    </SourcesContext.Provider>
  );
};

export const useSources = () => {
  const context = useContext(SourcesContext);
  if (context === undefined) {
    throw new Error('useSources must be used within a SourcesProvider');
  }
  return context;
};
