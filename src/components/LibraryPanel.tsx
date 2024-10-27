"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ExternalLink, FileText, ChevronDown, ChevronUp, Loader, Copy, Plus, Check, Trash2, Info, FileUp, FileIcon, Search, Link, ChevronLeft, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { supabase } from '@/lib/supabase'
import { summarizeText } from '@/services/library-summarize-ai'
import { uploadPdf } from '@/services/PdfUploadService';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image'

interface LibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articleId: string;
  addToArticle: (content: string) => void;  // Add this line
}

interface Snippet {
  id: string;
  title: string;
  url: string;
  text: string;
  favicon_url: string;
  summary: string;
  ai_summary?: string;
  is_pdf?: boolean;
  file_name?: string;
  pdf_content?: string;
  pdf_sources?: string | string[];
  favorite?: boolean;
}

const NoSnippetsInfo: React.FC = () => (
  <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
    <div className="flex items-center mb-2">
      <Info className="h-5 w-5 mr-2" />
      <h4 className="font-semibold">Hvordan legge til snippets</h4>
    </div>
    <ol className="list-decimal list-inside space-y-2">
      <li>Klikk på &quot;AI Chat&quot; ikonet i navigasjonslinjen</li>
      <li>Søk etter informasjon på nettet ved å bruke @ symbolet (f.eks. @din søketekst)</li>
      <li>Lagre interessante snippets til biblioteket</li>
      <li>Oppsummer snippeten og bruk den i artikkelen din</li>
    </ol>
    <p className="mt-3">
      Ved å bruke snippets kan du enkelt finne og inkludere relevant informasjon i artikkelen din.
    </p>
  </div>
)

// Add this at the end of the file
const styles = `
  .search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-icon {
    position: absolute;
    left: 0.75rem;
    pointer-events: none;
  }
  .search-input {
    padding-left: 2.5rem;
    width: 100%;
  }
  .search-input:focus {
    outline: none;
    box-shadow: none;
  }
  .search-input::placeholder {
    color: #9CA3AF;
  }
  .dark .search-input::placeholder {
    color: #6B7280;
  }
`;

