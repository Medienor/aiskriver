'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react"
import { supabase } from '../../../lib/supabase'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Download, Copy, Wand2, Trash2, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { upgradeFullArticle } from '../../../services/FullArticleUpgradeService';
import '@/styles/article-styles.css'
import { checkPlagiarism, CopyscapeResult } from '../../../services/CopyscapeService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { WordCountService } from '../../../services/WordCountService'

export default function ArticlePage() {
  const params = useParams()
  const id = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null
  const searchParams = useSearchParams()
  const router = useRouter()
  const isNewArticle = searchParams?.get('new') === 'true'
  const { data: session } = useSession()
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedDate, setGeneratedDate] = useState<string | null>(null)
  const [upgradeSettings, setUpgradeSettings] = useState({
    splitParagraphs: false,
    removeConclusions: false,
    reduceRepetition: false,
    simplifyComplexSentences: false,
    expandParagraphs: false,
  })
  const [webSearchResults, setWebSearchResults] = useState<Array<{ title: string; text: string; url: string }> | null>(null)
  const [showUpgraded, setShowUpgraded] = useState(false)
  const [upgradedContent, setUpgradedContent] = useState<string>('')
  const [hasUpgradedVersion, setHasUpgradedVersion] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const editableContentRef = useRef<HTMLDivElement>(null)
  const [isApiOperationInProgress, setIsApiOperationInProgress] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState<string>('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [wordsRemaining, setWordsRemaining] = useState<number>(0)
  const [isPlagiarismChecking, setIsPlagiarismChecking] = useState(false);
  const [plagiarismResult, setPlagiarismResult] = useState<CopyscapeResult | null>(null);
  const [plagiatChecksRemaining, setPlagiatChecksRemaining] = useState(0)
  const [isPlagiarismDialogOpen, setIsPlagiarismDialogOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.email && id && isInitialLoad) {
      fetchArticleAndGenerate()
      fetchWordCount()
      fetchPlagiatChecksRemaining()
      setIsInitialLoad(false)
    }
  }, [session, id, isInitialLoad])
  
  const fetchArticleAndGenerate = async () => {
    try {
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('articleid', id)
        .single()
  
      if (articleError) throw articleError
  
      if (articleData.status === 'draft' && isNewArticle) {
        // Only start generation if it hasn't started yet
        setIsGenerating(true)
        setGeneratedContent('Genererer artikkel...')
        // Start polling for updates
        pollForArticleUpdates()
      } else if (articleData.status === 'generating') {
        // If it's already generating, just start polling
        setIsGenerating(true)
        pollForArticleUpdates()
      } else {
        // If it's already generated, just display the content
        setGeneratedContent(cleanArticleContent(articleData.html))
        setUpgradedContent(cleanArticleContent(articleData.upgraded_html || ''))
        setGeneratedDate(articleData.created_at || null)
        setHasUpgradedVersion(!!articleData.upgraded_html)
        setIsLoading(false)
        setIsGenerating(false)
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to fetch article. Please try again.');
      setIsLoading(false)
    }
  }

  const pollForArticleUpdates = async () => {
    const pollInterval = setInterval(async () => {
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('articleid', id)
        .single()

      if (articleError) {
        console.error('Error polling for article updates:', articleError)
        clearInterval(pollInterval)
        return
      }

      if (articleData.html) {
        setStreamedContent(cleanArticleContent(articleData.html))
      }

      if (articleData.status === 'generated') {
        setGeneratedContent(cleanArticleContent(articleData.html))
        setGeneratedDate(articleData.created_at || null)
        setIsGenerating(false)
        setIsLoading(false)
        clearInterval(pollInterval)
      }
    }, 1000) // Poll every second

    // Clear interval after 10 minutes to prevent infinite polling
    setTimeout(() => clearInterval(pollInterval), 600000)
  }

  const fetchWordCount = async () => {
    if (!session?.user?.email) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('words_remaining')
        .eq('user_id', session.user.email)
        .single();

      if (error) throw error;
      setWordsRemaining(data.words_remaining);
    } catch (error) {
      console.error('Error fetching word count:', error);
    }
  }

  const fetchPlagiatChecksRemaining = async () => {
    if (!session?.user?.email) return;

    const wordCountService = WordCountService.getInstance();
    await wordCountService.initializeUser(session.user.email);
    setPlagiatChecksRemaining(wordCountService.getPlagiatChecksRemaining());
  }

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "article.html";
    document.body.appendChild(element);
    element.click();
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent).then(() => {
      alert("Content copied to clipboard!");
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }

  const handleUpgradeSettingChange = (setting: keyof typeof upgradeSettings) => {
    setUpgradeSettings(prev => ({ ...prev, [setting]: !prev[setting] }))
  }

  const handleStartUpgrade = async () => {
    if (wordsRemaining <= 0) {
      setError('Ingen ord igjen. Vennligst oppgrader for å fortsette.');
      return;
    }

    setIsLoading(true);
    setIsApiOperationInProgress(true);
    setError(null);
    setUpgradedContent('');
    setShowUpgraded(true);

    try {
      let fullUpgradedContent = '';
      for await (const chunk of upgradeFullArticle(generatedContent, upgradeSettings)) {
        fullUpgradedContent += chunk;
        setUpgradedContent(prev => prev + chunk);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const { error: updateError } = await supabase
        .from('articles')
        .update({ upgraded_html: fullUpgradedContent })
        .eq('articleid', id);

      if (updateError) throw updateError;

      setHasUpgradedVersion(true);
      
      // Deduct words and update word count
      const wordCount = fullUpgradedContent.split(/\s+/).length;
      await supabase.rpc('deduct_words', {
        p_user_id: session?.user?.email,
        p_word_count: wordCount,
      });
      fetchWordCount();
    } catch (err) {
      console.error('Error upgrading article:', err);
      setError('Failed to upgrade article. Please try again.');
    } finally {
      setIsLoading(false);
      setIsApiOperationInProgress(false);
    }
  }

  const handleDelete = async () => {
    if (!session?.user?.email) {
      console.error('User not authenticated');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this article?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('articleid', id)
        .eq('user_id', session.user.email);

      if (error) throw error;

      router.push('/');
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article. Please try again.');
    }
  }

  const handleSaveEdit = async () => {
    if (editableContentRef.current) {
      const newContent = editableContentRef.current.innerHTML
      if (showUpgraded) {
        setUpgradedContent(newContent)
      } else {
        setGeneratedContent(newContent)
      }
      await updateArticleInSupabase(newContent, showUpgraded)
      setIsEditing(false)
    }
  }

  const updateArticleInSupabase = async (content: string, isUpgraded: boolean) => {
    try {
      const updateData = isUpgraded 
        ? { upgraded_html: content }
        : { html: content };

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('articleid', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating article in Supabase:', err);
      setError('Failed to update article. Please try again.');
    }
  }

  const cleanArticleContent = (content: string): string => {
    let cleanedContent = content.replace(/<html>/g, '').replace(/<\/html>/g, '');
    cleanedContent = cleanedContent.replace(/```html/g, '').replace(/```/g, '');
    return cleanedContent.trim();
  }

  const handlePlagiarismCheck = async () => {
    if (!id) return;

    const wordCountService = WordCountService.getInstance();
    const canCheck = await wordCountService.checkPlagiatAvailability();

    if (!canCheck) {
      setError('Du har ikke flere plagiat-sjekk igjen. Vennligst oppgrader abonnementet ditt.');
      return;
    }

    setIsPlagiarismChecking(true);
    setError(null);

    try {
      // Fetch the full article content from Supabase
      const { data, error } = await supabase
        .from('articles')
        .select('html')
        .eq('articleid', id)
        .single();

      if (error) throw error;

      if (!data || !data.html) {
        throw new Error('No content found for this article');
      }

      // Send the raw HTML content for plagiarism check
      const result = await checkPlagiarism(data.html);
      setPlagiarismResult(result);
      setIsPlagiarismDialogOpen(true);  // Open the dialog when results are ready

      // Deduct plagiarism check
      await wordCountService.deductPlagiatCheck();
      setPlagiatChecksRemaining(wordCountService.getPlagiatChecksRemaining());
    } catch (error) {
      console.error('Error checking plagiarism:', error);
      setError('Failed to check plagiarism. Please try again.');
    } finally {
      setIsPlagiarismChecking(false);
    }
  };

  const closePlagiarismDialog = () => {
    setIsPlagiarismDialogOpen(false);
    setPlagiarismResult(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold mb-2 text-gray-900 dark:text-white flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isGenerating ? (
            <>
              Skriver...
              <Loader2 className="ml-2 h-6 w-6 animate-spin" />
            </>
          ) : (
            'Fullført'
          )}
        </motion.h1>
        {generatedDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Skrevet {new Date(generatedDate).toLocaleString('no-NO')}
          </p>
        )}
        <div className="mb-8 flex space-x-4">
          <Button 
            onClick={handleDownload} 
            className="bg-[#06f] hover:bg-[#05d] text-white"
            disabled={isApiOperationInProgress}
          >
            <Download className="mr-2 h-4 w-4" />
            Last ned
          </Button>
          <Button 
            onClick={handleCopy} 
            className="bg-[#06f] hover:bg-[#05d] text-white"
            disabled={isApiOperationInProgress}
          >
            <Copy className="mr-2 h-4 w-4" />
            Kopier
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>  {/* Wrap button in span to allow tooltip on disabled button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="bg-[#06f] hover:bg-[#05d] text-white"
                        disabled={isApiOperationInProgress || wordsRemaining <= 0}
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Gjør bedre
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" onCloseAutoFocus={(e) => e.preventDefault()}>
                      <DropdownMenuLabel className="text-lg font-bold">Instillinger</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {Object.entries(upgradeSettings).map(([key, value]) => (
                        <DropdownMenuCheckboxItem
                          key={key}
                          checked={value}
                          onCheckedChange={() => handleUpgradeSettingChange(key as keyof typeof upgradeSettings)}
                          onSelect={(e) => e.preventDefault()}
                        >
                          <div className="flex items-center">
                            <Checkbox
                              checked={value}
                              onCheckedChange={() => handleUpgradeSettingChange(key as keyof typeof upgradeSettings)}
                              className="mr-2"
                            />
                            <span className="text-sm">
                              {key === 'splitParagraphs' && 'Del opp paragrafer til 1-3 setninger'}
                              {key === 'removeConclusions' && 'Fjern konklusjon midt i paragrafer'}
                              {key === 'reduceRepetition' && 'Minsk repetering'}
                              {key === 'simplifyComplexSentences' && 'Forenkle komplekse setninger'}
                              {key === 'expandParagraphs' && 'Utvid og ekspander paragrafer'}
                            </span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <Button 
                          onClick={handleStartUpgrade} 
                          className="w-full bg-[#06f] hover:bg-[#05d] text-white"
                          disabled={isApiOperationInProgress}
                          style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
                        >
                          <Wand2 className="mr-2 h-4 w-4" />
                          Start oppgradering
                        </Button>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1.5">
                        <h4 className="font-semibold mb-1">Info</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Når du bruker denne funksjonen vil det bruke opp ord du har inkludert i pakken din. Vi lanserer snart et abonnement som gjør at oppgradering av tekst vil være gratis.
                        </p>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {wordsRemaining <= 0 ? 'Ingen ord igjen, vennligst oppgrader' : 'Forbedre artikkelen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isApiOperationInProgress}
            style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Slett
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handlePlagiarismCheck}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    disabled={isApiOperationInProgress || isPlagiarismChecking || plagiatChecksRemaining <= 0}
                  >
                    {isPlagiarismChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sjekker...
                      </>
                    ) : (
                      'Sjekk tekst for plagiat'
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {plagiatChecksRemaining <= 0 ? 'Ingen plagiat-sjekk igjen, vennligst oppgrader' : `${plagiatChecksRemaining} plagiat-sjekk igjen`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="mb-4 flex space-x-4">
          <button
            onClick={() => setShowUpgraded(false)}
            className={`text-sm ${!showUpgraded ? 'text-blue-600 font-semibold' : 'text-gray-500'} hover:underline`}
            disabled={isApiOperationInProgress}
            style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
          >
            Original
          </button>
          <button
            onClick={() => setShowUpgraded(true)}
            className={`text-sm ${showUpgraded ? 'text-blue-600 font-semibold' : 'text-gray-500'} hover:underline`}
            disabled={isApiOperationInProgress}
            style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
          >
            {isApiOperationInProgress ? 'Oppgraderer...' : 'Oppgradert'}
          </button>
        </div>
        <div 
          ref={editableContentRef}
          className="article-content"
          contentEditable={isEditing}
          onBlur={isEditing ? handleSaveEdit : undefined}
          dangerouslySetInnerHTML={{ 
            __html: isGenerating 
              ? streamedContent || '<p>Genererer artikkel...</p>'
              : cleanArticleContent(showUpgraded && hasUpgradedVersion ? upgradedContent : generatedContent)
          }}
        />

        {isEditing && (
          <Button onClick={handleSaveEdit} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
            Save Changes
          </Button>
        )}

        {webSearchResults && webSearchResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Related Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {webSearchResults.slice(0, 4).map((result, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white truncate">
                    {result.title || 'No title'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {result.text ? `${result.text.substring(0, 80)}...` : 'No text available'}
                  </p>
                  <a 
                    href={result.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:underline"
                  >
                    Les mer
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <AlertDialog open={isPlagiarismDialogOpen} onOpenChange={setIsPlagiarismDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">Plagiatsjekk resultat</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 dark:text-gray-300">
              {plagiarismResult && (
                <div className="space-y-4">
                  <p>Plagiat funnet: <span className="font-semibold">{plagiarismResult.isPlagiarized ? 'Ja' : 'Nei'}</span></p>
                  <p>Prosent plagiert: <span className="font-semibold">{plagiarismResult.percentPlagiarized.toFixed(2)}%</span></p>
                  {plagiarismResult.sources.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Kilder:</p>
                      <ul className="space-y-2">
                        {plagiarismResult.sources.map((source, index) => (
                          <li key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{source.title}</a>
                            {source.matchedWords !== undefined && (
                              <p>Matchede ord: <span className="font-semibold">{source.matchedWords}</span></p>
                            )}
                            {source.percentMatched !== undefined && (
                              <p>Prosent matchet: <span className="font-semibold">{source.percentMatched.toFixed(2)}%</span></p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col items-center">
            <AlertDialogAction onClick={closePlagiarismDialog} className="bg-blue-500 hover:bg-blue-600 text-white">OK</AlertDialogAction>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sjekket med Copyscape</p>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}