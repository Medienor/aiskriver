'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { supabase } from '../../lib/supabase'
import { Button } from "@/components/ui/button"
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wordsRemaining, setWordsRemaining] = useState<number>(0)
  const [totalWords, setTotalWords] = useState<number>(5000) // Default to 5000 for free users

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchWordCount()
    }
  }, [status, router, session])

  const fetchWordCount = async () => {
    if (!session?.user?.email) return;

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('words_remaining, total_words')
      .eq('user_id', session.user.email)
      .single();

    if (error) {
      console.error('Error fetching word count:', error);
    } else if (data) {
      setWordsRemaining(data.words_remaining);
      setTotalWords(data.total_words || 5000); // Use total_words if available, otherwise default to 5000
    }
  }

  const handleWriteArticle = () => {
    router.push('/write-article') // Adjust this route as needed
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Ready to write?</p>
      </div>
      
      <div className="w-64 h-64 mb-8">
        <CircularProgressbar
          value={(wordsRemaining / totalWords) * 100}
          text={`${wordsRemaining}`}
          styles={buildStyles({
            textSize: '16px',
            pathColor: wordsRemaining > 0 ? '#06f' : '#ef4444',
            textColor: '#888',
            trailColor: '#d6d6d6',
          })}
        />
      </div>
      
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        {wordsRemaining} / {totalWords} words left
      </p>
      
      <Button 
        onClick={handleWriteArticle}
        className="bg-[#06f] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
      >
        Write Article
      </Button>
    </div>
  )
}