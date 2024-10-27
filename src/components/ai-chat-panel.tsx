"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { ChevronRight, Search, Loader, Copy, Plus, Check, ExternalLink, ChevronLeft, Loader2, Clock, ChevronDown, Trash2, FileUp, Upload, Globe, Target, ChevronUp, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from 'uuid';
import { format, subHours } from 'date-fns';
import { nb } from 'date-fns/locale';
import DOMPurify from 'dompurify'
import { uploadPdf } from '@/services/PdfUploadService';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Add this import at the top



interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articleContent: string;
  articleId: string;
  chatUuid: string | null; // Allow null
  addToArticle: (content: string) => void;
}

interface Category {
  name: string;
  value: string;
}

interface Snippet {
  id: string;
  text: string;
  chat_uuid: string;
  // ... other fields
}

interface BingSearchResult {
  name: string;
  url: string;
  snippet: string;
  datePublished?: string;
  thumbnailUrl?: string;
}

interface ChatHistoryItem {
  chat_uuid: string;
  created_at: string;
  messages: string; // JSON string of messages
  // Add other relevant fields
}

type SearchMessage = {
  role: 'search';
  content: string;
  searchResults?: BingSearchResult[];
  relatedSearches?: string[];
};

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return '/default-favicon.png';
  }
}

const loadingTexts = ["Scanner...", "Søker...", "Jobber...", "Snart kommer det..."];

// Simple markdown to HTML conversion function
function markdownToHtml(markdown: string) {
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*)$/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
    .replace(/\[(.*?)\]\((.*?)\)/gim, "<a href='$2'>$1</a>")
    .replace(/\n$/gim, '<br />')
    .replace(/^```([\s\S]*?)```$/gm, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('');
}

type Message = {
  role: 'system' | 'user' | 'search';
  content: string;
  searchResults?: any[];
  fullText?: string;
};

