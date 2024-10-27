import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Copy, ExternalLink, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CitationToolbarProps {
  citation: string;
  fullCitation: string;
  title: string;
  citationId: string;
  article_url?: string;
  onDelete: (citationId: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export default function CitationToolbar({
  citation,
  fullCitation,
  title,
  citationId,
  article_url,
  onDelete,
  onClose,
  position
}: CitationToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [adjustedPosition, setAdjustedPosition] = useState(position);


  useEffect(() => {
    if (toolbarRef.current) {
      const toolbar = toolbarRef.current;
      const toolbarRect = toolbar.getBoundingClientRect();
      
      // Add a small delay to ensure accurate measurements
      requestAnimationFrame(() => {
        setAdjustedPosition(prevPosition => {
          const left = position.left - (toolbarRect.width / 2);
          
          return {
            top: position.top,
            left: Math.max(20, Math.min(left, window.innerWidth - toolbarRect.width - 20))
          };
        });
      });
    }
  }, [position]);



  useEffect(() => {
    const calculatePosition = () => {
      if (toolbarRef.current) {
        const toolbar = toolbarRef.current;
        const toolbarRect = toolbar.getBoundingClientRect();
        const editorElement = document.querySelector('.ql-editor');
        
        if (editorElement) {
          const editorRect = editorElement.getBoundingClientRect();
          
          // Calculate the horizontal center position
          let left = position.left;
          
          // Adjust if toolbar would overflow right edge
          if (left + (toolbarRect.width / 2) > editorRect.right) {
            left = editorRect.right - (toolbarRect.width / 2) - 20;
          }
          
          // Adjust if toolbar would overflow left edge
          if (left - (toolbarRect.width / 2) < editorRect.left) {
            left = editorRect.left + (toolbarRect.width / 2) + 20;
          }

          setAdjustedPosition({
            top: position.top,
            left: left
          });
        }
      }
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [position, toolbarRef]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleDelete = () => {
    onDelete(citationId);
    onClose();
  };

  const handleCopy = () => {
    if (article_url) {
      navigator.clipboard.writeText(article_url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleOpenLink = () => {
    if (article_url) {
      window.open(article_url, '_blank');
    }
  };

  return (
    <TooltipProvider>
      <motion.div
        ref={toolbarRef}
        className="fixed bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700"
        style={{
          top: `${adjustedPosition.top}px`,
          left: `${adjustedPosition.left}px`,
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: '300px'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute w-0 h-0" style={{
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid white',
          filter: 'drop-shadow(0 -1px 1px rgba(0,0,0,0.1))'
        }} />
        
        <div className="flex items-start space-x-3 mb-3">
          <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center text-lg font-bold rounded">
            {title[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 truncate">
              {title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
              {citation}
            </p>
          </div>
        </div>

        <div className="pl-3 border-l-2 border-blue-500 my-3">
          <p className="text-xs text-gray-600 dark:text-gray-300 break-words">
            {fullCitation}
          </p>
        </div>

        <div className="flex justify-end items-center space-x-2 mt-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                disabled={!article_url}
              >
                {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{isCopied ? 'Kopiert!' : 'Kopier lenke'}</p>
            </TooltipContent>
          </Tooltip>

          {article_url && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleOpenLink}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Åpne kilde</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleDelete}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Slett</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}
