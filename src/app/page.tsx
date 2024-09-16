'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { supabase } from '../lib/supabase'
import ArticleForm from '../components/ArticleForm'
import { v4 as uuidv4 } from 'uuid'
import { generateArticle } from '../services/OpenAIService'  // Add this import
import type { FormData } from '../types/FormData'
import { generateArticleWithWebSearch } from '../services/WebSearchArticleService';
import { WordCountService } from '../services/WordCountService';

// Remove the unused import
// import { motion } from 'framer-motion'
// import 'react-circular-progressbar/dist/styles.css'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [wordsRemaining, setWordsRemaining] = useState<number>(0)
  const [totalWords, setTotalWords] = useState<number>(0)

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchWordCount()
    }
  }, [status, router, session])

  const handleArticleGeneration = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const wordCountService = WordCountService.getInstance();
      await wordCountService.initializeUser(session?.user?.email || '');
      const estimatedWordCount = getEstimatedWordCount(formData.length);

      if (!(await wordCountService.checkWordAvailability(estimatedWordCount))) {
        throw new Error('Insufficient words remaining. Please upgrade your package or buy additional words.');
      }

      const articleId = uuidv4()
      
      console.log('Sending form data to OpenAI:', formData);

      // Create a new article in Supabase immediately
      const { error: insertError } = await supabase
        .from('articles')
        .insert([
          { 
            articleid: articleId, 
            title: formData.title, 
            user_id: session?.user?.email,
            status: 'generating', // Set status to 'generating' immediately
            formData: formData // Store the form data
          }
        ])

      if (insertError) {
        console.error('Feil ved innsetting av artikkel:', insertError)
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
          // Note: We don't throw an error here to allow article creation to continue
        }
      }

      // Redirect to the new article page immediately
      router.push(`/article/${articleId}?new=true`)

      // Generate the article content in the background
      let fullContent = '';
      if (formData.enableWebSearch) {
        await generateArticleWithWebSearch(formData, articleId);
        const { data, error } = await supabase
          .from('articles')
          .select('html')
          .eq('articleid', articleId)
          .single();
        if (error) throw error;
        fullContent = data.html;
      } else {
        for await (const chunk of generateArticle(formData)) {
          fullContent += chunk;
          // Update the article with the generated content
          await supabase
            .from('articles')
            .update({ 
              html: fullContent,
              status: 'generating'
            })
            .eq('articleid', articleId)
        }
      }

      // Final update to set status to 'generated'
      const { error: finalUpdateError } = await supabase
        .from('articles')
        .update({ 
          status: 'generated'
        })
        .eq('articleid', articleId)

      if (finalUpdateError) {
        console.error('Feil ved endelig oppdatering av artikkel:', finalUpdateError)
      }

      // Deduct words after successful generation
      const actualWordCount = countWords(fullContent);
      await wordCountService.deductWords(actualWordCount);
      fetchWordCount(); // Update the displayed word count

      console.log(`Deducted ${actualWordCount} words from user's balance.`);

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
              userEmail={session?.user?.email || ''}  // Add this line
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
