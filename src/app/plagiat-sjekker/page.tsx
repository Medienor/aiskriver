'use client'

import React, { useState, useEffect, ReactNode } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { checkPlagiarism, CopyscapeResult } from '../../services/CopyscapeService';
import { Loader2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { WordCountService } from '../../services/WordCountService';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Article {
  articleid: string;
  title: string;
  html: string;
}

export default function PlagiatSjekker() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CopyscapeResult | null>(null);
  const [error, setError] = useState<string | ReactNode | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [plagiatChecksRemaining, setPlagiatChecksRemaining] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/auth');
    } else if (status === "authenticated" && session?.user?.email) {
      fetchArticles();
      initializeWordCountService();
    }
  }, [status, session, router]);

  const initializeWordCountService = async () => {
    const wordCountService = WordCountService.getInstance();
    await wordCountService.initializeUser(session?.user?.email || '');
    setPlagiatChecksRemaining(wordCountService.getPlagiatChecksRemaining());
  };

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('articleid, title, html')
      .eq('user_id', session?.user?.email);

    if (error) {
      console.error('Error fetching articles:', error);
    } else {
      setArticles(data || []);
    }
  };

  const handleCheck = async () => {
    if (!content.trim()) {
      setError('Vennligst skriv inn noe innhold å sjekke.');
      return;
    }

    const wordCountService = WordCountService.getInstance();
    const canCheck = await wordCountService.checkPlagiatAvailability();

    if (!canCheck) {
      setError(
        <span>
          Du har ikke flere plagiat-sjekk igjen.{' '}
          <Link href="/pricing" className="text-blue-500 hover:underline">
            Vennligst oppgrader abonnementet ditt
          </Link>
          .
        </span>
      );
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      const plagiarismResult = await checkPlagiarism(content);
      setResult(plagiarismResult);
      await wordCountService.deductPlagiatCheck();
      setPlagiatChecksRemaining(wordCountService.getPlagiatChecksRemaining());
    } catch (err) {
      setError('Kunne ikke sjekke for plagiat. Vennligst prøv igjen.');
    } finally {
      setIsChecking(false);
    }
  };

  const importArticle = (html: string) => {
    setContent(html);
    setIsDialogOpen(false);  // Close the dialog after importing
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
      {status === "authenticated" ? (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Plagiat Sjekker</h1>
          
          <div className="flex justify-between items-center mb-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Importer artikkel
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800 shadow-lg rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Velg en artikkel å importere</DialogTitle>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto mt-4">
                  {articles.map((article) => (
                    <div key={article.articleid} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{article.title}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => importArticle(article.html)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 dark:text-blue-400"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Lim inn innholdet du vil sjekke for plagiat her..."
            className="w-full h-64 mb-4 p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          
          <div className="flex justify-between items-center mb-4">
            <Button 
              onClick={handleCheck}
              disabled={isChecking}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sjekker...
                </>
              ) : (
                'Sjekk for plagiat'
              )}
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {plagiatChecksRemaining}/10 søk igjen
            </p>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {result && (
            <div className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Plagiatsjekk resultat</h2>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Plagiat funnet: <span className="font-semibold">{result.isPlagiarized ? 'Ja' : 'Nei'}</span>
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Prosent plagiert: <span className="font-semibold">{result.percentPlagiarized.toFixed(2)}%</span>
                </p>
                {result.isPlagiarized && result.sources.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-gray-900 dark:text-white">Innhold er plagiert fra følgende sider:</p>
                    <ul className="space-y-2 list-disc pl-5">
                      {result.sources.map((source, index) => (
                        <li key={index} className="text-gray-700 dark:text-gray-300">
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {source.title || source.url}
                          </a>
                          {source.matchedWords && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              ({source.matchedWords} ord matchet)
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.sources.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2 text-gray-900 dark:text-white">Detaljert kildeinformasjon:</p>
                    <ul className="space-y-4">
                      {result.sources.map((source, index) => (
                        <li key={index} className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline text-lg">
                            {source.title || source.url}
                          </a>
                          {typeof source.matchedWords === 'number' && (
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                              Matchede ord: <span className="font-semibold">{source.matchedWords}</span>
                            </p>
                          )}
                          {typeof source.percentMatched === 'number' && (
                            <p className="text-gray-700 dark:text-gray-300">
                              Prosent matchet: <span className="font-semibold">{source.percentMatched.toFixed(2)}%</span>
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">Sjekket med Copyscape</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}