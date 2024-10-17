'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Copy, Download, CheckCircle, Lock, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSession, signIn } from 'next-auth/react'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { WordCountService } from '../services/WordCountService'

interface AIWriterPanelProps {
  hiddenPrompt: string;
  customFields?: {
    [key: string]: {
      type: 'input' | 'textarea' | 'select';
      label: string;
      options?: string[]; // For select fields
      placeholder?: string;
    };
  };
  hideFields?: string[];
}

export function AIWriterPanel({ hiddenPrompt, customFields = {}, hideFields = [] }: AIWriterPanelProps) {
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [wordsRemaining, setWordsRemaining] = useState<number | null>(null)
  const [totalWords, setTotalWords] = useState<number | null>(null)
  const { data: session } = useSession()
  const [formData, setFormData] = useState(() => ({
    talkingPoints: '',
    keywords: '',
    tone: '',
    audience: '',
    model: '',
    language: '',
    hiddenPrompt: hiddenPrompt,
    ...Object.keys(customFields).reduce((acc, key) => ({ ...acc, [key]: '' }), {})
  }))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGeneratedContent, setShowGeneratedContent] = useState(false)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const router = useRouter()
  const initialLoadRef = useRef(true)
  const [wordCountStatus, setWordCountStatus] = useState<'loading' | 'error' | 'success'>('loading')
  const [generatedWordCount, setGeneratedWordCount] = useState(0)
  const [showCopyNotification, setShowCopyNotification] = useState(false)

  useEffect(() => {
    if (initialLoadRef.current) {
      const cookieCount = Cookies.get('submissionCount');
      const localStorageCount = localStorage.getItem('submissionCount');
      
      if (cookieCount) {
        setSubmissionCount(parseInt(cookieCount, 10));
      } else if (localStorageCount) {
        setSubmissionCount(parseInt(localStorageCount, 10));
      }
      
      initialLoadRef.current = false;
    }
  }, []);

  useEffect(() => {
    Cookies.set('submissionCount', submissionCount.toString());
    localStorage.setItem('submissionCount', submissionCount.toString());
  }, [submissionCount]);

  useEffect(() => {
    const words = generatedContent.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [generatedContent]);

  useEffect(() => {
    if (session) {
      fetchWordCounts();
    }
  }, [session]);

  const fetchWordCounts = async () => {
    setWordCountStatus('loading');
    try {
      if (!session?.user?.email) {
        throw new Error('User email not found in session');
      }

      console.log('Fetching word counts for user email:', session.user.email);

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('words_remaining, total_words')
        .eq('user_id', session.user.email)
        .single();

      if (error) throw error;

      console.log('Subscription data:', data);

      if (data) {
        setWordsRemaining(data.words_remaining);
        setTotalWords(data.total_words);
        setWordCountStatus('success');
      } else {
        console.log('No subscription data found for user email:', session.user.email);
        setWordsRemaining(null);
        setTotalWords(null);
        setWordCountStatus('error');
      }
    } catch (error) {
      console.error('Error fetching word counts:', error);
      setWordsRemaining(null);
      setTotalWords(null);
      setWordCountStatus('error');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenerate = async () => {
    if (!session && submissionCount >= 1) {
      setShowModal(true)
      return
    }

    setIsLoading(true)
    setError(null)
    setGeneratedContent('')
    setShowGeneratedContent(true)
    setSubmissionCount(prev => {
      const newCount = prev + 1;
      Cookies.set('submissionCount', newCount.toString());
      localStorage.setItem('submissionCount', newCount.toString());
      return newCount;
    });

    try {
      const response = await fetch('/api/ai-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customFields: customFields,
          hideFields: hideFields
        })
      })
      if (!response.ok) {
        throw new Error('Failed to generate content')
      }
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let fullContent = '';
      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        const chunk = decoder.decode(value)
        fullContent += chunk;
        setGeneratedContent(prev => prev + chunk)
      }

      // Calculate word count
      const wordCount = fullContent.trim().split(/\s+/).length;
      setGeneratedWordCount(wordCount);

      // Deduct words if user is logged in
      if (session?.user?.email) {
        const wordCountService = WordCountService.getInstance();
        await wordCountService.initializeUser(session.user.email);
        if (await wordCountService.checkWordAvailability(wordCount)) {
          await wordCountService.deductWords(wordCount);
        } else {
          setError('Not enough words remaining in your account.');
        }
      }
    } catch (error) {
      console.error('Error generating content:', error)
      setError('An error occurred while generating content. Please try again.')
    } finally {
      setIsLoading(false)
      if (session) {
        fetchWordCounts();
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setShowCopyNotification(true)
    setTimeout(() => setShowCopyNotification(false), 2000) // Hide after 2 seconds
  }

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedContent], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "generated_content.html";
    document.body.appendChild(element);
    element.click();
  }

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  }

  const handleLogin = () => {
    router.push('/auth')
  }

  const handleCloseModal = () => {
    setShowModal(false);
  }

  // Render custom fields
  const renderCustomFields = () => {
    return Object.entries(customFields).map(([key, field]) => {
      if (hideFields.includes(key)) return null;

      switch (field.type) {
        case 'input':
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>
                {field.label}
              </label>
              <Input 
                id={key} 
                placeholder={field.placeholder || `Enter ${field.label}`} 
                className="w-full bg-[#f3f4f6] dark:bg-[#111827]" 
                value={formData[key as keyof typeof formData] || ''}
                onChange={handleInputChange}
              />
            </div>
          );
        case 'textarea':
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>
                {field.label}
              </label>
              <Textarea
                id={key}
                placeholder={field.placeholder || `Enter ${field.label}`}
                className="w-full bg-[#f3f4f6] dark:bg-[#111827]"
                value={formData[key as keyof typeof formData] || ''}
                onChange={handleInputChange}
              />
            </div>
          );
        case 'select':
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>
                {field.label}
              </label>
              <Select onValueChange={(value) => handleSelectChange(value, key)}>
                <SelectTrigger id={key} className="bg-[#f3f4f6] dark:bg-[#111827]">
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
      }
    });
  };

  return (
    <div className="container mx-auto">
      <Card className="w-full bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - Input fields */}
            <div className="w-full lg:w-1/2 space-y-4">
              {/* Custom fields */}
              {renderCustomFields()}

              {/* Existing fields */}
              {!hideFields.includes('talkingPoints') && (
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="talkingPoints">
                    Samtalepunkter
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 ml-1 inline-block" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Skriv inn hovedpunktene du ønsker å inkludere i teksten.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Textarea
                    id="talkingPoints"
                    placeholder="KI vil endre forretningsverdenen:- øker flere forretningsmuligheter - bringer til slutt mange fordeler i vårt daglige liv"
                    className="w-full bg-[#f3f4f6] dark:bg-[#111827]"
                    value={formData.talkingPoints}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {!hideFields.includes('keywords') && (
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="keywords">
                    Nøkkelord (valgfritt)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 ml-1 inline-block" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Legg til spesifikke ord du ønsker skal inkluderes i teksten.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <Input 
                    id="keywords" 
                    placeholder="Skriv inn dine nøkkelord" 
                    className="w-full bg-[#f3f4f6] dark:bg-[#111827]" 
                    value={formData.keywords}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {!hideFields.includes('tone') && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1" htmlFor="tone">
                      Tonefall
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 ml-1 inline-block" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Velg ønsket stemning eller stil for teksten.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    {session ? (
                      <Select onValueChange={(value) => handleSelectChange(value, 'tone')}>
                        <SelectTrigger id="tone" className="bg-[#f3f4f6] dark:bg-[#111827]">
                          <SelectValue placeholder="Velg tonefall" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Profesjonell</SelectItem>
                          <SelectItem value="casual">Uformell</SelectItem>
                          <SelectItem value="formal">Formell</SelectItem>
                          <SelectItem value="friendly">Vennlig</SelectItem>
                          <SelectItem value="authoritative">Autoritativ</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select>
                        <SelectTrigger id="tone" className="bg-[#f3f4f6] dark:bg-[#111827] opacity-60" onClick={() => setShowModal(true)}>
                          <SelectValue placeholder={<span className="flex items-center">Velg tonefall <Lock className="ml-2 h-4 w-4" /></span>} />
                        </SelectTrigger>
                      </Select>
                    )}
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1" htmlFor="audience">
                      Målgruppe
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 ml-1 inline-block" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Spesifiser hvem teksten er rettet mot.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </label>
                    {session ? (
                      <Select onValueChange={(value) => handleSelectChange(value, 'audience')}>
                        <SelectTrigger id="audience" className="bg-[#f3f4f6] dark:bg-[#111827]">
                          <SelectValue placeholder="Velg målgruppe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">Generell</SelectItem>
                          <SelectItem value="professionals">Fagfolk</SelectItem>
                          <SelectItem value="students">Studenter</SelectItem>
                          <SelectItem value="executives">Ledere</SelectItem>
                          <SelectItem value="technical">Tekniske eksperter</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select>
                        <SelectTrigger id="audience" className="bg-[#f3f4f6] dark:bg-[#111827] opacity-60" onClick={() => setShowModal(true)}>
                          <SelectValue placeholder={<span className="flex items-center">Velg målgruppe <Lock className="ml-2 h-4 w-4" /></span>} />
                        </SelectTrigger>
                      </Select>
                    )}
                  </div>
                </div>
              )}
              {!hideFields.includes('model') && (
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="model">
                    Modell
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 ml-1 inline-block" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Velg AI-modellen som skal generere teksten.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Select disabled>
                            <SelectTrigger id="model" className="bg-[#f3f4f6] dark:bg-[#111827] opacity-60 cursor-not-allowed w-full">
                              <SelectValue placeholder="Velg modell" />
                            </SelectTrigger>
                          </Select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Lock className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Kun tilgjengelig på Boost pakken</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
              {!hideFields.includes('language') && (
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="language">
                    Språk
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 ml-1 inline-block" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Velg språket teksten skal genereres på.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                  {session ? (
                    <Select onValueChange={(value) => handleSelectChange(value, 'language')}>
                      <SelectTrigger id="language" className="bg-[#f3f4f6] dark:bg-[#111827]">
                        <SelectValue placeholder="Velg språk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">Engelsk</SelectItem>
                        <SelectItem value="no">Norsk</SelectItem>
                        <SelectItem value="es">Spansk</SelectItem>
                        <SelectItem value="fr">Fransk</SelectItem>
                        <SelectItem value="de">Tysk</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Select>
                      <SelectTrigger id="language" className="bg-[#f3f4f6] dark:bg-[#111827] opacity-60" onClick={() => setShowModal(true)}>
                        <SelectValue placeholder={<span className="flex items-center">Velg språk <Lock className="ml-2 h-4 w-4" /></span>} />
                      </SelectTrigger>
                    </Select>
                  )}
                </div>
              )}
              <div className="flex flex-col items-end">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isLoading || (wordCountStatus === 'success' && wordsRemaining === 0)} 
                  className="bg-[#06f] text-white dark:text-white hover:bg-[#0056b3]"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Genererer...
                    </>
                  ) : 'Generer'}
                </Button>
                {session && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {wordCountStatus === 'loading' && <span>Laster ordtelling...</span>}
                    {wordCountStatus === 'error' && <span>Kunne ikke laste ordtelling. Vennligst prøv igjen senere.</span>}
                    {wordCountStatus === 'success' && wordsRemaining !== null && totalWords !== null && (
                      wordsRemaining === 0 ? (
                        <>
                          Tom for ord!{' '}
                          <Link href="/pricing" className="text-blue-500 hover:text-blue-600 underline">
                            Vennligst oppgrader
                          </Link>
                        </>
                      ) : (
                        `Tilgjengelig ord: ${wordsRemaining} / ${totalWords}`
                      )
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Right column - Generated content */}
            <div className={`w-full lg:w-1/2 ${showGeneratedContent ? 'block' : 'hidden'} lg:block`}>
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg h-96 relative">
                {error && (
                  <p className="text-red-500 mb-4">{error}</p>
                )}
                {generatedContent ? (
                  <>
                    <div className="absolute top-2 right-2 space-x-2">
                      <Button onClick={handleCopy} variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleDownload} variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    {showCopyNotification && (
                      <div className="absolute top-12 right-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm animate-fade-out">
                        Kopiert!
                      </div>
                    )}
                    <div className={`prose dark:prose-dark mt-8 ${!session ? 'h-full overflow-hidden' : 'overflow-auto'}`} style={{maxHeight: 'calc(100% - 2rem)'}}>
                      <ReactMarkdown 
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-4" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-semibold mb-3" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-md font-medium mb-2" {...props} />,
                          p: ({node, ...props}) => <p className="text-sm mb-2" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside text-sm mb-2" style={{ listStyleType: 'disc' }} {...props} />,
                          li: ({node, ...props}) => <li className="text-sm mb-2" {...props} />
                        }}
                      >
                        {generatedContent}
                      </ReactMarkdown>
                    </div>
                    {!session && wordCount > 150 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 dark:from-gray-700 via-gray-100/90 dark:via-gray-700/90 to-transparent h-80 flex items-end justify-center">
                        <div className="p-4 text-center">
                          <div className="bg-white/80 dark:bg-gray-800/80 p-8 rounded-lg shadow-lg">
                            <p className="text-base font-semibold text-gray-800 dark:text-white mb-4">
                              Teksten overstiger 150 ord. Logg inn eller registrer en gratis profil for og fortsette.
                            </p>
                            <Button onClick={handleLogin} className="bg-[#1b9130] text-white hover:bg-[#157a26] px-4 py-2 rounded-md text-sm font-medium">
                              Logg inn
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg className="w-24 h-24 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseModal}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg flex flex-col items-center w-96" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Registrer konto</h2>
            <Button
              onClick={handleGoogleSignUp}
              className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 mb-4"
            >
              <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Registrer deg med Google
            </Button>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Allerede har en konto?{' '}
              <span 
                onClick={handleLogin} 
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer underline"
              >
                Logg inn
              </span>
            </p>
            <div className="flex items-center mt-4">
              <CheckCircle className="text-green-500 h-5 w-5 mr-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingen behov for kredittkort</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}