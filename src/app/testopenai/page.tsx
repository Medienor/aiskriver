'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { streamTestPrompt } from '../../services/OpenAIService';

export default function TestOpenAI() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse('');

    try {
      for await (const chunk of streamTestPrompt(prompt)) {
        setResponse((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('An error occurred while generating the response.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8">
      <div className="max-w-[800px] mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Test OpenAI</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <Input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt"
            className="mb-4"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </form>
        <div 
          ref={responseRef}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-inner h-64 overflow-y-auto"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {response}
          </p>
        </div>
      </div>
    </div>
  );
}