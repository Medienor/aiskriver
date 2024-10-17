import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Upload, Loader } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase'; // Make sure this path is correct
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

interface SlideOutSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SlideOutSettingsPanel: React.FC<SlideOutSettingsPanelProps> = ({ isOpen, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      if (file.size > MAX_FILE_SIZE) {
        alert('File size exceeds 5MB limit. Please choose a smaller file.');
        return;
      }
      
      setIsUploading(true);
      try {
        const uuid = uuidv4();
        console.log('Generated UUID:', uuid);

        const arrayBuffer = await file.arrayBuffer();
        console.log('File converted to ArrayBuffer');

        console.log('Converting to HTML...');
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;
        console.log('Conversion to HTML complete');

        // Generate a title from the file name
        const title = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension

        console.log('Inserting into Supabase...');
        const { data, error } = await supabase
          .from('content')
          .insert({
            id: uuid,
            html_content: htmlContent,
            user_id: session?.user?.email,
            status: 'generated',
            title: title // Add the title here
          });

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Supabase insert error: ${error.message}`);
        }

        console.log('Supabase insert successful:', data);
        router.push(`/write/${uuid}`);
      } catch (error) {
        console.error('Detailed error:', error);
        let errorMessage = 'An unknown error occurred while uploading the file.';
        if (error instanceof Error) {
          errorMessage = `Error: ${error.message}`;
        }
        alert(`An error occurred while uploading the file: ${errorMessage}`);
      } finally {
        setIsUploading(false);
      }
    } else {
      alert('Please upload a valid DOCX file.');
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      ref={panelRef}
      className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-lg z-50"
      initial={{ x: '100%' }}
      animate={{ x: isOpen ? 0 : '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Innstillinger</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              onChange={handleFileUpload}
              className="hidden"
              id="docx-upload"
              disabled={isUploading}
            />
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2 py-6 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={isUploading}
              onClick={handleButtonClick}
            >
              {isUploading ? (
                <Loader className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-sm">Last opp</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">.DOCX</span>
                </>
              )}
            </Button>
          </div>
          {/* Add more settings options here */}
        </div>
      </div>
    </motion.div>
  );
};

export default SlideOutSettingsPanel;
