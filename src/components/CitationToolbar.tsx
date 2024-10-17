import React, { useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { motion } from 'framer-motion';

interface CitationToolbarProps {
  citation: string;
  fullCitation: string;
  title: string;
  citationId: string;
  onDelete: (citationId: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

const CitationToolbar: React.FC<CitationToolbarProps> = ({ 
  citation, 
  fullCitation, 
  title, 
  citationId,
  onDelete,
  onClose,
  position
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    console.log('CitationToolbar rendered with props:', { citation, fullCitation, title, position });
  }, [citation, fullCitation, title, position]);

  const handleDelete = () => {
    console.log('Delete button clicked');
    onDelete(citationId);
    onClose();
  };

  return (
    <motion.div
      ref={toolbarRef}
      className="citation-toolbar bg-white dark:bg-gray-800 rounded-lg p-2 w-64 absolute border border-gray-200 dark:border-gray-700 shadow-lg"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)', // Center horizontally
        zIndex: 1000,
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div 
        className="absolute w-0 h-0" 
        style={{
          top: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #ffffff',
        }}
      >
        <div 
          className="absolute w-0 h-0 dark:border-b-gray-800"
          style={{
            top: '1px',
            left: '-8px',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #ffffff',
          }}
        />
      </div>
      <div className="flex items-start space-x-2 mb-2">
        <div className="w-6 h-6 bg-blue-200 dark:bg-blue-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-bold rounded">
          {title[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xs font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2">{fullCitation}</p>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <Button 
          onClick={() => {
            console.log('Edit button clicked');
            console.log('Edit citation');
          }} 
          size="sm" 
          variant="outline" 
          className="text-[10px] h-6 px-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <Edit className="w-3 h-3 mr-1" /> Rediger
        </Button>
        <Button 
          onClick={handleDelete}
          size="sm" 
          variant="outline" 
          className="text-[10px] h-6 px-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Slett
        </Button>
      </div>
    </motion.div>
  );
};

export default CitationToolbar;
