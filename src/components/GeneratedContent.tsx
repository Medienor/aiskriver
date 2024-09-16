import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface GeneratedContentProps {
  content: string;
  isLoading: boolean;
  error: string | null;
}

export default function GeneratedContent({ content, isLoading, error }: GeneratedContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDownload = async (format: 'pdf' | 'docx') => {
    // Implement download logic here
    console.log(`Downloading as ${format}`);
  };

  // Function to sanitize the content
  const sanitizeContent = (htmlContent: string) => {
    // Remove ```html and ``` tags
    return htmlContent.replace(/```html|```/g, '');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 overflow-auto max-h-screen">
      {isLoading && (
        <div className="flex justify-center items-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && <p className="text-red-500 mb-4 font-semibold">{error}</p>}
      {content ? (
        <>
          <div 
            className="prose prose-lg max-w-none mb-6 dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeContent(content) }}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Last ned</Button>
            </DialogTrigger>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Velg filformat</DialogTitle>
                <DialogDescription className="dark:text-gray-300">
                  Velg hvilket format du vil laste ned artikkelen i.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center space-x-4 mt-4">
                <Button onClick={() => handleDownload('pdf')}>PDF</Button>
                <Button onClick={() => handleDownload('docx')}>DOCX</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 italic">Generate an article to see the content here.</p>
      )}
      <style jsx global>{`
        .prose {
          color: #2c3e50;
        }
        .dark .prose {
          color: #e2e8f0;
        }
        .prose h1 {
          color: #2c3e50;
          font-size: 2.5em;
          margin-bottom: 0.5em;
          border-bottom: 2px solid #3498db;
          padding-bottom: 0.2em;
        }
        .dark .prose h1 {
          color: #f1f5f9;
          border-bottom-color: #60a5fa;
        }
        .prose h2 {
          color: #34495e;
          font-size: 2em;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .dark .prose h2 {
          color: #e2e8f0;
        }
        .prose h3 {
          color: #7f8c8d;
          font-size: 1.5em;
          margin-top: 1em;
          margin-bottom: 0.5em;
        }
        .dark .prose h3 {
          color: #cbd5e1;
        }
        .prose p {
          color: #2c3e50;
          margin-bottom: 1em;
          line-height: 1.6;
        }
        .dark .prose p {
          color: #e2e8f0;
        }
        .prose ul, .prose ol {
          margin-left: 1.5em;
          margin-bottom: 1em;
        }
        .prose li {
          margin-bottom: 0.5em;
        }
        .prose a {
          color: #3498db;
          text-decoration: underline;
        }
        .dark .prose a {
          color: #60a5fa;
        }
        .prose a:hover {
          color: #2980b9;
        }
        .dark .prose a:hover {
          color: #93c5fd;
        }
        .prose code {
          background-color: #f8f8f8;
          padding: 0.2em 0.4em;
          border-radius: 3px;
        }
        .dark .prose code {
          background-color: #1e293b;
          color: #e2e8f0;
        }
      `}</style>
    </div>
  )
}