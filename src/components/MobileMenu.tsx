'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Home, Star, Smile, User, Search, X, PencilIcon } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useRouter();
  const { data: session } = useSession();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-800 p-4 shadow-lg transform transition-transform duration-300 ease-in-out">
        <Button 
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
        >
          <X className="h-6 w-6" />
        </Button>
        <nav className="mt-12">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <Home className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Home
              </Link>
            </li>
            <li>
              <Link href="/ai-chat" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <Star className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                AI Chat
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <Smile className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Pris
              </Link>
            </li>
            <li>
              <Link href="/profile" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <User className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Profil
              </Link>
            </li>
            <li>
              <Link href="/plagiat-sjekker" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <Search className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Plagiat sjekk
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="flex items-center py-2 px-4 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded" onClick={onClose}>
                <PencilIcon className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
                Skriv
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="mt-4">
          <Button 
            onClick={() => {
              router.push('/dashboard');
              onClose();
            }}
            className="w-full bg-[#06f] hover:bg-blue-700 text-white"
          >
            Skriv artikkel
          </Button>
        </div>
        
        {session && (
          <Button 
            onClick={() => {
              signOut();
              onClose();
            }}
            className="mt-4 w-full bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Logg ut
          </Button>
        )}
      </div>
    </div>
  );
}