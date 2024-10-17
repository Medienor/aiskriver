import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wand2, Book, Type, Bold, Italic, Underline, Link, ChevronDown, Heading1, Heading2, Heading3, List, ListOrdered, ChevronRight, Repeat, Minimize2, ArrowRightCircle, Languages, FileText, Scale, Check, ArrowDown, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { streamCompletion } from '@/services/ToolbarOpenAI';
import { WordCountService } from '@/services/WordCountService';
import { useSession } from "next-auth/react";
import SNLLookup from '@/components/SNLLookup';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { SNLResult } from '@/types/SNLResult';

interface TextSelectionToolbarProps {
  onAICommand: (command: string) => void;
  onCite: (selectedText: string, citation: string, fullCitation: string, result: SNLResult, citationId: string) => void;
  onFormatChange: (format: string) => void;
  onStyleChange: (style: 'bold' | 'italic' | 'underline') => void;
  onAddLink: () => void;
  onReplaceSelection: (newText: string) => void;
  onInsertBelow: (newText: string) => void;
  articleId?: string; // Make this prop optional
}

interface SelectionInfo {
  text: string;
  startOffset: number;
  endOffset: number;
  startContainer: Node | null;
  endContainer: Node | null;
}

const TextSelectionToolbar: React.FC<TextSelectionToolbarProps> = ({
  onAICommand,
  onCite,
  onFormatChange,
  onStyleChange,
  onAddLink,
  onReplaceSelection,
  onInsertBelow,
  articleId,
}) => {
  const { data: session } = useSession();
  // State declarations
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [aiPosition, setAiPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showAIToolbar, setShowAIToolbar] = useState(false);
  const [showSNLLookup, setShowSNLLookup] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [wordsRemaining, setWordsRemaining] = useState<number>(0);
  const [selectedText, setSelectedText] = useState('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [lastAction, setLastAction] = useState<{ type: string; tone?: string }>({ type: '' });
  const [isTypingInSNLLookup, setIsTypingInSNLLookup] = useState(false);

  // Refs
  const toolbarRef = useRef<HTMLDivElement>(null);
  const aiToolbarRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<SelectionInfo | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const articleContentRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const snlLookupRef = useRef<HTMLDivElement>(null);
  const mainToolbarRef = useRef<HTMLDivElement>(null);

  // Callbacks
  const updatePosition = useCallback(() => {
    const articleContent = document.querySelector('.article-content');
    if (selectionRef.current && articleContent) {
      const range = document.createRange();
      range.setStart(selectionRef.current.startContainer!, selectionRef.current.startOffset);
      range.setEnd(selectionRef.current.endContainer!, selectionRef.current.endOffset);
      const selectionRect = range.getBoundingClientRect();
      const articleRect = articleContent.getBoundingClientRect();
      const toolbarHeight = toolbarRef.current?.offsetHeight || 40;
      
      let top = selectionRect.top - toolbarHeight;
      let left = Math.max(selectionRect.left, articleRect.left);

      // Adjust if toolbar would go off-screen
      if (top < articleRect.top) top = selectionRect.bottom;
      if (left + (toolbarRef.current?.offsetWidth || 300) > articleRect.right) {
        left = articleRect.right - (toolbarRef.current?.offsetWidth || 300);
      }

      setPosition({ top, left });

      // Set AI toolbar and SNLLookup position
      const bottomTop = selectionRect.bottom;
      const bottomLeft = articleRect.left;
      const bottomWidth = articleRect.width;
      setAiPosition({ top: bottomTop, left: bottomLeft, width: bottomWidth });
    }
  }, []);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    const articleContent = document.querySelector('.article-content');
    const sourcesDiv = document.querySelector('.sources');
    
    if (selection && !selection.isCollapsed && articleContent) {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      
      // Check if the selection is within the article content but not within the sources div
      if (articleContent.contains(commonAncestor) && (!sourcesDiv || !sourcesDiv.contains(commonAncestor))) {
        const text = range.toString();
        setSelectedText(text);
        selectionRef.current = {
          text,
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          startContainer: range.startContainer,
          endContainer: range.endContainer
        };
        setSelectedRange(range);
        updatePosition();
        setIsVisible(true);
        setAiCommand('');
        setFilteredOptions([]);
        setAiResponse('');
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [updatePosition]);

  const handleCiteClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      setSelectedRange(range);
      setShowSNLLookup(true);
      setShowAIToolbar(false);
      updatePosition();
    }
  }, [updatePosition]);

  const maintainSelection = useCallback(() => {
    if (selectedRange && !isTypingInSNLLookup) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedRange);
    }
  }, [selectedRange, isTypingInSNLLookup]);

  const handleCite = useCallback((citation: string, fullCitation: string, result: SNLResult) => {
    if (selectedRange) {
      const text = selectedRange.toString();
      const citationId = uuidv4(); // Generate a new UUID here
      
      console.log('Attempting to add citation to Supabase:', { articleId, citationId, citation, fullCitation, result });

      // Add citation to Quill editor with the same ID
      onCite(text, citation, fullCitation, result, citationId);
    }
  }, [selectedRange, onCite, articleId]);

  const updateKildehenvisning = (fullCitation: string) => {
    // This function will need to be implemented in your main article editing component
    // It should add or update the "Kildehenvisning" section at the bottom of the article
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const isClickInsideDropdown = (event.target as Element).closest('[role="menu"]') !== null;
    const isClickInsideSNLLookup = snlLookupRef.current && snlLookupRef.current.contains(event.target as Node);
    const isClickInsideMainToolbar = mainToolbarRef.current && mainToolbarRef.current.contains(event.target as Node);
    const isClickInsideSNLLookupInput = (event.target as Element).tagName.toLowerCase() === 'input' && 
      (event.target as Element).getAttribute('placeholder') === 'Søk i Store norske leksikon...';
    
    if (
      !isClickInsideDropdown &&
      !isClickInsideSNLLookup &&
      !isClickInsideMainToolbar &&
      !isClickInsideSNLLookupInput &&
      !(event.target as Element).closest('.article-content')
    ) {
      setShowAIToolbar(false);
      setShowSNLLookup(false);
      setIsVisible(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [handleSelectionChange, handleClickOutside, updatePosition]);

  useEffect(() => {
    if (showSNLLookup) {
      maintainSelection();
    }
  }, [showSNLLookup, maintainSelection]);

  const initializeWordCount = useCallback(async () => {
    if (session?.user?.email) {
      const wordCountService = WordCountService.getInstance();
      await wordCountService.initializeUser(session.user.email);
      setWordsRemaining(wordCountService.getWordsRemaining());
    }
  }, [session?.user?.email]);

  useEffect(() => {
    initializeWordCount();
  }, [initializeWordCount]);

  const handleAIHelp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (wordsRemaining > 0) {
      setShowAIToolbar(true);
      setShowSNLLookup(false);
      updatePosition();
    }
  }, [updatePosition, wordsRemaining]);

  const handleAICommandSubmit = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (aiCommand.trim() === '' || isStreaming) return;
    
    const wordCountService = WordCountService.getInstance();
    const estimatedWordCount = aiCommand.split(/\s+/).length * 2; // Rough estimate

    if (!(await wordCountService.checkWordAvailability(estimatedWordCount))) {
      alert('Not enough words remaining in your balance.');
      return;
    }

    setIsStreaming(true);
    setAiResponse('');
    
    const selectedText = selectionRef.current?.text || '';
    const fullPrompt = `${selectedText}\n\n${aiCommand}`;
    
    setLastAction({ type: 'custom' });
    
    let generatedWordCount = 0;
    await streamCompletion(
      fullPrompt,
      (chunk) => {
        setAiResponse(prev => prev + chunk);
        generatedWordCount += chunk.split(/\s+/).length;
      },
      'You are a helpful assistant for writing and editing text.'
    );

    await wordCountService.deductWords(generatedWordCount);
    setWordsRemaining(wordCountService.getWordsRemaining());

    setIsStreaming(false);
    setAiCommand(''); // Clear the input field after search
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAICommandSubmit(e);
    }
  };

  const handleAIOptionClick = (option: string) => {
    setAiCommand(option);
  };

  const handleReplaceSelection = () => {
    if (aiResponse) {
      onReplaceSelection(aiResponse);
      setAiResponse('');
      setShowAIToolbar(false);
    }
  };

  const handleInsertBelow = () => {
    if (aiResponse) {
      onInsertBelow(aiResponse);
      setAiResponse('');
      setShowAIToolbar(false);
    }
  };

  const handleTryAgain = async () => {
    if (isStreaming) return;
    
    setIsStreaming(true);
    setAiResponse('');
    
    const selectedText = selectionRef.current?.text || '';
    let prompt = '';

    if (lastAction.type === 'custom') {
      prompt = `${selectedText}\n\n${aiCommand}`;
    } else {
      switch (lastAction.type) {
        case 'improve':
          prompt = `Skriv denne teksten slik at den er enklere å forstå:\n\n${selectedText}`;
          break;
        case 'paraphrase':
          prompt = `Omformuler denne teksten i denne tonen ${lastAction.tone}:\n\n${selectedText}`;
          break;
        case 'simplify':
          prompt = `Din jobb er å forenkle denne teksten i en ${lastAction.tone} tone:\n\n${selectedText}`;
          break;
        case 'expand':
          prompt = `Utvid og ekspander denne teksten:\n\n${selectedText}`;
          break;
        case 'summarize':
          prompt = `Oppsummer denne teksten:\n\n${selectedText}`;
          break;
        case 'counterargument':
          prompt = `Skriv en motargument basert på denne teksten:\n\n${selectedText}`;
          break;
        default:
          prompt = `${lastAction.type}:\n\n${selectedText}`;
      }
    }
    
    await streamCompletion(
      prompt,
      (chunk) => setAiResponse(prev => prev + chunk),
      'You are a helpful assistant for writing and editing text.'
    );

    setIsStreaming(false);
  };

  const handleDiscard = () => {
    setAiResponse('');
    setAiCommand('');
    setShowAIToolbar(false); // Close the toolbar
  };

  const handleAIAction = async (action: string, tone?: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isStreaming) return;
    
    setIsStreaming(true);
    setAiResponse('');
    
    const selectedText = selectionRef.current?.text || '';
    let prompt = '';

    switch (action) {
      case 'improve':
        prompt = `Skriv denne teksten slik at den er enklere å forstå:\n\n${selectedText}`;
        break;
      case 'paraphrase':
        prompt = `Omformuler denne teksten i denne tonen ${tone}:\n\n${selectedText}`;
        break;
      case 'simplify':
        prompt = `Din jobb er å forenkle denne teksten i en ${tone} tone:\n\n${selectedText}`;
        break;
      case 'expand':
        prompt = `Utvid og ekspander denne teksten:\n\n${selectedText}`;
        break;
      case 'summarize':
        prompt = `Oppsummer denne teksten:\n\n${selectedText}`;
        break;
      case 'counterargument':
        prompt = `Skriv en motargument basert på denne teksten:\n\n${selectedText}`;
        break;
      default:
        prompt = `${action}:\n\n${selectedText}`;
    }
    
    const wordCountService = WordCountService.getInstance();
    const estimatedWordCount = selectedText.split(/\s+/).length * 2; // Rough estimate

    if (!(await wordCountService.checkWordAvailability(estimatedWordCount))) {
      alert('Not enough words remaining in your balance.');
      return;
    }

    setLastAction({ type: action, tone });
    
    let generatedWordCount = 0;
    await streamCompletion(
      prompt,
      (chunk) => {
        setAiResponse(prev => prev + chunk);
        generatedWordCount += chunk.split(/\s+/).length;
      },
      'You are a helpful assistant for writing and editing text.'
    );

    await wordCountService.deductWords(generatedWordCount);
    setWordsRemaining(wordCountService.getWordsRemaining());

    setIsStreaming(false);
    // Close the dropdown menu after action
    const dropdownTrigger = document.querySelector('[aria-expanded="true"]') as HTMLElement;
    if (dropdownTrigger) {
      dropdownTrigger.click();
    }
  };

  const handleInputFocus = () => {
    // Restore the previous selection when the input is focused
    if (selectionRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.setStart(selectionRef.current.startContainer!, selectionRef.current.startOffset);
      range.setEnd(selectionRef.current.endContainer!, selectionRef.current.endOffset);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const renderTooltip = (content: string, shortcut: string) => (
    <div className="flex flex-col items-start">
      <p className="text-white">{content}</p>
      <div className="flex items-center mt-1">
        {shortcut.split('+').map((key, index) => (
          <React.Fragment key={key}>
            <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
              {key.trim()}
            </kbd>
            {index < shortcut.split('+').length - 1 && <span className="mx-1 text-white">+</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div
        ref={mainToolbarRef}
        className="fixed z-50"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
      >
        {isVisible && !showAIToolbar && !showSNLLookup && (
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-1 flex items-center space-x-1.5 border border-[#f0f0f0]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleAIHelp}
                  size="sm"
                  variant="ghost"
                  className="flex items-center bg-[#06f] text-white hover:bg-[#05d] px-2 py-1 h-7 text-xs mr-2 group"
                  disabled={wordsRemaining <= 0}
                >
                  <div className="bg-white bg-opacity-10 p-0.5 rounded mr-2 group-hover:bg-opacity-20">
                    <Wand2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white">AI Hjelp</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="border border-solid bg-[#1e3a8a] text-white shadow-[0_0_10px_rgba(0,0,0,0.1),0_-2px_5px_rgba(0,0,0,0.05)] border-[#ededed] dark:border-[#434343]">
                {wordsRemaining <= 0 
                  ? "Ingen ord igjen. Vennligst oppgrader kontoen din."
                  : renderTooltip('Rediger, forbedre eller skriv nytt', 'Ctrl + Shift + A')
                }
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleCiteClick} 
                  size="sm" 
                  variant="ghost" 
                  className="flex items-center bg-[#06f] text-white hover:bg-[#05d] px-2 py-1 h-7 text-xs mr-2 group"
                >
                  <div className="bg-white bg-opacity-10 p-0.5 rounded mr-2 group-hover:bg-opacity-20">
                    <Book className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white">Siter</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="tooltip-content border border-solid bg-[#1e3a8a] text-white shadow-[0_0_10px_rgba(0,0,0,0.1),0_-2px_5px_rgba(0,0,0,0.05)]">
                {renderTooltip('Legg til kildehenvisning', 'Ctrl + Shift + C')}
              </TooltipContent>
            </Tooltip>

            <div className="h-5 border-r border-gray-300 dark:border-gray-600 mx-2"></div>

            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 h-7 text-xs mr-2">
                      <Type className="w-3 h-3 mr-2" />
                      <span>Text</span>
                      <ChevronDown className="w-3 h-3 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white dark:bg-gray-800">
                    <DropdownMenuItem onClick={() => onFormatChange('p')} className="flex items-center text-gray-700 dark:text-gray-300 text-xs">
                      <Type className="w-3 h-3 mr-2" />
                      <span>Paragraph</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFormatChange('h1')} className="flex items-center text-gray-700 dark:text-gray-300 text-xs">
                      <Heading1 className="w-3 h-3 mr-2" />
                      <span>Heading 1</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFormatChange('h2')} className="flex items-center text-gray-700 dark:text-gray-300 text-xs">
                      <Heading2 className="w-3 h-3 mr-2" />
                      <span>Heading 2</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFormatChange('h3')} className="flex items-center text-gray-700 dark:text-gray-300 text-xs">
                      <Heading3 className="w-3 h-3 mr-2" />
                      <span>Heading 3</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFormatChange('ul')} className="flex items-center text-gray-700 dark:text-gray-300 text-xs">
                      <List className="w-3 h-3 mr-2" />
                      <span>Bullet List</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onFormatChange('ol')} className="flex items-center text-gray-700 dark:text-gray-300 text-xs">
                      <ListOrdered className="w-3 h-3 mr-2" />
                      <span>Numbered List</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent className="tooltip-content border border-solid bg-[#1e3a8a] text-white shadow-[0_0_10px_rgba(0,0,0,0.1),0_-2px_5px_rgba(0,0,0,0.05)]">
                {renderTooltip('Endre tekstformat', 'Ctrl + Alt + 0-9')}
              </TooltipContent>
            </Tooltip>

            <div className="h-5 border-r border-gray-300 dark:border-gray-600 mx-2"></div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => onStyleChange('bold')} size="sm" variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-1.5 py-1 h-7">
                  <Bold className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="tooltip-content border border-solid bg-[#1e3a8a] text-white shadow-[0_0_10px_rgba(0,0,0,0.1),0_-2px_5px_rgba(0,0,0,0.05)]">
                {renderTooltip('Tykkere tekst', 'Ctrl + B')}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => onStyleChange('italic')} size="sm" variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-1.5 py-1 h-7">
                  <Italic className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="tooltip-content border border-solid bg-[#1e3a8a] text-white shadow-[0_0_10px_rgba(0,0,0,0.1),0_-2px_5px_rgba(0,0,0,0.05)]">
                {renderTooltip('Italic tekst', 'Ctrl + I')}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => onStyleChange('underline')} size="sm" variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-1.5 py-1 h-7">
                  <Underline className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="tooltip-content border border-solid bg-[#1e3a8a] text-white shadow-[0_0_10px_rgba(0,0,0,0.1),0_-2px_5px_rgba(0,0,0,0.05)]">
                {renderTooltip('Understrek', 'Ctrl + U')}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onAddLink} size="sm" variant="ghost" className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-1.5 py-1 h-7">
                  <Link className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="tooltip-content border border-solid bg-[#1e3a8a] text-white shadow-[0_0_10px_rgba(0,0,0,0.1),0_-2px_5px_rgba(0,0,0,0.05)]">
                {renderTooltip('Lenke', 'Ctrl + K')}
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {(showAIToolbar || showSNLLookup) && (
          <div 
            className="fixed z-50 flex flex-col space-y-4" 
            style={{ 
              top: `${aiPosition.top}px`, 
              left: `${aiPosition.left}px`, 
              width: `${aiPosition.width}px` 
            }}
          >
            {showAIToolbar && (
              <div className="fixed z-50 flex flex-col space-y-4" style={{
                top: `${aiPosition.top}px`,
                left: `${aiPosition.left}px`,
                width: `${aiPosition.width}px`
              }}>
                <div
                  ref={searchBarRef}
                  className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-2 flex flex-col space-y-2"
                >
                  {aiResponse && (
                    <div className="text-sm leading-5 font-normal text-zinc-800 dark:text-zinc-200 space-y-3 max-h-52 overflow-y-auto mb-2">
                      <div>
                        <p>{aiResponse}</p>
                      </div>
                    </div>
                  )}
                  <div className="w-full flex items-center space-x-2">
                    {isStreaming ? (
                      <Loader2 className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" />
                    ) : (
                      <Wand2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    )}
                    <Input
                      placeholder={aiResponse ? "Fortell AI hva den skal gjøre neste..." : "Skriv inn AI-kommando..."}
                      className="flex-grow bg-white dark:bg-gray-700 text-black dark:text-white border-0 border-b border-gray-200 dark:border-gray-600 rounded-none shadow-none text-sm placeholder:text-gray-500 focus:outline-none focus:ring-0 focus:border-b focus:border-gray-200 dark:focus:border-gray-600"
                      value={aiCommand}
                      onChange={(e) => setAiCommand(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button
                      onClick={handleAICommandSubmit}
                      disabled={aiCommand.trim() === '' || isStreaming}
                      className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 h-[32px]"
                    >
                      {isStreaming ? 'Tenker...' : 'Send'}
                    </Button>
                  </div>
                </div>

                {aiResponse && (
                  <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 flex flex-col space-y-4 w-[300px]">
                    <div className="flex flex-col space-y-1">
                      <Button variant="ghost" onClick={handleReplaceSelection} className="flex items-center justify-start pl-0 py-1 h-auto dark:text-white">
                        <Check className="w-4 h-4 mr-2" />
                        Erstatt valgt tekst
                      </Button>
                      <Button variant="ghost" onClick={handleInsertBelow} className="flex items-center justify-start pl-0 py-1 h-auto dark:text-white">
                        <ArrowDown className="w-4 h-4 mr-2" />
                        Sett inn under
                      </Button>
                      <Button variant="ghost" onClick={handleTryAgain} className="flex items-center justify-start pl-0 py-1 h-auto dark:text-white">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Prøv igjen
                      </Button>
                      <Button variant="ghost" onClick={handleDiscard} className="flex items-center justify-start pl-0 py-1 h-auto dark:text-white">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Forkast
                      </Button>
                    </div>
                  </div>
                )}

                {!aiResponse && (
                  <div
                    ref={aiToolbarRef}
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 flex flex-col space-y-4"
                    style={{ width: '30%', minWidth: '200px' }}
                  >
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-black dark:text-white">Rediger eller gjennomgå</h3>
                      <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start text-xs py-1 h-auto pl-0 dark:text-white" onClick={() => handleAIAction('improve')}>
                          <Wand2 className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          Forbedre flyt
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between text-xs py-1 h-auto pl-0 dark:text-white">
                              <div className="flex items-center">
                                <Repeat className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400 " />
                                Omformulere
                              </div>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" sideOffset={5} className="bg-white dark:bg-gray-800" ref={dropdownRef}>
                            <DropdownMenuItem onClick={(e) => handleAIAction('paraphrase', 'akademisk', e)}>Akademisk</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('paraphrase', 'uformelt', e)}>Uformelt</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('paraphrase', 'overbevisende', e)}>Overbevisende</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('paraphrase', 'dristig', e)}>Dristig</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('paraphrase', 'vennlig', e)}>Vennlig</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between text-xs py-1 h-auto pl-0 dark:text-white">
                              <div className="flex items-center">
                                <Minimize2 className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                Forenkle
                              </div>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" sideOffset={5} className="bg-white dark:bg-gray-800">
                            <DropdownMenuItem onClick={(e) => handleAIAction('simplify', 'akademisk', e)}>Akademisk</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('simplify', 'uformelt', e)}>Uformelt</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('simplify', 'overbevisende', e)}>Overbevisende</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('simplify', 'dristig', e)}>Dristig</DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleAIAction('simplify', 'vennlig', e)}>Vennlig</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" className="w-full justify-start text-xs py-1 h-auto pl-0 dark:text-white" onClick={() => handleAIAction('expand')}>
                          <ArrowRightCircle className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          Gjør lengre
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between text-xs py-1 h-auto pl-0 dark:text-white">
                              <div className="flex items-center">
                                <Languages className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                                Oversett
                              </div>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" sideOffset={5} className="bg-white dark:bg-gray-800">
                            <DropdownMenuItem onClick={() => handleAIAction('Oversett til engelsk')}>Til engelsk</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAIAction('Oversett til norsk')}>Til norsk</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mt-4 mb-2 text-sm text-black dark:text-white">Generer fra valgt tekst</h3>
                      <div className="space-y-1">
                        <Button variant="ghost" className="w-full justify-start text-xs py-1 h-auto pl-0 dark:text-white" onClick={() => handleAIAction('summarize')}>
                          <FileText className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          Oppsummer
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-xs py-1 h-auto pl-0 dark:text-white" onClick={() => handleAIAction('counterargument')}>
                          <Scale className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
                          Skriv motargument
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {showSNLLookup && (
              <div
                ref={snlLookupRef}
                className="bg-white dark:bg-gray-800 shadow-xl rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <SNLLookup 
                  onCite={handleCite} 
                  selectedText={selectedRange ? selectedRange.toString() : ''}
                  maintainSelection={maintainSelection}
                  onClose={() => setShowSNLLookup(false)}
                  articleId={articleId} // Pass articleId directly
                  setIsTypingInSNLLookup={setIsTypingInSNLLookup}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TextSelectionToolbar;