import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface LoginPopupProps {
  onClose: () => void;
}

export default function LoginPopup({ onClose }: LoginPopupProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Feil passord");
        } else if (result.error === "No user found") {
          setError("Ingen konto med denne e-posten");
        } else {
          setError(result.error);
        }
      } else {
        // Håndter vellykket innlogging her (f.eks. omdiriger til dashboard)
        onClose();
      }
    } catch (error) {
      console.error('Feil under autentisering:', error)
      setError('En feil oppstod. Vennligst prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: '100%' }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Card className="w-full max-w-md relative bg-white dark:bg-gray-800" ref={popupRef}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-700 dark:text-gray-200">Logg inn på din Innhold.AI-konto</CardTitle>
          </CardHeader>
          <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={onClose}>
            <X size={20} />
          </button>
          <CardContent className="space-y-4">
            <Button onClick={handleGoogleAuth} className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700" size="lg">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Logg inn med Google
            </Button>
            <form onSubmit={handleSubmit}>
              <div className="relative mb-4">
                <Input 
                  type="email" 
                  placeholder="E-post" 
                  className="w-full dark:bg-gray-700 dark:text-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="relative mb-4">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Passord"
                  className="w-full pr-10 dark:bg-gray-700 dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
              <div className="text-sm text-blue-500 hover:underline cursor-pointer mb-4 dark:text-blue-400">
                Glemt passord?
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logger inn...
                  </>
                ) : (
                  'Logg inn'
                )}
              </Button>
            </form>
            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Har du ikke en konto ennå?{' '}
              <Link href="/auth" className="text-blue-500 hover:underline cursor-pointer dark:text-blue-400">Registrer deg her</Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}