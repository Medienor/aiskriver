'use client'

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, X, Search, Star, Eye, UserIcon, CogIcon, GiftIcon } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FolderArticleManager } from "@/components/FolderArticleManager"
import { FolderArticleList } from "@/components/FolderArticleList"
import { WordCountService } from '../../services/WordCountService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SitemapManager } from '@/components/SitemapManager';

interface Article {
  id: string;
  title: string;
  created_at: string;
  status: string;
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

interface Snippet {
  snippet_id: string;
  title: string;
  date: string;
  snippet: string;
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
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const pathname = usePathname()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (status === "authenticated" && session?.user?.email) {
      fetchArticles();
      fetchSubscription();
      fetchProjectFolders();
      fetchSnippets();
    }
  }, [status, router, session])

  useEffect(() => {
    const handleFocus = () => {
      if (status === "authenticated" && session?.user?.email) {
        fetchSubscription();
        fetchArticles();
        fetchProjectFolders();
        fetchSnippets();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [status, session]);

  const fetchArticles = async () => {
    if (!session?.user?.email) return;

    const { data, error } = await supabase
      .from('content')
      .select('id, title, created_at, status')
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
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('words_remaining, total_words, plagiat_check_remaining, total_plagiat_checks, plan')
        .eq('user_id', session.user.email)
        .single();

      if (error) throw error;

      setSubscription({
        plan: data.plan || 'Free',
        wordsTotal: data.total_words || 5000,
        wordsRemaining: data.words_remaining || 5000,
        plagiatChecksTotal: data.total_plagiat_checks || 10,
        plagiatChecksRemaining: data.plagiat_check_remaining || 10
      });
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

  const fetchSnippets = async () => {
    if (!session?.user?.email) return;

    const { data, error } = await supabase
      .from('saved_snippets')
      .select('snippet_id, title, date, snippet')
      .eq('user_id', session.user.email)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching snippets:', error);
    } else {
      setSnippets(data || []);
    }
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  };

  const handleOpenBillingPortal = () => {
    window.open('https://billing.stripe.com/p/login/28o00qaMC5FafdebII', '_blank');
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!session?.user?.email) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this article?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', articleId)
        .eq('user_id', session.user.email);

      if (error) throw error;

      // Remove the deleted article from the state
      setArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
    } catch (err) {
      console.error('Error deleting article:', err);
      alert('Failed to delete article. Please try again.');
    }
  }

  const handleDeleteAllArticles = async () => {
    if (!session?.user?.email) return;

    try {
      const { error } = await supabase
        .from('content')
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

  const handleDeleteSnippet = async (snippetId: string) => {
    if (!session?.user?.email) return;

    const confirmDelete = window.confirm('Er du sikker på at du vil slette denne kapselen?');
    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('saved_snippets')
        .delete()
        .eq('snippet_id', snippetId)
        .eq('user_id', session.user.email);

      if (error) throw error;

      setSnippets(prevSnippets => prevSnippets.filter(snippet => snippet.snippet_id !== snippetId));
    } catch (err) {
      console.error('Error deleting snippet:', err);
      alert('Kunne ikke slette kapselen. Vennligst prøv igjen.');
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nb-NO', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };

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
    <div className="bg-white dark:bg-gray-900 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Profil</h1>
        
        <nav className="flex justify-start mb-8 border-b border-gray-200 dark:border-gray-700">
          <Link 
            href="/profile" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <UserIcon className={`w-4 h-4 mr-2 ${pathname === '/profile' ? 'text-[#06f]' : ''}`} />
            <span>Profil</span>
          </Link>
          <Link 
            href="/profile/integration" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile/integration'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <CogIcon className={`w-4 h-4 mr-2 ${pathname === '/profile/integration' ? 'text-[#06f]' : ''}`} />
            <span>Integration</span>
          </Link>
          <Link 
            href="/profile/gaver" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile/gaver'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <GiftIcon className={`w-4 h-4 mr-2 ${pathname === '/profile/gaver' ? 'text-[#06f]' : ''}`} />
            <span>Få gaver</span>
          </Link>
          <Link 
            href="/profile/affiliate" 
            className={`flex items-center mr-6 text-base pb-2 border-b-2 ${
              pathname === '/profile/affiliate'
                ? 'text-[#06f] border-[#06f]'
                : 'text-gray-600 dark:text-gray-400 border-transparent'
            } hover:text-[#06f] transition-colors duration-200`}
          >
            <Star className={`w-4 h-4 mr-2 ${pathname === '/profile/affiliate' ? 'text-[#06f]' : ''}`} />
            <span>Affiliate</span>
          </Link>
        </nav>
        
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
                  <span>{subscription.wordsRemaining} ord igjen</span>
                  <span>{subscription.wordsTotal} ord i din pakke</span>
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
                  <span>{subscription.plagiatChecksRemaining} plagiat-sjekk igjen</span>
                  <span>{subscription.plagiatChecksTotal} plagiat-sjekk inkludert</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                  <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Din pakke inkluderer {subscription.wordsTotal} ord
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pakke: {subscription.plan}
                  </p>
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleUpgrade}
                  >
                    Oppgrader Abonnement
                  </Button>
                  <Button 
                    className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={handleOpenBillingPortal}
                  >
                    Fakturaer og betalinger
                  </Button>
                </div>
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
            <AlertDialogContent className="bg-white dark:bg-gray-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-gray-900 dark:text-white">Er du sikker?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                  Dette vil slette alle artiklene dine permanent. Denne handlingen kan ikke angres.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">Avbryt</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllArticles} className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">Slett alle</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {articles.length > 0 ? (
          <ul className="space-y-4">
            {articles.map((article) => (
              <li key={article.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <Link href={`/write/${article.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    <h3 className="text-lg font-semibold">{article.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Opprettet: {new Date(article.created_at).toLocaleDateString('nb-NO')}
                  </p>
                </div>
                <Button
                  onClick={() => handleDeleteArticle(article.id)}
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
                className="mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Legg til</Button>
            </form>
            <ul className="space-y-2">
              {projectFolders.map((folder) => (
                <li key={folder.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <div className="flex items-center">
                    <FolderArticleList 
                      folderId={folder.id} 
                      articleCount={folder.article_count}
                    />
                    <span className="ml-2 text-gray-900 dark:text-white">{folder.name}</span>
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
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Mine kapsler */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Mine kapsler</h2>
          {snippets.length > 0 ? (
            <ul className="space-y-4">
              {snippets.map((snippet) => (
                <li key={snippet.snippet_id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{snippet.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Opprettet: {formatDate(snippet.date)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 dark:text-white">{snippet.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 max-h-[60vh] overflow-y-auto">
                          <div 
                            className="prose dark:prose-invert max-w-none" 
                            dangerouslySetInnerHTML={{ __html: snippet.snippet }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={() => handleDeleteSnippet(snippet.snippet_id)}
                      variant="outline"
                      size="sm"
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Du har ingen lagrede kapsler ennå.</p>
          )}
        </div>
        {/* Manage Sitemaps */}
        <div className="mt-8">
          <SitemapManager />
        </div>
      </div>
    </div>
  )
}