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

export default function WritePage() {
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
  const { quill, quillRef } = useQuill({
    modules: {
      history: {
        userOnly: true,
      },
      hoverMenu: true, // Keep this if you're still using it
    },
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
  const [hoveredCitation, setHoveredCitation] = useState<{ id: string; citation: string; fullCitation: string; title: string } | null>(null);
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
    if (quill && citations && isPremiumUser !== undefined && citationStyle) {
      setContentManager(new ContentManager(quill, citations, isPremiumUser, citationStyle));
    }
  }, [quill, citations, isPremiumUser, citationStyle]);


  const saveToSupabase = useCallback(
    async (content: string) => {
      if (content !== lastSavedContent) {
        try {
          const { data, error } = await supabase
            .from('content')
            .update({ html_content: content })
            .eq('id', id)
            .select()
          if (error) throw error;
          if (data) {
            setLastSavedContent(content);
          }
          // Verification fetch removed to save space
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
  useEffect(() => {
    if (quill) {
      console.log('Quill editor initialized');
      if (pendingContent) {
        console.log('Inserting pending content into Quill');
        quill.clipboard.dangerouslyPasteHTML(pendingContent);
        setPendingContent(null);
      }
      let lastLength = quill.getLength();
      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          const content = quill.root.innerHTML
          setValue(content)
          console.log('Text changed, calling debouncedSaveToSupabase');
          debouncedSaveToSupabase(content)
          // Log the entire Quill content after each text change
          logQuillContent();
          // Check for h1 content and update title
          const h1Element = quill.root.querySelector('h1')
          if (h1Element) {
            const newTitle = h1Element.textContent || ''
            setArticleTitle(newTitle)
          }
        }
        if (source === 'user') {
          if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current)
          }
          const currentPosition = quill.getSelection()?.index
          if (currentPosition !== undefined) {
            const text = quill.getText(0, currentPosition)
            const lastTwoChars = text.slice(-2)
            // Check if content was pasted
            const isPaste = delta.ops?.some(op => op.insert && typeof op.insert === 'string' && op.insert.length > 1)
            if (!isPaste) {
              const newLineCreated = delta.ops?.some(op => op.insert === '\n')
              const currentLength = quill.getLength();
              const isNewEmptyLine = newLineCreated && currentLength === lastLength + 1;
              lastLength = currentLength;
              console.log('Text change detected:', { currentPosition, lastTwoChars, newLineCreated, isNewEmptyLine });
              const shouldTriggerSuggestion =
                ['.', ',', '?', '!'].includes(lastTwoChars[0]) ||
                (['.', ',', '?', '!'].includes(lastTwoChars[0]) && lastTwoChars[1] === ' ') ||
                isNewEmptyLine
              console.log('Should trigger suggestion:', shouldTriggerSuggestion);
              if (shouldTriggerSuggestion) {
                console.log('Setting timeout for suggestion generation');
                suggestionTimeoutRef.current = setTimeout(() => {
                  console.log('Generating suggestion at position:', currentPosition);
                  generateSuggestion(currentPosition, isNewEmptyLine)
                }, 500)
              }
            }
          }
          if (suggestedContentRange) {
            quill.removeFormat(suggestedContentRange.index, suggestedContentRange.length)
            setSuggestedContentRange(null)
          }
        }
      })
      quill.on('selection-change', (range) => {
        if (range && range.length === 0) {
          lastEditPositionRef.current = range.index
          console.log('Selection changed:', range);
        }
      })
      // Add event listener for keyboard shortcuts
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && !isSuggestionGenerating && !showSuggestion) {
          const selection = quill.getSelection();
          if (selection) {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              const line = quill.getLine(selection.index)[0];
              if (line) {
                const isEmptyLine = line.length() === 1 && quill.getText(selection.index, 1) === '\n';
                if (isEmptyLine) {
                  generateSuggestion(selection.index, true, true); // Pass true for isShortcut
                }
              }
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              const text = quill.getText(0, selection.index);
              const lastChar = text.charAt(text.length - 1);
              const secondLastChar = text.charAt(text.length - 2);
              if (lastChar === '.' || lastChar === ',' ||
                 (lastChar === ' ' && (secondLastChar === '.' || secondLastChar === ','))) {
                let insertPosition = selection.index;
                // If there's no space after punctuation, add one
                if (lastChar === '.' || lastChar === ',') {
                  quill.insertText(insertPosition, ' ');
                  insertPosition += 1;
                }
                generateSuggestion(insertPosition, false, true); // Pass true for isShortcut
              }
            }
          }
        }
      };
      quill.root.addEventListener('keydown', handleKeyDown);
      return () => {
        quill.off('text-change');
        quill.off('selection-change');
        quill.root.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [quill, suggestedContentRange, debouncedSaveToSupabase, pendingContent, logQuillContent]);
  const restoreCitationAttributes = useCallback(async () => {
    if (quill) {
      const citations = quill.root.querySelectorAll('span[style*="color: blue"]');
      const citationTexts = Array.from(citations).map(citation => citation.textContent?.trim());
      if (citationTexts.length > 0) {
        try {
          const { data, error } = await supabase
            .from('citations')
            .select('id, citation')
            .eq('article_id', id)
            .in('citation', citationTexts);
          if (error) throw error;
          if (data) {
            citations.forEach((citation) => {
              const citationElement = citation as HTMLElement;
              const citationText = citationElement.textContent?.trim();
              const matchingData = data.find(item => item.citation === citationText);
              if (matchingData) {
                citationElement.setAttribute('data-citation', matchingData.id);
                citationElement.setAttribute('source', 'citation');
              }
            });
          }
        } catch (error) {
          console.error('Error fetching citation data:', error);
        }
      }
      console.log('Citations restored:', citations.length);
    }
  }, [quill, id, supabase]);
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
  const generateContent = useCallback(async () => {
    try {
      setIsGenerating(true);
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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
    } catch (error) {
      console.error('Error generating content:', error);
      setIsGenerating(false);
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
  useEffect(() => {
    const fetchContent = async () => {
      try {
        console.log('Fetching content for id:', id);
        setIsGenerating(true);
        const { data, error } = await supabase
          .from('content')
          .select('html_content, title, status')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data) {
          if (data.status === 'generated') {
            setArticleTitle(data.title || 'Untitled');
            setIsGenerating(false);
            setIsGenerationComplete(true);
            if (data.html_content) {
              const cleanedContent = cleanHtml(data.html_content);
              setValue(cleanedContent);
              if (quill) {
                quill.setContents([]);
                quill.clipboard.dangerouslyPasteHTML(cleanedContent);
                await restoreCitationAttributes(); // Add this line
              } else {
                setPendingContent(cleanedContent);
              }
            }
          } else if (shouldGenerate && !generationInitiatedRef.current) {
            console.log('Initiating content generation');
            generationInitiatedRef.current = true;
            generateContent();
          } else {
            checkGenerationStatus();
          }
        } else if (shouldGenerate && !generationInitiatedRef.current) {
          console.log('No content found, initiating generation');
          generationInitiatedRef.current = true;
          generateContent();
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setValue('Error loading content.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [id, shouldGenerate, updateQuillContent, generateContent, checkGenerationStatus, quill, restoreCitationAttributes]);
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
    const [startLine] = quill.getLines(position);
    if (!startLine) {
      console.log('XXX: No line found at position');
      return '';
    }
  
    let startIndex = quill.getIndex(startLine);
    let endIndex = quill.getLength();
  
    // Find the start of the current paragraph
    while (startIndex > 0 && quill.getText(startIndex - 1, 1) !== '\n') {
      startIndex--;
    }
  
    // Find the end of the current paragraph
    for (let i = startIndex; i < quill.getLength(); i++) {
      const [line] = quill.getLines(i);
      if (line && (line.domNode.tagName === 'H1' || line.domNode.tagName === 'H2' || line.domNode.tagName === 'H3')) {
        endIndex = i;
        break;
      }
      if (quill.getText(i, 1) === '\n' && quill.getText(i + 1, 1) === '\n') {
        endIndex = i;
        break;
      }
    }
  
    const paragraph = quill.getText(startIndex, endIndex - startIndex).trim();
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

    let generatedTextLength = 0;
    const originalPosition = position;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === ' ') {
        e.preventDefault(); // Prevent default behavior
        controller.abort();

        // Find all <em> elements
        const emElements = quill.root.querySelectorAll('em');
        emElements.forEach((emElement) => {
          const emText = emElement.textContent || '';
          const emIndex = quill.getText().indexOf(emText);
          if (emIndex !== -1) {
            quill.deleteText(emIndex, emText.length);
          }
        });

        // Ensure there's a newline character if it's a new paragraph
        if (isNewEmptyLine) {
          const textAfter = quill.getText(originalPosition, 1);
          if (textAfter !== '\n') {
            quill.insertText(originalPosition, '\n');
          }
        }

        setIsSuggestionGenerating(false);
        document.removeEventListener('keydown', handleKeyDown);

        // Move the cursor to the appropriate position
        const cursorPosition = isNewEmptyLine ? originalPosition + 1 : originalPosition;
        quill.setSelection(cursorPosition, 0);
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
            } else {
              accumulatedContent += content;
              quill.insertText(insertPosition, content, {
                color: '#999',
                italic: true
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
































  const showSuggestionTooltip = (position: number, contentLength: number) => {
    if (quill && quillEditorRef.current) {
      const editorElement = quillEditorRef.current.querySelector('.ql-editor');
     
      if (editorElement) {
        // Get the bounds of the newly generated content
        const contentBounds = quill.getBounds(position, contentLength);
        const editorRect = editorElement.getBoundingClientRect();
       
        if (contentBounds) {
          // Position the tooltip 5px below the generated content
          const tooltipTop = contentBounds.bottom + 5;
          const tooltipLeft = contentBounds.left + (contentBounds.width / 2);
         
          setSuggestionPosition({
            top: tooltipTop,
            left: tooltipLeft
          });
          setShowSuggestion(true);
         
          console.log('Tooltip positioned based on generated content:', {
            contentBounds,
            editorRect,
            tooltipTop,
            tooltipLeft
          });
        } else {
          console.error('Unable to get content bounds');
        }
      }
    }
  }
































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
































  const handleCite = useCallback(async (selectedText: string, citation: string, fullCitation: string, result: any, citationId: string) => {
    console.log('handleCite called with:', { selectedText, citation, fullCitation, result, citationId });
    if (quill && !isProcessingCitation) {
      setIsProcessingCitation(true);
      try {
        const range = quill.getSelection();
        if (range) {
          const endOfSelection = range.index + range.length;
          console.log('Inserting citation with ID:', citationId);
         
          // Insert the citation text
          quill.insertText(endOfSelection, ` ${citation}`, {
            'color': 'blue'
          });




          // Force a Quill update
          quill.update();




          // Find the newly inserted span element
          setTimeout(() => {
            const spans = quill.root.querySelectorAll('span[style*="color: blue"]');
            const citationSpan = Array.from(spans).find(span => span.textContent?.includes(citation));
           
            if (citationSpan) {
              citationSpan.setAttribute('data-citation', citationId);
              citationSpan.setAttribute('source', 'citation');
              console.log('Citation span modified:', citationSpan.outerHTML);
            } else {
              console.log('Citation span not found');
            }




            console.log('HTML after insertion:', quill.root.innerHTML);
          }, 0);
         
          quill.setSelection(endOfSelection + citation.length + 1, 0);
          console.log('Citation inserted:', citation);
          console.log('Full citation:', fullCitation);
         
          // Store the citation data
          storeCitationData(citationId, citation, fullCitation, result.title, result);




          // Extract authors from the result
          const authors = result.authors ? result.authors.map((author: { full_name: string }) => author.full_name).join(', ') : '';




          // Format the last_updated date
          const lastUpdated = result.changed_at ? formatLastUpdated(result.changed_at) : null;




          // Save to Supabase
          const { data, error } = await supabase
            .from('citations')
            .insert({
              id: citationId,
              article_id: id,
              citation,
              full_citation: fullCitation,
              title: result.title,
              article_url: result.article_url,
              article_url_json: result.article_url_json,
              rank: result.rank ? Math.round(result.rank) : null,
              headword: result.headword,
              snl_article_id: result.article_id,
              article_type_id: result.article_type_id,
              source_content: selectedText,
              authors: authors,
              last_updated: lastUpdated
            });




          if (error) {
            console.error('Error saving citation to Supabase:', error);
          } else {
            console.log('Citation saved to Supabase:', data);
            // Update the citations state
            setCitations(prevCitations => [...prevCitations, { id: citationId, citation, full_citation: fullCitation, article_url: result.article_url }]);
          }




          // After inserting the citation, save the entire article content
          const updatedContent = quill.root.innerHTML;
          await saveToSupabase(updatedContent);
        }
      } catch (error) {
        console.error('Error processing citation:', error);
      } finally {
        setIsProcessingCitation(false);
      }
    } else {
      console.log('Citation processing skipped:', { isProcessingCitation, quillExists: !!quill });
    }
  }, [quill, isProcessingCitation, id, supabase, setCitations]);




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
      const range = quill.getSelection()
      if (range) {
        quill.deleteText(range.index, range.length)
        quill.insertText(range.index, newText)
      }
    }
  }
































  const handleInsertBelow = (newText: string) => {
    if (quill) {
      const range = quill.getSelection()
      if (range) {
        quill.insertText(range.index + range.length, '\n' + newText)
      }
    }
  }
































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
      const handleClick = async (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const citationId = target.getAttribute('data-citation');
        console.log('Click detected, target:', target);
        console.log('Citation ID:', citationId);
        if (citationId) {
          console.log('Citation clicked, ID:', citationId);
          try {
            const { data, error } = await supabase
              .from('citations')
              .select('*')
              .eq('id', citationId);
            console.log('Supabase query result:', { data, error });
            if (error) {
              console.error('Supabase error:', error);
              throw error;
            }
            if (data && data.length > 0) {
              console.log('Retrieved citation data:', data[0]);
              const { citation, full_citation: fullCitation, title } = data[0];
              if (citation && fullCitation && title) {
                const rect = target.getBoundingClientRect();
                setHoveredCitation({
                  id: citationId,
                  citation,
                  fullCitation,
                  title
                });
                setCitationToolbarPosition({
                  top: rect.bottom + window.scrollY,
                  left: rect.left + rect.width / 2 + window.scrollX
                });
              } else {
                console.log('Citation data incomplete');
              }
            } else {
              console.log('No citation data found for ID:', citationId);
            }
          } catch (error) {
            console.error('Error fetching citation data:', error);
          }
        } else if (hoveredCitation && !citationToolbarRef.current?.contains(e.target as Node)) {
          setHoveredCitation(null);
        }
      };
      editor.addEventListener('click', handleClick);
      document.addEventListener('click', handleClick);
      return () => {
        editor.removeEventListener('click', handleClick);
        document.removeEventListener('click', handleClick);
      };
    }
  }, [quill, supabase]);
  
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
                      <select className="border rounded px-2 py-1"
                        value={citationStyle}
                        onChange={(e) => setCitationStyle(e.target.value)}
                      >
                        <option value="APA7">APA 7</option>
                        <option value="MLA9">MLA 9</option>
                        <option value="IEEE">IEEE</option>
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
                  zIndex: 1000
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
                />
              </div>
            )}
            {isGenerating && (
              <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded">
                Generating content...
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
        onUpdateWordCount={updateWordCount} // New prop
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
       />
     </div>
   )}
      <Upgrade
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        isSidePanelMinimized={false} // or whatever value is appropriate
      />
    </div>
  )
}