import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { supabase } from '../lib/supabase';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Settings, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Sitemap {
  id: number;
  url: string;
  status: 'processing' | 'completed' | 'error';
  created_at: string;
  urls: string[];
}

export function SitemapManager() {
  const { data: session } = useSession();
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sitemaps, setSitemaps] = useState<Sitemap[]>([]);
  const [message, setMessage] = useState('');
  const [selectedSitemap, setSelectedSitemap] = useState<Sitemap | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      fetchSitemaps();
    }
  }, [session]);

  const fetchSitemaps = async () => {
    if (!session?.user?.email) return;

    const { data, error } = await supabase
      .from('sitemaps')
      .select('*')
      .eq('user_email', session.user.email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sitemaps:', error);
      setMessage("Kunne ikke hente nettkart. Vennligst prøv igjen.");
    } else {
      setSitemaps(data || []);
    }
  };

  const addSitemap = async () => {
    if (!session?.user?.email || !sitemapUrl) return;

    const existingSitemap = sitemaps.find(sitemap => sitemap.url === sitemapUrl);
    if (existingSitemap) {
      setMessage("Dette nettkartet er allerede lagt til.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase
      .from('sitemaps')
      .insert([
        { url: sitemapUrl, user_email: session.user.email, status: 'processing', urls: [] }
      ])
      .select();

    if (error) {
      console.error('Error adding sitemap:', error);
      setMessage("Kunne ikke legge til nettkart. Vennligst prøv igjen.");
      setIsLoading(false);
      return;
    }

    await fetchSitemaps();

    const response = await fetch('/api/process-sitemap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sitemapId: data[0].id, sitemapUrl }),
    });

    if (!response.ok) {
      console.error('Error processing sitemap:', await response.text());
      setMessage("Kunne ikke behandle nettkartet. Vennligst prøv igjen.");
    } else {
      setMessage("Nettkart lagt til og behandling startet.");
    }

    setIsLoading(false);
    setSitemapUrl('');
  };

  const deleteSitemap = async (id: number) => {
    const { error } = await supabase
      .from('sitemaps')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sitemap:', error);
      setMessage("Kunne ikke slette nettkartet. Vennligst prøv igjen.");
    } else {
      setMessage("Nettkartet ble slettet.");
      await fetchSitemaps();
    }
  };

  const removeLink = async (sitemapId: number, linkToRemove: string) => {
    const sitemap = sitemaps.find(s => s.id === sitemapId);
    if (!sitemap) return;

    const updatedUrls = sitemap.urls.filter(url => url !== linkToRemove);

    const { error } = await supabase
      .from('sitemaps')
      .update({ urls: updatedUrls })
      .eq('id', sitemapId);

    if (error) {
      console.error('Error updating sitemap:', error);
      setMessage("Kunne ikke oppdatere nettkartet. Vennligst prøv igjen.");
    } else {
      setMessage("Lenke fjernet fra nettkartet.");
      await fetchSitemaps();
      setSelectedSitemap(prev => prev ? {...prev, urls: updatedUrls} : null);
    }
  };

  const filteredUrls = selectedSitemap?.urls.filter(url =>
    url.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow mt-8">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="tracking-tight text-2xl font-bold text-gray-900 dark:text-white">Dine nettkart</h3>
      </div>
      <div className="p-6 pt-0">
        {message && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4" role="alert">
            <p>{message}</p>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); addSitemap(); }} className="mb-4 flex">
          <Input
            type="url"
            placeholder="Skriv inn sitemap.xml URL"
            value={sitemapUrl}
            onChange={(e) => setSitemapUrl(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 mr-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button
            type="submit"
            disabled={isLoading || !sitemapUrl}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Legger til...
              </>
            ) : (
              "Legg til"
            )}
          </Button>
        </form>

        <ul className="space-y-2">
          {sitemaps.map((sitemap) => (
            <li key={sitemap.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <div className="flex items-center">
                <span className="ml-2 text-gray-900 dark:text-white">{sitemap.url}</span>
                <span className={`ml-2 text-xs ${
                  sitemap.status === 'completed' ? 'text-green-500' :
                  sitemap.status === 'error' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {sitemap.status === 'completed' ? 'Fullført' :
                   sitemap.status === 'error' ? 'Feil' :
                   'Behandler'}
                </span>
              </div>
              <div className="flex items-center">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSitemap(sitemap)}
                      className="mr-2 inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-8 rounded-md px-3 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-[600px] bg-white dark:bg-gray-800 max-h-[90vh] overflow-hidden">
                    <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <DialogTitle className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        Nettkart Innstillinger
                      </DialogTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Tilpass din sitemap ved å fjerne sider du ikke skal være med i innhold du genererer
                      </p>
                    </DialogHeader>
                    <button
                      onClick={() => setSelectedSitemap(null)}
                      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-500 dark:text-gray-400">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span className="sr-only">Close</span>
                    </button>
                    <div className="mt-4 flex flex-col h-full">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Lenker</h4>
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            type="text"
                            placeholder="Søk etter URL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-4 py-2 w-full text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      {selectedSitemap && selectedSitemap.urls && selectedSitemap.urls.length > 0 ? (
                        <div className="overflow-x-auto flex-grow" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                          <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                              <tr>
                                <th scope="col" className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  URL
                                </th>
                                <th scope="col" className="px-2 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                  Handling
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                              {filteredUrls.map((url, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <td className="px-2 py-2 whitespace-nowrap text-xs md:text-sm text-gray-900 dark:text-gray-100 overflow-hidden text-ellipsis" style={{ maxWidth: '70%' }}>
                                    {url}
                                  </td>
                                  <td className="px-2 py-2 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                                    <button
                                      onClick={() => removeLink(selectedSitemap.id, url)}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                                    >
                                      Slett
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ingen lenker funnet for dette nettkartet.</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSitemap(sitemap.id)}
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:text-accent-foreground h-8 rounded-md px-3 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

