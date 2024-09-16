import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Article {
  articleid: string;
  title: string;
  created_at: string;
}

interface FolderArticleManagerProps {
  folderId: number;  // Changed from string to number
  userEmail: string;
  onArticleAdded: () => void;  // Add this line
}

export function FolderArticleManager({ folderId, userEmail, onArticleAdded }: FolderArticleManagerProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchArticles();
  }, [userEmail, folderId]);

  useEffect(() => {
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
  }, [searchTerm, articles]);

  const fetchArticles = async () => {
    // Fetch all user's articles
    const { data: allArticles, error: articlesError } = await supabase
      .from('articles')
      .select('articleid, title, created_at')
      .eq('user_id', userEmail)
      .order('created_at', { ascending: false });

    if (articlesError) {
      console.error('Error fetching articles:', articlesError);
      return;
    }

    // Fetch articles already in the folder
    const { data: folderArticles, error: folderError } = await supabase
      .from('folder_articles')
      .select('article_id')
      .eq('folder_id', folderId);

    if (folderError) {
      console.error('Error fetching folder articles:', folderError);
      return;
    }

    // Create a set of article IDs already in the folder
    const folderArticleIds = new Set(folderArticles.map(fa => fa.article_id));

    // Filter out articles that are already in the folder
    const availableArticles = allArticles.filter(article => !folderArticleIds.has(article.articleid));

    setArticles(availableArticles || []);
  };

  const addArticleToFolder = async (articleId: string) => {
    const { error } = await supabase
      .from('folder_articles')
      .insert({ folder_id: folderId, article_id: articleId });

    if (error) {
      console.error('Error adding article to folder:', error);
    } else {
      console.log('Article added to folder successfully');
      onArticleAdded();
      // Remove the added article from the list
      setArticles(prevArticles => prevArticles.filter(article => article.articleid !== articleId));
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Legg til artikler i mappen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Search className="h-4 w-4 opacity-50" />
            <Input
              placeholder="Søk etter artikler..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {filteredArticles.map((article) => (
              <li key={article.articleid} className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">{article.title}</span>
                <Button
                  onClick={() => addArticleToFolder(article.articleid)}
                  variant="outline"
                  size="sm"
                >
                  Legg til
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}