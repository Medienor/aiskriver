import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, Bookmark, Search, X, Check, Copy, Book, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SNLResult } from '@/types/SNLResult';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

interface SNLLookupProps {
  onCite: (citation: string, fullCitation: string, result: SNLResult) => void;
  selectedText: string;
  maintainSelection: () => void;
  onClose: () => void;
  articleId?: string; // Make this optional
  setIsTypingInSNLLookup: (isTyping: boolean) => void;
}

interface BingSearchResult {
  name: string;
  url: string;
  snippet: string;
  datePublished?: string;
  thumbnailUrl?: string;
}

interface RelatedSearch {
  text: string;
  displayText: string;
  webSearchUrl: string;
}

interface ScrapedContent {
  title: string;
  content: string;
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return '/default-favicon.png';
  }
}

const SNLLookup: React.FC<SNLLookupProps> = ({
  onCite,
  selectedText,
  maintainSelection,
  onClose,
  articleId,
  setIsTypingInSNLLookup
}) => {
  const [snlResults, setSnlResults] = useState<SNLResult[]>([]);
  const [isSnlLoading, setIsSnlLoading] = useState(false);
  const [snlSearchTerm, setSnlSearchTerm] = useState('');
  const [bingResults, setBingResults] = useState<BingSearchResult[]>([]);
  const [isBingLoading, setIsBingLoading] = useState(false);
  const [bingSearchTerm, setBingSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'leksikon' | 'oppdagelser'>('leksikon');
  const [citedArticles, setCitedArticles] = useState<Set<string>>(new Set());
  const [addedSnippets, setAddedSnippets] = useState<Set<string>>(new Set());
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());
  const [faviconErrors, setFaviconErrors] = useState<Set<string>>(new Set());
  const [relatedSearches, setRelatedSearches] = useState<RelatedSearch[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const snlSearchInputRef = useRef<HTMLInputElement>(null);
  const bingSearchInputRef = useRef<HTMLInputElement>(null);

  const searchSNL = useCallback(async (query: string) => {
    setIsSnlLoading(true);
    try {
      const response = await fetch(`https://snl.no/api/v1/search?query=${encodeURIComponent(query)}&limit=10&offset=0`);
      const data = await response.json();
      const newResults: SNLResult[] = await Promise.all(data.map(async (result: any) => {
        const articleResponse = await fetch(result.article_url_json);
        const articleData = await articleResponse.json();
        return {
          id: result.article_id,
          title: result.title,
          content: articleData.content,
          article_url: result.article_url,
          article_url_json: result.article_url_json,
          changed_at: articleData.changed_at,
          authors: articleData.authors,
          snippet: result.snippet
        };
      }));
      
      setSnlResults(newResults); // Replace existing results instead of appending
    } catch (error) {
      console.error('Error fetching SNL search results:', error);
    } finally {
      setIsSnlLoading(false);
    }
  }, []);

  const searchBing = useCallback(async (query: string) => {
    setIsBingLoading(true);
    try {
      console.log('Performing Bing search with query:', query);
      const response = await fetch(`/api/bing-search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, message: ${data.message || 'Unknown error'}`);
      }
      
      console.log('Bing search results:', data);
      setBingResults(data.webPages || []);
      setRelatedSearches(data.relatedSearches || []);
    } catch (error) {
      console.error('Error fetching Bing search results:', error);
      setBingResults([]);
      setRelatedSearches([]);
    } finally {
      setIsBingLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchArticleTitle = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('title')
          .eq('id', articleId)
          .single();

        if (error) throw error;

        if (data && data.title) {
          setBingSearchTerm(data.title);
          searchBing(data.title);
          
          // Split the title into words and search SNL for each word
          const words = data.title.split(/\s+/).filter((word: string) => word.length > 2);
          for (const word of words) {
            await searchSNL(word);
          }
        }
      } catch (error) {
        console.error('Error fetching article title:', error);
      }
    };

    fetchArticleTitle();
  }, [articleId, searchBing, searchSNL]);

  const handleSnlSearch = () => {
    if (snlSearchTerm.trim()) {
      setSnlResults([]); // Clear existing results
      searchSNL(snlSearchTerm);
    }
    if (snlSearchInputRef.current) {
      snlSearchInputRef.current.blur();
    }
    setIsTypingInSNLLookup(false);
    maintainSelection();
  };

  const handleBingSearch = () => {
    if (bingSearchTerm.trim()) {
      searchBing(bingSearchTerm);
    }
    if (bingSearchInputRef.current) {
      bingSearchInputRef.current.blur();
    }
    setIsTypingInSNLLookup(false);
    maintainSelection();
  };

  const scrapeContent = async (url: string) => {
    try {
      console.log(`Starting to scrape URL: ${url}`);
      const response = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { content } = await response.json();
      return content;
    } catch (error) {
      console.error('Error scraping content:', error);
      return '';
    }
  };

  const handleCite = useCallback((result: SNLResult) => {
    if (articleId) {
      // Use articleId
    } else {
      console.warn('Article ID is not provided');
      // Handle the case where articleId is not available
    }
    maintainSelection();
    const authors = formatAuthors(result.authors);
    const date = formatDate(result.changed_at);
    const citation = `(${authors}, ${date})`;
    const fullCitation = formatCitation(result);
    console.log('SNLLookup handleCite called with:', { citation, fullCitation, result });
    onCite(citation, fullCitation, result);
    setCitedArticles(prev => new Set(prev).add(result.article_id));
  }, [articleId, onCite]);

  const addToLibrary = async (result: BingSearchResult) => {
    const snippetId = uuidv4();
    try {
      const faviconUrl = getFaviconUrl(result.url);
      const scrapeResponse = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: result.url }),
      });

      if (!scrapeResponse.ok) {
        throw new Error(`HTTP error! status: ${scrapeResponse.status}`);
      }

      const { content } = await scrapeResponse.json();

      const snippetData = {
        id: snippetId,
        article_id: articleId,
        title: result.name,
        url: result.url,
        text: content,
        favicon_url: faviconUrl,
        source: 'bing',
        summary: result.snippet
      };

      const { data, error } = await supabase
        .from('search_snippets')
        .insert([snippetData]);

      if (error) throw error;

      setAddedSnippets(prev => new Set(prev).add(result.url));
    } catch (error) {
      console.error('Error adding snippet to library:', error);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedUrls(prev => new Set(prev).add(url));
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(url);
          return newSet;
        });
      }, 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
    });
  };

  const SkeletonCard = () => (
    <div className="p-2 flex flex-col justify-between">
      <div className="flex items-start space-x-2">
        <Skeleton className="w-6 h-6 rounded" />
        <div className="flex-1">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      </div>
      <div className="mt-2 flex space-x-1">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  const formatAuthors = (authors: { full_name: string }[]) => {
    if (!authors || authors.length === 0) return 'Ukjent forfatter';
    if (authors.length === 1) return authors[0].full_name;
    if (authors.length === 2) return `${authors[0].full_name} & ${authors[1].full_name}`;
    return `${authors[0].full_name} et al.`;
  };

  const formatCitation = (result: SNLResult) => {
    const authors = formatAuthors(result.authors);
    const date = formatDate(result.changed_at);
    return `${authors} (${date}). ${result.title}. I Store norske leksikon. Hentet fra ${result.article_url}`;
  };

  const handleImageError = (url: string) => {
    setFaviconErrors(prev => new Set(prev).add(url));
  };

  const getFaviconOrInitial = (result: BingSearchResult) => {
    if (faviconErrors.has(result.url)) {
      return (
        <div className="w-full h-full flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          {result.name[0].toUpperCase()}
        </div>
      );
    }
    return (
      <Image
        src={getFaviconUrl(result.url)}
        alt={result.name}
        width={16}
        height={16}
        className="object-contain"
        onError={() => handleImageError(result.url)}
      />
    );
  };

  return (
    <div 
      ref={containerRef}
      className="max-w-full w-full mx-auto space-y-2 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 overflow-hidden rounded-lg p-2 border border-gray-200 dark:border-gray-700"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2 flex-grow">
          <Button 
            variant={activeTab === 'leksikon' ? "default" : "ghost"} 
            size="sm" 
            className="h-6 text-[10px] font-semibold flex items-center px-2"
            onClick={() => setActiveTab('leksikon')}
          >
            <Book className="w-3 h-3 mr-1" /> Leksikon
          </Button>
          <Button 
            variant={activeTab === 'oppdagelser' ? "default" : "ghost"} 
            size="sm" 
            className="h-6 text-[10px] flex items-center px-2"
            onClick={() => setActiveTab('oppdagelser')}
          >
            <Globe className="w-3 h-3 mr-1" /> Internett søk
          </Button>
          <div className="flex-grow flex items-center space-x-2">
            <Input
              ref={activeTab === 'leksikon' ? snlSearchInputRef : bingSearchInputRef}
              type="text"
              placeholder={activeTab === 'leksikon' ? "Søk i Store norske leksikon..." : "Søk med Bing..."}
              value={activeTab === 'leksikon' ? snlSearchTerm : bingSearchTerm}
              onChange={(e) => activeTab === 'leksikon' ? setSnlSearchTerm(e.target.value) : setBingSearchTerm(e.target.value)}
              onFocus={() => setIsTypingInSNLLookup(true)}
              onBlur={() => setIsTypingInSNLLookup(false)}
              onKeyPress={(e) => e.key === 'Enter' && (activeTab === 'leksikon' ? handleSnlSearch() : handleBingSearch())}
              className="h-8 text-xs flex-grow dark:bg-gray-700 dark:text-gray-100"
            />
            <Button onClick={activeTab === 'leksikon' ? handleSnlSearch : handleBingSearch} size="sm" className="h-8">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button onClick={onClose} size="sm" variant="ghost">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="h-[calc(2*120px)] overflow-y-auto relative">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activeTab === 'leksikon' ? (
            isSnlLoading ? (
              Array(3).fill(0).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : (
              <>
                {snlResults.length > 0 ? (
                  snlResults.map((result) => (
                    <div 
                      key={result.article_id} 
                      className="p-2 flex flex-col justify-between"
                      onMouseEnter={maintainSelection}
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-bold rounded">
                          {result.title[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xs font-semibold">{result.title}</h2>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {formatCitation(result)}
                          </p>
                          <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            <span dangerouslySetInnerHTML={{ __html: result.snippet }} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-5 text-[10px] px-2 ${citedArticles.has(result.article_id) ? 'opacity-50' : ''}`}
                            onClick={() => handleCite(result)}
                            disabled={citedArticles.has(result.article_id)}
                            onMouseEnter={maintainSelection}
                          >
                            {citedArticles.has(result.article_id) ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-green-500" /> Lagt til
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3 mr-1" /> Siter
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-5 text-[10px] px-2" 
                            onClick={() => window.open(result.article_url, '_blank')}
                            onMouseEnter={maintainSelection}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Se
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-5 text-[10px] px-2"
                            onMouseEnter={maintainSelection}
                          >
                            <Bookmark className="w-3 h-3 mr-1" /> Lagre
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    Ingen resultater funnet. Prøv et annet søkeord.
                  </div>
                )}
              </>
            )
          ) : (
            <>
              {isBingLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <SkeletonCard key={`bing-${index}`} />
                ))
              ) : (
                <>
                  {bingResults.map((result: BingSearchResult, index) => (
                    <div 
                      key={`bing-${index}`} 
                      className="p-2 flex flex-col justify-between"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          {getFaviconOrInitial(result)}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xs font-semibold">{result.name}</h2>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">
                            {result.url}
                          </p>
                          <div className="text-[10px] text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                            {result.snippet}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-5 text-[10px] px-2" 
                            onClick={() => window.open(result.url, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Se
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-5 text-[10px] px-2 ${copiedUrls.has(result.url) ? 'bg-green-100 dark:bg-green-800' : ''}`}
                            onClick={() => copyToClipboard(result.url)}
                          >
                            {copiedUrls.has(result.url) ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-green-500" /> Kopiert
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" /> Kopier
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`h-5 text-[10px] px-2 ${addedSnippets.has(result.url) ? 'bg-green-100 dark:bg-green-800' : ''}`}
                            onClick={() => addToLibrary(result)}
                            disabled={addedSnippets.has(result.url)}
                          >
                            {addedSnippets.has(result.url) ? (
                              <>
                                <Check className="w-3 h-3 mr-1 text-green-500" /> Lagt til
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3 h-3 mr-1" /> Legg til i bibliotek
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {relatedSearches.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold mb-2">Relaterte søk:</h3>
                      <div className="flex flex-wrap gap-2">
                        {relatedSearches.map((search, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-6 px-2"
                            onClick={() => {
                              setBingSearchTerm(search.text);
                              searchBing(search.text);
                            }}
                          >
                            {search.displayText}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SNLLookup;