export default function LibraryPanel({ isOpen, onClose, articleId, addToArticle }: LibraryPanelProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());
  const [summarizingSnippets, setSummarizingSnippets] = useState<Set<string>>(new Set());
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSnippets();
    }
  }, [isOpen, articleId]);

  useEffect(() => {
    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    // Add event listener when the component mounts
    document.addEventListener("keydown", handleEscKey);

    // Remove event listener when the component unmounts
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  const fetchSnippets = async () => {
    try {
      const { data, error } = await supabase
        .from('search_snippets')
        .select('*')
        .eq('article_id', articleId);

      if (error) throw error;

      const sortedSnippets = (data || []).map(snippet => ({
        ...snippet,
        favorite: snippet.favorite === true || snippet.favorite === 'true'
      })).sort((a, b) => Number(b.favorite) - Number(a.favorite));

      setSnippets(sortedSnippets);
      console.log('Fetched snippets:', sortedSnippets);
    } catch (error) {
      console.error('Error fetching snippets:', error);
    }
  };

  const handleSummarize = async (snippet: Snippet) => {
    if (summarizingSnippets.has(snippet.id)) return;

    setSummarizingSnippets(prev => new Set(prev).add(snippet.id));

    try {
      let contentToSummarize = snippet.is_pdf ? snippet.pdf_content : snippet.text;
      
      if (!contentToSummarize) {
        // If content is not available in the snippet, fetch it from Supabase
        const { data, error } = await supabase
          .from('search_snippets')
          .select('pdf_content, text')
          .eq('id', snippet.id)
          .single();

        if (error) throw error;

        contentToSummarize = snippet.is_pdf ? data.pdf_content : data.text;
      }

      if (!contentToSummarize) {
        throw new Error('No content available to summarize');
      }

      const summary = await summarizeText(contentToSummarize, snippet.is_pdf);
      
      // Update the snippet in Supabase
      const { error } = await supabase
        .from('search_snippets')
        .update({ ai_summary: summary })
        .eq('id', snippet.id);

      if (error) throw error;

      // Update the local state
      setSnippets(prevSnippets => 
        prevSnippets.map(s => 
          s.id === snippet.id ? { ...s, ai_summary: summary } : s
        )
      );
    } catch (error) {
      console.error('Error summarizing snippet:', error);
    } finally {
      setSummarizingSnippets(prev => {
        const newSet = new Set(prev);
        newSet.delete(snippet.id);
        return newSet;
      });
    }
  };

  const toggleSnippet = (id: string) => {
    setExpandedSnippets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSummary = (id: string) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCopy = (content: string | undefined) => {
    if (!content) return; // Early return if content is undefined

    // Create a temporary element to parse the HTML
    const temp = document.createElement('div');
    temp.innerHTML = content;

    // Extract the text content, preserving basic structure
    const extractedContent = Array.from(temp.childNodes).map(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        switch (element.tagName.toLowerCase()) {
          case 'h2':
            return `## ${element.textContent}\n\n`;
          case 'h3':
            return `### ${element.textContent}\n\n`;
          case 'p':
            return `${element.textContent}\n\n`;
          default:
            return element.textContent;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      return '';
    }).join('');

    navigator.clipboard.writeText(extractedContent).then(() => {
      setShowCopyNotification(true);
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 3000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleAddToArticle = (content: string) => {
    // Remove empty lines and trim each line
    const cleanedContent = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .join('\n');

    addToArticle(cleanedContent);
    // Optionally, you can add some feedback here, like a toast notification
  };

  const truncateSummary = (summary: string, maxLength: number = 100) => {
    if (summary.length <= maxLength) return summary;
    return summary.substr(0, maxLength) + '...';
  };

  const handleDelete = async (snippetId: string) => {
    try {
      const { error } = await supabase
        .from('search_snippets')
        .delete()
        .eq('id', snippetId);

      if (error) throw error;

      // Remove the snippet from the local state
      setSnippets(prevSnippets => prevSnippets.filter(s => s.id !== snippetId));
    } catch (error) {
      console.error('Error deleting snippet:', error);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const newSnippet = await uploadPdf({
        file,
        articleId,
        chatUuid: uuidv4() // Add this import if not already present: import { v4 as uuidv4 } from 'uuid';
      });
      setSnippets(prevSnippets => [...prevSnippets, newSnippet]);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsUploading(false);
    }
  };

  const toggleSources = (id: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAddSource = (source: string) => {
    // Implement the logic to add the source as a reference
    console.log(`Adding source: ${source}`);
    // You might want to call a function here that adds the source to your article or references list
  };

  const toggleFavorite = async (snippet: Snippet) => {
    console.log('Toggling favorite for snippet:', snippet.id, 'Current status:', snippet.favorite);
    try {
      const newFavoriteStatus = !snippet.favorite;
      
      // Update Supabase first
      const { data, error } = await supabase
        .from('search_snippets')
        .update({ favorite: newFavoriteStatus })
        .eq('id', snippet.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        console.log('Updated snippet data:', data);
        // If Supabase update is successful, update local state
        setSnippets(prevSnippets =>
          prevSnippets.map(s =>
            s.id === snippet.id ? { ...s, favorite: newFavoriteStatus } : s
          ).sort((a, b) => Number(b.favorite) - Number(a.favorite)) // Sort favorites first
        );
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Optionally, you can show an error message to the user here
    }
  };

  return (
    <motion.div
      className="fixed right-0 top-0 h-full w-1/3 bg-white dark:bg-gray-800 shadow-lg z-50"
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? 0 : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full flex-col">
        <header className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bibliotek</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 dark:text-gray-300">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-4">
          {snippets.length === 0 ? (
            <NoSnippetsInfo />
          ) : (
            <div className="space-y-4 relative">
              <AnimatePresence>
                {snippets.map((snippet, index) => (
                  <motion.div
                    key={snippet.id}
                    layout
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
                    style={{ zIndex: snippets.length - index }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {snippet.is_pdf ? (
                          <FileIcon className="w-4 h-4 mr-2 text-red-500" />
                        ) : (
                          <Image 
  src={snippet.favicon_url} 
  alt="Favicon" 
  width={16} 
  height={16} 
  className="mr-2"
/>
                        )}
                        <h3 className="font-semibold text-gray-900 dark:text-white">{snippet.title}</h3>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(snippet)}
                        className="p-1"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            snippet.favorite === true ? 'text-yellow-400 fill-current' : 'text-gray-400'
                          }`}
                        />
                      </Button>
                    </div>
                    {!snippet.is_pdf && (
                      <div className="relative h-12 overflow-hidden">
                        <div 
                          className="text-sm mb-2 line-clamp-2 text-gray-700 dark:text-gray-300"
                          style={{
                            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                            maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)'
                          }}
                        >
                          {snippet.summary}
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-2 mt-4 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="-ml-2 flex space-x-2 items-center justify-between w-full">
                        <div className="flex space-x-2">
                          {snippet.is_pdf ? (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs flex items-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
                              onClick={() => toggleSources(snippet.id)}
                            >
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Se kilder
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs flex items-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
                              onClick={() => window.open(snippet.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Se kilde
                            </Button>
                          )}
                          <div className="relative">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs flex items-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
                              onClick={() => snippet.ai_summary ? toggleSummary(snippet.id) : handleSummarize(snippet)}
                              onMouseEnter={() => setActiveTooltip(snippet.id)}
                              onMouseLeave={() => setActiveTooltip(null)}
                            >
                              {summarizingSnippets.has(snippet.id) ? (
                                <Loader className="h-3 w-3 mr-1 animate-spin" />
                              ) : snippet.ai_summary ? (
                                expandedSummaries.has(snippet.id) ? (
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                )
                              ) : (
                                <FileText className="h-3 w-3 mr-1" />
                              )}
                              {summarizingSnippets.has(snippet.id) ? 'Oppsummerer...' : 
                               snippet.ai_summary ? 
                                 (expandedSummaries.has(snippet.id) ? 'Lukk oppsummering' : 'Se oppsummering') 
                               : 'Oppsumer'}
                            </Button>
                            {activeTooltip === snippet.id && !snippet.ai_summary && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded py-1 px-2 shadow-lg border border-gray-200 dark:border-gray-700">
                                <div className="text-center">
                                  Innhold.AI vil oppsumere hele artikkelen og finne relevante utdrag du kan bruke
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs flex items-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200"
                                onClick={() => handleDelete(snippet.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Slett denne</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedSources.has(snippet.id) && snippet.is_pdf && snippet.pdf_sources && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden"
                        >
                          <div className="p-2 search-input-wrapper">
                            <Search className="h-4 w-4 text-gray-400 search-icon" />
                            <Input
                              type="text"
                              placeholder="Søk i kilder..."
                              value={sourceSearch}
                              onChange={(e) => setSourceSearch(e.target.value)}
                              className="text-xs bg-white dark:bg-gray-800 h-8 search-input"
                            />
                          </div>
                          <div className="h-40 overflow-y-auto px-2" style={{ scrollbarWidth: 'thin' }}>
                            <ul className="space-y-1">
                              {(Array.isArray(snippet.pdf_sources) ? snippet.pdf_sources : snippet.pdf_sources.split(', '))
                                .filter(source => source && source.toLowerCase().includes(sourceSearch.toLowerCase()))
                                .map((source, index) => (
                                  <li key={index} className="flex justify-between items-center text-[10px] relative">
                                    <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-gray-300 hover:underline truncate mr-2">
                                      {source}
                                    </a>
                                    <div className="relative">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleAddSource(source)}
                                        className="p-1"
                                        onMouseEnter={() => setActiveTooltip(source)}
                                        onMouseLeave={() => setActiveTooltip(null)}
                                      >
                                        <Plus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                      </Button>
                                      <AnimatePresence>
                                        {activeTooltip === source && (
                                          <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-2 py-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-[8px] rounded shadow-lg whitespace-nowrap"
                                          >
                                            Legg til som kildehenvisning
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <AnimatePresence>
                      {expandedSummaries.has(snippet.id) && snippet.ai_summary && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-2 bg-white dark:bg-gray-600 p-4 rounded overflow-hidden"
                        >
                          <div 
                            id="oppsummeringbox"
                            className="text-sm mb-2 prose dark:prose-invert max-w-none summary-content"
                            dangerouslySetInnerHTML={{ __html: snippet.ai_summary }}
                          />
                          <div className="flex space-x-2 mt-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => snippet.ai_summary && handleCopy(snippet.ai_summary)}
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Kopier
                            </Button>
                            <div className="relative">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-xs flex items-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => handleAddToArticle(snippet.ai_summary!)}
                                onMouseEnter={() => setActiveTooltip(`add-to-article-${snippet.id}`)}
                                onMouseLeave={() => setActiveTooltip(null)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Legg til i artikkel
                              </Button>
                              {activeTooltip === `add-to-article-${snippet.id}` && (
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded py-1 px-2 shadow-lg border border-gray-200 dark:border-gray-700">
                                  <div className="text-center">
                                    Oppsummeringen blir lagt til i dokumentet ditt.
                                  </div>
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('pdf-upload')?.click()}
              disabled={isUploading}
              className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onMouseEnter={() => setActiveTooltip('pdf-upload')}
              onMouseLeave={() => setActiveTooltip(null)}
            >
              {isUploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  Laster opp...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  Last opp PDF
                </>
              )}
            </Button>
            {activeTooltip === 'pdf-upload' && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded py-1 px-2 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  Last opp PDF som AI vil oppsummere. Kan gjennbrukes i eget dokument
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-gray-800"></div>
              </div>
            )}
          </div>
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf"
            className="hidden"
            onChange={handlePdfUpload}
          />
        </div>
      </div>
      <AnimatePresence>
        {showCopyNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-700 shadow-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              <Check className="text-green-500 h-6 w-6 mr-2" />
              <p className="text-sm font-medium">Din tekst har blitt kopiert</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowCopyNotification(false)}
            >
              Lukk
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        .summary-content h2 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1a202c;
        }
        .dark .summary-content h2 {
          color: #e2e8f0;
        }
        .summary-content p {
          font-size: 0.8rem;
          margin-bottom: 10px;
          color: #4a5568;
        }
        .dark .summary-content p {
          color: #a0aec0;
        }
      `}</style>
      <style jsx global>{styles}</style>
    </motion.div>
  )
}
