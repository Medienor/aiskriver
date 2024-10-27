import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Clock, Library, Settings, Download, Copy, ChevronDown, Loader, User, Rocket, LogOut, Sun, Moon } from "lucide-react"
import Link from 'next/link'
import { WordPressPostButton } from '@/components/WordPressPostButton'
import AIChatPanel from '@/components/ai-chat-panel'
import LibraryPanel from '@/components/LibraryPanel'
import { motion, AnimatePresence } from "framer-motion"
import Upgrade from '@/components/Upgrade'
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { ContentManager } from '@/utils/contentManager';
import SlideOutSettingsPanel from '@/components/SlideOutSettingsPanel';

interface WriterNavProps {
  title: string | null;
  isGenerating: boolean;
  articleId: string;
  contentManager: ContentManager | null | undefined;
  onCopy: () => void;
  getContent: () => string;
  onAIChatToggle: () => void;
  addToArticle: (content: string) => void;
  onTitleChange: (newTitle: string) => void;
  isSidePanelMinimized?: boolean;
  onLanguageChange: (language: string) => void;
  onVipPromptChange: (prompt: string) => void;
  initialVipPrompt: string;
  initialLanguage: string;
  initialCitationStyle: string;
  onCitationStyleChange: (style: string) => void;
  initialAutocomplete: boolean;
  initialAutocompleteButton: boolean;
  initialExternalCiting: boolean;
  initialLocalCiting: boolean;
  onAutocompleteChange: (value: boolean) => void;
  onAutocompleteButtonChange: (value: boolean) => void;
  onExternalCitingChange: (value: boolean) => void;
  onLocalCitingChange: (value: boolean) => void;
}

