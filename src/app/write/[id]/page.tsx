'use client'
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useQuill } from 'react-quilljs'
import { useParams, useSearchParams } from 'next/navigation'
import { useSession } from "next-auth/react"
import 'react-quill/dist/quill.snow.css'
import '@/styles/writer-styles.css' // Import the new CSS file
import TextSelectionToolbar from '@/components/TextSelectionToolbar'
import SuggestionTooltip from '@/components/SuggestionTooltip'
import { supabase } from '@/lib/supabase'
import ShortcutNotification from '@/components/ShortcutNotification'
import WriterNav from '@/components/WriterNav'
import Quill from 'quill'
import { motion } from 'framer-motion'
import AIChatPanel from '@/components/ai-chat-panel'
import { v4 as uuidv4 } from 'uuid'
import { WordCountService } from '@/services/WordCountService'
import WordLimitNotification from '@/components/WordLimitNotification'
import { AnimatePresence } from 'framer-motion'
import BottomToolbar from '@/components/BottomToolbar'
import LoadingSpinner from '@/components/LoadingSpinner'
import CitationToolbar from '@/components/CitationToolbar'
import { formatCitation } from '@/utils/citationFormatter';
import Upgrade from '@/components/Upgrade';
import { ContentManager } from '@/utils/contentManager';
import CustomHistory from '@/utils/customHistory';
import { Range } from 'quill';
import { SNLResult } from '@/types/SNLResult';
import Delta from 'quill-delta';
import DropdownMenu from '@/components/DropdownMenu';
import dynamic from 'next/dynamic';
import { sanitizeContent } from '@/utils/contentSanitizer';
import { Loader, CircleStop } from 'lucide-react'
import { AIChatProvider } from '@/contexts/AIChatContext';



// Custom debounce function
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(this, args);
    }, wait);
  };
}

type Sources = 'user' | 'api' | 'silent';
type Block = any;
type BlockEmbed = any;