// Add this function near the top of your component
const updateSupabaseChat = async (newMessages: Message[], chatUuid: string | null, articleId: string) => {
  if (!chatUuid) {
    console.error('No chat UUID provided for updateSupabaseChat');
    return;
  }

  console.log('Updating Supabase chat history:', { chatUuid, articleId, newMessages });
  try {
    // First, check if the chat already exists
    const { data: existingChat, error: fetchError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_uuid', chatUuid)
      .eq('article_id', articleId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;
    if (existingChat) {
      console.log('Updating existing chat');
      result = await supabase
        .from('chat_history')
        .update({ 
          messages: JSON.stringify(newMessages)
        })
        .eq('chat_uuid', chatUuid)
        .eq('article_id', articleId);
    } else {
      console.log('Inserting new chat');
      result = await supabase
        .from('chat_history')
        .insert({ 
          chat_uuid: chatUuid, 
          messages: JSON.stringify(newMessages),
          article_id: articleId
        });
    }

    if (result.error) throw result.error;
    console.log('Supabase chat history updated successfully');
  } catch (error) {
    console.error('Error updating chat history in Supabase:', error);
  }
};

const renderSourcesBox = (
  searchResults: BingSearchResult[],
  activeTooltip: string | null,
  setActiveTooltip: (index: string | null) => void,
  expandedSnippets: { [key: string]: boolean },
  setExpandedSnippets: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>,
  articleId: string,
  currentChatUuid: string | null
) => {
  const saveToLibrary = async (result: BingSearchResult) => {
    try {
      const snippetData = {
        id: uuidv4(),
        article_id: articleId, // Make sure articleId is accessible here
        title: result.name,
        url: result.url,
        favicon_url: getFaviconUrl(result.url),
        text: result.snippet,
        created_at: new Date().toISOString(),
        chat_uuid: currentChatUuid // Add this if you want to track which chat the snippet came from
      };

      const { error } = await supabase
        .from('search_snippets')
        .insert(snippetData);

      if (error) throw error;
      
      // Optionally show success message
      console.log('Snippet saved successfully');
    } catch (error) {
      console.error('Error saving snippet:', error);
    }
  };

  const FaviconWithTooltip = ({ result }: { result: BingSearchResult }) => {
    const isExpanded = expandedSnippets[result.url] || false;
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = async (result: BingSearchResult) => {
      try {
        const snippetData = {
          id: uuidv4(),
          article_id: articleId,
          title: result.name,
          url: result.url,
          favicon_url: getFaviconUrl(result.url),
          summary: result.snippet,
          text: result.snippet,
          created_at: new Date().toISOString(),
          chat_uuid: currentChatUuid
        };

        const { error } = await supabase
          .from('search_snippets')
          .insert(snippetData);

        if (error) throw error;
        
        // Set saved state to true after successful save
        setIsSaved(true);
      } catch (error) {
        console.error('Error saving snippet:', error);
      }
    };

    return (
      <div className="relative">
        <Image 
  src={getFaviconUrl(result.url)} 
  alt={`favicon for ${result.name}`} 
  width={16}
  height={16}
  className="rounded-full cursor-pointer"
  onMouseEnter={() => setActiveTooltip(result.url)}
/>
        {activeTooltip === result.url && (
          <div 
            className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-[250px] bg-white dark:bg-[#1c2840] text-gray-800 dark:text-gray-200 text-xs rounded-lg py-2 px-3 shadow-lg border border-gray-200 dark:border-[#2e394f] z-50"
            onMouseEnter={() => setActiveTooltip(result.url)}
            onMouseLeave={() => {
              setActiveTooltip(null);
              setExpandedSnippets({});
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="font-semibold text-xs">{result.name}</div>
              <div className="text-gray-600 dark:text-gray-300 text-[0.7rem]">
                <div className={`${!isExpanded ? 'line-clamp-2' : ''}`}>
                  {result.snippet}
                </div>
                {!isExpanded && (
                  <button
                    onClick={() => setExpandedSnippets(prev => ({ ...prev, [result.url]: true }))}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 inline-flex items-center mt-1"
                  >
                    Les mer
                  </button>
                )}
              </div>
              <div className="flex gap-2 mt-1">
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[0.7rem] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-[0.2rem] px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Besøk <ExternalLink className="w-3 h-3 ml-1" />
                </a>
                <button
                  onClick={() => !isSaved && handleSave(result)}
                  disabled={isSaved}
                  className="flex items-center text-[0.7rem] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-[0.2rem] px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaved ? 'Lagret' : 'Lagre'} {isSaved ? <Check className="w-3 h-3 ml-1 text-green-500" /> : <Bookmark className="w-3 h-3 ml-1" />}
                </button>
              </div>
            </div>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2 border-4 border-transparent border-r-white dark:border-r-[#1c2840]"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-2 bg-white dark:bg-[#1c2840] rounded-lg shadow-sm mb-2 w-full">
      <h2 className="text-sm font-semibold mb-2 flex items-center gap-1 text-gray-800 dark:text-gray-200">
        <Globe className="w-3 h-3" />
        Kilder
      </h2>
      <div className="flex flex-wrap gap-2 items-center">
        {searchResults.map((result, index) => (
          <FaviconWithTooltip key={index} result={result} />
        ))}
      </div>
    </div>
  );
};

const renderWebSearchResults = (
  content: string,
  handleCopy: (content: string) => void,
  addToArticle: (content: string) => void,
  activeTooltip: string | null,
  setActiveTooltip: (tooltip: string | null) => void,
  index: number
) => {
  return (
    <div className="bg-white dark:bg-[#1c2840] rounded-lg p-2">
      <div 
        className="ai-chat-content prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
      <div className="mt-4 flex space-x-2">
        <Button 
          size="sm" 
          variant="ghost" 
          className="hover:bg-gray-100 dark:hover:bg-transparent text-gray-600 dark:text-[#9198a1]"
          onClick={() => handleCopy(content)}
        >
          <Copy className="h-4 w-4 mr-2" />
          Kopier
        </Button>
        <div className="relative">
          <Button 
            size="sm" 
            variant="ghost" 
            className="hover:bg-gray-100 dark:hover:bg-transparent text-gray-600 dark:text-[#9198a1]"
            onClick={() => addToArticle(content)}
            onMouseEnter={() => setActiveTooltip(`add-${index}`)}
            onMouseLeave={() => setActiveTooltip(null)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Legg til i artikkel
          </Button>
          {activeTooltip === `add-${index}` && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded py-1 px-2 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                Legg til svaret i dokumentet.
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2 border-4 border-transparent border-r-white dark:border-r-gray-800"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const renderRelatedSearchesBox = (
  relatedSearches: string[],
  handleRelatedSearch: (search: string) => void
) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-2 w-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
        <ChevronRight className="w-5 h-5" />
        Relatert
      </h2>
      <div className="flex flex-col gap-2">
        {relatedSearches.map((search, index) => (
          <button
            key={index}
            className="flex justify-between items-center w-full text-left text-sm p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            onClick={() => handleRelatedSearch(search)}
          >
            <span className="text-gray-700 dark:text-gray-200">{search}</span>
            <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default function AIChatPanel({
  isOpen,
  onClose,
  articleContent,
  articleId,
  chatUuid,  // Use the original prop name
  addToArticle,
}: AIChatPanelProps) {
  const { data: sessionData } = useSession();
  const initialMessage = "Hei! Jeg er din AI-forskningsassistent fra Innhold.AI. Hvordan kan jeg hjelpe deg med ditt nåværende tema?";
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Hva kan forbedres?",
    "Hva mangler jeg?"
  ]);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: initialMessage }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [loadingText, setLoadingText] = useState(loadingTexts[0]);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isWebSearching, setIsWebSearching] = useState(false)
  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [addedSnippets, setAddedSnippets] = useState<Set<string>>(new Set());
  const [showWebIndicator, setShowWebIndicator] = useState(false);
  const [bingResults, setBingResults] = useState<BingSearchResult[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;
  const [loadingSnippets, setLoadingSnippets] = useState<Set<string>>(new Set());
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [currentChatUuid, setCurrentChatUuid] = useState<string | null>(chatUuid);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [recentChats, setRecentChats] = useState<Date[]>([]);
  const [isOverLimit, setIsOverLimit] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const newChatButtonRef = useRef<HTMLButtonElement>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [supabaseQuestions, setSupabaseQuestions] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const activeChatUuidRef = useRef<string | null>(null);
  const [selectedChatUuid, setSelectedChatUuid] = useState<string | null>(null);
  const lastUploadedChatRef = useRef<string | null>(null);
  const forceUpdateRef = useRef<number>(0);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [expandedSnippets, setExpandedSnippets] = useState<{ [key: string]: boolean }>({});


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  useEffect(() => {
    if (isOpen && sessionData?.user?.id && articleId) {
      console.log('Initiating chat fetch with chat UUID:', chatUuid);
      if (chatUuid) {
        activeChatUuidRef.current = chatUuid;
        setCurrentChatUuid(chatUuid);
      }
      fetchLatestChat();
    }
  }, [isOpen, sessionData?.user?.id, articleId, chatUuid]);

  useEffect(() => {
    if (showChatHistory) {
      fetchAllChats();
    }
  }, [showChatHistory]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowChatHistory(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setShowWebIndicator(input.startsWith('@'));
  }, [input]);

  useEffect(() => {
    const now = new Date();
    const oneHourAgo = subHours(now, 1);
    const recentChatsWithinHour = recentChats.filter(date => date > oneHourAgo);
    setIsOverLimit(recentChatsWithinHour.length >= 5);
  }, [recentChats]);



// Add this cleanup effect
useEffect(() => {
  return () => {
    // Clear states when component unmounts
    setSelectedChatUuid(null);
    setCurrentChatUuid(null);
    activeChatUuidRef.current = null;
  };
}, []);


// Add this effect to sync states
useEffect(() => {
  if (selectedChatUuid) {
    console.log('🔄 Syncing chat states:', {
      selectedChat: selectedChatUuid,
      currentChat: currentChatUuid,
      activeRef: activeChatUuidRef.current
    });
    
    setCurrentChatUuid(selectedChatUuid);
    activeChatUuidRef.current = selectedChatUuid;
  }
}, [selectedChatUuid]);



  useEffect(() => {
    if (chatUuid) {
      fetchChatHistory();
    } else {
      // If it's a new chat, add the initial message
      setMessages([{ role: 'system', content: initialMessage }]);
    }
  }, [chatUuid]);

  useEffect(() => {
    if (articleId) {
      fetchQuestionsFromSupabase();
    }
  }, [articleId]);

  const fetchLatestChat = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching latest chat...');
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
  
      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No existing chat found. Creating new chat...');
          const newUuid = uuidv4();
          setCurrentChatUuid(newUuid);
          activeChatUuidRef.current = newUuid;
          setMessages([{ role: 'system', content: initialMessage }]);
          
          // Create new chat in Supabase
          await addNewChatToSupabase(newUuid);
        } else {
          throw error;
        }
      } else if (data) {
        console.log('Existing chat found:', data);
        setCurrentChatUuid(data.chat_uuid);
        activeChatUuidRef.current = data.chat_uuid;
        console.log('Set chat UUID to:', data.chat_uuid);
        
        try {
          const parsedMessages = JSON.parse(data.messages);
          console.log('Parsed messages:', parsedMessages);
          setMessages(parsedMessages);
        } catch (e) {
          console.error('Error parsing messages:', e);
          setMessages([{ role: 'system', content: initialMessage }]);
        }
      }
    } catch (error) {
      console.error('Error fetching latest chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllChats = async () => {
    if (!articleId) return;

    setIsLoadingHistory(true);
    try {
      console.log('Fetching all chats for article:', articleId);
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched chats:', data);
      setChatHistory(data || []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Update handleChatSelect to ensure UUID sync
  const handleChatSelect = async (selectedUuid: string) => {
    console.log('🎯 Selecting chat:', selectedUuid);
    
    // Update all UUID states immediately
    setSelectedChatUuid(selectedUuid);
    setCurrentChatUuid(selectedUuid);
    activeChatUuidRef.current = selectedUuid;
    
    console.log('📍 Chat context updated:', {
      selected: selectedUuid,
      current: currentChatUuid,
      ref: activeChatUuidRef.current
    });
  
    const selectedChat = chatHistory.find(chat => chat.chat_uuid === selectedUuid);
    if (selectedChat) {
      try {
        const parsedMessages = JSON.parse(selectedChat.messages);
        setMessages(parsedMessages);
        await fetchSnippets(selectedUuid);
        
        console.log('✅ Chat loaded:', {
          uuid: selectedUuid,
          messagesCount: parsedMessages.length,
          hasSnippets: await hasExistingSnippets(selectedUuid)
        });
      } catch (error) {
        console.error('❌ Error loading chat:', error);
      }
    }
    setShowChatHistory(false);
  };

  // Add function to check for existing snippets
const hasExistingSnippets = async (chatUuid: string) => {
  try {
    const { data, error } = await supabase
      .from('search_snippets')
      .select('id')
      .eq('chat_uuid', chatUuid)
      .limit(1);
      
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking snippets:', error);
    return false;
  }
};

  const handleNewChat = () => {
    console.log('handleNewChat called');
    const newChatUuid = uuidv4();
    console.log('Generated new chat UUID:', newChatUuid);
    setCurrentChatUuid(newChatUuid);
    setMessages([{ role: 'system', content: initialMessage }]);
    console.log('Set initial message for new chat');
    // Add the new chat to Supabase
    addNewChatToSupabase(newChatUuid);
  };

  const addNewChatToSupabase = async (newChatUuid: string) => {
    console.log('addNewChatToSupabase called with UUID:', newChatUuid);
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .insert({
          chat_uuid: newChatUuid,
          article_id: articleId,
          messages: JSON.stringify([{ role: 'system', content: initialMessage }])
        });

      if (error) throw error;
      console.log('New chat added to Supabase:', data);
      // Refresh the chat history
      fetchAllChats();
    } catch (error) {
      console.error('Error adding new chat to Supabase:', error);
    }
  };

  const handleSend = async (inputToSend: string = input, isRelatedSearch: boolean = false) => {
    if (!inputToSend.trim()) return;

    const isWebSearch = inputToSend.startsWith('@');
    const cleanInput = isWebSearch ? inputToSend.slice(1).trim() : inputToSend;

    // Only add the message to the chat if it's not a related search
    if (!isRelatedSearch) {
      setMessages(prev => [...prev, { role: 'user', content: `Søk etter: ${cleanInput}` }]);
    }

    setInput('');
    setIsTyping(true);

    try {
      if (isWebSearch || isRelatedSearch) {
        // If it's a web search command or a related search, perform web search
        await handleWebSearch(cleanInput);
      } else {
        // Normal chat handling
        await handleNormalChat(inputToSend);
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Beklager, det oppstod en feil. Vennligst prøv igjen.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const searchBing = useCallback(async (query: string) => {
    setIsWebSearching(true);
    try {
      console.log('Performing Bing search with query:', query);
      const response = await fetch('/api/testpage-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.body;
    } catch (error) {
      console.error('Error fetching Bing search results:', error);
      return null;
    } finally {
      setIsWebSearching(false);
    }
  }, []);

  const handleWebSearch = async (query: string) => {
    // Remove any '@' prefix if it exists
    const cleanQuery = query.startsWith('@') ? query.slice(1) : query;
    
    setMessages(prev => [...prev, { role: 'user', content: `Søk etter: ${cleanQuery}${selectedCategory ? ` (Kategori: ${selectedCategory.name})` : ''}` }]);
    setInput('');
    setIsTyping(true);

    try {
      const responseBody = await searchBing(cleanQuery);
      if (!responseBody) {
        throw new Error('No response body');
      }

      const reader = responseBody.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let searchResults: BingSearchResult[] = [];
      let relatedSearches: string[] = [];
      
      setMessages(prev => [...prev, { role: 'search', content: '', searchResults: [], relatedSearches: [] } as SearchMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        
        if (chunk.includes('[SEARCH_RESULTS]')) {
          const [_, resultsJson] = chunk.split('[SEARCH_RESULTS]');
          searchResults = JSON.parse(resultsJson.split('\n\n')[0]);
          console.log('Parsed search results:', searchResults);
        } else if (chunk.includes('[RELATED_SEARCHES]')) {
          const [_, relatedSearchesJson] = chunk.split('[RELATED_SEARCHES]');
          const relatedSearchesString = relatedSearchesJson.split('[DONE]')[0];
          relatedSearches = JSON.parse(relatedSearchesString);
          console.log('Parsed related searches:', relatedSearches);
        } else {
          accumulatedContent += chunk;
        }

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1] as SearchMessage;
          lastMessage.content = accumulatedContent;
          lastMessage.searchResults = searchResults;
          lastMessage.relatedSearches = relatedSearches;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error performing Bing search:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Beklager, det oppstod en feil under søket. Vennligst prøv igjen.' }]);
    } finally {
      setIsTyping(false);
      setSelectedCategory(null);
    }
  };


// First, add a function to fetch PDF content from search_snippets
const fetchPdfContent = async (snippetId: string) => {
  try {
    const { data, error } = await supabase
      .from('search_snippets')
      .select('text')
      .eq('id', snippetId)
      .single();

    if (error) throw error;
    return data?.text || '';
  } catch (error) {
    console.error('Error fetching PDF content:', error);
    return '';
  }
};

// Add this function to fetch snippets
const fetchSnippets = async (chatUuid: string) => {
  try {
    console.log('📚 Fetching snippets for chat:', chatUuid);
    const { data, error } = await supabase
      .from('search_snippets')
      .select('*')
      .eq('article_id', articleId)
      .eq('chat_uuid', chatUuid)  // Add this filter
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('📑 Found snippets for chat:', data);
    setSnippets(data || []);
  } catch (error) {
    console.error('❌ Error fetching snippets:', error);
  }
};

useEffect(() => {
  if (currentChatUuid) {
    console.log('🔄 Setting selected chat:', currentChatUuid);
    setSelectedChatUuid(currentChatUuid);
    activeChatUuidRef.current = currentChatUuid;
  }
}, [currentChatUuid]);

// Add useEffect to load snippets
useEffect(() => {
  if (articleId && currentChatUuid) {
    fetchSnippets(currentChatUuid);
  }
}, [articleId, currentChatUuid]);

const handleNormalChat = async (inputToSend: string) => {
  console.log('🚀 Chat message:', {
    input: inputToSend,
    currentUuid: currentChatUuid,
    selectedUuid: selectedChatUuid,
    refUuid: activeChatUuidRef.current
  });

  let chatUuidToUse = currentChatUuid || selectedChatUuid || activeChatUuidRef.current;

  if (!chatUuidToUse) {
    console.log('⚠️ No active chat, creating new one');
    chatUuidToUse = uuidv4();
    // Update all UUID states
    setCurrentChatUuid(chatUuidToUse);
    setSelectedChatUuid(chatUuidToUse);
    activeChatUuidRef.current = chatUuidToUse;
    await addNewChatToSupabase(chatUuidToUse);
  } else {
    console.log('✅ Using existing chat:', chatUuidToUse);
    // Ensure all UUID states are in sync
    setCurrentChatUuid(chatUuidToUse);
    setSelectedChatUuid(chatUuidToUse);
    activeChatUuidRef.current = chatUuidToUse;
  }

  const newMessages = [...messages, { role: 'user' as const, content: inputToSend }];
  setMessages(newMessages);
  setInput('');
  setIsTyping(true);

  try {
    let pdfContent = '';
    if (snippets.length > 0 && currentChatUuid) {
      // Verify snippet belongs to current chat
      const relevantSnippets = snippets.filter(s => s.chat_uuid === currentChatUuid);
      console.log('📑 Found relevant snippets for chat:', relevantSnippets.length);
      
      if (relevantSnippets.length > 0) {
        pdfContent = relevantSnippets[0].text || '';
        console.log('📄 Using PDF content from chat:', currentChatUuid);
      }
    }

    // Log the payload we're sending to the API
    const apiPayload = {
      messages: newMessages,
      articleContent,
      articleId,
      pdfContent
    };
    console.log('📦 Preparing API request payload:', {
      messageCount: newMessages.length,
      hasPdfContent: !!pdfContent,
      pdfContentLength: pdfContent.length,
      articleContentLength: articleContent.length
    });

    console.log('🚀 Sending request to AI chat API');
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    if (!response.body) throw new Error('Response body is null');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';

    console.log('Starting to read AI response stream');
    setMessages(prev => [...prev, { role: 'system', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      
      if (chunk.includes('[DONE]')) {
        console.log('Received [DONE] signal from OpenAI');
        break;
      }

      accumulatedContent += chunk;

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { 
          ...newMessages[newMessages.length - 1], 
          content: accumulatedContent 
        };
        return newMessages;
      });

      setIsTyping(false);
    }

    // Update Supabase with final messages
    setMessages(prev => {
      const finalMessages = [...prev];
      finalMessages[finalMessages.length - 1] = { 
        ...finalMessages[finalMessages.length - 1], 
        content: accumulatedContent 
      };
      updateSupabaseChat(finalMessages, chatUuidToUse, articleId);
      return finalMessages;
    });

  } catch (error) {
    console.error('Error sending message:', error);
    setMessages(prev => {
      const newMessages = [
        ...prev,
        { role: 'system' as const, content: 'Beklager, det oppstod en feil. Vennligst prøv igjen.' }
      ];
      updateSupabaseChat(newMessages, chatUuidToUse, articleId);
      return newMessages;
    });
  } finally {
    setIsTyping(false);
  }
};

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setShowCopyNotification(true);
      setTimeout(() => {
        setShowCopyNotification(false);
      }, 3000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleAddToArticle = (content: string) => {
    addToArticle(content);
  };

  const userInitial = sessionData?.user?.email ? sessionData.user.email[0].toUpperCase() : 'U';

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleAddToLibrary = async (result: BingSearchResult) => {
    if (!articleId) {
      console.error('Article ID is missing');
      return;
    }

    setLoadingSnippets(prev => new Set(prev).add(result.url));

    try {
      console.log(`Starting to scrape URL: ${result.url}`);
      const response = await fetch('/api/scrape-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: result.url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { content } = await response.json();

      const { data, error } = await supabase
        .from('search_snippets')
        .insert({
          article_id: articleId,
          title: result.name,
          url: result.url,
          text: content,
          favicon_url: getFaviconUrl(result.url),
          summary: result.snippet
        });

      if (error) throw error;

      console.log('Snippet added to library:', data);
      setAddedSnippets(prev => new Set(prev).add(result.url));
    } catch (error) {
      console.error('Error adding snippet to library:', error);
      // You can add some error feedback to the user here
    } finally {
      setLoadingSnippets(prev => {
        const newSet = new Set(prev);
        newSet.delete(result.url);
        return newSet;
      });
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    handleSend(question);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getChatTitle = (messagesString: string): string => {
    try {
      const messages = JSON.parse(messagesString);
      const firstUserMessage = messages.find((msg: any) => msg.role === 'user');
      if (firstUserMessage) {
        return firstUserMessage.content.slice(0, 15) + (firstUserMessage.content.length > 15 ? '...' : '');
      }
      return 'Ny chat';
    } catch (error) {
      console.error('Error parsing messages:', error);
      return 'Ukjent chat';
    }
  };

  const handleDeleteChat = async (chatUuid: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent chat selection when deleting
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('chat_uuid', chatUuid);

      if (error) throw error;

      // Remove the deleted chat from the local state
      setChatHistory(prevHistory => prevHistory.filter(chat => chat.chat_uuid !== chatUuid));

      // If the deleted chat was the current chat, reset the current chat
      if (chatUuid === currentChatUuid) {
        setCurrentChatUuid(null);
        setMessages([{ role: 'system', content: "Hei! Jeg er din AI-forskningsassistent fra Innhold.AI. Hvordan kan jeg hjelpe deg med ditt nåværende tema?" }]);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const renderMessageContent = (content: string, showSearchResults: boolean) => {
    const sanitizedContent = DOMPurify.sanitize(content, { ADD_ATTR: ['target'] });
    return (
      <div 
        className={`ai-chat-content prose prose-sm max-w-none dark:prose-invert ${
          showSearchResults ? 'hidden' : ''
        }`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
      />
    );
  };

  const fetchChatHistory = async () => {
    if (!chatUuid) return;

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('messages')
        .eq('chat_uuid', chatUuid)
        .single();

      if (error) throw error;

      if (data && data.messages) {
        setMessages(JSON.parse(data.messages));
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const fetchQuestionsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('questions')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      if (data && data.questions) {
        setSupabaseQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions from Supabase:', error);
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const newChatUuid = uuidv4();
    console.log('📝 Starting PDF upload process:', newChatUuid);
    
    setIsUploading(true);
    setIsUploadingPdf(true); // Add this line to set upload state
    
    try {
      // Step 1: Create initial chat state
      const initialMessages: Message[] = [
        { role: 'system', content: initialMessage },
        { role: 'user', content: `PDF lastet opp: ${file.name}` },
        { role: 'system', content: 'PDF-en er mottatt og blir behandlet. Du kan nå stille spørsmål om innholdet.' }
      ];
  
      // Step 2: Create chat in Supabase first
      const { error: chatError } = await supabase
        .from('chat_history')
        .insert({
          chat_uuid: newChatUuid,
          article_id: articleId,
          messages: JSON.stringify(initialMessages)
        });
  
      if (chatError) throw chatError;
  
      // Step 3: Upload PDF
      await uploadPdf({
        file,
        articleId,
        chatUuid: newChatUuid
      });
  
      // Step 4: Force state updates in specific order
      await Promise.all([
        // Update local states synchronously
        (async () => {
          setMessages(initialMessages);
          setCurrentChatUuid(newChatUuid);
          setSelectedChatUuid(newChatUuid);
          activeChatUuidRef.current = newChatUuid;
          lastUploadedChatRef.current = newChatUuid;
        })(),
        
        // Fetch snippets
        fetchSnippets(newChatUuid),
        
        // Force chat history refresh
        fetchAllChats()
      ]);
  
      // Step 5: Verify state consistency
      console.log('🔍 Verifying chat state:', {
        newChatUuid,
        currentState: currentChatUuid,
        selectedState: selectedChatUuid,
        activeRef: activeChatUuidRef.current,
        lastUploaded: lastUploadedChatRef.current
      });
  
    } catch (error) {
      console.error('❌ Upload failed:', error);
    } finally {
      setIsUploading(false);
      setIsUploadingPdf(false); // Add this line to reset upload state
      const fileInput = document.getElementById('ai-chat-pdf-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

// Add this effect to force synchronization after state updates
useEffect(() => {
  const syncChatState = async () => {
    const uploadedChat = lastUploadedChatRef.current;
    if (!uploadedChat) return;

    console.log('🔄 Forcing chat sync for:', uploadedChat);

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('messages, chat_uuid')
        .eq('chat_uuid', uploadedChat)
        .single();

      if (error) throw error;

      if (data) {
        const parsedMessages = JSON.parse(data.messages);
        
        // Force all states to match
        setMessages(parsedMessages);
        setCurrentChatUuid(data.chat_uuid);
        setSelectedChatUuid(data.chat_uuid);
        activeChatUuidRef.current = data.chat_uuid;
        
        await fetchSnippets(data.chat_uuid);
        
        console.log('✅ Forced sync complete:', {
          chat: data.chat_uuid,
          messageCount: parsedMessages.length
        });
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
    }
  };

  syncChatState();
}, [forceUpdateRef.current]);


// Override any other chat selection when we have an uploaded chat
useEffect(() => {
  if (lastUploadedChatRef.current && 
      currentChatUuid !== lastUploadedChatRef.current) {
    console.log('🚫 Preventing unwanted chat switch');
    setCurrentChatUuid(lastUploadedChatRef.current);
    setSelectedChatUuid(lastUploadedChatRef.current);
    activeChatUuidRef.current = lastUploadedChatRef.current;
  }
}, [currentChatUuid]);

// Update initial load effect
useEffect(() => {
  if (isOpen && sessionData?.user?.id && articleId) {
    // Always prefer the last uploaded chat
    const chatToUse = lastUploadedChatRef.current || chatUuid;
    
    if (chatToUse) {
      console.log('📂 Loading chat:', chatToUse);
      setCurrentChatUuid(chatToUse);
      setSelectedChatUuid(chatToUse);
      activeChatUuidRef.current = chatToUse;
      fetchSnippets(chatToUse);
    }
  }
}, [isOpen, sessionData?.user?.id, articleId]);

  const handleRelatedSearch = useCallback((search: string) => {
    setInput(search);
    handleSend(search, true); // Pass a flag indicating this is a related search
  }, [handleSend]);

  return (
    <div
      className={`fixed right-0 top-0 h-full w-1/3 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col">
        <header className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Chat</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-600 dark:text-gray-300">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </header>
        
        <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex justify-between items-center relative">
          <div className="relative" ref={dropdownRef}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 dark:text-gray-300"
              onClick={() => setShowChatHistory(!showChatHistory)}
            >
              <Clock className="h-4 w-4 mr-2" />
              Chats
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
            {showChatHistory && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-700 shadow-lg rounded-md overflow-hidden z-10">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : chatHistory.length > 0 ? (
                  <div className={`${chatHistory.length > 5 ? 'max-h-60 overflow-y-auto documents-list' : ''}`}>
                    {chatHistory.map((chat, index) => (
                      <div 
                        key={chat.chat_uuid}
                        className={`p-2.5 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer relative group ${
                          chat.chat_uuid === currentChatUuid ? 'bg-gray-100 dark:bg-gray-600' : ''
                        } ${index !== 0 ? 'border-t border-gray-200 dark:border-gray-600' : ''}`}
                        onClick={() => handleChatSelect(chat.chat_uuid)}
                      >
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {getChatTitle(chat.messages)}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {format(new Date(chat.created_at), "d. MMMM", { locale: nb })}
                        </div>
                        <button
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDeleteChat(chat.chat_uuid, e)}
                        >
                          <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="p-3 text-xs text-gray-500 dark:text-gray-400">Ingen chathistorikk funnet</p>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-gray-600 dark:text-gray-300 ${isOverLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleNewChat}
              onMouseEnter={() => setHoveredButton('new-chat')}
              onMouseLeave={() => setHoveredButton(null)}
              disabled={isOverLimit}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ny Chat
            </Button>
            {hoveredButton === 'new-chat' && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 text-xs font-medium text-center text-gray-900 bg-white border border-gray-200 rounded-md shadow-sm dark:bg-gray-800 dark:text-white dark:border-gray-700 whitespace-nowrap">
                {isOverLimit ? 'Utilgjengelig' : 'Start en ny chat'}
                <svg className="absolute text-white dark:text-gray-800 h-2 w-full left-0 bottom-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                  <polygon className="fill-current" points="0,255 127.5,127.5 255,255"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden p-4 bg-[#f5f5f5] dark:bg-[#0b1120]">
          <div className="h-full overflow-y-auto documents-list pr-5">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  // Skip rendering if this message is a duplicate of the previous user message
                  if (
                    message.role === 'user' &&
                    index > 0 &&
                    messages[index - 1].role === 'user' &&
                    messages[index - 1].content === message.content
                  ) {
                    return null;
                  }

                  return (
                    <div key={index} className={`flex mb-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      {message.role !== 'user' && (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-2">
                          AI
                        </div>
                      )}
                      <div className="flex flex-col max-w-[80%]">
                        {message.role === 'search' && message.searchResults && (
                          renderSourcesBox(
                            message.searchResults, 
                            activeTooltip, 
                            setActiveTooltip,
                            expandedSnippets,
                            setExpandedSnippets,
                            articleId,
                            currentChatUuid
                          )
                        )}
                        <div className={`rounded-lg p-2 text-[0.9rem] border border-solid
                          ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-900 dark:bg-[#1c2840] dark:text-gray-200'}
                          ${message.role === 'user' ? 'border-blue-500' : 'border-[#f0f0f0] dark:border-[#2e394f]'}`}>
                          {message.role === 'search' 
                            ? renderWebSearchResults(
                              message.content,
                              handleCopy,
                              addToArticle,
                              activeTooltip,
                              setActiveTooltip,
                              index
                            )
                            : renderMessageContent(message.content, false)}
                          {message.role === 'system' && (
                            <div className="mt-4 flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="hover:bg-gray-100 dark:hover:bg-transparent text-gray-600 dark:text-[#9198a1]"
                                onClick={() => handleCopy(message.content)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Kopier
                              </Button>
                              <div className="relative">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="hover:bg-gray-100 dark:hover:bg-transparent text-gray-600 dark:text-[#9198a1]"
                                  onClick={() => addToArticle(message.content)}
                                  onMouseEnter={() => setActiveTooltip(`add-${index}`)}
                                  onMouseLeave={() => setActiveTooltip(null)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Legg til i artikkel
                                </Button>
                                {activeTooltip === `add-${index}` && (
                                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 w-48 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-xs rounded py-1 px-2 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="text-center">
                                      Legg til svaret i dokumentet.
                                    </div>
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-2 border-4 border-transparent border-r-white dark:border-r-gray-800"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        {message.role === 'search' && 
  'relatedSearches' in message &&  
  Array.isArray(message.relatedSearches) &&  // Check if it's an array
  message.relatedSearches.length > 0 && 
  message.content?.trim().length > 50 && 
  (
    renderRelatedSearchesBox(message.relatedSearches as string[], handleRelatedSearch)
  )
}
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-bold flex-shrink-0 ml-2">
                          {userInitial}
                        </div>
                      )}
                    </div>
                  );
                })}
                {messages.length === 1 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forslag til spørsmål:</p>
                    <div className="flex flex-col space-y-2">
                      {[...suggestedQuestions, ...supabaseQuestions].map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestedQuestion(question)}
                          className="text-left text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {isTyping && (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Tenker...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form className="flex space-x-2 relative" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <AnimatePresence>
                  {showWebIndicator && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                      className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs px-1.5 py-0.5 rounded flex items-center justify-center"
                    >
                      Web
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Input 
                className={`w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                  input.startsWith('@') 
                    ? 'border-[#06f] animate-glow pl-14' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={`Still et spørsmål eller bruk @ for websøk${selectedCategory ? ` (${selectedCategory.name})` : ''}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
            </div>
            <div className="flex space-x-2">
              <div className="relative group">
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 px-3 py-2 bg-white text-gray-800 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap dark:bg-gray-800 dark:text-white pointer-events-none shadow-md">
                  Last opp et PDF dokument du kan snakke med
                  <div className="absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white dark:border-l-gray-800"></div>
                </div>
                <Button 
                  type="button"
                  onClick={() => document.getElementById('ai-chat-pdf-upload')?.click()}
                  disabled={isUploadingPdf}
                  className="bg-white hover:bg-gray-100 text-gray-700 flex items-center justify-center px-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  {isUploadingPdf ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={isTyping || !input.trim()}
                className="w-20 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isTyping ? (
                  <>
                    Send
                    <Loader className="ml-2 h-5 w-5 animate-spin" />
                  </>
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </form>
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
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Din tekst har blitt kopiert</p>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setShowCopyNotification(false)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Lukk
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes subtleGlow {
          0% {
            box-shadow: 0 0 2px rgba(0, 102, 255, 0.1);
          }
          50% {
            box-shadow: 0 0 4px rgba(0, 102, 255, 0.2);
          }
          100% {
            box-shadow: 0 0 2px rgba(0, 102, 255, 0.1);
          }
        }
        .animate-glow {
          animation: subtleGlow 3s ease-in-out infinite;
        }
      `}</style>
      <input
        type="file"
        id="ai-chat-pdf-upload"
        accept=".pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />
    </div>
  )
}