export default function WriterNav({
  title,
  isGenerating,
  articleId,
  contentManager,
  onCopy,
  getContent,
  onAIChatToggle,
  addToArticle,
  onLanguageChange,
  initialCitationStyle,
  onCitationStyleChange,
  initialLanguage,
  onTitleChange,
  onVipPromptChange,
  initialVipPrompt,
  isSidePanelMinimized = false, // Provide a default value
  initialAutocomplete,
  initialAutocompleteButton,
  initialExternalCiting,
  initialLocalCiting,
  onAutocompleteChange,
  onAutocompleteButtonChange,
  onExternalCitingChange,
  onLocalCitingChange,
}: WriterNavProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isTitleLoaded, setIsTitleLoaded] = useState(false);
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const aiChatButtonRef = useRef<HTMLButtonElement>(null);
  const libraryButtonRef = useRef<HTMLButtonElement>(null);
  

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setEditedTitle(title || '');
    if (title !== null) {
      setIsTitleLoaded(true);
    }
  }, [title]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (editedTitle !== title) {
      onTitleChange(editedTitle);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    console.log('Language change received in WriterNav:', newLanguage);
    onLanguageChange(newLanguage);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  useEffect(() => {
    const handleAIChatToggle = () => {
      aiChatButtonRef.current?.click();
    };

    const handleLibraryToggle = () => {
      libraryButtonRef.current?.click();
    };

    window.addEventListener('simulateAIChatClick', handleAIChatToggle);
    window.addEventListener('simulateLibraryClick', handleLibraryToggle);

    return () => {
      window.removeEventListener('simulateAIChatClick', handleAIChatToggle);
      window.removeEventListener('simulateLibraryClick', handleLibraryToggle);
    };
  }, []);

  const handleCitationStyleChange = (newStyle: string) => {
    console.log('Citation style change received in WriterNav:', newStyle);
    onCitationStyleChange(newStyle);
  };

  const handleAutocompleteChange = (value: boolean) => {
    console.log('Autocomplete change received in WriterNav:', value);
    onAutocompleteChange(value);
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div className="flex items-center h-[1.5rem]">
          <AnimatePresence>
            {isTitleLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    className="text-[0.85rem] font-normal bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100"
                  />
                ) : (
                  <h1
                    className="text-[0.85rem] font-normal cursor-text text-gray-900 dark:text-gray-100"
                    onClick={handleTitleClick}
                  >
                    {isGenerating || !title ? "Untitled" : truncateTitle(title)}
                  </h1>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {isGenerating && (
            <Loader className="ml-2 h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            className="bg-[#06f] text-white hover:bg-[#05d] text-xs"
            onClick={() => setShowUpgradeModal(true)}
          >
            Oppgrader
          </Button>
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-700 dark:text-gray-300"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Eksporter
              <ChevronDown className={`ml-2 h-3 w-3 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            <div
              className={`
                absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg
                overflow-hidden transition-all duration-200 ease-in-out
                ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
              `}
            >
              <div className="py-1">
                <button
                  onClick={() => { contentManager?.handleDownload(); setIsDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download className="mr-2 h-3 w-3" />
                  Last ned
                </button>
                <button
                  onClick={() => { contentManager?.handleCopy(); setIsDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Copy className="mr-2 h-3 w-3" />
                  Kopier
                </button>
                <div className="px-4 py-2">
                  <WordPressPostButton
                    articleContent={getContent()}
                    articleId={articleId}
                  />
                </div>
              </div>
            </div>
          </div>
          <Button
            ref={aiChatButtonRef}
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center space-x-1 text-xs text-gray-700 dark:text-gray-300"
            onClick={onAIChatToggle}
          >
            <span className="bg-purple-200 dark:bg-purple-700 rounded-full w-1.5 h-1.5" />
            <span>AI Chat</span>
          </Button>
          <Button
            ref={libraryButtonRef}
            variant="ghost"
            size="sm"
            className="hidden sm:flex items-center space-x-1 text-xs text-gray-700 dark:text-gray-300"
            onClick={() => setIsLibraryOpen(true)}
          >
            <Library className="h-4 w-4 mr-1" />
            <span>Bibliotek</span>
          </Button>
          <div className="relative" ref={profileDropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-700 dark:text-gray-300"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <User className="h-4 w-4" />
            </Button>
            <div
              className={`
                absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg
                overflow-hidden transition-all duration-200 ease-in-out
                ${isProfileDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
              `}
            >
              <div className="py-1">
                <button
                  onClick={() => { router.push('/profile'); setIsProfileDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Instillinger
                </button>
                <button
                  onClick={() => { router.push('/pricing'); setIsProfileDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  Se priser
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Lightmode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Darkmode
                    </>
                  )}
                </button>
                <button
                  onClick={() => { signOut(); setIsProfileDropdownOpen(false); }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logg ut
                </button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-700 dark:text-gray-300"
            onClick={() => setIsSettingsPanelOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <AIChatPanel
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        articleContent={getContent()}
        articleId={articleId}
        chatUuid={null}
        addToArticle={addToArticle}
      />
      <LibraryPanel
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        articleId={articleId}
        addToArticle={addToArticle}
      />
      <Upgrade
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        isSidePanelMinimized={isSidePanelMinimized}
      />
      <SlideOutSettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
        onLanguageChange={onLanguageChange}
        onVipPromptChange={onVipPromptChange}
        onCitationStyleChange={onCitationStyleChange}
        onAutocompleteChange={onAutocompleteChange}
        onAutocompleteButtonChange={onAutocompleteButtonChange}
        onExternalCitingChange={onExternalCitingChange}
        onLocalCitingChange={onLocalCitingChange}
        initialLanguage={initialLanguage}
        initialVipPrompt={initialVipPrompt}
        initialCitationStyle={initialCitationStyle}
        initialAutocomplete={initialAutocomplete}
        initialAutocompleteButton={initialAutocompleteButton}
        initialExternalCiting={initialExternalCiting}
        initialLocalCiting={initialLocalCiting}
      />
    </>
  )
}