export default function WritePage() {
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [recentlyDeleted, setRecentlyDeleted] = useState(false);
  const [loadingDropdownItem, setLoadingDropdownItem] = useState<string | null>(null);
  const [lastSelectedDropdownItem, setLastSelectedDropdownItem] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ x: number; y: number } | null>(null);
  const [newLineIndex, setNewLineIndex] = useState<number | null>(null);
  const DynamicDropdownMenu = dynamic(() => import('@/components/DropdownMenu'), { ssr: false });
  const hasAddedNewLineRef = useRef(false);
  const [value, setValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params?.id as string
  const shouldGenerate = searchParams?.get('generate') === 'true'
  const generationInitiatedRef = React.useRef(false)
  const [citations, setCitations] = useState<Array<{ id: string, citation: string, full_citation: string, article_url?: string, last_updated?: string, }>>([]);
  const [articleTitle, setArticleTitle] = useState<string | null>(null)
  const [suggestion, setSuggestion] = useState('')
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 })
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastEditPositionRef = useRef<number | null>(null)
  const [suggestedContentRange, setSuggestedContentRange] = useState<{ index: number, length: number } | null>(null)
  const [lastSavedContent, setLastSavedContent] = useState('')
  const [showShortcutNotification, setShowShortcutNotification] = useState(false)
  const [hasSeenNotification, setHasSeenNotification] = useState(false)
  const [pendingContent, setPendingContent] = useState<string | null>(null)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [chatUuid, setChatUuid] = useState<string | null>(null)
  const [contentManager, setContentManager] = useState<ContentManager | null>(null);
  const [showWordLimitNotification, setShowWordLimitNotification] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [isSuggestionGenerating, setIsSuggestionGenerating] = useState(false);
  const [isGenerationComplete, setIsGenerationComplete] = useState(false)
  const [lastUntitledPosition, setLastUntitledPosition] = useState(0);
  const [language, setLanguage] = useState('norwegian');
  const [vipPrompt, setVipPrompt] = useState('');
  const [autocomplete, setAutocomplete] = useState(true);
  const [autocompleteButton, setAutocompleteButton] = useState(true);
  const [externalCiting, setExternalCiting] = useState(true);
  const [localCiting, setLocalCiting] = useState(true);
  const [citationStyleChanging, setCitationStyleChanging] = useState(false);


  const { quill, quillRef } = useQuill({
    modules: {
      history: {
        userOnly: true,
      },
      hoverMenu: true, // Keep this if you're still using it
      table: true,
      clipboard: {
        matchVisual: false,
      }
    },
    formats: [
      'header',
      'bold', 'italic', 'underline', 'strike',
      'list', 'bullet',
      'link',
      'align', 'color', 'background',
      'citation-format',
      'data-citation',
      'source'
    ],
    placeholder: 'Uten tittel',
    theme: 'snow'
  });




  useEffect(() => {
    if (quill) {
      (quill.history as any) = new (Quill.import('modules/history') as any)(quill, { userOnly: true });
    }
  }, [quill]);


  
  const tooltipRef = useRef<HTMLDivElement>(null)
  const quillEditorRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const [wordCountService, setWordCountService] = useState<WordCountService | null>(null)
  const [hoveredCitation, setHoveredCitation] = useState<{ id: string; citation: string; fullCitation: string; title: string; article_url?: string } | null>(null);
  const [citationToolbarPosition, setCitationToolbarPosition] = useState({ top: 0, left: 0 });
  const citationToolbarRef = useRef<HTMLDivElement>(null);
  const [isProcessingCitation, setIsProcessingCitation] = useState(false);
  const [citationStyle, setCitationStyle] = useState('APA7');
  const getSurroundingContext = (quill: Quill, position: number) => {
    const [currentLine] = quill.getLines(position);
    if (!currentLine) return null;
    const lineIndex = quill.getIndex(currentLine);
    const prevLine = quill.getLines(lineIndex - 1, 1)[0];
    const nextLine = quill.getLines(lineIndex + 1, 1)[0];
    return {
      prevLine: prevLine ? quill.getText(quill.getIndex(prevLine), prevLine.length()) : null,
      currentLine: quill.getText(lineIndex, currentLine.length()),
      nextLine: nextLine ? quill.getText(quill.getIndex(nextLine), nextLine.length()) : null
    };
  };
  const fetchPremiumStatus = useCallback(async (userEmail: string) => {
    console.log('Fetching premium status for:', userEmail);
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('premium')
        .eq('user_id', userEmail)  // Changed from 'email' to 'user_id'
        .single();
      if (error) throw error;
      console.log('Premium status data:', data);
      const isPremium = data?.premium === 'YES';
      console.log('Is premium user:', isPremium);
      setIsPremiumUser(isPremium);
    } catch (error) {
      console.error('Error fetching premium status:', error);
      setIsPremiumUser(false);
    }
  }, [supabase]);




  useEffect(() => {
    if (quill && citations && isPremiumUser !== undefined) {
      setContentManager(new ContentManager(quill, citations, isPremiumUser));
    }
  }, [quill, citations, isPremiumUser]);

  // VIP PROMPT HANDLER

  const handleVipPromptChange = async (newPrompt: string) => {
    console.log('WritePage: VIP prompt change requested:', newPrompt);
    setVipPrompt(newPrompt);
    if (session?.user?.email) {
      try {
        const { error } = await supabase
          .from('user_subscriptions')
          .upsert({ user_id: session.user.email, vipprompt: newPrompt })
        if (error) throw error;
        console.log('WritePage: VIP prompt updated in Supabase');
      } catch (error) {
        console.error('Error updating VIP prompt:', error);
      }
    }
  };


  // CITATION STYLE HANDLER

  const handleCitationStyleChange = async (newStyle: string) => {
    try {
      setCitationStyleChanging(true);
      console.log('WritePage: Citation style change requested:', newStyle);
      setCitationStyle(newStyle);
      
      if (quill) {
        const citationSpans = Array.from(quill.root.querySelectorAll('span[style*="color: blue"][data-citation]'));
        
        citationSpans.forEach((span) => {
          const citationElement = span as HTMLElement;
          const citationId = citationElement.getAttribute('data-citation');
          
          if (!citationId) return;
    
          const citationData = citations.find(c => c.id === citationId);
          if (!citationData) return;
    
          let inTextCitation = '';
          switch (newStyle.toLowerCase()) {
            case 'ieee':
              const index = citations.findIndex(c => c.id === citationId);
              inTextCitation = ` [${index + 1}]`;
              break;
            case 'apa7':
            case 'mla9':
              let citation = citationData.citation;
              if (!citation.startsWith(' ')) {
                citation = ` ${citation}`;
              }
              inTextCitation = citation;
              break;
          }
    
          citationElement.textContent = inTextCitation;
          citationElement.setAttribute('citation-format', newStyle);
        });
      }

      if (session?.user?.email) {
        await supabase
          .from('user_subscriptions')
          .upsert({ 
            user_id: session.user.email, 
            citation_style: newStyle 
          });
      }
    } catch (error) {
      console.error('Error changing citation style:', error);
    } finally {
      // Use a slightly longer timeout to ensure all DOM updates are complete
      setTimeout(() => {
        setCitationStyleChanging(false);
      }, 100);
    }
  };

  // LANGUAGE HANDLER

  const handleLanguageChange = async (newLanguage: string) => {
    console.log('Language change received in WritePage:', newLanguage);
    setLanguage(newLanguage);
    
    if (session?.user?.email) {
      try {
        console.log('Attempting to update language in Supabase');
        const { error } = await supabase
          .from('user_subscriptions')
          .update({ language: newLanguage })
          .eq('user_id', session.user.email)
        
        if (error) throw error;
        console.log('Language preference updated successfully in Supabase');
      } catch (error) {
        console.error('Error updating language preference in Supabase:', error);
      }
    } else {
      console.log('No user session, skipping Supabase update');
    }
  };


  // PICK LANGUAGE ON START OF SET

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (session?.user?.email) {
        try {
          const { data, error } = await supabase
            .from('user_subscriptions')
            .select('language, vipprompt, citation_style, autocomplete, autocomplete_button, external_citing, local_citing')
            .eq('user_id', session.user.email)
            .single()
          
          if (error) throw error;
          
          console.log('WritePage: Fetched data from Supabase:', data);
          
          if (data) {
            setLanguage(data.language || 'norwegian');
            setVipPrompt(data.vipprompt || '');
            setCitationStyle(data.citation_style || 'apa7');
            setAutocomplete(data.autocomplete ?? true);
            setAutocompleteButton(data.autocomplete_button ?? true);
            setExternalCiting(data.external_citing ?? true);
            setLocalCiting(data.local_citing ?? true);
            console.log('WritePage: Updated all states from Supabase');
          }
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
    };
  
    fetchUserPreferences();
  }, [session]);


  // AUTOCOMPLETE HANDLERS TOGGLE SWITCHES AND CITING SETTNNGS FOR SETTINGS PANEL AND SUPABASE


  const handleAutocompleteChange = async (value: boolean) => {
    console.log('WritePage: Autocomplete change received:', value);
    setAutocomplete(value);
    await updateSupabase('autocomplete', value);
  };
  
  const handleAutocompleteButtonChange = async (value: boolean) => {
    console.log('WritePage: Autocomplete button change received:', value);
    setAutocompleteButton(value);
    await updateSupabase('autocomplete_button', value);
  };
  
  const handleExternalCitingChange = async (value: boolean) => {
    console.log('WritePage: External citing change received:', value);
    setExternalCiting(value);
    await updateSupabase('external_citing', value);
  };
  
  const handleLocalCitingChange = async (value: boolean) => {
    console.log('WritePage: Local citing change received:', value);
    setLocalCiting(value);
    await updateSupabase('local_citing', value);
  };
  
  const updateSupabase = async (field: string, value: boolean) => {
    console.log(`WritePage: Attempting to update ${field} in Supabase to:`, value);
    if (session?.user?.email) {
      try {
        const { data, error } = await supabase
          .from('user_subscriptions')
          .upsert({ 
            user_id: session.user.email, 
            [field]: value 
          }, { 
            onConflict: 'user_id' 
          })
        
        if (error) throw error;
        console.log(`WritePage: ${field} updated successfully in Supabase:`, data);
      } catch (error) {
        console.error(`WritePage: Error updating ${field} in Supabase:`, error);
      }
    } else {
      console.log('WritePage: No user session, skipping Supabase update');
    }
  };



  const saveToSupabase = useCallback(
    async (content: string) => {
      if (content !== lastSavedContent) {
        try {
          const sanitizedContent = sanitizeContent(content);
          const { data, error } = await supabase
            .from('content')
            .update({ html_content: sanitizedContent })
            .eq('id', id)
            .select()
          if (error) throw error;
          if (data) {
            setLastSavedContent(sanitizedContent);
          }
        } catch (error) {
          // Error handling remains
        }
      }
    },
    [id, lastSavedContent]
  )
  const debouncedSaveToSupabase = useCallback(
    debounce((content: string) => {
      saveToSupabase(content);
    }, 1000),
    [saveToSupabase]
  )
  const logQuillContent = useCallback(() => {
    if (quill) {
      const delta = quill.getContents();
      const lastTextInsert = delta.ops?.find(op => typeof op.insert === 'string');
      if (lastTextInsert && typeof lastTextInsert.insert === 'string') {
        const paragraphCount = (lastTextInsert.insert.match(/\n/g) || []).length;
      }
    }
  }, [quill]);


  const restoreCitationAttributes = useCallback(async () => {
    if (!quill) return;
    
    console.log('Starting citation attribute restoration...');
    
    // Get all blue spans, even those without attributes
    const citations = Array.from(quill.root.querySelectorAll('span[style*="color: blue"]'));
    console.log('Found blue spans:', citations.length);
  
    if (citations.length > 0) {
      try {
        // Get all citations from the database
        const { data: dbCitations, error } = await supabase
          .from('citations')
          .select('*')
          .eq('article_id', id)
          .order('created_at', { ascending: true });
  
        if (error) throw error;
  
        if (!dbCitations?.length) {
          console.log('No citations found in database');
          return;
        }
  
        console.log('Found citations in database:', dbCitations.length);
  
        // Create IEEE numbering map
        const citationNumberMap = new Map(
          dbCitations.map((citation, index) => [citation.id, index + 1])
        );
  
        // First pass: Update each citation in place without Delta operations
        for (let i = 0; i < citations.length; i++) {
          const citationSpan = citations[i] as HTMLElement;
          const existingId = citationSpan.getAttribute('data-citation');
          const citationText = citationSpan.textContent?.trim();
          
          // Try to find matching citation in database
          let matchingCitation = existingId 
            ? dbCitations.find(c => c.id === existingId)
            : dbCitations[i]; // Fall back to index-based matching if no ID
  
          if (matchingCitation) {
            // Restore all attributes
            citationSpan.setAttribute('data-citation', matchingCitation.id);
            citationSpan.setAttribute('source', 'citation');
            citationSpan.setAttribute('citation-format', citationStyle);
  
            // Format citation text based on style
            let formattedText = '';
            switch (citationStyle.toLowerCase()) {
              case 'ieee':
                const number = citationNumberMap.get(matchingCitation.id) || i + 1;
                formattedText = ` [${number}]`;
                break;
  
                case 'mla9':
  // Get the MLA9 format from Supabase
  let mla9Citation = matchingCitation.mla9_format;
  
  // Check if citation already starts with a space
  if (!mla9Citation.startsWith(' ')) {
    // Add space if it's missing
    formattedText = ` ${mla9Citation}`;
    console.log('Added space to MLA9 citation:', formattedText);
  } else {
    // Use citation as is if it already has a space
    formattedText = mla9Citation;
    console.log('Using MLA9 citation with existing space:', formattedText);
  }
  break;

case 'apa7':
  // Get the APA7 format from Supabase
  let apa7Citation = matchingCitation.apa7_format;
  
  // Check if citation already starts with a space
  if (!apa7Citation.startsWith(' ')) {
    // Add space if it's missing
    formattedText = ` ${apa7Citation}`;
    console.log('Added space to APA7 citation:', formattedText);
  } else {
    // Use citation as is if it already has a space
    formattedText = apa7Citation;
    console.log('Using APA7 citation with existing space:', formattedText);
  }
  break;
            }
  
            // Update the citation text only if it's different
            if (citationSpan.textContent !== formattedText) {
              citationSpan.textContent = formattedText;
            }
  
            console.log('Restored citation:', {
              id: matchingCitation.id,
              text: formattedText,
              format: citationStyle
            });
          }
        }
  
        // Force a Quill update
        quill.update();
  
        // Save the restored content back to Supabase
        const updatedContent = quill.root.innerHTML;
        await saveToSupabase(updatedContent);
  
      } catch (error) {
        console.error('Error restoring citation attributes:', error);
      }
    }
  }, [quill, id, citationStyle, supabase, saveToSupabase]);




  
  useEffect(() => {
    if (quill) {
      console.log('Quill editor initialized');
      
      let isInitialLoad = true;
  
      if (pendingContent) {
        console.log('Inserting pending content into Quill');
        const sanitizedContent = sanitizeContent(pendingContent);
        quill.clipboard.dangerouslyPasteHTML(sanitizedContent);
        setPendingContent(null);
      }
  
      let lastLength = quill.getLength();
      let isDeleting = false;
      const deletionDelay = 200;
  
      const handleTextChange = (delta: Delta, oldDelta: Delta, source: Sources) => {
        if (source === 'user' && !citationStyleChanging) {
          // Handle deletion operations
          const deleteOp = delta.ops.find(op => 'delete' in op) as { delete?: number } | undefined;
          if (deleteOp && typeof deleteOp.delete === 'number' && deleteOp.delete > 1) {
            const retainOp = delta.ops[0];
            const retainLength = typeof retainOp === 'object' && 'retain' in retainOp ? retainOp.retain as number : 0;
            
            const deletedContent = oldDelta.slice(retainLength, retainLength + deleteOp.delete).ops
              .map(op => (typeof op === 'object' && 'insert' in op && typeof op.insert === 'string') ? op.insert : '')
              .join('');
            
            const isFullParagraphDeletion = /^\n?[\s\S]*\n$/.test(deletedContent);
            
            console.log('Deletion detected:', {
              deleteLength: deleteOp.delete,
              deletedContent,
              isFullParagraphDeletion
            });
  
            isDeleting = true;
            setTimeout(() => {
              isDeleting = false;
            }, deletionDelay);
  
            if (isFullParagraphDeletion) {
              console.log('Full paragraph deletion detected');
              setTimeout(() => {
                const selection = quill.getSelection();
                if (selection) {
                  const currentPosition = selection.index;
                  const text = quill.getText();
                  
                  let paragraphStart = currentPosition;
                  while (paragraphStart > 0 && text[paragraphStart - 1] !== '\n') {
                    paragraphStart--;
                  }
      
                  let prevParagraphStart = paragraphStart - 1;
                  while (prevParagraphStart > 0 && text[prevParagraphStart - 1] !== '\n') {
                    prevParagraphStart--;
                  }
      
                  let prevParagraphEnd = prevParagraphStart;
                  while (prevParagraphEnd < text.length && text[prevParagraphEnd] !== '\n') {
                    prevParagraphEnd++;
                  }
      
                  if (prevParagraphEnd > prevParagraphStart) {
                    quill.setSelection(prevParagraphEnd, 0);
                    console.log('Cursor moved to end of previous paragraph');
                  }
                }
              }, 0);
            }
          }
  
          // Handle content updates
          const content = quill.root.innerHTML;
          setValue(content);
          debouncedSaveToSupabase(content);
          logQuillContent();
  
          // Update title if h1 is present
          const h1Element = quill.root.querySelector('h1');
          if (h1Element) {
            const newTitle = h1Element.textContent || '';
            setArticleTitle(newTitle);
          }
  
          // Handle suggestion generation
          if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
          }
  
          const currentPosition = quill.getSelection()?.index;
          if (currentPosition !== undefined) {
            const text = quill.getText(0, currentPosition);
            const lastTwoChars = text.slice(-2);
            const isPaste = delta.ops?.some(op => op.insert && typeof op.insert === 'string' && op.insert.length > 1);
            
            if (!isPaste) {
              const newLineCreated = delta.ops?.some(op => op.insert === '\n');
              const currentLength = quill.getLength();
              const isNewEmptyLine = newLineCreated && currentLength === lastLength + 1;
              lastLength = currentLength;
              
              const shouldTriggerSuggestion =
                ['.', ',', '?', '!'].includes(lastTwoChars[0]) ||
                (['.', ',', '?', '!'].includes(lastTwoChars[0]) && lastTwoChars[1] === ' ') ||
                isNewEmptyLine;
  
              if (shouldTriggerSuggestion && !isDeleting) {
                suggestionTimeoutRef.current = setTimeout(() => {
                  if (!isDeleting) {
                    generateSuggestion(currentPosition, isNewEmptyLine);
                  }
                }, deletionDelay);
              }
            }
          }
  
          if (suggestedContentRange) {
            quill.removeFormat(suggestedContentRange.index, suggestedContentRange.length);
            setSuggestedContentRange(null);
          }
  
          // Call restoreCitationAttributes only if it's not the initial load
          // and if the change is not a citation-related change
          if (!isInitialLoad && !delta.ops?.some(op => op.attributes && op.attributes['data-citation'])) {
            restoreCitationAttributes();
          }
        }
      };
  
      // Call restoreCitationAttributes once after initial content load
      if (isInitialLoad) {
        restoreCitationAttributes();
        isInitialLoad = false;
      }
  
      // Add event listeners
      quill.on('text-change', handleTextChange);
  
      return () => {
        quill.off('text-change', handleTextChange);
      };
    }
  }, [quill, suggestedContentRange, debouncedSaveToSupabase, pendingContent, logQuillContent, citationStyleChanging, restoreCitationAttributes]);




  const debugCitations = () => {
    if (quill) {
      const citations = quill.root.querySelectorAll('span[style*="color: blue"]');
      const citationData = Array.from(citations).map(citation => ({
        text: citation.textContent,
        id: citation.getAttribute('data-citation'),
        format: citation.getAttribute('citation-format')
      }));
      console.log('Current citations in document:', citationData);
    }
  };


  const getFormattedCitationText = (citation: any, style: string, citationNumber?: number): string => {
    switch (style.toLowerCase()) {
      case 'ieee':
        return ` [${citationNumber || '?'}]`;
        
      case 'apa7':
        const author = citation.authors?.split(',')[0] || 'Ukjent';
        const year = citation.last_updated 
          ? citation.last_updated.match(/\((\d{4})/)?.[1] 
          : 'u.å.';
        return ` (${author}, ${year})`;
        
      case 'mla9':
        const mlaAuthor = citation.authors?.split(',')[0] || 'Ukjent';
        return ` (${mlaAuthor})`;
        
      default:
        return citation.citation;
    }
  };


  const updateQuillContent = useCallback((content: string) => {
    if (quill) {
      console.log('Updating Quill content:', content);
      quill.clipboard.dangerouslyPasteHTML(content);
      quill.update();
    } else {
      console.log('Quill not initialized, storing content for later');
      setPendingContent(content);
    }
  }, [quill])



  const handleStopGeneration = async () => {
    if (citationStyleChanging) return; // Add this guard
    if (abortController) {
      abortController.abort();
      setIsGenerating(false);
      setAbortController(null);
      
      // Get the current content from your Quill editor
      const currentContent = quill ? quill.root.innerHTML : '';
      
      // Save the current content to Supabase
      await saveToSupabase(currentContent);
      
      // Update the status in Supabase to 'generated'
      try {
        await supabase
          .from('content')
          .update({ status: 'generated' })
          .eq('id', id);
        
        console.log('Content saved and status updated to generated');
      } catch (error) {
        console.error('Error updating status:', error);
      }
    }
  };






  const generateContent = useCallback(async () => {
    try {
      setIsGenerating(true);
      const controller = new AbortController();
      setAbortController(controller);
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            if (content === '[DONE]') {
              setIsGenerating(false);
              setIsGenerationComplete(true);
            } else {
              accumulatedContent += content;
              const cleanedContent = cleanHtml(accumulatedContent);
              setValue(cleanedContent);
              updateQuillContent(cleanedContent);
            }
          }
        }
      }
      // After generation is complete, update Supabase
      const { error } = await supabase
        .from('content')
        .update({
          html_content: accumulatedContent,
          status: 'generated'
        })
        .eq('id', id);
      if (error) throw error;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Content generation aborted');
      } else {
        console.error('Error generating content:', error);
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null);
    }
  }, [id, updateQuillContent]);


  
  const checkGenerationStatus = useCallback(() => {
    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('title, status, html_content')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data && data.status === 'generated') {
          setArticleTitle(data.title || 'Untitled');
          setIsGenerating(false);
          setIsGenerationComplete(true);
          if (data.html_content) {
            const cleanedContent = cleanHtml(data.html_content);
            setValue(cleanedContent);
            updateQuillContent(cleanedContent);
          }
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking generation status:", error);
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [id, updateQuillContent]);


  useEffect(() => {
    const fetchInitialCitations = async () => {
      try {
        const { data, error } = await supabase
          .from('citations')
          .select('id, citation, full_citation, article_url, authors, last_updated')
          .eq('article_id', id);
        if (error) throw error;
        if (data) {
          setCitations(data);
        }
      } catch (error) {
        console.error('Error fetching initial citations:', error);
      }
    };
    fetchInitialCitations();
  }, [id, supabase]);

// Add this function inside your component, but outside of any useEffect
const simulateCtrlDownArrow = useCallback(() => {
  if (quill) {
    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      ctrlKey: true,
      bubbles: true
    });
    quill.root.dispatchEvent(event);
  }
}, [quill]);



