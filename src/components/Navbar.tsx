'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, MenuIcon, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileMenu } from './MobileMenu'

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <>
      <nav className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              <Sparkles className="h-6 w-6 mr-2" /> {/* Added sparkling icon */}
              Innhold.AI
            </Link>
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
              <div className="hidden md:flex items-center space-x-4">
                {status === 'authenticated' ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        Skriv ✏️
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="outline" className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        Profil
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
              <Button 
                className="md:hidden"
                variant="outline"
                size="icon"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <MenuIcon className="h-[1.2rem] w-[1.2rem] text-gray-900 dark:text-gray-100" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}