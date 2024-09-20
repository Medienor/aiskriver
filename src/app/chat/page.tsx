'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, X, Check, Save } from 'lucide-react'; // Added Save import
import { performQuickWebSearch } from '@/services/ExaChatService';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase'; // Corrected import path
import { v4 as uuidv4 } from 'uuid'; // Import uuid library
import { useSession } from 'next-auth/react'; // Import useSession from next-auth/react

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  text: string;
  favicon: string;
  summary: string;
}

const chatStyles = {
  h3: {
    fontWeight: 600,
    marginBottom: '1.5rem',
    fontSize: '1.1rem',
    lineHeight: '1.75rem',
    color: '#1a202c', // dark gray for light mode
  },
  p: {
    marginBottom: '1.5rem',
    color: '#4a5568', // medium gray for light mode
  },
  ul: {
    marginBottom: '1.5rem',
    paddingLeft: '1.5rem',
    listStyleType: 'disc', // Add this line to show bullet points
  },
  li: {
    marginBottom: '0.5rem',
    color: '#4a5568', // medium gray for light mode
  },
};

const darkChatStyles = {
  h3: {
    ...chatStyles.h3,
    color: '#e2e8f0', // light gray for dark mode
  },
  p: {
    ...chatStyles.p,
    color: '#cbd5e0', // lighter gray for dark mode
  },
  ul: {
    ...chatStyles.ul,
  },
  li: {
    ...chatStyles.li,
    color: '#cbd5e0', // lighter gray for dark mode
  },
};

const SkeletonLoader = () => (
  <div className="flex items-center space-x-2">
    <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-4 w-4"></div>
    <div className="flex-1">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
    </div>
  </div>
);

interface SearchResultSet {
  query: string;
  results: SearchResult[];
  summary: string;
  gridBoxes: SearchResult[];
}

