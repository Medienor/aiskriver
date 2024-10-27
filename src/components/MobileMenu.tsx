'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Home, Star, Smile, User, Search, X, PencilIcon, Link as LinkIcon, Calculator, FileText, Coins } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [wordsRemaining, setWordsRemaining] = useState<number | null>(null);
  const [totalWords, setTotalWords] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
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

      fetchWordCount()
    }
  }, [status, session]);

  const wordUsagePercentage = totalWords && wordsRemaining != null
    ? Math.min((wordsRemaining / totalWords) * 100, 100)
    : 0;

  const getProgressBarColor = (percentage: number) => {
    if (percentage <= 10) return 'bg-red-600';
    if (percentage <= 50) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  if (!isOpen) return null;

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    if (session) {
      router.push('/affiliate');
    } else {
      router.push('/bli-affiliate');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-transform duration-300 ease-in-out">
        <Button 
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
        >
          <X className="h-6 w-6" />
        </Button>
        <nav className="mt-12">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <Home className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Home
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <Smile className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Pris
              </Link>
            </li>
            <li>
              <Link href="/profile" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <User className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Profil
              </Link>
            </li>
            <li>
              <Link href="/plagiat-sjekker" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <Search className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Plagiat sjekk
              </Link>
            </li>
            <li>
              <Link href="/tools" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <FileText className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Skriververktøy
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Word count indicator */}
        {wordsRemaining !== null && totalWords !== null && (
          <div className="mt-6 mb-4">
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

        <div className="mt-4">
          <Button 
            onClick={() => {
              router.push('/write');
              onClose();
            }}
            className="w-full bg-[#06f] hover:bg-blue-700 text-white"
          >
            Skriv artikkel
          </Button>
        </div>
        
        {session && (
          <Button 
            onClick={() => {
              signOut();
              onClose();
            }}
            className="mt-4 w-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Logg ut
          </Button>
        )}
      </div>
    </div>
  );
}