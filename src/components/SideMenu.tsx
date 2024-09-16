'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Home, Star, Smile, User, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Article {
  articleid: string;
  title: string;
  created_at: string;
}

export function SideMenu() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recentArticles, setRecentArticles] = React.useState<Article[]>([]);

  React.useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const fetchRecentArticles = async () => {
        const { data, error } = await supabase
          .from('articles')
          .select('articleid, title, created_at')
          .eq('user_id', session.user.email)
          .order('created_at', { ascending: false })
          .limit(3)

        if (error) {
          console.error('Error fetching recent articles:', error)
        } else {
          setRecentArticles(data || [])
        }
      }

      fetchRecentArticles()
    }
  }, [status, session]);

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 h-screen p-4 flex flex-col">
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Home className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
              Home
            </Link>
          </li>
          <li>
            <Link href="/ai-chat" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Star className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
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
              Plagiat sjekk
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="mt-4">
        <Button 
          onClick={() => router.push('/dashboard')}
          className="w-full bg-[#06f] hover:bg-blue-700 text-white"
        >
          Skriv artikkel
        </Button>
      </div>
      
      {recentArticles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-bold text-gray-700 dark:text-gray-200 mb-2">Siste artikler</h3>
          <ul className="space-y-1">
            {recentArticles.map((article) => (
              <li key={article.articleid}>
                <Link href={`/article/${article.articleid}`} className="block py-1 px-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                  {article.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <Button 
        onClick={() => signOut()}
        className="mt-4 w-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
      >
        Logg ut
      </Button>
    </div>
  );
}