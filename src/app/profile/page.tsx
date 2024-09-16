'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, X } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FolderArticleManager } from "@/components/FolderArticleManager"
import { FolderArticleList } from "@/components/FolderArticleList"
import { WordCountService } from '../../services/WordCountService';

interface Article {
  articleid: string;
  title: string;
  created_at: string;
}

interface Subscription {
  plan: string;
  wordsTotal: number;
  wordsRemaining: number;
  plagiatChecksTotal: number;
  plagiatChecksRemaining: number;
}

interface ProjectFolder {
  id: number;
  name: string;
  created_at: string;
  user_email: string;
  article_count: number;
}

async function getUserSubscription(email: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('words_remaining')
    .eq('user_id', email)
    .single();

  if (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }

  return data;
}

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>([])
  const [subscription, setSubscription] = useState<Subscription>({
    plan: 'Free',
    wordsTotal: 5000,
    wordsRemaining: 5000,
    plagiatChecksTotal: 10,
    plagiatChecksRemaining: 10
  })
  const [projectFolders, setProjectFolders] = useState<ProjectFolder[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState<number | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchArticles();
      fetchSubscription();
      fetchProjectFolders();
    }
  }, [status, router, session])

  useEffect(() => {
    const handleFocus = () => {
      if (status === "authenticated" && session?.user?.email) {
        fetchSubscription();
        fetchArticles();
        fetchProjectFolders();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, session]);

  const fetchArticles = async () => {
    if (!session?.user?.email) return;

    const { data, error } = await supabase
      .from('articles')
      .select('articleid, title, created_at')
      .eq('user_id', session.user.email)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
    } else {
      setArticles(data || [])
    }
  }

  const fetchSubscription = async () => {
    if (!session?.user?.email) return;

    try {
      const wordCountService = WordCountService.getInstance();
      await wordCountService.initializeUser(session.user.email);
      
      const wordsRemaining = wordCountService.getWordsRemaining();
      const plagiatChecksRemaining = wordCountService.getPlagiatChecksRemaining();

      setSubscription(prev => ({
        ...prev,
        wordsRemaining: wordsRemaining,
        plagiatChecksRemaining: plagiatChecksRemaining
      }));
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  }

  const fetchProjectFolders = async () => {
    if (!session?.user?.email) return;

    // Step 1: Fetch project folders
    const { data: folderData, error: folderError } = await supabase
      .from('project_folders')
      .select('*')
      .eq('user_email', session.user.email)
      .order('created_at', { ascending: false });

    if (folderError) {
      console.error('Error fetching project folders:', folderError);
      return;
    }

    // Step 2: Fetch article count for each folder
    const foldersWithCount = await Promise.all(folderData.map(async (folder) => {
      const { count, error: countError } = await supabase
        .from('folder_articles')
        .select('*', { count: 'exact', head: true })
        .eq('folder_id', folder.id);

      if (countError) {
        console.error('Error fetching article count for folder:', countError);
        return { ...folder, article_count: 0 };
      }

      return { ...folder, article_count: count || 0 };
    }));

    setProjectFolders(foldersWithCount);
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!session?.user?.email) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this article?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('articleid', articleId)
        .eq('user_id', session.user.email);

      if (error) throw error;

      // Remove the deleted article from the state
      setArticles(prevArticles => prevArticles.filter(article => article.articleid !== articleId));
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article. Please try again.');
    }
  }

  const handleDeleteAllArticles = async () => {
    if (!session?.user?.email) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('user_id', session.user.email);

      if (error) throw error;

      // Clear all articles from the state
      setArticles([]);
    } catch (err) {
      console.error('Error deleting all articles:', err);
      alert('Failed to delete all articles. Please try again.');
    }
  }

  const handleAddFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !session?.user?.email) return;

    const { data, error } = await supabase
      .from('project_folders')
      .insert([{ name: newFolderName, user_email: session.user.email }])
      .select();

    if (error) {
      console.error('Error adding folder:', error);
    } else if (data) {
      setProjectFolders([...projectFolders, data[0]]);
      setNewFolderName('');
    }
  }

  const handleEditFolder = async (id: number, newName: string) => {
    const { error } = await supabase
      .from('project_folders')
      .update({ name: newName })
      .eq('id', id);

    if (error) {
      console.error('Error updating folder:', error);
    } else {
      setProjectFolders(projectFolders.map(folder => 
        folder.id === id ? { ...folder, name: newName } : folder
      ));
      setEditingFolderId(null);
    }
  }

  const handleDeleteFolder = async (id: number) => {
    const confirmDelete = window.confirm('Er du sikker på at du vil slette denne mappen?');
    if (!confirmDelete) return;

    const { error } = await supabase
      .from('project_folders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting folder:', error);
    } else {
      setProjectFolders(projectFolders.filter(folder => folder.id !== id));
    }
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Laster...</div>
  }

  if (!session) {
    return null
  }

  const wordPercentage = (subscription.wordsRemaining / subscription.wordsTotal) * 100;
  const plagiatCheckPercentage = (subscription.plagiatChecksRemaining / subscription.plagiatChecksTotal) * 100;
  const isOutOfWords = subscription.wordsRemaining <= 0;
  const isOutOfPlagiatChecks = subscription.plagiatChecksRemaining <= 0;

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Profil</h1>
        
        {/* User Info */}
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <p className="mb-2 text-gray-800 dark:text-gray-200"><strong>Navn:</strong> {session.user?.name}</p>
          <p className="mb-4 text-gray-800 dark:text-gray-200"><strong>E-post:</strong> {session.user?.email}</p>
        </div>
        
        {/* Subscription Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Ditt Abonnement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Ordbruk</h3>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isOutOfWords ? 'bg-red-600' : 'bg-blue-500'}`}
                    style={{ width: `${100 - wordPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{subscription.wordsTotal - subscription.wordsRemaining} brukt</span>
                  <span>{subscription.wordsRemaining} gjenstår</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Plagiat-sjekk</h3>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isOutOfPlagiatChecks ? 'bg-red-600' : 'bg-blue-500'}`}
                    style={{ width: `${100 - plagiatCheckPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>{subscription.plagiatChecksTotal - subscription.plagiatChecksRemaining} brukt</span>
                  <span>{subscription.plagiatChecksRemaining} gjenstår</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Totalt ord: {subscription.wordsTotal}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Plan: {subscription.plan}</p>
                </div>
                <Button 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={handleUpgrade}
                >
                  Oppgrader Abonnement
                </Button>
              </div>
              {(isOutOfWords || isOutOfPlagiatChecks) && (
                <p className="text-red-500 font-semibold">
                  {isOutOfWords && "Du har brukt opp alle ordene dine. "}
                  {isOutOfPlagiatChecks && "Du har brukt opp alle plagiat-sjekkene dine. "}
                  <Link href="/pricing" className="text-blue-600 dark:text-blue-400 hover:underline">Vennligst oppgrader abonnementet ditt</Link> for å fortsette.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Articles */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dine Artikler</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
                Slett alle
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription>
                  Dette vil slette alle artiklene dine permanent. Denne handlingen kan ikke angres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllArticles}>Slett alle</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {articles.length > 0 ? (
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article.articleid} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <Link href={`/article/${article.articleid}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Opprettet: {new Date(article.created_at).toLocaleDateString('nb-NO')}
                  </p>
                </div>
                <Button
                  onClick={() => handleDeleteArticle(article.articleid)}
                  variant="outline"
                  size="sm"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Du har ikke skrevet noen artikler ennå.</p>
        )}

        {/* Project Folders */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Mine prosjekter</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddFolder} className="mb-4 flex">
              <Input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Nytt prosjektnavn"
                className="mr-2"
              />
              <Button type="submit">Legg til</Button>
            </form>
            <ul className="space-y-2">
              {projectFolders.map((folder) => (
                <li key={folder.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <div className="flex items-center">
                    <FolderArticleList folderId={folder.id} articleCount={folder.article_count} />
                    <span className="ml-2">{folder.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FolderArticleManager 
                      folderId={folder.id} 
                      userEmail={session.user?.email || ''} 
                      onArticleAdded={fetchProjectFolders}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingFolderId(folder.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFolder(folder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}