// CUSTOM LINK BEHAVIOR

useEffect(() => {
  if (quill) {
    const editor = quill.root as HTMLElement;

    // Add CSS for cursor and tooltip
    editor.style.setProperty('--link-cursor', 'pointer');
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .ql-editor a {
        cursor: var(--link-cursor) !important;
      }
      .custom-tooltip {
        position: absolute;
        background-color: white;
        border: 1px solid #ccc;
        padding: 5px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      .custom-tooltip::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-top: 5px solid white;
      }
      .custom-tooltip .delete-icon {
        cursor: pointer;
        margin-left: 10px;
        color: #888;
      }
      .custom-tooltip .delete-icon:hover {
        color: #333;
      }
    `;
    document.head.appendChild(styleElement);

    let tooltip: HTMLDivElement | null = null;

    const showTooltip = (anchor: HTMLAnchorElement) => {
      console.log('Showing tooltip for:', anchor.href);
      if (tooltip) {
        document.body.removeChild(tooltip);
      }

      tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      
      const urlSpan = document.createElement('span');
      urlSpan.textContent = anchor.href;
      tooltip.appendChild(urlSpan);

      const deleteIcon = document.createElement('span');
      deleteIcon.innerHTML = '&#x2715;'; // X symbol
      deleteIcon.className = 'delete-icon';
      deleteIcon.onclick = (e) => {
        console.log('Delete icon clicked');
        e.preventDefault();
        e.stopPropagation();
        
        const blot = quill.scroll.find(anchor);
        if (blot) {
          const index = quill.getIndex(blot);
          const length = anchor.textContent?.length || 0;
          
          console.log('Removing format at index:', index, 'length:', length);
          quill.removeFormat(index, length);
          console.log('Format removed');
        } else {
          console.error('Could not find the link in the Quill document');
        }
        
        if (tooltip) {
          document.body.removeChild(tooltip);
          tooltip = null;
          console.log('Tooltip removed');
        }
      };
      tooltip.appendChild(deleteIcon);

      document.body.appendChild(tooltip);
      positionTooltip(anchor);

      // Add mouseenter event to the tooltip
      tooltip.addEventListener('mouseenter', () => {
        if (tooltip) {
          tooltip.style.pointerEvents = 'auto';
        }
      });

      // Add mouseleave event to the tooltip
      tooltip.addEventListener('mouseleave', () => {
        hideTooltip();
      });
    };

    const positionTooltip = (anchor: HTMLAnchorElement) => {
      if (tooltip) {
        const rect = anchor.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
        tooltip.style.top = `${rect.top - tooltipRect.height - 10 + window.pageYOffset}px`;
      }
    };

    const hideTooltip = () => {
      if (tooltip) {
        document.body.removeChild(tooltip);
        tooltip = null;
      }
    };

    // Handle click event
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        event.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    };

    // Handle mouseover event
    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor) {
        showTooltip(anchor);
      }
    };

    // Handle mouseout event
    const handleMouseOut = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && tooltip && !tooltip.contains(event.relatedTarget as Node)) {
        setTimeout(() => {
          if (tooltip && !tooltip.matches(':hover')) {
            hideTooltip();
          }
        }, 100);
      }
    };

    editor.addEventListener('click', handleClick);
    editor.addEventListener('mouseover', handleMouseOver);
    editor.addEventListener('mouseout', handleMouseOut);

    // Cleanup function
    return () => {
      editor.removeEventListener('click', handleClick);
      editor.removeEventListener('mouseover', handleMouseOver);
      editor.removeEventListener('mouseout', handleMouseOut);
      document.head.removeChild(styleElement);
      if (tooltip) {
        document.body.removeChild(tooltip);
      }
    };
  }
}, [quill]);


const handleCitationAdded = (citationId: string) => {
  // Implement the logic for when a citation is added
  console.log('Citation added:', citationId);
  // You might want to update some state or perform some action here
};



// HOVER ICONS ON QUILLELEMENTS PARAGRAPHS, HEADINGS DROP DOWN MENU 1/2

const handleDropdownItemClick = async (item: string) => {
  console.log('Dropdown item clicked:', item);
  setLastSelectedDropdownItem(item);
  setLoadingDropdownItem(item);

  if (!quill || newLineIndex === null || !wordCountService) {
    console.error('Quill, newLineIndex, or wordCountService not available');
    setLoadingDropdownItem(null);
    return;
  }

  console.log('Quill and newLineIndex are available');
  
  // Apply the format
  switch (item) {
    case 'Tekst':
      quill.formatLine(newLineIndex, 1, 'header', false);
      break;
    case 'Tittel 2':
      quill.formatLine(newLineIndex, 1, 'header', 2);
      break;
    case 'Tittel 3':
      quill.formatLine(newLineIndex, 1, 'header', 3);
      break;
    case 'Punktliste':
      quill.formatLine(newLineIndex, 1, 'list', 'bullet');
      setLoadingDropdownItem(null);
      setDropdownPosition(null);
      return;
    case 'Nummerert liste':
      quill.formatLine(newLineIndex, 1, 'list', 'ordered');
      setLoadingDropdownItem(null);
      setDropdownPosition(null);
      return;
  }

  // Generate content for text and titles only
  if (['Tekst', 'Tittel 2', 'Tittel 3'].includes(item)) {
    // Check if the user has enough words remaining
    const wordsRemaining = await wordCountService.refreshAndGetWordsRemaining();
    if (wordsRemaining < 50) {
      console.log(`Content generation skipped: User has only ${wordsRemaining} words remaining`);
      setShowWordLimitNotification(true);
      setLoadingDropdownItem(null);
      setDropdownPosition(null);
      return;
    }

    try {
      const h1Title = quill.getText(0, quill.getLength()).split('\n')[0];
      
      // Find the last non-empty paragraph
      let closestParagraph = '';
      let currentIndex = newLineIndex;
      while (currentIndex > 0 && !closestParagraph) {
        const [line] = quill.getLines(currentIndex - 1);
        if (line && line.length() > 0 && !line.domNode.tagName.match(/^H[1-6]$/)) {
          closestParagraph = line.domNode.textContent || '';
          break;
        }
        currentIndex--;
      }

      const closestTitle = getClosestTitle(quill, newLineIndex);

      console.log('Sending request to generate-dropdown-contents');
      console.log('Closest paragraph:', closestParagraph);
      const response = await fetch('/api/generate-dropdown-contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedOption: item,
          closestParagraph,
          closestTitle: closestTitle ? `${closestTitle.level}: ${closestTitle.title}` : null,
          h1Title
        }),
      });

      if (response.ok) {
        console.log('Response received from generate-dropdown-contents');
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let generatedContent = '';

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          lines.forEach((line) => {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                console.log('Content generation complete');
                // Wrap the generated content in a span
                const wrappedContent = `<span style="color: rgb(103, 132, 200)">${generatedContent}</span>`;
                
                // Insert the wrapped content
                quill.clipboard.dangerouslyPasteHTML(newLineIndex, wrappedContent, 'api');
                
                // Set the suggestion range
                const suggestedRange = {
                  index: newLineIndex,
                  length: generatedContent.length
                };
                console.log('Setting suggested content range:', suggestedRange);
                setSuggestedContentRange(suggestedRange);
                
                // Position and show the suggestion tooltip
                const lastLine = findLastLineOfGeneratedContent(newLineIndex, generatedContent.length);
                console.log('Last line of generated content:', lastLine);
                
                if (lastLine && quillEditorRef.current) {
                  const editorElement = quillEditorRef.current.querySelector('.ql-editor');
                  if (editorElement) {
                    const editorRect = editorElement.getBoundingClientRect();
                    const editorScrollTop = editorElement.scrollTop;
                    
                    const tooltipTop = lastLine.bottom - editorRect.top + editorScrollTop + 5;
                    const tooltipLeft = lastLine.left - editorRect.left + (lastLine.width / 2);
                    
                    console.log('Setting suggestion position:', { top: tooltipTop, left: tooltipLeft });
                    setSuggestionPosition({
                      top: tooltipTop,
                      left: tooltipLeft,
                    });
                    console.log('Showing suggestion tooltip');
                    setShowSuggestion(true);
                  } else {
                    console.error('Editor element not found');
                  }
                } else {
                  console.error('Unable to position tooltip: Last line or quillEditorRef not available');
                }
              } else {
                generatedContent += data;
              }
            }
          });
        }
      } else {
        console.error('Error response from generate-dropdown-contents');
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoadingDropdownItem(null);
    }
  }

  setDropdownPosition(null);
};





// HOVER ICONS ON QUILL ELEMENTS PARAGRAPHS, HEADINGS


useEffect(() => {
  if (quill) {
    const editor = quill.root as HTMLElement;
    let isSelecting = false;
    let selectionStartTime: number | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      isSelecting = true;
      selectionStartTime = Date.now();
    };

    const handleMouseUp = (e: MouseEvent) => {
      const selectionEndTime = Date.now();
      const selectionDuration = selectionEndTime - (selectionStartTime || 0);

      // Reset selection tracking
      isSelecting = false;
      selectionStartTime = null;

      // If the selection took more than 200ms, we assume it's a deliberate selection
      // and not a quick click on the + icon
      if (selectionDuration > 200) {
        return;
      }

      handlePlusClick(e);
    };

    const handlePlusClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const clickedElement = target.closest('p, h1, h2, h3');
      if (clickedElement instanceof HTMLElement) {
        const rect = clickedElement.getBoundingClientRect();
        
        // Check if the click is within the icon area
        const isClickOnIcon = e.clientX - rect.left <= 20 && e.clientY - rect.top <= rect.height;
        
        if (isClickOnIcon) {
          e.preventDefault();
          e.stopPropagation();
          
          const range = quill.getSelection(true);
          if (range) {
            const [leaf] = quill.getLeaf(range.index);
            if (leaf) {
              const index = quill.getIndex(leaf);
              
              quill.insertText(index + clickedElement.textContent!.length, '\n');
              const newIndex = index + clickedElement.textContent!.length + 1;
              setNewLineIndex(newIndex);
              
              quill.setSelection(newIndex, 0);
              
              // Position the dropdown relative to the new line
              setTimeout(() => {
                const bounds = quill.getBounds(newIndex);
                const editorElement = quill.container.querySelector('.ql-editor') as HTMLElement;
                const editorRect = editorElement.getBoundingClientRect();
                
                if (bounds && editorElement) {
                  const offsetY = 60;
                  const newPosition = {
                    x: editorRect.left + bounds.left,
                    y: bounds.top + bounds.height - editorElement.scrollTop + offsetY
                  };
                  setDropdownPosition(newPosition);
                }
              }, 0);
            }
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hoverElement = target.closest('p, h1, h2, h3');
      
      if (hoverElement instanceof HTMLElement) {
        const rect = hoverElement.getBoundingClientRect();
        const isHoverOnIcon = e.clientX - rect.left <= 20;
        
        if (isHoverOnIcon) {
          hoverElement.classList.add('icon-hovered');
        } else {
          hoverElement.classList.remove('icon-hovered');
        }
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('p, h1, h2, h3')) {
        target.classList.remove('icon-hovered');
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownPosition && !(e.target as HTMLElement).closest('.editor-dropdown')) {
        setDropdownPosition(null);
        setNewLineIndex(null);
      }
    };

    editor.addEventListener('mousedown', handleMouseDown);
    editor.addEventListener('mouseup', handleMouseUp);
    editor.addEventListener('mousemove', handleMouseMove);
    editor.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('click', handleClickOutside);

    return () => {
      editor.removeEventListener('mousedown', handleMouseDown);
      editor.removeEventListener('mouseup', handleMouseUp);
      editor.removeEventListener('mousemove', handleMouseMove);
      editor.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('click', handleClickOutside);
    };
  }
}, [quill, dropdownPosition, setDropdownPosition, setNewLineIndex]);




// GUARD FOR ISGENERATING STATE

const setIsGeneratingWithGuard = (value: boolean) => {
  // Only allow setting isGenerating to true during initial load or content generation
  if (!value || shouldGenerate || isLoading) {
    setIsGenerating(value);
    console.log('isGenerating set to:', value, 'shouldGenerate:', shouldGenerate, 'isLoading:', isLoading);
  }
};


// END OF HOVER ICONS ON QUILL ELEMENTS PARAGRAPHS, HEADINGS



useEffect(() => {
  const fetchContent = async () => {
    if (citationStyleChanging) return;
    if (!id || !shouldGenerate) return;
    if (!isLoading && isGenerationComplete) return;
    
    try {
      console.log('Fetching content for id:', id);
      setIsGeneratingWithGuard(true);
      const { data, error } = await supabase
        .from('content')
        .select('html_content, title, status, outline_type')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        if (data.status === 'generated') {
          setArticleTitle(data.title || 'Untitled');
          setIsGeneratingWithGuard(false);
          setIsGenerationComplete(true);
          if (data.html_content) {
            const cleanedContent = cleanHtml(data.html_content);
            setValue(cleanedContent);
            if (quill) {
              quill.setContents([]);
              quill.clipboard.dangerouslyPasteHTML(cleanedContent);
              await restoreCitationAttributes();
              
              if (data.outline_type === 'no-outline' && !hasAddedNewLineRef.current) {
                setTimeout(() => {
                  if (quill) {
                    const length = quill.getLength();
                    quill.insertText(length, '\n');
                    quill.setSelection(length + 1, 0);
                    hasAddedNewLineRef.current = true;
                    setTimeout(simulateCtrlDownArrow, 50);
                  }
                }, 1200);
              }
            } else {
              setPendingContent(cleanedContent);
            }
          }
        } else if (shouldGenerate && !generationInitiatedRef.current) {
          console.log('Initiating content generation');
          generationInitiatedRef.current = true;
          generateContent();
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      setValue('Error loading content.');
    } finally {
      setIsLoading(false);
    }
  };

  let mounted = true;
  
  if ((shouldGenerate || isLoading) && !citationStyleChanging && mounted) {
    fetchContent();
  }

  return () => {
    mounted = false;
  };
}, [id, shouldGenerate, isLoading, citationStyleChanging, restoreCitationAttributes]);





  useEffect(() => {
    const fetchArticleAndChatUuid = async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select('chat_uuid')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data.chat_uuid) {
          setChatUuid(data.chat_uuid);
        } else {
          const newChatUuid = uuidv4();
          setChatUuid(newChatUuid);
          await supabase
            .from('content')
            .update({ chat_uuid: newChatUuid })
            .eq('id', id);
        }
      } catch (error) {
        console.error('Error fetching chat UUID:', error);
      }
    };
    fetchArticleAndChatUuid();
  }, [id]);
  useEffect(() => {
    if (session?.user?.email) {
      const service = WordCountService.getInstance()
      service.initializeUser(session.user.email).then(() => {
        setWordCountService(service)
      })
      console.log('Calling fetchPremiumStatus');
      fetchPremiumStatus(session.user.email);
    }
  }, [session, fetchPremiumStatus]);
  const cleanHtml = (html: string): string => {
    // Remove any surrounding HTML tags
    let cleanedContent = html.replace(/<html>|<\/html>|<body>|<\/body>/gi, '');
    // Remove any markdown code block indicators
    cleanedContent = cleanedContent.replace(/```html|```/g, '');
    // Ensure all tags are properly closed
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanedContent;
    cleanedContent = tempDiv.innerHTML;
    // Remove any extra whitespace
    cleanedContent = cleanedContent.replace(/>\s+</g, '><').trim();
    return cleanedContent;
  }
  const [isTitleLoading, setIsTitleLoading] = useState(false);
  const generateTitleSuggestion = async (insertPosition: number) => {
    if (!quill) return null;
    const content = quill.root.innerHTML;
    console.log('Generating title suggestion at position:', insertPosition);
    // Insert loading placeholder
    const loadingText = "Generating title...";
    quill.insertText(insertPosition, loadingText);
    quill.formatLine(insertPosition, loadingText.length, 'header', 2);
    setIsTitleLoading(true);


    try {
      const response = await fetch('/api/generate-title-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });


      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);


      const data = await response.json();
      let suggestedTitle = data.title;
      console.log('Received suggested title:', suggestedTitle);


      if (suggestedTitle) {
        // Remove loading placeholder
        quill.deleteText(insertPosition, loadingText.length);
        
        // Insert the title with formatting
        quill.insertText(insertPosition, suggestedTitle, {
          'header': 2,
          'color': '#A0A0A0',
          'class': 'prerender-h2'
        });
        
        console.log('Inserted title with formatting');

        // Insert a new line after the title
        quill.insertText(insertPosition + suggestedTitle.length, '\n');
        
        const titleLength = suggestedTitle.length;

        // Show the SuggestionTooltip for the h2 title
        setSuggestedContentRange({
          index: insertPosition,
          length: titleLength
        });

        showSuggestionTooltip(insertPosition, titleLength);

        return { title: suggestedTitle, position: insertPosition };
      }

      return null;
    } catch (error) {
      console.error("Error generating title suggestion:", error);
      // Remove loading placeholder in case of error
      quill.deleteText(insertPosition, loadingText.length);
      return null;
    } finally {
      setIsTitleLoading(false);
    }
  };









// CURRENT SENTENCE

const getCurrentSentence = (quill: Quill, position: number): string => {
  console.log('XXX: Getting current sentence for position:', position);
  const [startLine] = quill.getLines(position);
  if (!startLine) {
    console.log('XXX: No line found at position');
    return '';
  }

  let startIndex = position;
  let endIndex = position;

  // Find the start of the current paragraph
  while (startIndex > 0 && !/\n$/.test(quill.getText(startIndex - 1, 1))) {
    startIndex--;
  }

  // Find the end of the current paragraph
  while (endIndex < quill.getLength() && !/\n$/.test(quill.getText(endIndex, 1))) {
    endIndex++;
  }

  // Now find the sentence boundaries within this paragraph
  let sentenceStart = startIndex;
  let sentenceEnd = endIndex;

  // Find the start of the current sentence
  while (sentenceStart > startIndex && !/[.!?]\s*$/.test(quill.getText(sentenceStart - 1, 1))) {
    sentenceStart--;
  }

  // Find the end of the current sentence
  while (sentenceEnd < endIndex && !/[.!?]/.test(quill.getText(sentenceEnd, 1))) {
    sentenceEnd++;
  }
  sentenceEnd++; // Include the punctuation mark

  const sentence = quill.getText(sentenceStart, sentenceEnd - sentenceStart).trim();
  console.log('XXX: Current sentence:', sentence);
  return sentence;
};

// CURRENT PARAGRAPH

const getCurrentParagraph = (quill: Quill, position: number): string => {
  console.log('XXX: Getting current paragraph for position:', position);
  let startIndex = position;
  let endIndex = position;
  let paragraph = '';

  // Search backwards for the start of the paragraph or a non-empty paragraph
  while (startIndex > 0) {
    const [line] = quill.getLines(startIndex - 1);
    if (line && (line.domNode.tagName === 'H1' || line.domNode.tagName === 'H2' || line.domNode.tagName === 'H3')) {
      break;
    }
    startIndex--;
    if (quill.getText(startIndex, 1) === '\n' && quill.getText(startIndex + 1, 1) === '\n') {
      startIndex++; // Move to the start of the paragraph
      break;
    }
  }

  // Search forwards for the end of the paragraph
  while (endIndex < quill.getLength()) {
    const [line] = quill.getLines(endIndex);
    if (line && (line.domNode.tagName === 'H1' || line.domNode.tagName === 'H2' || line.domNode.tagName === 'H3')) {
      break;
    }
    if (quill.getText(endIndex, 1) === '\n' && quill.getText(endIndex + 1, 1) === '\n') {
      break;
    }
    endIndex++;
  }

  paragraph = quill.getText(startIndex, endIndex - startIndex).trim();

  // If the paragraph is empty, search for the nearest non-empty paragraph
  if (!paragraph) {
    let nearestStart = startIndex;
    let nearestEnd = endIndex;

    // Search backwards
    while (nearestStart > 0) {
      const [line] = quill.getLines(nearestStart - 1);
      if (line && (line.domNode.tagName === 'H1' || line.domNode.tagName === 'H2' || line.domNode.tagName === 'H3')) {
        nearestStart--; // Include the heading
        break;
      }
      nearestStart--;
      const text = quill.getText(nearestStart, endIndex - nearestStart).trim();
      if (text) {
        paragraph = text;
        break;
      }
    }

    // If still empty, search forwards
    if (!paragraph) {
      while (nearestEnd < quill.getLength()) {
        const [line] = quill.getLines(nearestEnd);
        if (line && (line.domNode.tagName === 'H1' || line.domNode.tagName === 'H2' || line.domNode.tagName === 'H3')) {
          break;
        }
        nearestEnd++;
        const text = quill.getText(startIndex, nearestEnd - startIndex).trim();
        if (text) {
          paragraph = text;
          break;
        }
      }
    }
  }

  console.log('XXX: Found paragraph:', paragraph);
  return paragraph;
};
  
  //CURRENT TITLE

  const getClosestTitle = (quill: Quill, position: number): { level: string, title: string } => {
    console.log('XXX: Getting closest title for position:', position);
    let currentIndex = position;
    while (currentIndex > 0) {
      const [line] = quill.getLines(currentIndex);
      if (line && line.domNode.tagName.match(/^H[123]$/)) {
        const level = line.domNode.tagName.toLowerCase();
        const title = line.domNode.textContent || '';
        console.log(`XXX: Found ${level} title:`, title);
        return { level, title };
      }
      currentIndex--;
    }
    console.log('XXX: No title found');
    return { level: '', title: '' };
  };




  const generateSuggestion = async (position: number, isNewEmptyLine: boolean, isShortcut: boolean = false) => {
    console.log('generateSuggestion called:', { position, isNewEmptyLine, isShortcut });

    // Check if autocomplete is turned off
  if (!autocomplete) {
    console.log('Autocomplete is turned off. Skipping suggestion generation.');
    return;
  }
    
    // Exit early if content was recently deleted
    if (recentlyDeleted) {
      console.log('Skipping suggestion generation due to recent deletion');
      return;
    }

    if (!quill || !wordCountService) {
      console.log('Suggestion generation skipped:', { quillExists: !!quill, wordCountServiceExists: !!wordCountService });
      return;
    }
    
    // Get the most up-to-date content directly from Quill
    const fullContent = quill.root.innerHTML;
    const relevantContent = quill.getText(0, position);
    const currentParagraph = getCurrentParagraph(quill, position);
    const closestTitle = getClosestTitle(quill, position);
    const currentSentence = getCurrentSentence(quill, position);
    const isSentenceEnd = /[.!?]\s*$/.test(currentSentence);
  
    console.log('Current content state:', { fullContent, relevantContent, currentParagraph, closestTitle, currentSentence });
  
    const delta = quill.getContents();
    let paragraphCount = 0;
    let lastParagraphEnd = 0;

    // Check if the user has enough words remaining
const wordsRemaining = await wordCountService.refreshAndGetWordsRemaining();
if (wordsRemaining < 50) {
  console.log(`Suggestion generation skipped: User has only ${wordsRemaining} words remaining`);
  setShowWordLimitNotification(true);
  return;
}
  
    // Count actual paragraphs (excluding h2 titles) starting from the last Untitled position
    delta.ops?.forEach((op) => {
      if (typeof op.insert === 'string') {
        const lines = op.insert.split('\n');
        lines.forEach((line, index) => {
          if (line.trim() !== '' && (!op.attributes || op.attributes.header !== 2)) {
            lastParagraphEnd += line.length + 1; // +1 for the newline
            if (lastParagraphEnd > lastUntitledPosition) {
              paragraphCount++;
            }
          }
        });
      }
    });
  
    console.log('Paragraph count since last Untitled:', paragraphCount);
  
    // Check if we should generate a title
    if (paragraphCount === 4 && isNewEmptyLine) {
      const currentLine = quill.getLine(lastParagraphEnd)[0];
      const isEndOfParagraph = currentLine && (currentLine.length() === 0 || currentLine.domNode.tagName === 'P');
  
      if (isEndOfParagraph) {
        const existingFormat = quill.getFormat(lastParagraphEnd);
        if (!existingFormat.header) {
          const titleSuggestion = await generateTitleSuggestion(lastParagraphEnd);
          if (titleSuggestion) {
            setLastUntitledPosition(lastParagraphEnd + titleSuggestion.title.length + 1);
            return;
          }
        }
      }
    }
  
    if (isSuggestionGenerating) return; // Exit if already generating
    setIsSuggestionGenerating(true);
  
    const controller = new AbortController();
    const signal = controller.signal;
  
    let generatedTextStart = position;
    let generatedTextLength = 0;
  
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      controller.abort();
    
      if (quill) {
        // Find and remove all suggested content
        const delta = quill.getContents();
        const newDelta = new Delta();
        delta.ops?.forEach((op) => {
          if (op.attributes && op.attributes.color === '#6784c8') {
            // This is suggested content, so we don't add it to the new delta
            return;
          }
          // This is not suggested content, so we keep it
          if (typeof op.insert === 'string') {
            newDelta.insert(op.insert, op.attributes || undefined);
          } else if (typeof op.insert === 'object') {
            newDelta.insert(op.insert);
          }
        });
    
        quill.setContents(newDelta);
    
        // Ensure there's a newline character if it's a new paragraph
        if (isNewEmptyLine) {
          const textAfter = quill.getText(generatedTextStart, 1);
          if (textAfter !== '\n') {
            quill.insertText(generatedTextStart, '\n');
          }
        }
    
        // Calculate the appropriate cursor position
        const cursorPosition = isNewEmptyLine ? generatedTextStart + 1 : generatedTextStart;
    
        // Move the cursor to the appropriate position
        quill.setSelection(cursorPosition, 0);
    
        // Insert the pressed key if it's a printable character
        if (e.key.length === 1) {
          // Insert the text without any formatting (this will place it directly in the <p> tag)
          quill.insertText(cursorPosition, e.key, { color: null, italic: null });
          quill.setSelection(cursorPosition + 1, 0);
        }
      }
    
      setIsSuggestionGenerating(false);
      setShowSuggestion(false);
      setSuggestion('');
      setSuggestedContentRange(null);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFullyGeneratedKeyPress);
    };
  
    const handleFullyGeneratedKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      if (quill && suggestedContentRange) {
        // Remove the suggestion
        quill.deleteText(suggestedContentRange.index, suggestedContentRange.length);
        
        // Insert the typed character if it's a printable character
        if (e.key.length === 1) {
          quill.insertText(suggestedContentRange.index, e.key, { color: null, italic: null });
          quill.setSelection(suggestedContentRange.index + 1, 0);
        } else {
          quill.setSelection(suggestedContentRange.index, 0);
        }
  
        // Close the suggestion tooltip and reset states
        setShowSuggestion(false);
        setSuggestion('');
        setSuggestedContentRange(null);
  
        // Remove this event listener
        document.removeEventListener('keypress', handleFullyGeneratedKeyPress);
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
  
    try {
      const fullContent = quill.root.innerHTML;
      const relevantContent = quill.getText(0, position);
      const currentParagraph = getCurrentParagraph(quill, position);
      const closestTitle = getClosestTitle(quill, position);
      const currentTitle = getCurrentTitle(quill, position);
      const surroundingContext = getSurroundingContext(quill, position);
      const currentSentence = getCurrentSentence(quill, position);
      console.log('Client-side - Current Paragraph:', currentParagraph);
      console.log('Client-side - Closest H2 Title:', closestTitle);
  
      const response = await fetch('/api/generate-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fullContent,
          relevantContent: relevantContent,
          selectionStart: position,
          isNewEmptyLine: isNewEmptyLine,
          currentTitle: currentTitle,
          surroundingContext: surroundingContext,
          currentParagraph: currentParagraph,
          closestH2Title: closestTitle,
          currentSentence: currentSentence,
          language: language,
          vipPrompt: vipPrompt,
          isSentenceEnd: isSentenceEnd
        }),
        signal: signal,
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
  
      let accumulatedContent = '';
      let insertPosition = position;
  
      // Only adjust insert position if it's not a shortcut-triggered suggestion
      if (isNewEmptyLine && !isShortcut) {
        const lineInfo = quill.getLine(position);
        if (lineInfo && lineInfo[0]) {
          const line = lineInfo[0];
          insertPosition = line.next ? quill.getIndex(line.next) : quill.getLength();
        }
      }
  
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const content = line.slice(6);
            if (content === '[DONE]') {
              setSuggestion(accumulatedContent);
              showSuggestionTooltip(insertPosition, accumulatedContent.length);
              // Add the keypress event listener for fully generated suggestion
              document.addEventListener('keypress', handleFullyGeneratedKeyPress);
            } else {
              accumulatedContent += content;
              quill.insertText(insertPosition, content, {
                color: '#6784c8',
                italic: false
              });
              insertPosition += content.length;
              generatedTextLength += content.length;
            }
          }
        }
      }
  
      setSuggestedContentRange({
        index: insertPosition - accumulatedContent.length,
        length: accumulatedContent.length
      });
  
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Suggestion generation cancelled');
      } else {
        console.error("Error generating suggestion:", error);
      }
    } finally {
      setIsSuggestionGenerating(false);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keypress', handleFullyGeneratedKeyPress);
    }
  };
  
  // Helper function to get the current h2 or h3 title
  const getCurrentTitle = (quill: Quill, position: number) => {
    const [line] = quill.getLines(position);
    if (!line) return null;
  
    let currentNode = line.domNode as HTMLElement;
    while (currentNode && currentNode !== quill.root) {
      if (currentNode.tagName === 'H2' || currentNode.tagName === 'H3') {
        return {
          text: currentNode.textContent,
          level: currentNode.tagName.toLowerCase()
        };
      }
      currentNode = currentNode.parentNode as HTMLElement;
    }
    return null;
  };
























  const findLastLineOfGeneratedContent = (position: number, contentLength: number) => {
    if (quill && quillEditorRef.current) {
      const editorElement = quillEditorRef.current.querySelector('.ql-editor');
      
      if (editorElement) {
        // Find the span containing the generated content
        const generatedSpan = editorElement.querySelector(`span[style*="color: rgb(103, 132, 200)"]`);
        
        if (generatedSpan) {
          // Get all text nodes within the span
          const textNodes = Array.from(generatedSpan.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
          
          if (textNodes.length > 0) {
            // Get the last text node
            const lastTextNode = textNodes[textNodes.length - 1];

            // Log the content of the last text node
            console.log('%c Last line of generated content:', 'font-size: 16px; color: #4CAF50; font-weight: bold;');
            console.log('%c ' + lastTextNode.textContent, 'font-size: 14px; color: #2196F3; background: #E3F2FD; padding: 5px; border-radius: 3px;');
            
            // Create a range for the last text node
            const range = document.createRange();
            range.selectNodeContents(lastTextNode);
            
            // Get the bounding rectangle of the range
            const rect = range.getBoundingClientRect();
            
            return {
              bottom: rect.bottom,
              left: rect.left,
              width: rect.width
            };
          }
        }
      }
    }
    return null;
  };







  const showSuggestionTooltip = (position: number, contentLength: number) => {
    const lastLine = findLastLineOfGeneratedContent(position, contentLength);
    
    if (lastLine && quillEditorRef.current) {
      const editorElement = quillEditorRef.current.querySelector('.ql-editor');
      if (editorElement) {
        const editorRect = editorElement.getBoundingClientRect();
        const editorScrollTop = editorElement.scrollTop;
        
        const tooltipTop = lastLine.bottom - editorRect.top + editorScrollTop + 5;
        const tooltipLeft = lastLine.left - editorRect.left + (lastLine.width / 2);
        
        setSuggestionPosition({
          top: tooltipTop,
          left: tooltipLeft,
        });
        setShowSuggestion(true);
      }
    }
  };




  const handleAcceptSuggestion = async () => {
    if (quill && suggestedContentRange && wordCountService) {
      quill.history.cutoff(); // Mark a point in history
      
      console.log('Accepting suggestion. Range:', suggestedContentRange);
      let suggestionText = quill.getText(suggestedContentRange.index, suggestedContentRange.length).trim();
      console.log('Suggestion text:', suggestionText);
      const wordCount = suggestionText.split(/\s+/).length;
  
      try {
        const hasEnoughWords = await wordCountService.checkWordAvailability(wordCount);
        if (!hasEnoughWords) {
          setShowWordLimitNotification(true);
          return;
        }
  
        await wordCountService.deductWords(wordCount);
        console.log(`Deducted ${wordCount} words from user's balance`);
  
        const format = quill.getFormat(suggestedContentRange.index, suggestedContentRange.length);
        console.log('Suggestion format:', format);
  
        if (format.header === 2) {
          console.log('Suggestion is an h2 title');
          // Remove hashtags and down arrow
          suggestionText = suggestionText.replace(/^##\s*|\s*↓$/g, '').trim();
          
          // Remove the original suggested text
          quill.deleteText(suggestedContentRange.index, suggestedContentRange.length);
          
          // Insert the cleaned title text with H2 formatting and normal color
          quill.insertText(suggestedContentRange.index, suggestionText, {
            'header': 2,
            'color': 'black', // Explicitly set to black
          });
          
          console.log('Removed hashtags, temporary formatting, and prerender class, kept h2');
  
          // Move the cursor to the end of the suggestion
          const endOfSuggestion = suggestedContentRange.index + suggestionText.length;
          quill.setSelection(endOfSuggestion, 0);
  
          // Insert a new line and set its format to normal paragraph
          quill.insertText(endOfSuggestion, '\n');
          quill.formatLine(endOfSuggestion + 1, 1, 'header', false);
  
          // Move the cursor to the new line
          quill.setSelection(endOfSuggestion + 1, 0);

          // Update lastUntitledPosition
          setLastUntitledPosition(suggestedContentRange.index + suggestionText.length + 1);
        } else {
          console.log('Suggestion is not an h2 title');
          // Handle regular suggestion acceptance
          quill.removeFormat(suggestedContentRange.index, suggestedContentRange.length);
        }
  
        setShowSuggestion(false);
        setSuggestion('');
        setSuggestedContentRange(null);
  
        const updatedDelta = quill.getContents();
        console.log('Quill Editor Contents (Delta) after accepting suggestion:', JSON.stringify(updatedDelta, null, 2));

        quill.history.cutoff(); // Mark another point in history
      } catch (error) {
        console.error("Error handling suggestion acceptance:", error);
      }
    }
  };
































  const handleRegenerate = () => {
    if (quill && suggestedContentRange) {
      // Remove the previous suggestion
      quill.deleteText(suggestedContentRange.index, suggestedContentRange.length);
      setShowSuggestion(false);
     
      // Generate a new suggestion
      generateSuggestion(suggestedContentRange.index, false);
      
    }
  };
































  const handleDeclineSuggestion = () => {
    if (quill && suggestedContentRange) {
      quill.history.cutoff(); // Mark a point in history
      
      const format = quill.getFormat(suggestedContentRange.index, suggestedContentRange.length);
      const isFullyGenerated = !isSuggestionGenerating;
  
      if (format.header === 2) {
        // If it's an h2 title, remove it entirely
        quill.deleteText(suggestedContentRange.index, suggestedContentRange.length + 1); // +1 to remove the newline
      } else {
        // For regular suggestions, remove the text and ensure no extra characters are left
        quill.deleteText(suggestedContentRange.index, suggestedContentRange.length);
        
        // Check if there's an extra character left and remove it if necessary
        const textAfter = quill.getText(suggestedContentRange.index, 1);
        if (textAfter && textAfter !== '\n') {
          quill.deleteText(suggestedContentRange.index, 1);
        }
  
        // If it was fully generated, ensure there's an empty line
        if (isFullyGenerated) {
          const textAfterDeletion = quill.getText(suggestedContentRange.index, 1);
          if (textAfterDeletion !== '\n') {
            quill.insertText(suggestedContentRange.index, '\n');
          }
        }
      }
  
      setShowSuggestion(false);
      setSuggestion('');
      setSuggestedContentRange(null);
  
      // Move the cursor to the beginning of the empty line
      quill.setSelection(suggestedContentRange.index, 0);
      
      quill.history.cutoff(); // Mark another point in history
    }
  }
































  const handleAICommand = (command: string) => {
    // Implement AI command handling logic here
    console.log('AI Command:', command)
  }
































  const handleCite = useCallback(async (selectedText: string, citation: string, fullCitation: string, result: SNLResult, citationId: string) => {
    console.log('handleCite called with:', { selectedText, citation, fullCitation, result, citationId });
    if (quill && !isProcessingCitation) {
      setIsProcessingCitation(true);

      try {
        const range = quill.getSelection();
        if (range) {
          // Check if the citation already exists
          const existingCitation = quill.root.querySelector(`span[data-citation="${citationId}"]`);
          if (existingCitation) {
            console.log('Citation already exists, not inserting duplicate');
            return null;
          }

          // Get existing citations to determine the next number
          const { data: existingCitations } = await supabase
            .from('citations')
            .select('id')
            .eq('article_id', id)
            .order('created_at', { ascending: true });

          // Calculate the citation number based on unique citations
          const uniqueCitationIds = new Set(existingCitations?.map(c => c.id) || []);
          const citationNumber = uniqueCitationIds.size + 1;

          // Format the citation based on style
          let inTextCitation = '';
          switch (citationStyle.toLowerCase()) {
            case 'ieee':
              inTextCitation = ` [${citationNumber}]`;
              break;
            case 'apa7':
              const author = result.authors?.[0]?.full_name?.split(' ').pop() || 'Ukjent';
              const year = result.changed_at 
                ? new Date(result.changed_at).getFullYear() 
                : 'u.å.';
              inTextCitation = ` (${author}, ${year})`;
              break;
            case 'mla9':
              const mlaAuthor = result.authors?.[0]?.full_name?.split(' ').pop() || 'Ukjent';
              inTextCitation = ` (${mlaAuthor})`;
              break;
          }

          // Insert the citation with a guaranteed unique ID
          quill.insertText(range.index + selectedText.length, inTextCitation, {
            'color': 'blue'
          });

          // Force a Quill update
          quill.update();

          // Find the newly inserted span element and add attributes
          setTimeout(() => {
            const spans = quill.root.querySelectorAll('span[style*="color: blue"]');
            const citationSpan = Array.from(spans).find(span => 
              span.textContent?.includes(inTextCitation));
           
            if (citationSpan) {
              citationSpan.setAttribute('data-citation', citationId);
              citationSpan.setAttribute('source', 'citation');
              citationSpan.setAttribute('citation-format', citationStyle);
              console.log('Citation span modified:', citationSpan.outerHTML);
            } else {
              console.log('Citation span not found');
            }
          }, 0);
         
          quill.setSelection(range.index + selectedText.length + inTextCitation.length, 0);


          // Function to format authors for APA7
const formatAPA7Authors = (authors: { full_name: string }[], changedAt: string) => {
  let authorPart = '';
  if (!authors || authors.length === 0) {
    authorPart = 'Unknown';
  } else if (authors.length === 1) {
    const lastName = authors[0].full_name.split(' ').pop() || '';
    authorPart = lastName;
  } else if (authors.length === 2) {
    const lastName1 = authors[0].full_name.split(' ').pop() || '';
    const lastName2 = authors[1].full_name.split(' ').pop() || '';
    authorPart = `${lastName1} & ${lastName2}`;
  } else {
    const firstAuthorLastName = authors[0].full_name.split(' ').pop() || '';
    authorPart = `${firstAuthorLastName} et al.`;
  }

  // Extract year from changed_at
  const year = new Date(changedAt).getFullYear();

  return `(${authorPart}, ${year})`;
};


          // Function to format authors for MLA9
const formatMLA9Authors = (authors: { full_name: string }[]) => {
  if (!authors || authors.length === 0) return '(Unknown)';
  if (authors.length === 1) {
    const lastName = authors[0].full_name.split(' ').pop() || '';
    return `(${lastName})`;
  }
  if (authors.length === 2) {
    const lastName1 = authors[0].full_name.split(' ').pop() || '';
    const lastName2 = authors[1].full_name.split(' ').pop() || '';
    return `(${lastName1} og ${lastName2})`;
  }
  const firstAuthorLastName = authors[0].full_name.split(' ').pop() || '';
  return `(${firstAuthorLastName} et al.)`;
};

// Generate MLA9 format citation
const mla9Format = formatMLA9Authors(result.authors);
const apa7Format = formatAPA7Authors(result.authors, result.changed_at);

          // Save to Supabase
          const { data, error } = await supabase
            .from('citations')
            .insert({
              id: citationId,
              article_id: id,
              citation: citation,
              full_citation: fullCitation,
              title: result.title,
              article_url: result.article_url,
              article_url_json: result.article_url_json,
              rank: result.rank ? Math.round(result.rank) : null,
              headword: result.headword,
              snl_article_id: result.id,
              article_type_id: result.article_type_id,
              source_content: selectedText,
              citation_format: citationStyle,
              mla9_format: mla9Format,
              apa7_format: apa7Format
            });

          if (error) {
            console.error('Error saving citation to Supabase:', error);
            return null;
          } else {
            console.log('Citation saved to Supabase:', data);
            setCitations(prevCitations => [...prevCitations, { 
              id: citationId, 
              citation, 
              full_citation: fullCitation, 
              article_url: result.article_url 
            }]);
            
            const updatedContent = quill.root.innerHTML;
            await saveToSupabase(updatedContent);
            
            if (handleCitationAdded) {
              handleCitationAdded(result.id);
            }
            
            return citationId;
          }
        }
      } catch (error) {
        console.error('Error processing citation:', error);
      } finally {
        setIsProcessingCitation(false);
      }
    }
  }, [quill, isProcessingCitation, id, citationStyle, supabase, setCitations, handleCitationAdded]);

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const day = date.getDate();
    const monthNames = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember'
    ];
    const month = monthNames[date.getMonth()];
    return `(${year}, ${day}. ${month})`;
  };
































  // Update storeCitationData function
  const storeCitationData = (id: string, citation: string, fullCitation: string, title: string, result: SNLResult) => {
    const citationData = JSON.parse(localStorage.getItem('citationData') || '{}');
    citationData[id] = { citation, fullCitation, ...result };
    localStorage.setItem('citationData', JSON.stringify(citationData));
  };































  const handleFormatChange = (format: string) => {
    if (quill) {
      quill.format('header', format === 'p' ? false : format.replace('h', ''))
    }
  }
































  const handleStyleChange = (style: 'bold' | 'italic' | 'underline') => {
    if (quill) {
      const currentFormat = quill.getFormat()
      quill.format(style, !currentFormat[style])
    }
  }
































  const handleAddLink = () => {
    if (quill) {
      const range = quill.getSelection()
      if (range) {
        const url = prompt('Enter the URL')
        if (url) {
          quill.format('link', url)
        }
      }
    }
  }
































  const handleReplaceSelection = (newText: string) => {
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        // Get the current line formats
        const formats = quill.getFormat(range);
        
        // Find the start and end of the selection
        const [startBlock] = quill.getLine(range.index);
        const [endBlock] = quill.getLine(range.index + range.length);
        
        // Delete the selected text
        quill.deleteText(range.index, range.length);
        
        // Insert the new text with preserved formats, except for header, and add background
        const newFormats = { ...formats, header: false, background: 'rgba(255, 244, 199, 1)' };
        quill.insertText(range.index, newText, newFormats);
        
        // Ensure there's a newline after the inserted text if it doesn't end with one
        if (!newText.endsWith('\n')) {
          quill.insertText(range.index + newText.length, '\n', newFormats);
        }
        // If the original selection ended at a heading, insert a newline before it
        if (endBlock && endBlock.domNode.tagName.match(/^H[1-6]$/)) {
          quill.insertText(range.index + newText.length + 1, '\n', newFormats);
        }
        
        // Move the cursor to the end of the inserted text
        quill.setSelection(range.index + newText.length, 0);
  
        // Fade out the background
        const fadeOutDuration = 2000; // 2 seconds
        const fadeOutSteps = 20;
        const fadeOutInterval = fadeOutDuration / fadeOutSteps;
        let currentStep = 0;
  
        const fadeInterval = setInterval(() => {
          currentStep++;
          const opacity = 1 - (currentStep / fadeOutSteps);
          const backgroundColor = `rgba(255, 244, 199, ${opacity})`;
          
          quill.formatText(range.index, newText.length, { background: backgroundColor });
  
          if (currentStep >= fadeOutSteps) {
            clearInterval(fadeInterval);
            quill.removeFormat(range.index, newText.length);
          }
        }, fadeOutInterval);
      }
    }
  };
































  const handleInsertBelow = (newText: string) => {
    if (quill) {
      const range = quill.getSelection();
      console.log('Current selection range:', range);
  
      if (range) {
        let insertIndex = range.index + range.length;
        console.log('Insert index:', insertIndex);
  
        let [block, offset] = quill.getLine(insertIndex - 1);
        console.log('Current block:', block);
  
        const blockEndIndex = block ? quill.getIndex(block) + block.length() : insertIndex;
  
        // Create a new delta
        let delta = new Delta()
          .retain(blockEndIndex)
          .insert(newText.trim(), { background: '#f0f0f0' })  // Light grey background
          .insert('\n');
  
        console.log('Delta to apply:', JSON.stringify(delta, null, 2));
  
        // Apply the delta
        quill.updateContents(delta);
  
        // Log the Quill delta after insertion
        const newDelta = quill.getContents();
        console.log('Quill delta after insertion:', JSON.stringify(newDelta, null, 2));
  
        // Move the cursor to the end of the inserted text
        const newCursorPosition = blockEndIndex + newText.trim().length;
        console.log('New cursor position:', newCursorPosition);
        quill.setSelection(newCursorPosition, 0);
  
        // Fade out the background
        const fadeOutDuration = 2000; // 2 seconds
        const fadeOutSteps = 20;
        const fadeOutInterval = fadeOutDuration / fadeOutSteps;
        let currentStep = 0;
  
        const fadeInterval = setInterval(() => {
          currentStep++;
          const opacity = 1 - (currentStep / fadeOutSteps);
          const backgroundColor = `rgba(255, 244, 199, ${opacity})`;
          
          quill.formatText(blockEndIndex, newText.trim().length, { background: backgroundColor });
  
          if (currentStep >= fadeOutSteps) {
            clearInterval(fadeInterval);
            quill.removeFormat(blockEndIndex, newText.trim().length);
          }
        }, fadeOutInterval);
      }
    }
  };































  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSuggestion &&
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node) &&
          quillEditorRef.current &&
          quillEditorRef.current.contains(event.target as Node)) {
        handleDeclineSuggestion();
      }
    }
































    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSuggestion])
































  useEffect(() => {
    // Check if the user has seen the notification before
    const hasSeenNotification = localStorage.getItem('hasSeenShortcutNotification')
    setHasSeenNotification(!!hasSeenNotification)
  }, [])
































  const handleShortcutUsed = () => {
    if (!hasSeenNotification) {
      setShowShortcutNotification(true)
      localStorage.setItem('hasSeenShortcutNotification', 'true')
      setHasSeenNotification(true)
    }
  }
































  const handleCloseNotification = () => {
    setShowShortcutNotification(false)
    localStorage.setItem('hasSeenShortcutNotification', 'true')
    setHasSeenNotification(true)
  }
































 // const handleDownload = () => {
 //   const element = document.createElement("a");
 //   const file = new Blob([quill?.root.innerHTML || ''], {type: 'text/html'});
 //   element.href = URL.createObjectURL(file);
 //   element.download = "article.html";
 //   document.body.appendChild(element);
 //   element.click();
 // }
































  // const handleCopy = () => {
  //   navigator.clipboard.writeText(quill?.root.innerHTML || '').then(() => {
  //     alert("Content copied to clipboard!");
  //   }, (err) => {
  //     console.error('Could not copy text: ', err);
  //   });
  // }
































  const getContent = () => {
    return contentManager ? contentManager.getContent() : '';
  };
































  const addToArticle = (content: string) => {
    if (quill) {
      const range = quill.getSelection();
      if (range) {
        // Create a temporary div to parse the HTML
        const temp = document.createElement('div');
        temp.innerHTML = content;
































        // Iterate through the child nodes and insert them into the editor
        temp.childNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            switch (element.tagName.toLowerCase()) {
              case 'h2':
                quill.insertText(range.index, element.textContent + '\n', 'header', '2');
                range.index += (element.textContent?.length || 0) + 1;
                break;
              case 'h3':
                quill.insertText(range.index, element.textContent + '\n', 'header', '3');
                range.index += (element.textContent?.length || 0) + 1;
                break;
              case 'p':
                quill.insertText(range.index, element.textContent + '\n');
                range.index += (element.textContent?.length || 0) + 1;
                break;
              // Add more cases for other HTML elements as needed
              default:
                quill.clipboard.dangerouslyPasteHTML(range.index, element.outerHTML);
                range.index += element.textContent?.length || 0;
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            const textContent = node.textContent || '';
            quill.insertText(range.index, textContent);
            range.index += textContent.length;
          }
        });
       
        quill.setSelection(range.index, 0);
      } else {
        quill.clipboard.dangerouslyPasteHTML(quill.getLength(), content);
      }
    }
  };

  const handleTitleChange = useCallback(async (newTitle: string) => {
    setArticleTitle(newTitle);
    try {
      const { error } = await supabase
        .from('content')
        .update({ title: newTitle })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error updating title in Supabase:', error);
      // Optionally, you can add some error handling UI here
    }
  }, [id]);
  const updateWordCount = useCallback(() => {
    if (quill) {
      const text = quill.getText().trim()
      const words = text ? text.split(/\s+/).length : 0
      setWordCount(words)
    }
  }, [quill])
  const updateUndoRedoState = useCallback(() => {
    if (quill) {
      setCanUndo(quill.history.stack.undo.length > 0)
      setCanRedo(quill.history.stack.redo.length > 0)
    }
  }, [quill])


  useEffect(() => {
    if (quill) {
      const handleTextChange = () => {
        updateWordCount()
        updateUndoRedoState()
      }
      quill.on('text-change', handleTextChange)
      // Initial update
      handleTextChange()
      return () => {
        quill.off('text-change', handleTextChange)
      }
    }
  }, [quill, updateWordCount, updateUndoRedoState])



  const handleUndo = () => {
    if (quill && canUndo) {
      quill.history.undo()
    }
  }
  const handleRedo = () => {
    if (quill && canRedo) {
      quill.history.redo()
    }
  }


  useEffect(() => {
    if (quill) {
      const editor = quill.root;
      let scrollTimeout: NodeJS.Timeout;
  
      const handleScroll = () => {
        // Hide tooltip while scrolling
        setHoveredCitation(null);
      };
  
      const handleClick = async (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const citationSpan = target.closest('span[data-citation]') as HTMLSpanElement | null;
        const citationId = citationSpan?.getAttribute('data-citation');
  
        if (citationSpan && citationId) {
          // Prevent the default cursor movement
          e.preventDefault();
          e.stopPropagation();
  
          try {
            const spanRect = citationSpan.getBoundingClientRect();
            const editorElement = quill.root.parentElement;
            
            if (editorElement) {
              const editorRect = editorElement.getBoundingClientRect();
              
              // Get the actual text content node of the citation span
              const textNode = Array.from(citationSpan.childNodes).find(node => 
                node.nodeType === Node.TEXT_NODE
              );
              
              // Create a range to get precise text measurements
              const range = document.createRange();
              if (textNode) {
                range.selectNodeContents(textNode);
                const textRect = range.getBoundingClientRect();
                
                // Calculate the exact center of the text, not just the span
                const textCenter = textRect.left + (textRect.width / 2);
                
                console.log('Citation measurements:', {
                  spanRect,
                  textRect,
                  textCenter,
                  editorRect
                });
  
                // Use viewport-relative coordinates since we're using fixed positioning
                setCitationToolbarPosition({
                  top: spanRect.bottom + 5, // Remove window.scrollY since using fixed
                  left: textCenter
                });
              } else {
                // Fallback to span center if text node not found
                const spanCenter = spanRect.left + (spanRect.width / 2);
                setCitationToolbarPosition({
                  top: spanRect.bottom + 5, // Remove window.scrollY since using fixed
                  left: spanCenter
                });
              }
  
              // Query database and show toolbar
              const { data, error } = await supabase
                .from('citations')
                .select('*')
                .eq('id', citationId)
                .single();
  
              if (error) throw error;
              if (data) {
                const { citation, full_citation: fullCitation, title, article_url } = data;
                setHoveredCitation({
                  id: citationId,
                  citation,
                  fullCitation,
                  title,
                  article_url: article_url || undefined
                });
              }
            }
          } catch (error) {
            console.error('Error handling citation click:', error);
          }
        } else if (hoveredCitation && !citationToolbarRef.current?.contains(e.target as Node)) {
          setHoveredCitation(null);
        }
      };
  
      editor.addEventListener('click', handleClick);
      document.addEventListener('click', handleClick);
      window.addEventListener('scroll', handleScroll, { passive: true });
  
      return () => {
        editor.removeEventListener('click', handleClick);
        document.removeEventListener('click', handleClick);
        window.removeEventListener('scroll', handleScroll);
        if (scrollTimeout) clearTimeout(scrollTimeout);
      };
    }
  }, [quill, supabase, hoveredCitation]);




  
  const handleDeleteCitation = useCallback(async (citationId: string) => {
    if (!citationId) {
      console.error('Citation ID is undefined');
      return;
    }
    if (quill && hoveredCitation) {
      // Delete from Quill editor
      const citations = quill.root.querySelectorAll(`span[data-citation="${citationId}"]`) as NodeListOf<HTMLElement>;
      citations.forEach((citation) => {
        const blot = quill.scroll.find(citation);
        if (blot) {
          const index = quill.getIndex(blot);
          if (index !== undefined) {
            const length = citation.textContent?.length || 0;
            // Check for period and space after the citation
            const nextChars = quill.getText(index + length, 2);
            let additionalDelete = 0;
            if (nextChars === '. ') {
              additionalDelete = 1; // Only delete the period, keep the space
            }
            // Delete the citation and the period (if present), but keep the space
            quill.deleteText(index, length + additionalDelete);
          }
        }
      });
      // Delete from Supabase
      try {
        const { error } = await supabase
          .from('citations')
          .delete()
          .eq('id', citationId);
        if (error) {
          console.error('Error deleting citation from Supabase:', error);
          // Optionally, you can add some error handling UI here
        } else {
          console.log('Citation deleted successfully from Supabase');
          // Update the citations state
          setCitations(prevCitations => prevCitations.filter(citation => citation.id !== citationId));
        }
      } catch (error) {
        console.error('Error deleting citation:', error);
      }
      setHoveredCitation(null);
      // Save the updated article content to Supabase
      const updatedContent = quill.root.innerHTML;
      await saveToSupabase(updatedContent);
    }
  }, [quill, hoveredCitation, supabase, setCitations, saveToSupabase]);


  useEffect(() => {
    if (quill) {
      const handleSelectionChange = (range: Range | null, _oldRange: Range | null, _source: Sources) => {
        if (range) {
          const currentTitle = getCurrentTitle(quill, range.index);
          const surroundingContext = getSurroundingContext(quill, range.index);
          // You can store these in state if needed, or just use them directly when generating suggestions
          console.log('Cursor moved:', { position: range.index, currentTitle, surroundingContext });
        }
      };
      quill.on('selection-change', handleSelectionChange);
      return () => {
        quill.off('selection-change', handleSelectionChange);
      };
    }
  }, [quill]);


  useEffect(() => {
    if (quill) {
      const style = document.createElement('style');
      style.textContent = `
        .ql-editor span[data-citation] {
          cursor: pointer;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [quill]);

  const verifyCitationAttributes = useCallback(() => {
    if (quill) {
      const citations = quill.root.querySelectorAll('span[style*="color: blue"]');
      citations.forEach((citation) => {
        const citationElement = citation as HTMLElement;
        const citationId = citationElement.getAttribute('data-citation');
        const source = citationElement.getAttribute('source');
        console.log('Citation verification:', {
          text: citationElement.textContent,
          citationId,
          source,
          hasDataCitation: citationElement.hasAttribute('data-citation'),
          hasSource: citationElement.hasAttribute('source')
        });
      });
    }
  }, [quill]);
































  useEffect(() => {
    if (quill) {
      const editor = quill.root;
 
      const ensurePeriodAfterCitation = (citationSpan: HTMLElement) => {
        const nextNode = citationSpan.nextSibling;
        if (!nextNode || (nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent?.trim())) {
          // If there's no next node or it's an empty text node, add a period and space
          const periodSpace = document.createTextNode('. ');
          citationSpan.parentNode?.insertBefore(periodSpace, citationSpan.nextSibling);
        } else if (nextNode.nodeType === Node.TEXT_NODE && !nextNode.textContent?.startsWith('.')) {
          // If the next node is text but doesn't start with a period, add one
          nextNode.textContent = '. ' + nextNode.textContent?.trimStart();
        }
      };
 
      const preventCitationEdit = (e: Event) => {
        const target = e.target as HTMLElement;
        const citationSpan = target.closest('span[data-citation]') as HTMLElement | null;
        const linkElement = target.closest('a') as HTMLElement | null;

        // Allow normal behavior for links
        if (linkElement) {
          return true; // Allow default behavior for links
        }


        if (citationSpan) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (range.startOffset === citationSpan.textContent?.length) {
              // Cursor is at the end of the citation
              e.preventDefault();
              ensurePeriodAfterCitation(citationSpan);
              // Move cursor after the period and space
              const newRange = document.createRange();
              newRange.setStartAfter(citationSpan.nextSibling || citationSpan);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            } else {
              // Prevent editing inside the citation
              e.preventDefault();
              return false;
            }
          }
        }
      };
 
      const preventCitationSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const citationSpan = range.commonAncestorContainer.parentElement?.closest('span[data-citation]') as HTMLElement | null;
          const linkElement = range.commonAncestorContainer.parentElement?.closest('a') as HTMLElement | null;

          // Allow normal selection for links
          if (linkElement) {
            return true;
          }


          if (citationSpan) {
            // Check if the selection is entirely within the citation
            const isWithinCitation = citationSpan.contains(range.startContainer) && citationSpan.contains(range.endContainer);
           
            if (isWithinCitation) {
              ensurePeriodAfterCitation(citationSpan);
              // Move the cursor after the citation and the added period/space
              const newRange = document.createRange();
              newRange.setStartAfter(citationSpan.nextSibling || citationSpan);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
      };
 
      const handleMouseUp = () => {
        setTimeout(preventCitationSelection, 0);
      };
 
      editor.addEventListener('keydown', preventCitationEdit);
      editor.addEventListener('input', preventCitationEdit);
      editor.addEventListener('paste', preventCitationEdit);
      editor.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('selectionchange', preventCitationSelection);
 
      return () => {
        editor.removeEventListener('keydown', preventCitationEdit);
        editor.removeEventListener('input', preventCitationEdit);
        editor.removeEventListener('paste', preventCitationEdit);
        editor.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('selectionchange', preventCitationSelection);
      };
    }
  }, [quill]);


  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      
      <WriterNav
        title={articleTitle}
        isGenerating={isGenerating}
        articleId={id}
        contentManager={contentManager}
        getContent={getContent}
        onAIChatToggle={() => setIsAIChatOpen(!isAIChatOpen)}
        addToArticle={addToArticle}
        onTitleChange={handleTitleChange}
        onCopy={() => contentManager?.handleCopy()}
        isSidePanelMinimized={false}
        onLanguageChange={handleLanguageChange}
        initialLanguage={language}
        onVipPromptChange={handleVipPromptChange}
        initialVipPrompt={vipPrompt}
        initialCitationStyle={citationStyle}
        onCitationStyleChange={handleCitationStyleChange}
        initialAutocomplete={autocomplete}
        initialAutocompleteButton={autocompleteButton}
        initialExternalCiting={externalCiting}
        initialLocalCiting={localCiting}
        onAutocompleteChange={handleAutocompleteChange}
        onAutocompleteButtonChange={handleAutocompleteButtonChange}
        onExternalCitingChange={handleExternalCitingChange}
        onLocalCitingChange={handleLocalCitingChange}
      />
      <motion.div
        className="flex-1 p-4 overflow-auto pb-16 relative"
        animate={{ marginRight: isAIChatOpen ? '33.333%' : '0' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <ShortcutNotification
          show={showShortcutNotification}
          onClose={handleCloseNotification}
        />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="max-w-[800px] mx-auto relative">
            <div className="article-content" ref={quillEditorRef}>
              <div ref={quillRef} />
              {citations.length > 0 && (
                <div className="sources" style={{ padding: '12px 15px', borderTop: '1px solid #e0e0e0' }}>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Litteraturliste</h3>
                  </div>
                  <div>
                    <select 
                      className="border rounded px-2 py-1"
                      value={citationStyle}
                      onChange={(e) => handleCitationStyleChange(e.target.value)}
                    >
                      <option value="apa7">APA 7</option>
                      <option value="mla9">MLA 9</option>
                      <option value="ieee">IEEE</option>
                      </select>
                    </div>
                  </div>
                  <ul className={`list-disc pl-5 ${!isPremiumUser ? 'blur-protected' : ''}`}>
                    {citations.map((citation) => {
                      const { text, url } = formatCitation(citation as any, citationStyle);
                      return (
                        <li key={citation.id} className="mb-2 text-sm">
                          {text}
                          {url && (
                            <>
                              {' '}
                              <span
                                className="citation-link"
                                style={{ color: 'blue', cursor: 'pointer' }}
                                data-citation={citation.id}
                              >
                                {url}
                              </span>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  {!isPremiumUser && (
                    <div className="mt-4 text-center">
                      <p
                        className="text-sm text-blue-600 cursor-pointer hover:underline"
                        onClick={() => setIsUpgradeModalOpen(true)}
                        style={{ fontSize: '1rem !important', fontWeight: 600 }}
                      >
                        Oppgrader til Premium for å se listen 💙
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <TextSelectionToolbar
              onAICommand={handleAICommand}
              onCite={handleCite}
              onCitationAdded={handleCitationAdded}  // Add this line
              onFormatChange={handleFormatChange}
              onStyleChange={handleStyleChange}
              onAddLink={handleAddLink}
              onReplaceSelection={handleReplaceSelection}
              onInsertBelow={handleInsertBelow}
              articleId={id}
            />
            {showSuggestion && (
              <div
                ref={tooltipRef}
                style={{
                  position: 'absolute',
                  top: suggestionPosition.top,
                  left: suggestionPosition.left,
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  width: '100%',
                  maxWidth: '800px',
                  textAlign: 'center'
                }}
              >
                <SuggestionTooltip
                  onAccept={handleAcceptSuggestion}
                  onTryAgain={handleRegenerate}
                  onDecline={handleDeclineSuggestion}
                  onShortcutUsed={handleShortcutUsed}
                  onSuggestionHandled={() => setShowSuggestion(false)}
                  quill={quill}
                  suggestedContentRange={suggestedContentRange}
                  isVisible={autocompleteButton} // Make sure this is correct
                />
              </div>
            )}
            {isGenerating && (
              <div className="fixed bottom-16 right-7 flex items-center space-x-2">
                <button
                  id="stop-stream"
                  className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded border border-gray-300 shadow-sm hover:shadow-md transition-shadow duration-200"
                  style={{ borderRadius: '0.25rem' }}
                  onClick={handleStopGeneration}
                >
                  <span>Stop</span>
                  <CircleStop className="ml-1 h-3 w-3 text-black" />
                </button>
                <div className="flex items-center">
                  <Loader className="h-4 w-4 animate-spin text-gray-400 dark:text-gray-500" />
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
      <BottomToolbar
      onUndo={handleUndo}
      onRedo={handleRedo}
      wordCount={wordCount}
      canUndo={canUndo}
      canRedo={canRedo}
      isGenerationComplete={isGenerationComplete}
      onUpdateWordCount={updateWordCount}
      userEmail={session?.user?.email || ''} // Add this line
    />
      <AIChatPanel
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        articleContent={value}
        articleId={id}
        chatUuid={chatUuid}
        addToArticle={addToArticle}
      />
      <AnimatePresence>
        {showWordLimitNotification && (
          <WordLimitNotification onClose={() => setShowWordLimitNotification(false)} />
        )}
      </AnimatePresence>
     
      {hoveredCitation && (
     <div ref={citationToolbarRef}>
       <CitationToolbar
         citation={hoveredCitation.citation}
         fullCitation={hoveredCitation.fullCitation}
         title={hoveredCitation.title}
         citationId={hoveredCitation.id} // Add this line
         onDelete={handleDeleteCitation}
         onClose={() => setHoveredCitation(null)}
         position={citationToolbarPosition}
         article_url={hoveredCitation.article_url}
       />
     </div>
   )}
      <Upgrade
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        isSidePanelMinimized={false} // or whatever value is appropriate
      />
      {dropdownPosition && (
        <DropdownMenu
          onItemClick={handleDropdownItemClick}
          position={dropdownPosition}
          loadingItem={loadingDropdownItem}
        />
        
      )}
    </div>
  )
}