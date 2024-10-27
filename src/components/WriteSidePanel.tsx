'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { FileText, Gift, HelpCircle, Keyboard, Search, Zap, ChevronLeft, ChevronRight, Settings, Rocket, X, MessageSquare, Video, ThumbsUp, Home, Smile, User, Calculator, Upload, Loader, Menu, ChevronDown, Folder, Trash2, MoreVertical, Clock, Star, Edit, Trash, ExternalLink, Library, FolderPlus } from "lucide-react"
import { supabase } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import GetStarted from '@/components/GetStarted'
import ContactPopup from '@/components/ContactPopup'
import Link from 'next/link'
import ShortcutHelp from '@/components/ShortcutHelp'
import SNLLookup from '@/components/SNLLookup'
import { v4 as uuidv4 } from 'uuid'
import mammoth from 'mammoth'
import VideoHelp from '@/components/VideoHelp'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WriteSidePanelProps {
  onMinimizeChange: (isMinimized: boolean) => void;
  onUpgradeClick: () => void;
  initialMinimizedState?: boolean;
}

interface Article {
  id: string
  title: string
}

interface Folder {
  id: string
  name: string
  items?: (Folder | Article)[]
}

interface ArticleWithDate extends Article {
  created_at: string
  isDeleting?: boolean
}

interface FolderWithArticles extends Folder {
  articles: Article[]
  isOpen: boolean
}

const FolderItem: React.FC<{ 
  item: Folder; 
  level: number; 
  onDeleteFolder: (folderId: string) => void;
  onOpenFolder: (folderId: string, folderName: string) => void;
}> = ({ item, level, onDeleteFolder, onOpenFolder }) => {
  return (
    <div className="relative">
      <div
        className={`flex items-center py-0.5 px-2 cursor-pointer`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onOpenFolder(item.id, item.name)}
      >
        <div className="flex-grow flex items-center overflow-hidden">
          <Folder className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-[0.85rem] font-normal text-gray-700 dark:text-gray-200 truncate">{item.name}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 ml-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                onDeleteFolder(item.id)
              }}
              className="text-xs py-1"
            >
              <Trash className="h-3 w-3 mr-2" />
              Slett mappe
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

const EmptyStateComponent = ({ onNewArticle }: { onNewArticle: () => void }) => {
  console.log("Rendering EmptyStateComponent");
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="relative mb-6 group">
        <svg
          className="h-48 w-48 transition-transform duration-300 ease-in-out group-hover:scale-105"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tilted document in the back */}
          <g transform="rotate(-15 100 100)">
            <rect x="40" y="40" width="100" height="130" rx="8" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
            <line x1="60" y1="70" x2="120" y2="70" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="60" y1="90" x2="120" y2="90" stroke="#D1D5DB" strokeWidth="2" />
            <line x1="60" y1="110" x2="120" y2="110" stroke="#D1D5DB" strokeWidth="2" />
          </g>

          {/* Main document in the front */}
          <rect x="60" y="30" width="100" height="130" rx="8" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
          <line x1="80" y1="60" x2="140" y2="60" stroke="#E5E7EB" strokeWidth="2" />
          <line x1="80" y1="80" x2="140" y2="80" stroke="#E5E7EB" strokeWidth="2" />
          <line x1="80" y1="100" x2="140" y2="100" stroke="#E5E7EB" strokeWidth="2" />
          <line x1="80" y1="120" x2="140" y2="120" stroke="#E5E7EB" strokeWidth="2" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Ingen artikler ennå</h2>
      <p className="text-sm text-gray-500 mb-6">Opprett din første artikkel for å komme i gang</p>
      <Button 
        variant="outline" 
        className="flex items-center space-x-2 bg-white text-[#0066FF] border-[#0066FF] hover:bg-[#0066FF] hover:text-white transition-colors"
        onClick={() => {
          console.log("Empty state 'Legg til ny artikkel' button clicked");
          onNewArticle();
        }}
      >
        <Plus className="h-5 w-5" />
        <span>Legg til ny artikkel</span>
      </Button>
    </div>
  )
}

