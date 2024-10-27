'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { checkPlagiarism, CopyscapeResult } from '../../services/CopyscapeService';
import { Loader2, Plus, ChevronDown, ChevronUp, ExternalLink, Upload, Wand2, FileText, Edit, RefreshCw, PenTool, X, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import LoginPopup from '../../components/login-popup';
import Footer from '../../components/footer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import ImprovedPlagiarismSection from '@/components/PlagiatSection';
import HowToChooseAgent from '@/components/HowToPlagiat'
import { streamCompletion } from '../../services/plagiat-ai';
import { default as MagicButton } from '@/components/MagicButton';
import { WordCountService } from '@/services/WordCountService'


interface Article {
  articleid: string;
  title: string;
  html: string;
}

const categories = [
  {
    name: "Studenter",
    image: "/images/student.jpg",
    description: "Lever oppgaver med selvtillit",
    content: "Innhold.AI's Plagiatkontroll hjelper deg med å sikre at oppgavene dine er originale og overholder universitetets retningslinjer.",
    bulletPoints: [
      "Skann oppgaven din raskt for å oppdage potensielt plagiat",
      "Få detaljerte rapporter om tekstlikhet med eksisterende kilder",
      "Lær å sitere og referere korrekt med våre veiledninger"
    ]
  },
  {
    name: "Lærere",
    image: "/images/teacher.jpg",
    description: "Oppretthold akademisk integritet",
    content: "Vår Plagiatkontroll hjelper lærere med å opprettholde høye akademiske standarder og fremme original tenkning blant studenter.",
    bulletPoints: [
      "Effektivt skann store mengder studentoppgaver",
      "Identifiser mistenkelige mønstre og uautorisert samarbeid",
      "Gi konstruktive tilbakemeldinger til studenter om kildebruk"
    ]
  },
  {
    name: "Forfattere",
    image: "/images/blogger.jpg",
    description: "Sikre originalitet i ditt arbeid",
    content: "For forfattere og skribenter, hjelper vår Plagiatkontroll med å opprettholde autentisitet og troverdighet i ditt arbeid.",
    bulletPoints: [
      "Verifiser at ditt innhold er unikt før publisering",
      "Unngå utilsiktet plagiering ved å oppdage tekstlikhet",
      "Beskytt ditt rykte som en original og pålitelig forfatter"
    ]
  }
]

const SideMenu = ({ result, onHighlight }: { result: CopyscapeResult, onHighlight: (text: string) => void }) => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const plagiarismPercentage = result.allpercentmatched || 0;

  const getBarColor = (percentage: number) => {
    if (percentage <= 40) return 'bg-green-500';
    if (percentage <= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const getDomainName = (url: string): string => {
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      return domain.charAt(0).toUpperCase() + domain.slice(1);
    } catch {
      return 'Unknown domain';
    }
  };

  return (
    <div className="bg-[#f3f4f6] p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Plagiatsjekk Resultat</h3>
      
      <div className="mb-6">
        <div className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700 relative">
          <div 
            className={`h-4 rounded-full ${getBarColor(plagiarismPercentage)}`} 
            style={{ width: `${Math.min(Math.max(plagiarismPercentage, 5), 95)}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs mt-3 text-gray-900 dark:text-gray-200">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="flex justify-between py-5 border-t border-b border-[#d9d9d9] mb-2 text-gray-800 dark:text-gray-200">
        <span>Plagiat funnet:</span>
        <span className="font-bold">{result.count > 0 ? 'Ja' : 'Nei'}</span>
      </div>
      <div className="flex justify-between mb-4 text-gray-800 dark:text-gray-200">
        <span>Prosent plagiert:</span>
        <span className="font-bold">{plagiarismPercentage.toFixed(2)}%</span>
      </div>
      {result.count > 0 && result.result && (
        <div>
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white flex items-center justify-between py-[10px] border-t border-b border-[#d5d5d5] mb-[15px]">
            Plagierte seksjoner:
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </h4>
          <div className="space-y-2">
            {result.result.map((source, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden" style={{ borderLeft: '2px #06f solid' }}>
                <button
                  className="w-full text-left p-3 hover:border-blue-800 dark:hover:bg-gray-700 transition-colors duration-200 flex justify-between items-center"
                  onClick={() => toggleItem(index)}
                >
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{getDomainName(source.url)}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${openItems.includes(index) ? 'rotate-180' : ''}`} />
                </button>
                {openItems.includes(index) && (
                  <div className="p-3">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center mb-2 text-sm">
                      <span className="truncate">{source.url}</span>
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {source.minwordsmatched} ord matchet ({((source.minwordsmatched / result.allwordsmatched!) * 100).toFixed(2)}% av totalt plagiat)
                    </p>
                    <div 
                      className="text-xs italic bg-[#FFFACD] dark:bg-gray-600 p-2 rounded cursor-pointer hover:bg-[#FFF5B1] dark:hover:bg-gray-500 transition-colors text-gray-800 dark:text-gray-200"
                      onClick={() => onHighlight(source.textsnippet)}
                    >
                      {source.textsnippet}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PlagiatSjekker() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<CopyscapeResult | null>(null);
  const [error, setError] = useState<string | React.ReactNode | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [plagiatChecksRemaining, setPlagiatChecksRemaining] = useState(0);
  const [totalPlagiatChecks, setTotalPlagiatChecks] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string | null>(null);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [highlightedContent, setHighlightedContent] = useState('');
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [showCharCount, setShowCharCount] = useState(true);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isResultReady, setIsResultReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      fetchArticles();
      initializeWordCountService();
    }
  }, [status, session]);

  const initializeWordCountService = async () => {
    if (!session?.user?.email) return;

    const wordCountService = WordCountService.getInstance();
    await wordCountService.initializeUser(session.user.email);
    setPlagiatChecksRemaining(wordCountService.getPlagiatChecksRemaining());

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('total_plagiat_checks')
      .eq('user_id', session.user.email)
      .single();

    if (error) {
      console.error('Error fetching total plagiat checks:', error);
    } else if (data) {
      setTotalPlagiatChecks(data.total_plagiat_checks);
    }
  };

  const fetchArticles = async () => {
    if (!session?.user?.email) return;

    const { data, error } = await supabase
      .from('articles')
      .select('articleid, title, html')
      .eq('user_id', session.user.email);

    if (error) {
      console.error('Error fetching articles:', error);
    } else {
      setArticles(data || []);
    }
  };

  const handleCheck = async () => {
    if (!session) {
      setShowLoginPopup(true);
      return;
    }

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
      setShowSideMenu(true);
      setShowCharCount(false);
      setShowAIOptions(true);
      setIsResultReady(true); // Set this to true when results are ready
    } catch (err) {
      setError('Kunne ikke sjekke for plagiat. Vennligst prøv igjen.');
    } finally {
      setIsChecking(false);
    }
  };

  const resetCheck = () => {
    setContent('');
    setResult(null);
    setShowSideMenu(false);
    setShowCharCount(true);
    setShowAIOptions(false);
    setIsResultReady(false);
  };

  const handleAIOption = async (option: string) => {
    setShowAIModal(false);
    setIsGenerating(true);
    setAiResponse('');

    const prompt = option === "Endre hele teksten"
      ? `Endre hele denne teksten og formuler den bedre, mer effektiv og gi meg den tilbake. Viktig at du ikke glemmer noe. Gi meg også teksten tilbake i HTML format, kun gi meg innholdet tilbake og ikke svar på noe annet.: ${content}`
      : `Endre kun denne plagierte teksten og gi meg tilbake en omformulert versjon: ${Array.from(contentEditableRef.current?.querySelectorAll('mark') || []).map(el => el.textContent).join(' ')}`;

    const systemMessage = 'You are an AI assistant that helps rewrite text to avoid plagiarism. Format your response in HTML compatible with markdown.';

    console.log('Selected option:', option);
    console.log('Current content:', content);
    console.log('Prompt to OpenAI:', prompt);

    try {
      let fullResponse = '';
      await streamCompletion(
        prompt,
        (chunk) => {
          fullResponse += chunk;
          setAiResponse(prev => prev + chunk);
        },
        systemMessage
      );

      console.log('Full response from OpenAI:', fullResponse);

      // Remove any potential code block markers
      fullResponse = fullResponse.replace(/```html\n?|\n?```/g, '');

      if (option === "Endre hele teksten") {
        setContent(fullResponse);
        if (contentEditableRef.current) {
          contentEditableRef.current.innerHTML = DOMPurify.sanitize(fullResponse, {
            ALLOWED_TAGS: ['p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote'],
            ALLOWED_ATTR: ['style'],
          });
        }
      }

      // Count words in the AI response
      const wordCount = fullResponse.trim().split(/\s+/).length;

      // Deduct words from user's balance
      const wordCountService = WordCountService.getInstance();
      await wordCountService.deductWords(wordCount);

      console.log(`Deducted ${wordCount} words from user's balance`);

      setShowAIOptions(false); // Hide the "Rediger med AI" button
      console.log('Updated content:', contentEditableRef.current?.innerHTML);
    } catch (error) {
      console.error('Error processing AI request:', error);
      setError('An error occurred while processing the AI request. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const openImportDialog = () => {
    setIsImportDialogOpen(true);
  };

  const closeImportDialog = () => {
    setIsImportDialogOpen(false);
  };

  const importArticle = (html: string) => {
    setContent(html);
    closeImportDialog();
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "Hva er en plagiatkontroll?",
      answer: "En plagiatkontroll er et verktøy som sammenligner din tekst med et stort antall online kilder for å identifisere eventuelle likheter eller direkte kopier. Dette hjelper deg å sikre at ditt arbeid er originalt og korrekt sitert."
    },
    {
      question: "Hvorfor er det viktig å sjekke for plagiat?",
      answer: "Å sjekke for plagiat er viktig for å opprettholde akademisk integritet, unngå opphavsrettskrenkelser, og sikre at ditt arbeid er genuint og originalt. Det kan også hjelpe deg å identifisere områder hvor du kan ha glemt å sitere kilder korrekt."
    },
    {
      question: "Hvor nøyaktig er plagiatkontrollen?",
      answer: "Vår plagiatkontroll er svært nøyaktig og bruker avanserte algoritmer for å sammenligne din tekst med milliarder av online dokumenter. Den kan oppdage både direkte kopier og omskrevne passasjer."
    },
    {
      question: "Hvor mange plagiatsjekk får jeg?",
      answer: "Antall tilgjengelige plagiatsjekk avhenger av din abonnementsplan. Du kan se ditt gjenværende antall sjekk øverst på siden når du er logget inn."
    },
    {
      question: "Hva skjer hvis plagiat oppdages?",
      answer: "Hvis plagiat oppdages, vil du motta en detaljert rapport som viser de matchende tekstdelene og deres kilder. Dette gir deg muligheten til å revidere ditt arbeid, sitere korrekt, eller omskrive innholdet for å gjøre det mer originalt."
    },
    {
      question: "Er mine tekster sikre og konfidensielle?",
      answer: "Ja, vi tar personvern på alvor. Alle tekster som sjekkes for plagiat behandles konfidensielt og lagres ikke i våre systemer etter at sjekken er fullført."
    },
    {
      question: "Kan jeg sjekke tekster på andre språk enn norsk?",
      answer: "Ja, vår plagiatkontroll støtter flere språk, inkludert engelsk, svensk, og dansk, i tillegg til norsk."
    },
    {
      question: "Hvordan håndterer plagiatkontrollen sitater?",
      answer: "Plagiatkontrollen vil identifisere sitater som potensielt plagiat. Det er derfor viktig at du bruker korrekt sitatformatering i din tekst for å skille mellom direkte sitater og ditt eget arbeid."
    },
    {
      question: "Kan jeg bruke plagiatkontrollen på publiserte verk?",
      answer: "Ja, du kan bruke plagiatkontrollen på publiserte verk, men husk at dette ikke gir deg rett til å kopiere eller gjenbruke opphavsrettsbeskyttet materiale uten tillatelse."
    },
    {
      question: "Hvordan kan jeg unngå utilsiktet plagiat?",
      answer: "For å unngå utilsiktet plagiat, sørg for å alltid sitere dine kilder korrekt, parafrasere informasjon med dine egne ord, og bruk plagiatkontrollen regelmessig for å dobbeltsjekke ditt arbeid."
    }
  ];

  const extractSentences = (text: string): string[] => {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  };

  const findAndHighlightMatches = (content: string, sentences: string[]): string => {
    let highlightedContent = content;
    sentences.forEach(sentence => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length > 10) { // Ignore very short sentences
        const escapedSentence = trimmedSentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSentence})`, 'gi');
        highlightedContent = highlightedContent.replace(regex, '<mark class="bg-[#FFFACD] dark:bg-gray-600">$1</mark>');
      }
    });
    return highlightedContent;
  };

  const addScrollbarIndicators = () => {
    if (!contentEditableRef.current) return;

    const container = contentEditableRef.current;
    const highlights = container.querySelectorAll('mark');
    const containerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;

    // Remove existing indicators
    container.querySelectorAll('.scrollbar-indicator').forEach(el => el.remove());

    highlights.forEach(highlight => {
      const highlightTop = highlight.offsetTop;
      const indicatorPosition = (highlightTop / scrollHeight) * 100;

      const indicator = document.createElement('div');
      indicator.className = 'scrollbar-indicator';
      indicator.style.top = `${indicatorPosition}%`;
      container.appendChild(indicator);
    });
  };

  const highlightPlagiarizedText = (text: string) => {
    if (!contentEditableRef.current) return;

    const sentences = extractSentences(text);
    const currentContent = contentEditableRef.current.innerHTML;
    const highlightedContent = findAndHighlightMatches(currentContent, sentences);

    contentEditableRef.current.innerHTML = DOMPurify.sanitize(highlightedContent);
    
    // Add scrollbar indicators after highlighting
    setTimeout(addScrollbarIndicators, 0);
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    
    // Sanitize content
    const sanitizedContent = DOMPurify.sanitize(target.innerHTML, {
      ALLOWED_TAGS: ['p', 'br', 'div', 'span'],
      ALLOWED_ATTR: ['style'],
    });
  
    // Update content state
    setContent(sanitizedContent);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sanitizedText = DOMPurify.sanitize(text.replace(/\n/g, '<br>'));
    document.execCommand('insertHTML', false, sanitizedText);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.name.endsWith('.docx')) return;
  
    let content = '';
  
    if (file.name.endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      content = result.value;
    }

    if (content) {
      const styledContent = `
        <style>
          * { font-family: inherit; }
          p { font-size: 1rem; line-height: 1.5rem; }
          h1, h2, h3, h4, h5, .custom-heading { font-size: 1.5rem; line-height: 2rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; }
        </style>
        ${content}
      `;
      setContent(styledContent);
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = DOMPurify.sanitize(styledContent, {
          ALLOWED_TAGS: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'strong', 'em', 'u', 'span', 'div', 'ul', 'ol', 'li', 'style'],
          ALLOWED_ATTR: ['style', 'class']
        });
      }
    }
  };

  // const handlePdfUpload = async (file: File): Promise<string> => {
  //   try {
  //     const arrayBuffer = await file.arrayBuffer();
  //     const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  //    let html = '<div style="font-size: 1rem; line-height: 1.5rem;">';

  //     for (let i = 1; i <= pdf.numPages; i++) {
  //       const page = await pdf.getPage(i);
  //       const textContent = await page.getTextContent();
  //       textContent.items.forEach((item: any) => {
  //         html += `<span>${item.str}</span>`;
  //       });
  //       html += '<br><br>';
  //     }
  //     html += '</div>';
  //     return html;
  //   } catch (error) {
  //     console.error('Error processing PDF:', error);
  //     return '';
  //   }
  // };

  // Add this CSS either in a separate CSS file or using a CSS-in-JS solution
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 12px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .scrollbar-indicator {
      position: absolute;
      right: 0;
      width: 12px;
      height: 4px;
      background-color: yellow;
      z-index: 10;
    }
  `;

  // Add this to your component or in a separate file that's imported
  useEffect(() => {
    if (contentEditableRef.current) {
      contentEditableRef.current.innerHTML = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: ['p', 'br', 'div', 'span'],
        ALLOWED_ATTR: ['style'],
      });
    }
  }, [content]);

  const handleContentClick = () => {
    if (window.innerWidth <= 650) {
      setIsExpanded(true);
    }
  };

  // Add this function if it doesn't exist already
  const handleSwitchToRegister = () => {
    setShowLoginPopup(false);
    // If you have a register popup, you might want to show it here
    // setShowRegisterPopup(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-[80rem] mx-auto px-4 flex flex-col flex-grow">
        <div className="flex-grow py-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Plagiatkontroll</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">Innhold.AI krysssjekker flere millioner kilder på internett for å se om din tekst er plagiert</p>
          
          <div className="flex justify-start items-center mb-4 space-x-4">
            <Button 
              variant="outline" 
              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={openImportDialog}
            >
              <Plus className="mr-2 h-4 w-4" />
              Importer artikkel
            </Button>
            <Button 
              variant="outline" 
              className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => document.getElementById('fileUpload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Last opp
            </Button>
            <input
              type="file"
              id="fileUpload"
              accept=".docx"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
          
          <div className={`flex flex-col md:flex-row md:space-x-4 ${showSideMenu && result ? 'md:space-x-6' : ''} relative`}>
            <div className={`flex-grow relative mb-4 md:mb-0 ${showSideMenu && result ? 'md:w-[70%]' : 'w-full'}`}>
              <div className={`w-full mb-4 p-4 border-2 border-blue-500 focus:border-blue-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-md transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700 overflow-auto custom-scrollbar md:h-[500px] ${isExpanded ? 'h-[450px]' : 'h-[250px]'}`}>
                <div
                  ref={contentEditableRef}
                  contentEditable={!isGenerating}
                  onInput={handleContentChange}
                  onPaste={handlePaste}
                  onClick={handleContentClick}
                  className="h-full"
                />
                {/* React-managed content */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-75 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  </div>
                )}
                {showCharCount && (
                  <div className="absolute bottom-6 right-6 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md">
                    {content.length}/5000
                  </div>
                )}
                {showAIOptions && (
                  <div className="absolute bottom-6 right-6" style={{ paddingBottom: '5px', paddingRight: '4px' }}>
                    <div onClick={() => setShowAIModal(true)}>
                      <MagicButton />
                    </div>
                  </div>
                )}
              </div>
              {showAIModal && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Endre med AI</h3>
                      <Button variant="ghost" onClick={() => setShowAIModal(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Button
                        key="Endre hele teksten"
                        variant="outline"
                        className="w-full justify-start text-gray-900 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleAIOption("Endre hele teksten")}
                        disabled={isGenerating}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Endre hele teksten
                      </Button>
                    </div>
                    {isGenerating && (
                      <div className="mt-4 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Processing with AI...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {showSideMenu && result && (
              <div id="side-menu" className="w-full md:w-[30%] h-auto md:h-[500px] bg-[#f3f4f6] dark:bg-gray-800 p-4 rounded-lg overflow-y-auto">
                <SideMenu
                  result={result}
                  onHighlight={highlightPlagiarizedText}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-8 mb-4">
            <div>
              <Button 
                onClick={isResultReady ? resetCheck : handleCheck}
                disabled={isChecking}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sjekker...
                  </>
                ) : isResultReady ? (
                  <>
                    Ny plagiat sjekk
                    <RefreshCw className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  'Sjekk for plagiat'
                )}
              </Button>
              {!session && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                  Alle nye brukere får 10 søk helt gratis
                </p>
              )}
            </div>
            {session && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {plagiatChecksRemaining}/{totalPlagiatChecks} søk igjen
              </p>
            )}
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          <div className="py-20">
            {/* Add the ImprovedPlagiarismSection here */}
            <ImprovedPlagiarismSection />
          </div>

          <section className="py-20">
          <HowToChooseAgent />
        </section>

          <section className="bg-white dark:bg-gray-800 py-16 mt-12 rounded-lg">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-navy-900 dark:text-white mb-12">
                Innhold.AI Plagiatkontroll er perfekt for..
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {categories.map((category, index) => (
                  <button
                    key={category.name}
                    className={`bg-white dark:bg-gray-700 rounded-lg p-6 text-center transition-all duration-300 ${
                      index === activeTab ? "border-b-4 border-blue-500 shadow-lg" : "hover:shadow-md"
                    }`}
                    onClick={() => setActiveTab(index)}
                  >
                    <div className={`w-20 h-20 mx-auto mb-4 overflow-hidden rounded-full transition-all duration-300 ${
                      index === activeTab ? "border-4 border-blue-600" : "border-4 border-light-blue-300"
                    }`}>
                      <Image
                        src={category.image}
                        alt={category.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                  </button>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <Image
                      src={categories[activeTab].image}
                      alt={`Person som bruker Innhold.AI's Plagiatkontroll for ${categories[activeTab].name}`}
                      width={600}
                      height={390}
                      className="w-full h-[390px] object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{categories[activeTab].name}</h3>
                    <p className="text-gray-800 dark:text-gray-300 mb-6">
                      {categories[activeTab].description}
                    </p>
                    <p className="text-gray-800 dark:text-gray-200 mb-6">
                      {categories[activeTab].content}
                    </p>
                    <ul className="space-y-4 text-gray-800 dark:text-gray-200">
                      {categories[activeTab].bulletPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Accordion section */}
          <div className="mt-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <button
              className="w-full p-6 flex justify-between items-center focus:outline-none"
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white md:text-base sm:text-base lg:text-2xl sm:text-base">Hvordan fungerer plagiatkontrollen?</h2>
              {isAccordionOpen ? (
                <ChevronUp className="h-6 w-6 text-gray-500" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-500" />
              )}
            </button>
            
            {isAccordionOpen && (
              <div className="p-6 pt-0">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Vår plagiatkontroll er et kraftig verktøy designet for å hjelpe deg med å sikre originaliteten i ditt innhold. Ved å bruke avansert teknologi, sammenligner systemet din tekst med milliarder av nettsider, akademiske publikasjoner og andre online ressurser.
                </p>

                <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Slik fungerer prosessen:</h3>
                
                <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">Du limer inn eller skriver inn teksten du ønsker å kontrollere i tekstfeltet.</li>
                  <li className="mb-2">Vår algoritme analyserer teksten og sammenligner den med et omfattende database av online innhold.</li>
                  <li className="mb-2">Systemet identifiserer eventuelle matchende tekstdeler og beregner en total prosent av potensielt plagiert innhold.</li>
                  <li className="mb-2">Du mottar en detaljert rapport som viser eventuelle matchende kilder, prosentandel av likhet, og spesifikke tekstdeler som matcher.</li>
                </ol>

                <h3 className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">Fordeler med å bruke vår plagiatkontroll:</h3>
                
                <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                  <li className="mb-2">Nøyaktig og pålitelig: Vår teknologi gir presise resultater og minimerer falske positive treff.</li>
                  <li className="mb-2">Omfattende dekning: Sjekker mot et bredt spekter av online kilder for grundig analyse.</li>
                  <li className="mb-2">Tidsbesparende: Rask prosessering gir deg resultater på kort tid.</li>
                  <li className="mb-2">Brukervennlig: Enkel å bruke med en intuitiv grensesnitt.</li>
                  <li className="mb-2">Detaljerte rapporter: Gir deg spesifikk informasjon om potensielt plagierte deler.</li>
                  <li className="mb-2">Forbedrer skrivearbeidet: Hjelper deg med å identifisere områder som trenger omskriving eller sitering.</li>
                  <li className="mb-2">Beskytter ditt omdømme: Sikrer at ditt arbeid er originalt før publisering eller innsending.</li>
                </ul>

                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  Ved å bruke vår plagiatkontroll regelmessig, kan du være trygg på at ditt innhold er unikt og originalt. Dette er spesielt viktig for studenter, akademikere, innholdsskapere og profesjonelle som verdsetter integritet i sitt arbeid.
                </p>

                <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Slik sjekker vi plagiat</h3>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  Vår plagiatkontroll leverer en grundig og pålitelig tjeneste ved hjelp av et omfattende samarbeid med Copyscape, en anerkjent aktør på området. Denne samarbeidsmodellen gjør det mulig for oss å skanne gjennom hele internett, noe som er avgjørende for å identifisere og vurdere om innholdet du ønsker å sjekke for plagiat allerede eksisterer på nettet. Med et trykk på en knapp kan du dermed sikre at ditt arbeid er både originalt og unikt i en stadig mer kompleks digital verden.
                </p>

                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  I tillegg til den omfattende søkefunksjonaliteten, tilbyr vår plagiatkontroll en detaljert likhetsrapport. Denne rapporten gir deg verdifulle innsikter om hvor stort omfanget av likhet er, inkludert en spesifik plagiatprosent. Dette tallet er essensielt for å forstå graden av samsvar med annet publisert innhold. Rapporten inkluderer også en utførlig bibliografi som lister opp all kilden materialet er sammenlignet med, og gir deg anledning til å se nøyaktig hva som er blitt vurdert i analysen.
                </p>

                <h3 className="text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white">Andre populære verktøy</h3>

                <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
                  <li className="mb-2"><a href="/dashboard" className="text-blue-500 hover:underline">Artikkelskriver</a>: Skap unikt innhold med vår AI-drevne artikkelgenerator</li>
                  <li className="mb-2"><a href="/tools/article-rewriter" className="text-blue-500 hover:underline">Artikkel omskriver</a>: Forny og forbedre eksisterende tekster enkelt</li>
                  <li className="mb-2"><a href="/tools/sentence-expander" className="text-blue-500 hover:underline">Setningsutvidelse</a>: Utvid og berik dine setninger for mer detaljert innhold</li>
                  <li className="mb-2"><a href="/tools/plagiarism-remover" className="text-blue-500 hover:underline">Plagiatfjerner</a>: Omskriv tekst for å eliminere potensielt plagiat</li>
                  <li className="mb-2"><a href="/tools/essay-writer" className="text-blue-500 hover:underline">Essayskriver</a>: Få hjelp til å strukturere og skrive overbevisende essays</li>
                </ul>
              </div>
            )}
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white text-left">Spørsmål og svar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <button
                    className="w-full text-left p-6 focus:outline-none"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.question}</h3>
                      {openFaqIndex === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  {openFaqIndex === index && (
                    <div className="p-6 pt-0">
                      <p className="text-gray-700 dark:text-gray-300">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
      {showLoginPopup && (
        <LoginPopup 
          onClose={() => setShowLoginPopup(false)} 
          onSwitchToRegister={handleSwitchToRegister}
          isVisible={showLoginPopup}
        />
      )}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="bg-white dark:bg-gray-800 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Importer artikkel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {articles.map((article) => (
              <div key={article.articleid} className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => importArticle(article.html)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Importer
                </Button>
                <span className="text-gray-900 dark:text-white">{article.title}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}