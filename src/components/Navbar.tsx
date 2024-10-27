'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, MenuIcon, Sparkles, PenTool, FileText, Repeat, BookOpen, Wand2, ArrowRightLeft, RefreshCcw, Type, FileSearch, ArrowRight, User, Settings, Rocket, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MobileMenu } from './MobileMenu'
import LoginPopup from './login-popup'
import RegisterPopup from './register-popup'

export function Navbar() {
  const { setTheme, theme } = useTheme()
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
  const [showLoginPopup, setShowLoginPopup] = useState(false)
  const [showRegisterPopup, setShowRegisterPopup] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const megaMenuTriggerRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

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

  const handleSwitchToRegister = () => {
    setShowLoginPopup(false);
    setTimeout(() => setShowRegisterPopup(true), 250);
  };

  const handleSwitchToLogin = () => {
    setShowRegisterPopup(false);
    setTimeout(() => setShowLoginPopup(true), 250);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node) &&
          megaMenuTriggerRef.current && !megaMenuTriggerRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }

    function handleMouseMove(event: MouseEvent) {
      if (megaMenuRef.current) {
        const rect = megaMenuRef.current.getBoundingClientRect();
        if (event.clientY > rect.bottom) {
          setIsMegaMenuOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const menuItems = [
    { name: 'Avsnittsgenerator', icon: <PenTool className="w-4 h-4" />, href: '/tools/sentence-expander' },
    { name: 'Artikkelforfatter', icon: <FileText className="w-4 h-4" />, href: '/tools/article-rewriter' },
    { name: 'Parafraseringsverktøy', icon: <Repeat className="w-4 h-4" />, href: '/tools/paraphrasing-tool' },
    { name: 'Essayforfatter', icon: <BookOpen className="w-4 h-4" />, href: '/tools/essay-writer' },
    { name: 'AI tekstgenerator', icon: <Wand2 className="w-4 h-4" />, href: '/tools/ai-writer' },
    { name: 'Setningsutvidelse', icon: <ArrowRightLeft className="w-4 h-4" />, href: '/tools/sentence-expander' },
    { name: 'Avsnitt omskriver', icon: <RefreshCcw className="w-4 h-4" />, href: '/tools/paragraph-rewriter' },
    { name: 'Setningsgenerator', icon: <Type className="w-4 h-4" />, href: '/tools/paragraph-generator' },
    { name: 'Plagiatfjerner', icon: <FileSearch className="w-4 h-4" />, href: '/tools/plagiarism-remover' },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-auto md:h-16 py-2 md:py-0">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                Innhold.AI
              </Link>
              <div className="hidden md:flex ml-10 space-x-6">
                <div 
                  className="relative"
                  ref={megaMenuTriggerRef}
                  onMouseEnter={() => setIsMegaMenuOpen(true)}
                >
                  <button className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                    Skriververktøy
                  </button>
                </div>
                <div className="relative">
                  <Link href="/pricing" className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400">
                    Pris
                  </Link>
                </div>
                {/* Add more links here as needed */}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                {status === 'authenticated' ? (
                  <>
                    <Link href="/write">
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-0.5 text-sm"
                      >
                        Skriv
                      </Button>
                    </Link>
                    <div className="relative" ref={profileDropdownRef}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                      <div 
                        className={`
                          absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg 
                          overflow-hidden transition-all duration-200 ease-in-out
                          ${isProfileDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
                        `}
                      >
                        <div className="py-1">
                          <button 
                            onClick={() => { router.push('/profile'); setIsProfileDropdownOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Instillinger
                          </button>
                          <button 
                            onClick={() => { router.push('/pricing'); setIsProfileDropdownOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Rocket className="mr-2 h-4 w-4" />
                            Se priser
                          </button>
                          <button 
                            onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setIsProfileDropdownOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            {theme === "dark" ? 
                              <SunIcon className="mr-2 h-4 w-4" /> : 
                              <MoonIcon className="mr-2 h-4 w-4" />
                            }
                            {theme === "dark" ? "Lys modus" : "Mørk modus"}
                          </button>
                          <button 
                            onClick={() => { signOut(); setIsProfileDropdownOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logg ut
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLoginPopup(true)}
                      className="text-sm text-black dark:text-white hover:underline"
                    >
                      Logg inn
                    </button>
                    <Button
                      onClick={() => setShowRegisterPopup(true)}
                      className="rounded-full bg-blue-600 text-white hover:bg-blue-700 text-sm px-4 py-1"
                    >
                      Prøv gratis
                    </Button>
                  </>
                )}
              </div>
              <Button 
                className="md:hidden"
                variant="outline"
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <MenuIcon className="h-4 w-4 md:h-[1.2rem] md:w-[1.2rem] text-gray-900 dark:text-gray-100" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      {isMegaMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-10" style={{ top: '64px' }}></div>
          <div 
            ref={megaMenuRef}
            className="fixed top-16 left-0 w-full bg-white dark:bg-gray-800 shadow-lg z-20 transition-all duration-300 ease-in-out transform origin-top mt-[1px]"
            style={{
              animation: 'subtleGrowDown 200ms ease-in-out forwards',
              transformOrigin: 'top center'
            }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h3 className="font-semibold text-sm mb-2 text-gray-800 dark:text-gray-200">Generell skriving</h3>
              <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mb-4"></div>
              <div className="grid grid-cols-3 gap-2">
                {menuItems.map((item, index) => (
                  <Link 
                    href={item.href} 
                    key={index} 
                    className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-150"
                    onClick={() => setIsMegaMenuOpen(false)}
                  >
                    <div className="bg-white p-2 rounded-full shadow-md">
                      <div className="text-[#06f]">{item.icon}</div>
                    </div>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link 
                  href="/tools" 
                  className="inline-flex items-center text-base font-medium text-[#06f] hover:underline group"
                  onClick={() => setIsMegaMenuOpen(false)}
                >
                  <span>Se alle 120+ AI-skriveverktøy</span>
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <LoginPopup 
        onClose={() => setShowLoginPopup(false)} 
        onSwitchToRegister={handleSwitchToRegister}
        isVisible={showLoginPopup}
      />
      <RegisterPopup 
        onClose={() => setShowRegisterPopup(false)} 
        onSwitchToLogin={handleSwitchToLogin}
        isVisible={showRegisterPopup}
      />
      <style jsx global>{`
        @keyframes subtleGrowDown {
          0% {
            transform: scaleY(0.98)
          }
          100% {
            transform: scaleY(1)
          }
        }
      `}</style>
    </>
  );
}
