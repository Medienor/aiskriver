'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { supabase } from '../../lib/supabase'
import ArticleForm from '../../components/ArticleForm'
import { v4 as uuidv4 } from 'uuid'
import { generateArticle } from '../../services/OpenAIService'
import type { FormData } from '../../types/FormData'
import { generateArticleWithWebSearch } from '../../services/WebSearchArticleService';
import { WordCountService } from '../../services/WordCountService';

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wordsRemaining, setWordsRemaining] = useState<number>(0)
  const [totalWords, setTotalWords] = useState<number>(0)
  const [sitemaps, setSitemaps] = useState<{ id: number; url: string }[]>([])

  const fetchWordCount = async () => {
    if (!session?.user?.email) return;

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('words_remaining, total_words')
        .eq('user_id', session.user.email)
        .single();

      if (error) throw error;

      setWordsRemaining(data.words_remaining);
      setTotalWords(data.total_words);
    } catch (error) {
      console.error('Error fetching word count:', error);
    }
  }

  const fetchSitemaps = async () => {
    if (!session?.user?.email) return;

    try {
      const { data, error } = await supabase
        .from('sitemaps')
        .select('id, url')
        .eq('user_email', session.user.email);

      if (error) throw error;

      setSitemaps(data || []);
    } catch (error) {
      console.error('Error fetching sitemaps:', error);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchWordCount()
      fetchSitemaps()
    }
  }, [status, router, session])

  const handleArticleGeneration = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const articleId = uuidv4()
      
      // Convert formData to a string
      const formDataString = JSON.stringify(formData)

      // Create a new article in Supabase immediately
      const { error: insertError } = await supabase
        .from('articles')
        .insert([
          { 
            articleid: articleId, 
            title: formData.title, 
            user_id: session?.user?.email,
            status: 'pending', // Set status to 'pending'
            formData: formDataString // Store the form data as a string
          }
        ])

      if (insertError) {
        throw new Error(`Kunne ikke opprette artikkel: ${insertError.message}`)
      }

      // If a project folder is selected, link the article to the folder
      if (formData.projectId) {
        const { error: folderLinkError } = await supabase
          .from('folder_articles')
          .insert([
            {
              folder_id: parseInt(formData.projectId),
              article_id: articleId
            }
          ])

        if (folderLinkError) {
          console.error('Feil ved linking av artikkel til mappe:', folderLinkError)
        }
      }

      // Redirect to the new article page
      router.push(`/article/${articleId}`)

    } catch (err) {
      console.error('Feil i handleArticleGeneration:', err);
      setError('Kunne ikke opprette artikkel. Vennligst prøv igjen.');
    } finally {
      setIsLoading(false)
    }
  }

  function getEstimatedWordCount(length: string): number {
    switch (length) {
      case 'short': return 500;
      case 'medium': return 1000;
      case 'long': return 1500;
      default: return 1000;
    }
  }

  function countWords(text: string): number {
    // Remove HTML tags
    const strippedText = text.replace(/<[^>]*>/g, '');
    // Split by whitespace and filter out empty strings
    const words = strippedText.split(/\s+/).filter(word => word.length > 0);
    return words.length;
  }

  const wordCountPercentage = (wordsRemaining / totalWords) * 100;
  const isWordCountLow = wordCountPercentage < 20;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4">
        <main className="flex flex-col md:flex-row">
          <div className="p-4 w-full">
            <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Artikkel Dashbord</h1>
            <ArticleForm 
              onSubmit={handleArticleGeneration} 
              wordsRemaining={wordsRemaining} 
              totalWords={totalWords} 
              userEmail={session?.user?.email || ''}
              sitemaps={sitemaps}
            />
            <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
              {wordsRemaining} / {totalWords} ord igjen
            </p>
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        </main>
      </div>
    </div>
  )
}
