'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Smile, User, Search, Link as LinkIcon, Calculator, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ContactPopup from './ContactPopup';

interface Article {
  id: string;
  title: string;
  created_at: string;
}

export function SideMenu() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [wordsRemaining, setWordsRemaining] = useState<number | null>(null);
  const [totalWords, setTotalWords] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isContactPopupOpen, setIsContactPopupOpen] = useState(false);
  const [contactType, setContactType] = useState<'contact' | 'feedback'>('contact');

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchRecentArticles = async () => {
        const { data, error } = await supabase
          .from('content')
          .select('id, title, created_at')
          .eq('user_id', session.user.email)
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) {
          console.error('Error fetching recent articles:', error)
        } else {
          setRecentArticles(data || [])
        }
      }

      const fetchWordCount = async () => {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('words_remaining, total_words')
          .eq('user_id', session.user.email)
          .single()

        if (error) {
          console.error('Error fetching word count:', error)
        } else if (data) {
          setWordsRemaining(data.words_remaining)
          setTotalWords(data.total_words)
        }
      }

      fetchRecentArticles()
      fetchWordCount()
    }
  }, [status, session]);

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session) {
      router.push('/affiliate');
    } else {
      router.push('/bli-affiliate');
    }
  };

  const wordUsagePercentage = totalWords && wordsRemaining != null
    ? Math.min((wordsRemaining / totalWords) * 100, 100) // Ensure it doesn't exceed 100%
    : 0;

  const getProgressBarColor = (percentage: number) => {
    if (percentage <= 10) return 'bg-red-600';
    if (percentage <= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  const toggleSideMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  const openContactPopup = (type: 'contact' | 'feedback') => {
    setContactType(type);
    setIsContactPopupOpen(true);
  };

  const closeContactPopup = () => {
    setIsContactPopupOpen(false);
  };

  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.slice(0, maxLength) + '...';
  };

  return (
    <>
      <div className="hidden md:flex md:flex-col md:w-64 bg-gray-100 dark:bg-gray-800 h-full overflow-y-auto fixed left-0 top-0 pt-16">
        <div className="flex flex-col h-full">
          {/* Navigation links at the top */}
          <nav className="flex-grow p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <Home className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Hjem
                </Link>
              </li>
              <li>
                <Link href="/chat" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <MessageSquare className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  AI Chat
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <Smile className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Pris
                </Link>
              </li>
              <li>
                <Link href="/profile" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <User className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Profil
                </Link>
              </li>
              <li>
                <Link href="/plagiat-sjekker" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <Search className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Plagiatkontroll
                </Link>
              </li>
              <li>
                <Link href="/matteloser" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  <Calculator className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                  Matteløser
                </Link>
              </li>
            </ul>
          </nav>
          
          {/* Other items at the bottom */}
          <div className="p-4 mt-auto">
            {wordsRemaining !== null && totalWords !== null && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                  <span>{wordsRemaining.toLocaleString()} ord igjen</span>
                  {wordsRemaining > 500 ? (
                    <span>{totalWords.toLocaleString()} totalt</span>
                  ) : (
                    <Link href="/pricing" className="text-blue-500 hover:text-blue-600 flex items-center">
                      Kjøp ord
                      <Coins className="ml-1 h-4 w-4" />
                    </Link>
                  )}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                  <div 
                    className={`${getProgressBarColor(wordUsagePercentage)} h-2.5 rounded-full`} 
                    style={{ width: `${wordUsagePercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#06f] hover:bg-blue-700 text-white mb-4"
            >
              Skriv artikkel
            </Button>
            
            {recentArticles.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Siste artikler</h3>
                <ul className="space-y-1">
                  {recentArticles.map((article) => (
                    <li key={article.id}>
                      <Link 
                        href={`/write/${article.id}`} 
                        className="block py-1 px-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded overflow-hidden whitespace-nowrap text-overflow-ellipsis"
                      >
                        {truncateTitle(article.title)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {status === "authenticated" && (
              <>
                <Button 
                  onClick={() => signOut()}
                  className="w-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 mb-4"
                >
                  Logg ut
                </Button>
                <div className="flex justify-center space-x-4 text-sm">
                  <button
                    onClick={() => openContactPopup('contact')}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Kontakt
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    onClick={() => openContactPopup('feedback')}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    Tilbakemelding
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ContactPopup
        isOpen={isContactPopupOpen}
        onClose={closeContactPopup}
        type={contactType}
      />
    </>
  );
}