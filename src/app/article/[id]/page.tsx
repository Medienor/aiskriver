'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { upgradeFullArticle } from '../../../services/FullArticleUpgradeService';
import '@/styles/article-styles.css'
import { checkPlagiarism, CopyscapeResult } from '../../../services/CopyscapeService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { WordCountService } from '../../../services/WordCountService'
import { fixStreamedHTML } from '../../../utils/FixHTML';
import TextSelectionToolbar from '@/components/TextSelectionToolbar';
import ContentBlock from '@/components/ContentBlock';
import { generateTable } from '../../../services/TableGenerationService';
import { WordPressPostButton } from '@/components/WordPressPostButton';
import { ChevronDown } from 'lucide-react'

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
  const hasStartedGenerating = useRef(false);
  const [isUpgradeInitiated, setIsUpgradeInitiated] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);
  const [contentBlocks, setContentBlocks] = useState<Array<{ id: string; content: string; type: string }>>([]);
  const [loadingTableIndex, setLoadingTableIndex] = useState<number | null>(null);

  useEffect(() => {
    if (session?.user?.email && id && isInitialLoad && !hasStartedGenerating.current) {
      fetchArticleAndGenerate()
      fetchWordCount()
      fetchPlagiatChecksRemaining()
      setIsInitialLoad(false)
    }
  }, [session, id, isInitialLoad])
  
  const fetchArticleAndGenerate = async () => {
    if (hasStartedGenerating.current) return;
    hasStartedGenerating.current = true;
    
    try {
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('articleid', id)
        .single()
  
      if (articleError) throw articleError
  
      if (articleData.status === 'pending') {
        setIsGenerating(true);
        setGeneratedContent('Genererer artikkel...');
        
        const formData = JSON.parse(articleData.formData);

        // Update the status to 'generating' to prevent duplicate generations
        await supabase
          .from('articles')
          .update({ status: 'generating' })
          .eq('articleid', id);

        const response = await fetch('/api/test-openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              const content = line.slice(6);
              fullContent += content;
              const fixedContent = fixStreamedHTML(content);
              setStreamedContent(prev => prev + fixedContent);
            }
          }
        }

        // Deduct words only once, after the full content is generated
        const wordCount = fullContent.split(/\s+/).length;
        const wordCountService = WordCountService.getInstance();
        await wordCountService.initializeUser(session?.user?.email || '');
        await wordCountService.deductWords(wordCount);

        // Update the article status to 'generated' in the database
        await supabase
          .from('articles')
          .update({ 
            html: fullContent,
            status: 'generated'
          })
          .eq('articleid', id);

        setGeneratedContent(fullContent);
        setIsGenerating(false);
        setIsLoading(false);
        fetchWordCount(); // Update the displayed word count
      } else if (articleData.status === 'generating') {
        // If it's already generating, just start polling
        setIsGenerating(true);
        pollForArticleUpdates();
      } else {
        // If it's already generated, just display the content
        setGeneratedContent(cleanArticleContent(articleData.html))
        setUpgradedContent(cleanArticleContent(articleData.upgraded_html || ''))
        setGeneratedDate(articleData.created_at || null)
        setHasUpgradedVersion(!!articleData.upgraded_html)
        setIsUpgradeInitiated(!!articleData.upgraded_html)
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
    setIsUpgradeInitiated(true);
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

  const handleContentChange = useCallback((index: number, newContent: string) => {
    setContentBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      newBlocks[index] = { ...newBlocks[index], content: newContent };
      
      // Update Supabase with the full content
      const fullContent = newBlocks.map(block => block.content).join('');
      updateArticleInSupabase(fullContent, showUpgraded);
      
      return newBlocks;
    });
  }, [showUpgraded]);

  const handleAddElement = useCallback((type: string, index: number) => {
    setContentBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      const newContent = type === 'ul' || type === 'ol' 
        ? `<${type}><li>New list item</li></${type}>`
        : `<${type}>New ${type} content</${type}>`;
      newBlocks.splice(index + 1, 0, {
        id: `block-${Date.now()}`,
        content: newContent,
        type: type,
      });
      
      // Update Supabase with the full content
      const fullContent = newBlocks.map(block => block.content).join('');
      updateArticleInSupabase(fullContent, showUpgraded);
      
      return newBlocks;
    });
  }, [showUpgraded]);

  const handleFormatChange = useCallback((format: string) => {
    document.execCommand(format, false, undefined);
    updateContentAfterFormatting();
  }, []);

  const handleStyleChange = useCallback((style: 'bold' | 'italic' | 'underline') => {
    console.log('handleStyleChange called with:', style);
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      console.log('Selection before style change:', selection.toString());
      console.log('Selection range:', {
        startContainer: selection.anchorNode,
        startOffset: selection.anchorOffset,
        endContainer: selection.focusNode,
        endOffset: selection.focusOffset
      });
      
      try {
        document.execCommand(style, false, undefined);
        console.log('Style applied successfully');
      } catch (error) {
        console.error('Error applying style:', error);
      }
      
      console.log('Content after style change:', editableContentRef.current?.innerHTML);
      updateContentAfterFormatting();
    } else {
      console.log('No text selected or selection collapsed');
    }
  }, []);

  const handleAddLink = useCallback(() => {
    const url = prompt('Enter the URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      updateContentAfterFormatting();
    }
  }, []);

  useEffect(() => {
    if (editableContentRef.current) {
      const content = isGenerating 
        ? streamedContent
        : cleanArticleContent(showUpgraded && hasUpgradedVersion ? upgradedContent : generatedContent);
      
      if (content) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const blocks = Array.from(doc.body.children).map((child, index) => ({
          id: `block-${index}`,
          content: child.outerHTML,
          type: child.tagName.toLowerCase(),
        }));
        setContentBlocks(blocks);
      }
    }
  }, [isGenerating, streamedContent, showUpgraded, hasUpgradedVersion, upgradedContent, generatedContent]);

  const handleContentBlur = useCallback(async () => {
    if (!isGenerating && !isLoading && editableContentRef.current) {
      const newContent = editableContentRef.current.innerHTML;
      await updateArticleInSupabase(newContent, showUpgraded);
    }
  }, [isGenerating, isLoading, showUpgraded]);

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

  const handleAICommand = () => {
    // Implement AI command functionality
    console.log('AI command triggered');
  };

  const handleCite = () => {
    // Implement citation functionality
    console.log('Citation triggered');
  };

  const handleReplaceSelection = useCallback((newText: string) => {
    console.log('handleReplaceSelection called with:', newText);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      console.log('Selection range before:', range.toString());
      range.deleteContents();
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);
      console.log('Content after replacement:', editableContentRef.current?.innerHTML);
      updateContentAfterFormatting();
    }
  }, []);

  const handleInsertBelow = useCallback((newText: string) => {
    console.log('handleInsertBelow called with:', newText);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      console.log('Selection range before:', range.toString());
      const newParagraph = document.createElement('p');
      newParagraph.textContent = newText;
      range.collapse(false);
      range.insertNode(newParagraph);
      console.log('Content after insertion:', editableContentRef.current?.innerHTML);
      updateContentAfterFormatting();
    }
  }, []);

  const updateContentAfterFormatting = useCallback(() => {
    console.log('updateContentAfterFormatting called');
    if (editableContentRef.current) {
      console.log('Content before update:', editableContentRef.current.innerHTML);
      const newBlocks = Array.from(editableContentRef.current.children).map((child, index) => {
        console.log(`Block ${index}:`, child.outerHTML);
        return {
          id: `block-${index}`,
          content: child.outerHTML,
          type: child.tagName.toLowerCase(),
        };
      });
      setContentBlocks(newBlocks);
      const fullContent = newBlocks.map(block => block.content).join('');
      console.log('Full content after update:', fullContent);
      updateArticleInSupabase(fullContent, showUpgraded);
    } else {
      console.log('editableContentRef.current is null');
    }
  }, [showUpgraded]);

  const handleDeleteBlock = useCallback(async (index: number) => {
    setContentBlocks(prevBlocks => {
      const newBlocks = prevBlocks.filter((_, i) => i !== index);
      
      // Update Supabase with the full content
      const fullContent = newBlocks.map(block => block.content).join('');
      updateArticleInSupabase(fullContent, showUpgraded);
      
      return newBlocks;
    });
  }, [showUpgraded]);

  const handleAddTable = useCallback(async (index: number) => {
    const currentBlock = contentBlocks[index];
    let heading = '';
    const paragraph = currentBlock.content;

    // Find the closest h2 or h3
    for (let i = index - 1; i >= 0; i--) {
      if (contentBlocks[i].type === 'h2' || contentBlocks[i].type === 'h3') {
        heading = contentBlocks[i].content.replace(/<[^>]*>/g, '');
        break;
      }
    }

    console.log('Sending to generateTable:', { heading, paragraph });

    setLoadingTableIndex(index);

    try {
      let tableHtml = await generateTable(heading, paragraph.replace(/<[^>]*>/g, ''));
      console.log('Received tableHtml:', tableHtml);
      
      // Remove ```html and ``` if present
      tableHtml = tableHtml.replace(/```html\n?|\n?```/g, '');

      // Add a wrapper div with styling
      tableHtml = `<div class="table-wrapper">${tableHtml}</div>`;
      
      setContentBlocks(prevBlocks => {
        const newBlocks = [...prevBlocks];
        newBlocks.splice(index + 1, 0, {
          id: `block-${Date.now()}`,
          content: tableHtml,
          type: 'table',
        });
        
        // Update Supabase with the full content
        const fullContent = newBlocks.map(block => block.content).join('');
        updateArticleInSupabase(fullContent, showUpgraded);
        
        return newBlocks;
      });
    } catch (error) {
      console.error('Error generating table:', error);
      setError('Failed to generate table. Please try again.');
    } finally {
      setLoadingTableIndex(null);
    }
  }, [contentBlocks, showUpgraded, updateArticleInSupabase]);

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
        <div className="mb-8 flex space-x-4 min-w-max overflow-x-auto">
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
          <Button 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isApiOperationInProgress}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Slett
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="bg-[#06f] hover:bg-[#05d] text-white"
                        disabled={isApiOperationInProgress}
                      >
                        Eksporter
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Last ned
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopy}>
                        <Copy className="mr-2 h-4 w-4" />
                        Kopier
                      </DropdownMenuItem>
                      {id && ( // Only render WordPressPostButton if id is not null
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <WordPressPostButton 
                            articleContent={showUpgraded ? upgradedContent : generatedContent}
                            articleId={id}
                          />
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Eksporter artikkel
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
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
                    <DropdownMenuContent className="w-80">
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
          {isUpgradeInitiated && (
            <button
              onClick={() => setShowUpgraded(true)}
              className={`text-sm ${showUpgraded ? 'text-blue-600 font-semibold' : 'text-gray-500'} hover:underline`}
              disabled={isApiOperationInProgress}
              style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
            >
              {isApiOperationInProgress ? 'Oppgraderer...' : 'Oppgradert'}
            </button>
          )}
        </div>
        <div 
          className="article-content"
          ref={editableContentRef}
        >
          {contentBlocks.map((block, index) => (
            <ContentBlock
              key={block.id}
              content={block.content}
              type={block.type}
              onAddElement={(type) => handleAddElement(type, index)}
              onContentChange={(newContent) => {
                console.log(`ContentBlock ${index} changed:`, newContent);
                handleContentChange(index, newContent);
              }}
              onDeleteBlock={() => handleDeleteBlock(index)}
              onAddTable={() => handleAddTable(index)}
              isLoadingTable={loadingTableIndex === index}
            />
          ))}
        </div>
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
                  <p>Antall treff: <span className="font-semibold">{plagiarismResult.count}</span></p>
                  {plagiarismResult.allwordsmatched !== undefined && (
                    <p>Totalt antall ord matchet: <span className="font-semibold">{plagiarismResult.allwordsmatched}</span></p>
                  )}
                  {plagiarismResult.allpercentmatched !== undefined && (
                    <p>Total prosent matchet: <span className="font-semibold">{plagiarismResult.allpercentmatched.toFixed(2)}%</span></p>
                  )}
                  {plagiarismResult.result && plagiarismResult.result.length > 0 && (
                    <div>
                      <p className="font-semibold mb-2">Kilder:</p>
                      <ul className="space-y-2">
                        {plagiarismResult.result.map((source, index) => (
                          <li key={index} className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">{source.title}</a>
                            <p>Minimum ord matchet: <span className="font-semibold">{source.minwordsmatched}</span></p>
                            <p>Prosent matchet: <span className="font-semibold">{source.percentmatched.toFixed(2)}%</span></p>
                            <p>Tekstutdrag: <span className="italic">{source.textsnippet}</span></p>
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
      <TextSelectionToolbar
        onAICommand={handleAICommand}
        onCite={handleCite}
        onFormatChange={handleFormatChange}
        onStyleChange={handleStyleChange}
        onAddLink={handleAddLink}
        onReplaceSelection={handleReplaceSelection}
        onInsertBelow={handleInsertBelow}
      />
    </div>
  )
}