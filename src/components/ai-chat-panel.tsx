"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronRight, Search, Loader, Copy, Plus, Check, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { performWebSearch } from "@/services/ExaService"
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from "framer-motion"

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  articleContent: string;
  articleId: string;
  chatUuid: string | null;
  addToArticle: (content: string) => void;
}

interface Category {
  name: string;
  value: string;
}

const categories: Category[] = [
  { name: "General", value: "" },
  { name: "Research Paper", value: "research_paper" },
  { name: "Company", value: "company" },
  { name: "News Article", value: "news_article" },
  { name: "PDF", value: "pdf" },
  { name: "Github", value: "github" },
  { name: "Tweet", value: "tweet" },
  { name: "Movie", value: "movie" },
  { name: "Song", value: "song" },
  { name: "Personal Site", value: "personal_site" }
];

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

export default function AIChatPanel({ isOpen, onClose, articleContent, articleId, chatUuid, addToArticle }: AIChatPanelProps) {
  const { data: session } = useSession()
  const initialMessage = "Hei! Jeg er din AI-forskningsassistent fra Innhold.AI. Hvordan kan jeg hjelpe deg med ditt nåværende tema?";
  const suggestedQuestions = [
    "Hva kan forbedres?",
    "Hva mangler jeg?"
  ];
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
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [addedSnippets, setAddedSnippets] = useState<Set<string>>(new Set());
  const [showWebIndicator, setShowWebIndicator] = useState(false);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  useEffect(() => {
    if (chatUuid) {
      fetchChatHistory();
    }
  }, [chatUuid]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false);
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  useEffect(() => {
    setShowWebIndicator(input.startsWith('@'));
  }, [input]);

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

  const saveChatHistory = async (newMessages: typeof messages) => {
    if (!chatUuid) return;

    try {
      const { error } = await supabase
        .from('chat_history')
        .upsert({ 
          chat_uuid: chatUuid, 
          messages: JSON.stringify(newMessages),
          article_id: articleId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const startLoadingAnimation = () => {
    let index = 0;
    loadingIntervalRef.current = setInterval(() => {
      index = (index + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[index]);
    }, 2500);
  };

  const stopLoadingAnimation = () => {
    if (loadingIntervalRef.current) {
      clearInterval(loadingIntervalRef.current);
    }
  };

  const handleSend = async (customInput?: string) => {
    const inputToSend = customInput || input;
    if (!inputToSend.trim() || isTyping) return;

    if (inputToSend.startsWith('@')) {
      const query = inputToSend.slice(1).trim(); // Remove the @ symbol
      await handleWebSearch(query);
    } else {
      await handleNormalChat(inputToSend);
    }
  };

  const handleWebSearch = async (query: string) => {
    setMessages(prev => [...prev, { role: 'user', content: `Søk etter: ${query}${selectedCategory ? ` (Kategori: ${selectedCategory.name})` : ''}` }]);
    setInput('');
    setIsTyping(true);
    setIsWebSearching(true);

    try {
      const searchResults = await performWebSearch(query, selectedCategory?.value);
      const fullText = searchResults.map(result => result.text).join('\n\n');
      setMessages(prev => [...prev, { 
        role: 'search', 
        content: 'Her er resultatene fra websøket:',
        searchResults: searchResults.slice(0, 5),
        fullText: fullText
      }]);
    } catch (error) {
      console.error('Error performing web search:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Beklager, det oppstod en feil under websøket. Vennligst prøv igjen.' }]);
    } finally {
      setIsTyping(false);
      setIsWebSearching(false);
      setSelectedCategory(null); // Reset the category after search
    }
  };

  const handleNormalChat = async (inputToSend: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: inputToSend }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    await saveChatHistory(newMessages);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          articleContent,
          articleId
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      setMessages(prev => [...prev, { role: 'system', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedContent += chunk;

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            ...newMessages[newMessages.length - 1], 
            content: accumulatedContent 
          };
          saveChatHistory(newMessages); // Save chat history after each chunk
          return newMessages;
        });

        // Stop showing the loading spinner as soon as we start receiving a response
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => {
        const newMessages = [
          ...prev,
          { role: 'system' as const, content: 'Beklager, det oppstod en feil. Vennligst prøv igjen.' }
        ];
        saveChatHistory(newMessages);
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

  const userInitial = session?.user?.email ? session.user.email[0].toUpperCase() : 'U';

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowSettingsDropdown(false);
  };

  const handleAddToLibrary = async (result: any) => {
    if (!articleId) {
      console.error('Article ID is missing');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('search_snippets')
        .insert({
          article_id: articleId,
          title: result.title,
          url: result.url,
          text: result.text,
          favicon_url: getFaviconUrl(result.url),
          summary: result.summary
        });

      if (error) throw error;

      console.log('Snippet added to library:', data);
      setAddedSnippets(prev => new Set(prev).add(result.url));
      // You can add some user feedback here, like a toast notification
    } catch (error) {
      console.error('Error adding snippet to library:', error);
      // You can add some error feedback to the user here
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    handleSend(question);
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-1/3 bg-white dark:bg-gray-800 shadow-lg z-50 transition-transform duration-300 ease-in-out ${
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
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-start space-x-2 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'system' && (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    AI
                  </div>
                )}
                {message.role === 'search' && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    <Search className="h-4 w-4" />
                  </div>
                )}
                {isWebSearching && index === messages.length - 1 && message.role !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    <Loader className="h-4 w-4 animate-spin" />
                  </div>
                )}
                <div className={`rounded-lg p-2 max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-gray-900 dark:text-gray-100' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                }`}>
                  {message.role === 'user' && message.content.startsWith('Søk etter:') ? (
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-500 dark:text-gray-300 mr-1" />
                      <span className="text-black dark:text-white text-sm">{message.content.slice(11)}</span>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="text-sm break-words"
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(message.content) }}
                      />
                      {message.role === 'system' && (
                        <div className="mt-2 space-x-2 flex items-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs flex items-center" 
                            onClick={() => handleAddToArticle(message.content)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Legg til i artikkel
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs flex items-center" 
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Kopier
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  {message.searchResults && (
                    <div className="mt-2 space-y-2">
                      {message.searchResults.map((result, idx) => (
                        <div key={idx} className="bg-white dark:bg-gray-600 p-2 rounded">
                          <div className="flex items-center">
                            <img src={getFaviconUrl(result.url)} alt="favicon" className="w-4 h-4 mr-2" />
                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{result.title}</a>
                          </div>
                          <p className="text-xs mt-1">{result.summary}</p>
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs flex items-center ${addedSnippets.has(result.url) ? 'text-gray-400 cursor-not-allowed' : ''}`}
                              onClick={() => !addedSnippets.has(result.url) && handleAddToLibrary(result)}
                              disabled={addedSnippets.has(result.url)}
                            >
                              {addedSnippets.has(result.url) ? (
                                <>
                                  <Check className="h-3 w-3 mr-1 text-green-500" />
                                  Lagt til i bibliotek
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Legg til i bibliotek
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold flex-shrink-0">
                    {userInitial}
                  </div>
                )}
              </div>
            ))}
            {messages.length === 1 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forslag til spørsmål:</p>
                <div className="flex flex-col space-y-2">
                  {suggestedQuestions.map((question, index) => (
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
              <div className="flex items-start space-x-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  <Loader className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-lg p-2 max-w-[80%] bg-gray-100 dark:bg-gray-700">
                  <p className="text-sm break-words text-gray-900 dark:text-gray-100">Tenker..</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
                    ? 'border-[#06f] animate-glow pl-14 pr-10' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder={`Still et spørsmål eller bruk @ for websøk${selectedCategory ? ` (${selectedCategory.name})` : ''}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
              />
              {input.startsWith('@') && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div ref={settingsDropdownRef}>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                      className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full p-1"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    {showSettingsDropdown && (
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-10">
                        <div className="py-1 max-h-60 overflow-y-auto">
                          {categories.map((category, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => handleCategorySelect(category)}
                            >
                              {category.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="w-20 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center"
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
    </div>
  )
}