'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { useTheme } from "next-themes"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleAuth = async (action: 'login' | 'register') => {
    setIsLoading(true)
    try {
      await signIn('google', { 
        callbackUrl: '/profile',
        ...(action === 'register' && { registerNewUser: 'true' })
      });
    } catch (error) {
      console.error(`${action} error:`, error);
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <nav className="w-full mx-auto flex items-center justify-between p-4">
        <div className="flex items-center">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Innhold.AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
            variant="outline" 
            size="icon"
            className="bg-gray-200 dark:bg-gray-600"
          >
            {theme === "dark" ? 
              <SunIcon className="h-[1.2rem] w-[1.2rem] text-yellow-500" /> : 
              <MoonIcon className="h-[1.2rem] w-[1.2rem] text-gray-900" />
            }
          </Button>
          {status === 'authenticated' ? (
            <>
              <Link href="/">
                <Button variant="outline" className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Skriv ✏️
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  Profile
                </Button>
              </Link>
              <Button onClick={() => signOut()}>Log out</Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Log in / Register'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAuth('login')}>
                  Log in
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAuth('register')}>
                  Register
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </div>
  );
}