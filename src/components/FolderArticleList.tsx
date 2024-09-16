import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from 'next/link';
import { X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Article {
  articleid: string;
  title: string;
}

interface FolderArticleListProps {
  folderId: number;
  articleCount: number;
}

export function FolderArticleList({ folderId, articleCount }: FolderArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchFolderArticles();
  }, [folderId]);

  const fetchFolderArticles = async () => {
    // First, get the article IDs from folder_articles
    const { data: folderArticles, error: folderError } = await supabase
      .from('folder_articles')
      .select('article_id')
      .eq('folder_id', folderId);

    if (folderError) {
      console.error('Error fetching folder articles:', folderError);
      return;
    }

    if (!folderArticles || folderArticles.length === 0) {
      setArticles([]);
      return;
    }

    // Then, fetch the actual articles
    const articleIds = folderArticles.map(fa => fa.article_id);
    const { data: articlesData, error: articlesError } = await supabase
      .from('articles')
      .select('articleid, title')
      .in('articleid', articleIds);

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
    } else {
      setArticles(articlesData || []);
    }
  };

  const removeArticleFromFolder = async (articleId: string) => {
    const { error } = await supabase
      .from('folder_articles')
      .delete()
      .match({ folder_id: folderId, article_id: articleId });

    if (error) {
      console.error('Error removing article from folder:', error);
    } else {
      setArticles(articles.filter(article => article.articleid !== articleId));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full w-8 h-8 p-0 font-semibold"
        >
          {articleCount}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Artikler i mappen</DialogTitle>
        </DialogHeader>
        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
          {articles.map((article) => (
            <li key={article.articleid} className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300 truncate mr-2">{article.title}</span>
              <div className="flex items-center space-x-2">
                <Link href={`/article/${article.articleid}`} passHref>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    Rediger
                  </Button>
                </Link>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArticleFromFolder(article.articleid)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fjern fra mappen</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}