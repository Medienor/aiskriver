'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { FileText, Gift, HelpCircle, Keyboard, Search, Zap, ChevronLeft, ChevronRight, Settings, Rocket, X, MessageSquare, Video, ThumbsUp, Home, Smile, User, Calculator } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import GetStarted from '@/components/GetStarted'
import ContactPopup from '@/components/ContactPopup'
import Link from 'next/link'
import ShortcutHelp from '@/components/ShortcutHelp'
import SNLLookup from '@/components/SNLLookup'

interface WriteSidePanelProps {
  onMinimizeChange: (isMinimized: boolean) => void;
  onUpgradeClick: () => void;
  initialMinimizedState?: boolean;
}

export default function WriteSidePanel({ 
  onMinimizeChange, 
  onUpgradeClick,
  initialMinimizedState = false
}: WriteSidePanelProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<{ id: string; title: string }[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [wordsRemaining, setWordsRemaining] = useState<number | null>(null)
  const [totalWords, setTotalWords] = useState<number | null>(null)
  const [isMinimized, setIsMinimized] = useState(initialMinimizedState)
  const [isMobileView, setIsMobileView] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false)
  const getStartedRef = useRef<HTMLDivElement>(null)
  const [isHelpMenuOpen, setIsHelpMenuOpen] = useState(false)
  const helpMenuRef = useRef<HTMLDivElement>(null)
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false)
  const [contactPopupType, setContactPopupType] = useState<'contact' | 'feedback'>('contact')
  const pathname = usePathname()
  const isWritePage = pathname?.startsWith('/write')
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false)
  const shortcutHelpRef = useRef<HTMLDivElement>(null)
  const [isSNLLookupOpen, setIsSNLLookupOpen] = useState(false)
  const snlLookupRef = useRef<HTMLDivElement>(null)
  const [selectedText, setSelectedText] = useState('')
  const [articleId, setArticleId] = useState<string | null>(null)
  const [isTypingInSNLLookup, setIsTypingInSNLLookup] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768
      setIsMobileView(isMobile)
      if (isMobile && !isMinimized) {
        setIsMinimized(true)
        onMinimizeChange(true)
      }
    }

    handleResize() // Call once to set initial state
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [onMinimizeChange, isMinimized])

  useEffect(() => {
    if (session?.user?.email) {
      fetchDocuments(session.user.email)
      fetchWordCount(session.user.email)
    }
  }, [session])

  useEffect(() => {
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDocuments(filtered)
  }, [searchTerm, documents])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (getStartedRef.current && !getStartedRef.current.contains(event.target as Node)) {
        setIsGetStartedOpen(false)
      }
    }

    if (isGetStartedOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isGetStartedOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setIsHelpMenuOpen(false)
      }
    }

    if (isHelpMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isHelpMenuOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shortcutHelpRef.current && !shortcutHelpRef.current.contains(event.target as Node)) {
        setIsShortcutHelpOpen(false)
      }
    }

    if (isShortcutHelpOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isShortcutHelpOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (snlLookupRef.current && !snlLookupRef.current.contains(event.target as Node)) {
        setIsSNLLookupOpen(false)
      }
    }

    if (isSNLLookupOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSNLLookupOpen])

  useEffect(() => {
    const saved = localStorage.getItem('sidePanelMinimized')
    if (saved !== null) {
      setIsMinimized(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('sidePanelMinimized', JSON.stringify(isMinimized))
    onMinimizeChange(isMinimized)
  }, [isMinimized, onMinimizeChange])

  const fetchDocuments = async (email: string) => {
    const { data, error } = await supabase
      .from('content')
      .select('id, title')
      .eq('user_id', email)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching documents:', error)
    } else {
      setDocuments(data || [])
      setFilteredDocuments(data || [])
    }
  }

  const fetchWordCount = async (email: string) => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('words_remaining, total_words')
      .eq('user_id', email)
      .single()

    if (error) {
      console.error('Error fetching word count:', error)
    } else if (data) {
      setWordsRemaining(data.words_remaining)
      setTotalWords(data.total_words)
    }
  }

  const truncate = (str: string, n: number) => {
    return (str.length > n) ? str.slice(0, n-1) + '...' : str;
  }

  const userInitial = session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'
  const userName = truncate(session?.user?.name || session?.user?.email || 'Bruker', 15)

  const wordUsagePercentage = totalWords && wordsRemaining != null
    ? Math.min((wordsRemaining / totalWords) * 100, 100)
    : 0;

  const getProgressBarColor = (percentage: number) => {
    if (percentage <= 10) return 'bg-red-600';
    if (percentage <= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };
  const toggleMinimize = () => {
    setIsMinimized((prev: boolean) => !prev)
  }

  const handleContactClick = (type: 'contact' | 'feedback') => {
    setContactPopupType(type)
    setIsContactPopupOpen(true)
    setIsHelpMenuOpen(false)
  }

  const toggleShortcutHelp = () => {
    setIsShortcutHelpOpen(!isShortcutHelpOpen)
  }

  const renderButtons = () => {
    if (isWritePage) {
      return (
        <>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            onClick={() => setIsGetStartedOpen(true)}
          >
            <Zap className="mr-2 h-4 w-4 text-yellow-400" />
            Kom i gang guide
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
              onClick={() => setIsHelpMenuOpen(!isHelpMenuOpen)}
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Hjelp
            </Button>
            <AnimatePresence>
              {isHelpMenuOpen && (
                <motion.div
                  ref={helpMenuRef}
                  className="fixed left-[14rem] ml-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-[60]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <button 
                      onClick={() => handleContactClick('feedback')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Tilbakemelding
                    </button>
                    <button 
                      onClick={() => handleContactClick('contact')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send oss melding
                    </button>
                    <button 
                      onClick={() => { /* Handle video help */ }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Video className="mr-2 h-4 w-4" />
                      Video hjelp
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            onClick={toggleShortcutHelp}
          >
            <Keyboard className="mr-2 h-4 w-4" />
            Snarveier
          </Button>
        </>
      )
    } else {
      return (
        <>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Hjem
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            asChild
          >
            <Link href="/pricing">
              <Smile className="mr-2 h-4 w-4" />
              Pris
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            asChild
          >
            <Link href="/plagiat-sjekker">
              <Search className="mr-2 h-4 w-4" />
              Plagiatkontroll
            </Link>
          </Button>
        </>
      )
    }
  }

  return (
    <>
      <AnimatePresence>
        {(!isMinimized || !isMobileView) && (
          <motion.div 
            className={`h-screen bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col fixed left-0 top-0 z-50 ${
              isMobileView ? 'w-64' : ''
            }`}
            initial={isMobileView ? { x: "-100%" } : { width: "3rem" }}
            animate={isMobileView ? { x: isMinimized ? "-100%" : 0 } : { width: isMinimized ? "3rem" : "14rem" }}
            exit={isMobileView ? { x: "-100%" } : { width: "3rem" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="h-[48.5px] px-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex items-center justify-between">
              {!isMinimized && (
                <div className="flex items-center space-x-3 overflow-hidden relative" ref={dropdownRef}>
                  <div 
                    className="flex items-center space-x-3 cursor-pointer"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center">
                      <span className="text-[0.85rem] font-normal text-gray-700 dark:text-gray-200">{userInitial}</span>
                    </div>
                    <span className="text-[0.85rem] font-normal text-gray-700 dark:text-gray-200 truncate">{userName}</span>
                  </div>
                  <div 
                    className={`
                      absolute left-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg 
                      overflow-hidden transition-all duration-200 ease-in-out z-50
                      ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
                    `}
                    style={{
                      position: 'fixed',
                      top: 'calc(48.5px + 0.5rem)',
                      left: '1rem',
                    }}
                  >
                    <div className="py-1">
                      <button 
                        onClick={() => { router.push('/profile'); setIsDropdownOpen(false); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Innstillinger
                      </button>
                      <button 
                        onClick={() => { router.push('/pricing'); setIsDropdownOpen(false); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Rocket className="mr-2 h-4 w-4" />
                        Se priser
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-500 dark:text-gray-400" 
                onClick={toggleMinimize}
              >
                {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
            {!isMinimized && (
              <>
                <div className="p-4 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input 
                      className="pl-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
                      placeholder="Søk dokumenter" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {isWritePage && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-white dark:bg-gray-700 text-blue-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 mt-2 border-none shadow-none"
                      onClick={() => router.push('/write')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nytt dokument
                    </Button>
                  )}
                </div>
                <div className="flex-grow overflow-hidden">
                  <div className="p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Dokumenter</span>
                    </div>
                    <div className="h-[220px] overflow-y-auto pr-2 custom-scrollbar document-list">
                      <div className="space-y-2 pb-12">
                        {filteredDocuments.length > 0 ? (
                          filteredDocuments.map((doc) => (
                            <div 
                              key={doc.id} 
                              className="text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 cursor-pointer truncate"
                              onClick={() => router.push(`/write/${doc.id}`)}
                            >
                              {truncate(doc.title, 20)}
                            </div>
                          ))
                        ) : (
                          <div className="text-sm py-1 px-2 text-gray-500 dark:text-gray-400">
                            Ingen treff
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-2 h-16 bg-gradient-to-t from-white via-white dark:from-gray-800 dark:via-gray-800 to-transparent pointer-events-none"></div>
                  </div>
                </div>
                <div className="p-4 space-y-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                  <div className="space-y-2 pb-4">
                    {renderButtons()}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                      <span>{wordsRemaining?.toLocaleString()} ord igjen</span>
                      <span>{totalWords?.toLocaleString()} totalt</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                      <div 
                        className={`${getProgressBarColor(wordUsagePercentage)} h-2.5 rounded-full`} 
                        style={{ width: `${wordUsagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                    onClick={onUpgradeClick}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Oppgrader
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {isMobileView && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleMinimize}
        >
          {isMinimized ? <ChevronRight className="h-6 w-6" /> : <ChevronLeft className="h-6 w-6" />}
        </Button>
      )}
      {isMobileView && !isMinimized && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleMinimize}
        />
      )}
      {isGetStartedOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            ref={getStartedRef}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-400"
              onClick={() => setIsGetStartedOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <GetStarted />
          </div>
        </div>
      )}
      <ContactPopup 
        isOpen={isContactPopupOpen}
        onClose={() => setIsContactPopupOpen(false)}
        type={contactPopupType}
      />
      {isShortcutHelpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            ref={shortcutHelpRef}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-400"
              onClick={() => setIsShortcutHelpOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <ShortcutHelp />
          </div>
        </div>
      )}
      {isSNLLookupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div 
            ref={snlLookupRef}
            className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl"
          >
            <SNLLookup 
              onCite={(citation) => {/* Handle citation */}}
              selectedText={selectedText}
              maintainSelection={() => {}}
              onClose={() => setIsSNLLookupOpen(false)}
              articleId={articleId || ''}
              setIsTypingInSNLLookup={setIsTypingInSNLLookup}
            />
          </div>
        </div>
      )}
    </>
  )
}
