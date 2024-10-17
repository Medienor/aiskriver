'use client'

import React, { useState, useEffect } from 'react'
import { Wand2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const Sparkle = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="16" height="16" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z" fill="#FFC700"/>
  </svg>
)

export default function MagicButton() {
  const { data: session } = useSession()
  const [wordsRemaining, setWordsRemaining] = useState<number | null>(null)
  const [wordCountStatus, setWordCountStatus] = useState<'loading' | 'error' | 'success'>('loading')

  useEffect(() => {
    if (session) {
      fetchWordCounts()
    }
  }, [session])

  const fetchWordCounts = async () => {
    setWordCountStatus('loading')
    try {
      if (!session?.user?.email) {
        throw new Error('User email not found in session')
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('words_remaining')
        .eq('user_id', session.user.email)
        .single()

      if (error) throw error

      if (data) {
        setWordsRemaining(data.words_remaining)
        setWordCountStatus('success')
      } else {
        setWordsRemaining(null)
        setWordCountStatus('error')
      }
    } catch (error) {
      console.error('Error fetching word counts:', error)
      setWordsRemaining(null)
      setWordCountStatus('error')
    }
  }

  const buttonText = wordsRemaining === 0 ? 'Oppgrader' : 'Endre med AI'
  const buttonProps = wordsRemaining === 0 ? { 'data-no-words': true } : {}

  return (
    <div className="relative inline-block magical-button-wrapper">
      {wordsRemaining === 0 ? (
        <Link href="/pricing">
          <button
            className="flex items-center justify-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md transition-all duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            {...buttonProps}
          >
            <Wand2 className="w-4 h-4 mr-1.5" />
            {buttonText}
          </button>
        </Link>
      ) : (
        <button
          className="flex items-center justify-center px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md transition-all duration-300 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          {...buttonProps}
        >
          <Wand2 className="w-4 h-4 mr-1.5" />
          {buttonText}
        </button>
      )}
      <Sparkle style={{ position: 'absolute', top: '50%', left: '-20px', animation: 'floatHorizontal 4s ease-in-out infinite' }} />
      <Sparkle style={{ position: 'absolute', top: '-10px', right: '-10px', animation: 'floatVertical 4s ease-in-out infinite 0.5s' }} />
      <style jsx>{`
        @keyframes floatHorizontal {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          50% { transform: translateX(8px) rotate(10deg); }
        }
        @keyframes floatVertical {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(10deg); }
        }
        button {
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
        }
        .magical-button-wrapper {
          animation: smoothPulse 2s infinite;
        }
        @keyframes smoothPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 0 16px 8px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
      `}</style>
    </div>
  )
}