export default function WriteSidePanel({ 
  onMinimizeChange, 
  onUpgradeClick,
  initialMinimizedState = false
}: WriteSidePanelProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<ArticleWithDate[]>([])
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
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isVideoHelpOpen, setIsVideoHelpOpen] = useState(false)
  const [isDocumentsPanelOpen, setIsDocumentsPanelOpen] = useState(false)
  const [documentSearchTerm, setDocumentSearchTerm] = useState('')
  const newDocumentRef = useRef<HTMLButtonElement>(null);
  const newDocumentDropdownRef = useRef<HTMLButtonElement>(null);
  const [isNewDocumentDropdownOpen, setIsNewDocumentDropdownOpen] = useState(false);
  const isWritePageWithoutUUID = pathname === '/write'

  console.log('Current pathname:', pathname);
  console.log('isWritePageWithoutUUID:', isWritePageWithoutUUID);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isVideoHelpOpen && event.target instanceof Element) {
        const popupContent = document.querySelector('.video-help-popup-content');
        if (popupContent && !popupContent.contains(event.target)) {
          setIsVideoHelpOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVideoHelpOpen]);

  useEffect(() => {
    const handleSimulateNewDocumentClick = () => {
      console.log("simulateNewDocumentClick event received");
      // Add the logic here to open the "Nytt dokument" dropdown
      // This might involve setting a state variable or calling a function
      // For example:
      // setIsNewDocumentDropdownOpen(true);
      // or
      // openNewDocumentDropdown();
    };

    console.log("Adding event listener for simulateNewDocumentClick");
    window.addEventListener('simulateNewDocumentClick', handleSimulateNewDocumentClick);

    return () => {
      console.log("Removing event listener for simulateNewDocumentClick");
      window.removeEventListener('simulateNewDocumentClick', handleSimulateNewDocumentClick);
    };
  }, []);

  const fetchDocuments = async (email: string) => {
    const { data, error } = await supabase
      .from('content')
      .select('id, title, created_at')
      .eq('user_id', email)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching documents:', error)
    } else {
      setDocuments(data || [])
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller file.')
        return
      }
      
      setIsUploading(true)
      try {
        const uuid = uuidv4()
        console.log('Generated UUID:', uuid)

        const arrayBuffer = await file.arrayBuffer()
        console.log('File converted to ArrayBuffer')

        console.log('Converting to HTML...')
        const result = await mammoth.convertToHtml({ arrayBuffer })
        const htmlContent = result.value
        console.log('Conversion to HTML complete')

        // Generate a title from the file name
        const title = file.name.replace(/\.[^/.]+$/, "") // Remove file extension

        console.log('Inserting into Supabase...')
        const { data, error } = await supabase
          .from('content')
          .insert({
            id: uuid,
            html_content: htmlContent,
            user_id: session?.user?.email,
            status: 'generated',
            title: title
          })

        if (error) {
          console.error('Supabase insert error:', error)
          throw new Error(`Supabase insert error: ${error.message}`)
        }

        console.log('Supabase insert successful:', data)
        router.push(`/write/${uuid}`)
      } catch (error) {
        console.error('Detailed error:', error)
        let errorMessage = 'An unknown error occurred while uploading the file.'
        if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`
        }
        alert(`An error occurred while uploading the file: ${errorMessage}`)
      } finally {
        setIsUploading(false)
      }
    } else {
      alert('Please upload a valid DOCX file.')
    }
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
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

  const toggleSidePanel = () => {
    if (isMobileView) {
      setIsSidePanelOpen(!isSidePanelOpen)
    } else {
      setIsMinimized(!isMinimized)
      onMinimizeChange(!isMinimized)
    }
  }

  const openVideoHelp = () => {
    setIsVideoHelpOpen(true)
  }


  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(documentSearchTerm.toLowerCase())
  )

  const toggleDocumentsPanel = () => {
    setIsDocumentsPanelOpen(prev => !prev)
  }

  const handleDeleteArticle = async (id: string) => {
    try {
      // Step 1: Delete related scraped content
      const { error: scrapedContentError } = await supabase
        .from('scraped_content')
        .delete()
        .eq('content_id', id)

      if (scrapedContentError) {
        console.error('Error deleting related scraped content:', scrapedContentError);
        console.log('Failed to delete related scraped content. Article deletion aborted.');
        return;
      }

      // Step 2: Delete the article
      const { data, error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Full error object:', JSON.stringify(error, null, 2));
        console.error('Error deleting article:', error.message);
        console.log('An error occurred while deleting the article. Please try again.');
      } else {
        // Remove the deleted article from the local state with animation
        setDocuments(prevDocuments => 
          prevDocuments.map(doc => 
            doc.id === id ? { ...doc, isDeleting: true } : doc
          )
        )
        setTimeout(() => {
          setDocuments(prevDocuments => prevDocuments.filter(doc => doc.id !== id))
        }, 300) // Match this with the CSS transition duration
        console.log('Article and related scraped content deleted successfully');
      }
    } catch (error) {
      console.error('Unexpected error when deleting article:', error);
      console.log('An unexpected error occurred. Please try again.');
    }
  }

  const renderPanelContent = () => (
    <div className="flex flex-col h-full" style={{ height: '100%' }}>
      <div className="flex-shrink-0">
        <div className="h-[48.5px] px-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 z-10 flex items-center justify-between">
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-500 dark:text-gray-400" 
            onClick={toggleSidePanel}
          >
            {isMobileView ? <X className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <div className="p-4 space-y-2">
          {isWritePage && (
            <>
              <DropdownMenu open={isNewDocumentDropdownOpen} onOpenChange={setIsNewDocumentDropdownOpen}>
  <DropdownMenuTrigger asChild>
    <Button
      ref={newDocumentDropdownRef}
      variant="ghost"
      size="sm"
      className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 pl-0 py-1"
      onClick={() => {
        console.log("'Nytt dokument' button clicked");
        setIsNewDocumentDropdownOpen(prev => !prev);
      }}
    >
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
          <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-sm">Nytt dokument</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-[300px] mt-1" 
                  sideOffset={0}
                  alignOffset={-4}
                  align="start"
                >
                  <div className="h-2 w-2 rotate-45 bg-white dark:bg-gray-800 absolute -top-1 left-[11px] z-10"></div>
                  <DropdownMenuItem className="py-3 cursor-pointer" onClick={() => router.push('/write')}>
                    <div className="flex items-start">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium">Dokument</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Begynn på nytt dokument</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3 cursor-pointer" onClick={handleAIChatToggle}>
                    <div className="flex items-start">
                      <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
                        <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="font-medium">AI-chat</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Start en ny AI Chat</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="py-3 cursor-pointer" onClick={handleUploadButtonClick}>
                    <div className="flex items-start">
                      <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                        <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium">Last opp</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Last opp fra datamaskinen din</div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 pl-0 py-1"
                onClick={toggleDocumentsPanel}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-[#dcfce7] dark:bg-[#dcfce7] flex items-center justify-center mr-2">
                    <FileText className="h-4 w-4 text-[#1ea751] dark:text-[#1ea751]" />
                  </div>
                  <span className="text-sm">Dokumenter</span>
                </div>
              </Button>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 pl-0 py-1"
                        onClick={handleAIChatToggle}
                        disabled={isWritePageWithoutUUID}
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-2">
                            <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-sm">AI Chat</span>
                        </div>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {isWritePageWithoutUUID && (
                    <TooltipContent side="right" className="relative">
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-white dark:border-r-gray-800"></div>
                      <p>Start et dokument først</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 pl-0 py-1"
                        onClick={handleLibraryToggle}
                        disabled={isWritePageWithoutUUID}
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-2">
                            <Library className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-sm">Bibliotek</span>
                        </div>
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {isWritePageWithoutUUID && (
                    <TooltipContent side="right" className="relative">
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-white dark:border-r-gray-800"></div>
                      <p>Start et dokument først</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="hidden"
                id="docx-upload"
                disabled={isUploading}
              />
            </>
          )}
        </div>
      </div>
      
      <div className="flex-grow overflow-hidden">
        {/* Remove the folders section from here */}
        {/* The documents section can remain if you want to keep it */}
      </div>
      
      <div className="flex-shrink-0 mt-auto p-4 space-y-2 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            onClick={() => setIsGetStartedOpen(true)}
          >
            <Zap className="mr-2 h-4 w-4" />
            Kom i gang guide
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            onClick={openVideoHelp}
          >
            <Video className="mr-2 h-4 w-4" />
            Videoer
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
            {isHelpMenuOpen && (
              <div
                ref={helpMenuRef}
                className="absolute left-full ml-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-[60]"
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
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-gray-700 dark:text-gray-200 hover:bg-transparent pl-0 py-1"
            onClick={toggleShortcutHelp}
          >
            <Keyboard className="mr-2 h-4 w-4" />
            Snarveier
          </Button>
        </div>
        <div className="space-y-2 pt-2">
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
    </div>
  )

  console.log('Active tooltip:', activeTooltip);

  const panelVariants = {
    open: { width: "14rem" },
    closed: { width: "3rem" },
  }

  const contentVariants = {
    visible: { opacity: 1, transition: { delay: 0.1 } },
    hidden: { opacity: 0, transition: { duration: 0.1 } },
  }

  const handleNewArticle = () => {
    console.log("handleNewArticle called");
    setIsNewDocumentDropdownOpen(true); // Open the dropdown programmatically
    setIsDocumentsPanelOpen(false);
  };

  const handleAIChatToggle = () => {
    const event = new CustomEvent('simulateAIChatClick');
    window.dispatchEvent(event);
  };

  const handleLibraryToggle = () => {
    const event = new CustomEvent('simulateLibraryClick');
    window.dispatchEvent(event);
  };

  return (
    <div className="hidden md:block relative">
      <AnimatePresence>
        {((!isMinimized && !isMobileView) || (isMobileView && isSidePanelOpen)) && (
          <motion.div 
            className={`h-screen bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col fixed left-0 top-0 z-30 ${
              isMobileView ? 'w-full' : 'w-56'
            } md:block hidden`}
            initial={isMobileView ? { x: "-100%" } : "closed"}
            animate={isMobileView ? { x: 0 } : "open"}
            exit={isMobileView ? { x: "-100%" } : "closed"}
            variants={panelVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={contentVariants}
              style={{ height: '100%' }}
            >
              {renderPanelContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isMobileView && isMinimized && (
        <div 
          className="h-screen w-12 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col fixed left-0 top-0 z-50 md:block hidden" // Add md:block hidden here
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="mt-2 mx-auto text-gray-500 dark:text-gray-400" 
            onClick={toggleSidePanel}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isMobileView && isSidePanelOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidePanel}
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
      {isVideoHelpOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl video-help-popup-content">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-400"
              onClick={() => setIsVideoHelpOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <VideoHelp />
          </div>
        </div>
      )}
      <AnimatePresence>
        {isDocumentsPanelOpen && (
          <div 
            className="fixed top-0 left-56 h-screen w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 z-40"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Dokumenter</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDocumentsPanelOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  className="w-full pl-10 text-sm focus-visible:ring-[#06f] focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:border-[#06f]"
                  style={{ 
                    '--tw-ring-color': '#06f',
                    '--tw-ring-offset-width': '0px',
                    '--tw-ring-width': '1px'
                  } as React.CSSProperties}
                  placeholder="Søk dokumenter" 
                  value={documentSearchTerm}
                  onChange={(e) => setDocumentSearchTerm(e.target.value)}
                />
              </div>
              {filteredDocuments.length > 0 ? (
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
                  {filteredDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer flex items-center group transition-all duration-300 ${doc.isDeleting ? 'opacity-0 h-0' : 'opacity-100'}`}
                      onClick={() => router.push(`/write/${doc.id}?generate=true`)}
                    >
                      <div className="w-[80%]">
                        <div className="font-medium text-[0.75rem] truncate">{doc.title}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {format(new Date(doc.created_at), "d. MMMM", { locale: nb })}
                        </div>
                      </div>
                      <div className="w-[20%] flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(`/write/${doc.id}?generate=true`, '_blank')
                              }}
                              className="text-xs py-1"
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Åpne i ny fane
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteArticle(doc.id)
                              }}
                              className="text-xs py-1 text-red-600"
                            >
                              <Trash className="h-3 w-3 mr-2" />
                              Slett
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateComponent onNewArticle={handleNewArticle} />
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

