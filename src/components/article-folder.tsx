import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FolderOpen, Clock, Plus, X, Edit, Trash, Check, ChevronDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, cubicBezier } from 'framer-motion'

interface Article {
  id: string
  title: string
  html_content: string
  created_at: string
}

interface ArticleFolderProps {
  folderId: string
  folderName: string
  onClose: () => void
}

const EmptyFolderState = ({ message = "Denne mappen er tom", onClick }: { message?: string, onClick: () => void }) => (
  <div 
    className="flex flex-col items-center justify-center p-8 text-center cursor-pointer"
    onClick={onClick}
  >
    <div className="relative mb-4 group">
      <svg
        className="h-48 w-48 transition-transform duration-300 ease-in-out group-hover:scale-105"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* SVG path data */}
        <path
          d="M30 60C30 53.3726 35.3726 48 42 48H80L90 60H158C164.627 60 170 65.3726 170 72V150C170 156.627 164.627 162 158 162H42C35.3726 162 30 156.627 30 150V60Z"
          fill="url(#folder-gradient)"
        />
        <path
          d="M30 60C30 53.3726 35.3726 48 42 48H80L90 60H158C164.627 60 170 65.3726 170 72V150C170 156.627 164.627 162 158 162H42C35.3726 162 30 156.627 30 150V60Z"
          fill="url(#folder-gradient-2)"
          fillOpacity="0.2"
        />
        <path
          d="M30 60C30 53.3726 35.3726 48 42 48H80L90 60H158C164.627 60 170 65.3726 170 72V78H30V60Z"
          fill="url(#folder-top-gradient)"
        />
        <rect x="90" y="95" width="20" height="4" rx="2" fill="#6B7280" />
        <rect x="80" y="105" width="40" height="4" rx="2" fill="#6B7280" />
        <g className="opacity-70">
          <rect x="70" y="85" width="60" height="40" rx="4" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="4 4" fill="none" />
          <path d="M96 105H104M100 101V109" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </g>
        <defs>
          <linearGradient id="folder-gradient" x1="100" y1="48" x2="100" y2="162" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="folder-gradient-2" x1="30" y1="105" x2="170" y2="105" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="folder-top-gradient" x1="100" y1="48" x2="100" y2="78" gradientUnits="userSpaceOnUse">
            <stop stopColor="#93C5FD" />
            <stop offset="1" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
      </svg>
    </div>
    <p className="text-lg font-medium text-gray-700">{message}</p>
    <p className="mt-2 text-sm text-gray-500">Klikk for å legge til artikler i denne mappen</p>
  </div>
)