export default function AIChat() {
  const { data: session } = useSession(); // Get session from next-auth
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultSets, setSearchResultSets] = useState<SearchResultSet[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultSet, setSelectedResultSet] = useState<SearchResultSet | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(true);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [showLoadingEffect, setShowLoadingEffect] = useState(false);
  const [showTopSearchBox, setShowTopSearchBox] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [disabledSaveButtons, setDisabledSaveButtons] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowLoadingEffect(true);

    try {
      const response = await performQuickWebSearch(searchQuery);
      
      const newResultSet: SearchResultSet = {
        query: searchQuery,
        results: response.results,
        summary: '',
        gridBoxes: response.results.slice(0, 4)
      };

      setSearchResultSets(prev => [...prev, newResultSet]);
      
      // Handle streaming of finalSummary
      const reader = response.finalSummaryStream.getReader();
      const decoder = new TextDecoder();
      
      setIsStreaming(true);
      let summary = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') break;
            try {
              const parsedData = JSON.parse(data);
              if (parsedData.content) {
                summary += parsedData.content;
                setSearchResultSets(prev => {
                  const newSets = [...prev];
                  newSets[newSets.length - 1].summary = summary;
                  return newSets;
                });
              }
            } catch (error) {
              console.error('Error parsing JSON:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setIsSearching(false);
      setIsStreaming(false);
      setShowLoadingEffect(false);
      setSearchQuery('');
      if (searchResultSets.length === 0) {
        setShowTopSearchBox(false);
      }
      if (summaryRef.current) {
        summaryRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (resultSet: SearchResultSet) => {
    setSelectedResultSet(resultSet);
  };

  const applyStylesToContent = (content: string, isDarkMode: boolean) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    const styles = isDarkMode ? darkChatStyles : chatStyles;

    doc.querySelectorAll('h3').forEach(el => Object.assign(el.style, styles.h3));
    doc.querySelectorAll('p').forEach(el => Object.assign(el.style, styles.p));
    doc.querySelectorAll('ul').forEach(el => Object.assign(el.style, styles.ul));
    doc.querySelectorAll('li').forEach(el => Object.assign(el.style, styles.li));

    return doc.body.innerHTML;
  };

  const handleSaveSnippet = async (resultSet: SearchResultSet, index: number) => {
    if (!session || !session.user || !session.user.email) {
      console.error('User not logged in');
      return;
    }

    setDisabledSaveButtons(prev => [...prev, resultSet.query]);

    const snippetId = uuidv4(); // Generate a UUID for the snippet_id

    const { error } = await supabase
      .from('saved_snippets')
      .insert([
        { user_id: session.user.email, snippet_id: snippetId, snippet: resultSet.summary, title: resultSet.query, date: new Date() }
      ]);

    if (error) {
      console.error('Error saving snippet:', error);
    } else {
      console.log('Snippet saved successfully');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl">
        <AnimatePresence>
          {showTopSearchBox && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SearchForm
                searchQuery={searchQuery}
                handleInputChange={handleInputChange}
                handleSearch={handleSearch}
                isSearching={isSearching}
                showLoadingEffect={showLoadingEffect}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {searchResultSets.map((resultSet, setIndex) => (
          <div key={setIndex} className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Søkeresultater for &quot;{resultSet.query}&quot;
            </h2>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-4 gap-4 mb-6"
            >
              {resultSet.gridBoxes.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
                  onClick={() => handleResultClick(resultSet)}
                >
                  <div className="flex items-center space-x-2">
                    <Image 
                      src={result.favicon} 
                      alt={`${result.title} favicon`} 
                      width={16} 
                      height={16} 
                      className="rounded-sm"
                    />
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {resultSet.summary && (
              <motion.div 
                ref={setIndex === searchResultSets.length - 1 ? summaryRef : null}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6"
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Oppsummering</h2>
                <div 
                  className="text-gray-700 dark:text-gray-300 max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: applyStylesToContent(
                      resultSet.summary, 
                      document.documentElement.classList.contains('dark')
                    ) 
                  }}
                />
                <Button
                  onClick={() => handleSaveSnippet(resultSet, setIndex)}
                  className="mt-4 flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white"
                  disabled={disabledSaveButtons.includes(resultSet.query)}
                >
                  {disabledSaveButtons.includes(resultSet.query) ? <Check size={16} /> : <Save size={16} />}
                  <span>{disabledSaveButtons.includes(resultSet.query) ? 'Lagret' : 'Lagre'}</span>
                </Button>
              </motion.div>
            )}

            {setIndex === searchResultSets.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <SearchForm
                  searchQuery={searchQuery}
                  handleInputChange={handleInputChange}
                  handleSearch={handleSearch}
                  isSearching={isSearching}
                  showLoadingEffect={showLoadingEffect}
                />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedResultSet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setSelectedResultSet(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed top-0 right-0 w-full md:w-1/2 lg:w-1/3 h-full bg-white dark:bg-gray-800 shadow-lg overflow-y-auto z-50"
            >
              <div className="p-6">
                <button
                  onClick={() => setSelectedResultSet(null)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Kilder:</h2>
                <div className="space-y-4">
                  {selectedResultSet.results.map((result, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                      <Image 
                        src={result.favicon} 
                        alt={`${result.title} favicon`} 
                        width={16} 
                        height={16} 
                        className="rounded-sm"
                      />
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#06f] hover:underline flex-grow truncate"
                      >
                        {result.title}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50"
          >
            Vi har lagret innholdet til din profil. Du kan bruke den igjen senere.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingEffect() {
  return (
    <div className="flex items-center space-x-4 mt-6">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <div className="flex-grow">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
      </div>
    </div>
  );
}

function SearchForm({ searchQuery, handleInputChange, handleSearch, isSearching, showLoadingEffect }: {
  searchQuery: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: (e: React.FormEvent) => Promise<void>;
  isSearching: boolean;
  showLoadingEffect: boolean;
}) {
  return (
    <form onSubmit={handleSearch} className="mb-4">
      <div className="relative group">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Spør om hva som helst.."
          className="w-full pr-12 py-6 text-lg rounded-full shadow-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 transition-all duration-300 ease-in-out"
        />
        <Button 
          type="submit" 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-full p-2 transition-all duration-300 ease-in-out"
          disabled={isSearching}
        >
          <Search size={24} />
        </Button>
      </div>
      {showLoadingEffect && <LoadingEffect />}
    </form>
  );
}