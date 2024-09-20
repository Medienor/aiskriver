'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { streamMatteProblem } from '@/services/MatteloserService';
import { X, Upload } from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import styles from './matteloser.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export default function Matteloser() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !image) return;

    const newUserMessage: Message = { role: 'user', content: input };
    if (image) {
      newUserMessage.image = image;
    }
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      
      for await (const chunk of streamMatteProblem(input, image)) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred while generating the response.' }]);
    } finally {
      setIsLoading(false);
      setImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (e) => setImage(e.target?.result as string);
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => setImage(null);

  const openImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  const renderMathContent = (content: string) => {
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        if (isValidLaTeX(math)) {
          try {
            return <BlockMath key={index} math={math} />;
          } catch (error) {
            console.error('Error rendering BlockMath:', error);
            return <span key={index}>{part}</span>;
          }
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        if (isValidLaTeX(math)) {
          try {
            return <InlineMath key={index} math={math} />;
          } catch (error) {
            console.error('Error rendering InlineMath:', error);
            return <span key={index}>{part}</span>;
          }
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  const isValidLaTeX = (latex: string) => {
    const validCommands = ['\\frac', '\\sqrt', '\\sum', '\\int', '\\lim', '\\infty', '\\pi'];
    return validCommands.some(command => latex.includes(command)) || /[a-zA-Z0-9^_{}]+/.test(latex);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 px-4">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Matteløser</h1>
        <div 
          ref={chatRef}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-inner h-[60vh] overflow-y-auto mb-4"
        >
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'text-left' : 'text-right'}`}>
              {message.image && (
                <div className="mb-2">
                  <img 
                    src={message.image} 
                    alt="User uploaded" 
                    className="max-w-xs max-h-32 rounded inline-block cursor-pointer" 
                    onClick={() => openImagePreview(message.image!)}
                  />
                </div>
              )}
              <div className={`inline-block p-3 rounded-lg ${message.role === 'assistant' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
                <div className={`text-base text-gray-800 dark:text-gray-200 ${styles.katexContainer}`}>
                  {renderMathContent(message.content)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {image && (
            <div className="relative inline-block">
              <img src={image} alt="Pasted" className="max-w-xs max-h-32 rounded" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              >
                <X size={16} />
              </button>
            </div>
          )}
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Skriv inn ditt matteproblem eller lim inn et bilde..."
              className="w-full p-2 pr-10 border rounded resize-none text-base"
              rows={3}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 bottom-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <Upload size={20} />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".png,.jpg,.jpeg"
            className="hidden"
          />
          <Button type="submit" disabled={isLoading} className="text-base">
            {isLoading ? 'Løser...' : 'Send'}
          </Button>
        </form>
      </div>
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeImagePreview}>
          <div className="max-w-4xl max-h-4xl">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-full" />
          </div>
        </div>
      )}
    </div>
  );
}