const Loader = () => (
  <svg className="animate-spin h-8 w-8 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)

export default function ArticleFolder({ folderId, folderName, onClose }: ArticleFolderProps) {
  const [folderArticles, setFolderArticles] = useState<Article[]>([])
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [addedArticles, setAddedArticles] = useState<Set<string>>(new Set())
  const { data: session } = useSession()
  const router = useRouter()
  const [addArticleSearchTerm, setAddArticleSearchTerm] = useState('')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const isMounted = useRef(false)

  const fetchAllUserArticles = useCallback(async (userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('id, title, html_content, created_at')
        .eq('user_id', userEmail)

      if (error) throw error
      if (isMounted.current) {
        setAllArticles(data || [])
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Error fetching user articles:', error)
    }
  }, [])

  const fetchFolderArticles = useCallback(async () => {
    if (!isInitialized) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('folder_articles')
        .select('article_id')
        .eq('folder_id', folderId)

      if (error) throw error

      const articleIds = data.map(item => item.article_id)
      const folderArticles = allArticles.filter(article => articleIds.includes(article.id))
      
      if (isMounted.current) {
        setAddedArticles(new Set(articleIds))
        setFolderArticles(folderArticles)
      }
    } catch (error) {
      console.error('Error fetching folder articles:', error)
    } finally {
      if (isMounted.current) {
        // Add a slight delay before removing the loading state
        setTimeout(() => setIsLoading(false), 100)
      }
    }
  }, [folderId, allArticles, isInitialized])

  useLayoutEffect(() => {
    isMounted.current = true
    if (session?.user?.email) {
      fetchAllUserArticles(session.user.email)
    }
    return () => {
      isMounted.current = false
    }
  }, [session, fetchAllUserArticles])

  useLayoutEffect(() => {
    if (isInitialized) {
      fetchFolderArticles()
    }
  }, [isInitialized, fetchFolderArticles])

  const addArticleToFolder = async (articleId: string) => {
    const { error } = await supabase
      .from('folder_articles')
      .insert({ folder_id: folderId, article_id: articleId })

    if (error) {
      console.error('Error adding article to folder:', error)
    } else {
      setAddedArticles(prev => new Set(prev).add(articleId))
      fetchFolderArticles()
    }
  }

  const handleEdit = (articleId: string) => {
    router.push(`/write/${articleId}`)
  }

  const handleDelete = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from('folder_articles')
        .delete()
        .match({ folder_id: folderId, article_id: articleId })

      if (error) throw error

      setFolderArticles(prevArticles => prevArticles.filter(article => article.id !== articleId))
    } catch (error) {
      console.error('Error removing article from folder:', error)
      alert('Det oppstod en feil under fjerning av artikkelen fra mappen.')
    }
  }

  const filteredArticles = folderArticles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.html_content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  const smoothEaseIn = cubicBezier(0.4, 0.0, 0.2, 1)

  // Add this function to filter articles based on the search term
  const filteredAllArticles = allArticles.filter(article =>
    article.title.toLowerCase().includes(addArticleSearchTerm.toLowerCase()) ||
    article.html_content.toLowerCase().includes(addArticleSearchTerm.toLowerCase())
  )

  return (
    <div className="relative max-w-[800px] w-full mx-auto bg-background overflow-hidden">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FolderOpen className="mr-2 h-5 w-5" />
            <h1 className="text-xl font-semibold">{folderName}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsPanelOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Legg til artikkel
            </Button>
            <Button onClick={onClose} variant="outline" size="sm">Lukk</Button>
          </div>
        </div>
        
        {folderArticles.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative w-full sm:w-64">
              <Input
                type="text"
                placeholder="Søk artikler..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            <div className="relative">
              <Button
                onClick={() => setIsSortOpen(!isSortOpen)}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                {sortBy === 'date' ? 'Dato' : 'Tittel'}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              {isSortOpen && (
                <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                  <button
                    className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => { setSortBy('date'); setIsSortOpen(false); }}
                  >
                    Dato
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => { setSortBy('title'); setIsSortOpen(false); }}
                  >
                    Tittel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!isInitialized || isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center bg-background"
          >
            <Loader />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-[calc(100vh-240px)] overflow-y-auto custom-scrollbar"
          >
            {folderArticles.length > 0 ? (
              sortedArticles.map((article) => (
                <div key={article.id} className="px-4 py-4 border-t border-b border-gray-200 last:border-b-0">
                  <h2 className="text-sm font-medium mb-1 truncate">{article.title}</h2>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        onClick={() => handleEdit(article.id)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Rediger
                      </Button>
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 text-xs"
                          onClick={() => handleDelete(article.id)}
                          onMouseEnter={() => setActiveTooltip(`delete-${article.id}`)}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <Trash className="h-3 w-3 mr-1" />
                          Slett
                        </Button>
                        {activeTooltip === `delete-${article.id}` && (
                          <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 w-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-[10px] font-medium rounded py-1 px-2 shadow-lg border border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                              Sletter kun dokument fra mappen
                            </div>
                            <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 border-8 border-transparent border-l-white dark:border-l-gray-800"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyFolderState onClick={() => setIsPanelOpen(true)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div 
            className="absolute inset-0 bg-black/60 flex items-end justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: smoothEaseIn }}
          >
            <motion.div 
              className="bg-white dark:bg-gray-800 w-full rounded-t-lg shadow-lg overflow-hidden flex flex-col"
              style={{
                maxWidth: '800px',
                height: 'calc(100% - 48px)',
              }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.25, ease: smoothEaseIn }}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Legg til artikler i mappen</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsPanelOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 border-b">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Søk etter artikler..."
                    value={addArticleSearchTerm}
                    onChange={(e) => setAddArticleSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredAllArticles.length === 0 ? (
                  <p className="p-4">Ingen artikler funnet.</p>
                ) : (
                  filteredAllArticles.map((article) => (
                    <div key={article.id} className="border-b border-gray-200 last:border-b-0">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1 min-w-0 mr-4">
                          <h3 className="text-sm font-medium truncate">{article.title}</h3>
                        </div>
                        <Button 
                          onClick={() => addArticleToFolder(article.id)} 
                          size="sm"
                          disabled={addedArticles.has(article.id)}
                          className={`
                            bg-white dark:bg-gray-700 
                            ${addedArticles.has(article.id)
                              ? 'text-gray-500 dark:text-gray-400'
                              : 'text-[#06f] hover:bg-[#06f] hover:text-white dark:text-[#06f] dark:hover:bg-[#06f] dark:hover:text-white'
                            }
                          `}
                        >
                          {addedArticles.has(article.id) ? (
                            <>
                              Lagt til <Check className="ml-1 h-4 w-4 text-green-500" />
                            </>
                          ) : (
                            'Legg til'
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  )
}
