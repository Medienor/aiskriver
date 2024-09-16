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
import { upgradeSelectedText } from '../../../services/UpgradeArticleService';
import { upgradeFullArticle } from '../../../services/FullArticleUpgradeService';
import EditToolbar from '@/components/EditToolbar'
import { generateArticle } from '../../../services/OpenAIService';
import { FormData } from '../../../types/FormData';

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

  const [selectedText, setSelectedText] = useState('')
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const editableContentRef = useRef<HTMLDivElement>(null)
  const [refreshingText, setRefreshingText] = useState<string | null>(null)
  const [isApiOperationInProgress, setIsApiOperationInProgress] = useState(false)
  const [editorContent, setEditorContent] = useState<string>('')

  useEffect(() => {
    const storedRefreshingText = localStorage.getItem('refreshingText')
    if (storedRefreshingText) {
      setRefreshingText(storedRefreshingText)
      localStorage.removeItem('refreshingText')
    }
  }, [])

  useEffect(() => {
    if (session?.user?.email && id) {
      fetchArticleAndGenerate()
    }
  }, [session, id, isNewArticle])

  const fetchArticleAndGenerate = async () => {
    try {
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('articleid', id)
        .single()

      if (articleError) throw articleError

      if (articleData.status === 'draft' && isNewArticle) {
        await generateArticleContent(JSON.parse(articleData.html))
      } else {
        setGeneratedContent(cleanArticleContent(articleData.html))
        setUpgradedContent(cleanArticleContent(articleData.upgraded_html || ''))
        setGeneratedDate(articleData.created_at || null)
        setHasUpgradedVersion(!!articleData.upgraded_html)
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to fetch article. Please try again.');
      setIsLoading(false)
    }
  }

  const generateArticleContent = async (formData: Record<string, unknown>) => {
    setIsLoading(true)
    setError(null)
    setGeneratedContent('')
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleid: id, formData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedContent(cleanArticleContent(data.content));
      setWebSearchResults(data.webSearchResults);
      setGeneratedDate(new Date().toISOString());
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating article:', err);
      setError('Failed to generate article. Please try again.');
      setIsLoading(false)
    }
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
    console.log('Starting upgrade with settings:', upgradeSettings);
    setIsLoading(true);
    setIsApiOperationInProgress(true);
    setError(null);
    setUpgradedContent(''); // Reset the upgraded content
    setShowUpgraded(true); // Switch to the "Oppgradert" tab immediately

    try {
      console.log('Checking OpenAI API key...');
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        console.error('OpenAI API key is not set');
        throw new Error('OpenAI API key is not set');
      }

      console.log('Calling upgradeFullArticle function...');
      console.log('Current content length:', generatedContent.length);
      
      let fullUpgradedContent = '';
      for await (const chunk of upgradeFullArticle(generatedContent, upgradeSettings)) {
        fullUpgradedContent += chunk;
        setUpgradedContent(prev => prev + chunk);
        // Optional: Add a small delay to allow React to update the state
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      console.log('Upgrade completed. New content length:', fullUpgradedContent.length);
      console.log('First 200 characters of upgraded content:', fullUpgradedContent.substring(0, 200));

      console.log('Updating article in Supabase...');
      const { error: updateError } = await supabase
        .from('articles')
        .update({ upgraded_html: fullUpgradedContent })
        .eq('articleid', id);

      if (updateError) {
        console.error('Error updating article in Supabase:', updateError);
        throw updateError;
      }

      console.log('Article updated successfully in Supabase');
      setHasUpgradedVersion(true);
    } catch (err) {
      console.error('Error upgrading article:', err);
      setError('Failed to upgrade article. Please try again.');
    } finally {
      setIsLoading(false);
      setIsApiOperationInProgress(false);
      console.log('Upgrade process completed');
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

  const handleTextSelection = () => {
    // Only allow text selection when not showing the upgraded version
    if (showUpgraded) return;

    const selection = window.getSelection()
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const selectedElement = range.commonAncestorContainer.parentElement
      if (selectedElement) {
        const rect = selectedElement.getBoundingClientRect()
        setSelectedText(selection.toString())
        setToolbarPosition({
          top: window.scrollY + rect.bottom,
          left: window.scrollX + rect.left
        })
        setShowToolbar(true)
      }
    } else {
      setShowToolbar(false)
    }
  }

  const handleRefresh = async () => {
    if (!selectedText) return
    try {
      setRefreshingText(selectedText)
      localStorage.setItem('refreshingText', selectedText)
      const upgradedContent = await upgradeSelectedText(selectedText)
      const cleanedUpgradedContent = cleanArticleContent(upgradedContent)
      
      const currentContent = showUpgraded ? upgradedContent : generatedContent
      
      // Find the start and end indices of the selected text
      const startIndex = currentContent.indexOf(selectedText)
      if (startIndex === -1) {
        console.error('Selected text not found in current content')
        setError('Failed to refresh content. Selected text not found.')
        return
      }
      const endIndex = startIndex + selectedText.length

      // Replace only the selected portion of the content
      const newContent = 
        currentContent.substring(0, startIndex) + 
        cleanedUpgradedContent + 
        currentContent.substring(endIndex)

      if (showUpgraded) {
        setUpgradedContent(newContent)
      } else {
        setGeneratedContent(newContent)
      }
      await updateArticleInSupabase(newContent, showUpgraded)
    } catch (error) {
      console.error('Error refreshing content:', error)
      setError('Failed to refresh content. Please try again.')
    } finally {
      setRefreshingText(null)
      localStorage.removeItem('refreshingText')
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setEditorContent(showUpgraded ? upgradedContent : generatedContent)
  }

  const handleEditorChange = (content: string) => {
    setEditorContent(content)
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

  const handleDeleteSelection = async () => {
    if (!selectedText) return
    const currentContent = showUpgraded ? upgradedContent : generatedContent
    const newContent = currentContent.replace(selectedText, '')
    if (showUpgraded) {
      setUpgradedContent(newContent)
    } else {
      setGeneratedContent(newContent)
    }
    await updateArticleInSupabase(newContent, showUpgraded)
    setShowToolbar(false)
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
    // Remove <html> tags
    let cleanedContent = content.replace(/<html>/g, '').replace(/<\/html>/g, '');
    
    // Remove ```html and ``` tags
    cleanedContent = cleanedContent.replace(/```html/g, '').replace(/```/g, '');
    
    // Trim any leading or trailing whitespace
    cleanedContent = cleanedContent.trim();
    
    return cleanedContent;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.h1 
          className="text-3xl font-bold mb-2 text-gray-900 dark:text-white flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading ? (
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
            style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            onClick={handleCopy} 
            className="bg-[#06f] hover:bg-[#05d] text-white"
            disabled={isApiOperationInProgress}
            style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="bg-[#06f] hover:bg-[#05d] text-white"
                disabled={isApiOperationInProgress}
                style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
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
          <Button 
            onClick={handleDelete} 
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={isApiOperationInProgress}
            style={{ opacity: isApiOperationInProgress ? 0.5 : 1 }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Slett
          </Button>
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
        {showToolbar && !showUpgraded && (
          <div style={{ position: 'fixed', top: toolbarPosition.top, left: toolbarPosition.left }}>
            <EditToolbar onRefresh={handleRefresh} onEdit={handleEdit} onDelete={handleDeleteSelection} />
          </div>
        )}
        <div 
          ref={editableContentRef}
          className="article-content"
          contentEditable={isEditing}
          onBlur={isEditing ? handleSaveEdit : undefined}
          onMouseUp={showUpgraded ? undefined : handleTextSelection}
          dangerouslySetInnerHTML={{ 
            __html: cleanArticleContent(showUpgraded && hasUpgradedVersion ? upgradedContent : generatedContent)
              .replace(refreshingText || '', `<span class="skeleton-loader">${refreshingText || ''}</span>`)
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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
        
        .article-content {
          font-family: 'Inter', sans-serif;
          color: #000000;
          line-height: 1.6;
        }
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4,
        .article-content h5,
        .article-content h6 {
          color: inherit;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .article-content h1 {
          font-size: 2.5em;
        }
        .article-content h2 {
          font-size: 2em;
        }
        .article-content h3 {
          font-size: 1.5em;
        }
        .article-content p {
          margin-bottom: 1em;
        }
        .article-content ul,
        .article-content ol {
          margin-bottom: 1em;
          padding-left: 2em;
        }
        .article-content li {
          margin-bottom: 0.5em;
        }
        .article-content ul > li {
          list-style-type: disc;
        }
        .article-content ol > li {
          list-style-type: decimal;
        }
        @media (prefers-color-scheme: dark) {
          .article-content {
            color: #ffffff;
          }
          .article-content h1,
          .article-content h2,
          .article-content h3,
          .article-content h4,
          .article-content h5,
          .article-content h6 {
            color: #ffffff;
          }
        }
        ::selection {
          background-color: #3b82f6;
          color: white;
        }
        
        .skeleton-loader {
          display: inline-block;
          position: relative;
          overflow: hidden;
          background-color: #e2e8f0;
          color: transparent;
          animation: skeleton-loading 1s infinite alternate;
        }

        .skeleton-loader::before {
          content: '';
          display: block;
          position: absolute;
          left: -150px;
          top: 0;
          height: 100%;
          width: 150px;
          background: linear-gradient(to right, transparent 0%, #f0f4f8 50%, transparent 100%);
          animation: skeleton-load 1s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
        }

        @media (prefers-color-scheme: dark) {
          .skeleton-loader {
            background-color: #2d3748;
          }

          .skeleton-loader::before {
            background: linear-gradient(to right, transparent 0%, #4a5568 50%, transparent 100%);
          }
        }

        @keyframes skeleton-loading {
          0% {
            background-color: #e2e8f0;
          }
          100% {
            background-color: #f0f4f8;
          }
        }

        @media (prefers-color-scheme: dark) {
          @keyframes skeleton-loading {
            0% {
              background-color: #2d3748;
            }
            100% {
              background-color: #4a5568;
            }
          }
        }

        @keyframes skeleton-load {
          from {
            left: -150px;
          }
          to {
            left: 100%;
          }
        }
      `}</style>
    </div>
  )
}