import { useState, useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { getAffiliateCookie, removeAffiliateCookie } from '@/utils/cookies'

interface RegisterPopupProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  isVisible: boolean;
}

export default function RegisterPopup({ onClose, onSwitchToLogin, isVisible }: RegisterPopupProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError("Passordene stemmer ikke overens");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/supabase-callback`,
        },
      })
      if (error) {
        console.error('Signup error:', error);
        if (error.message.includes('not authorized')) {
          setError('Denne e-postadressen kan ikke brukes. Vennligst prøv en annen.');
        } else {
          setError(error.message);
        }
        return;
      }
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setError('En konto med denne e-postadressen eksisterer allerede. Vennligst prøv å logge inn.');
        } else {
          setMessage('Vennligst sjekk e-posten din for en bekreftelseslenke for å fullføre registreringen.');
          
          try {
            // Add user to user_subscriptions table
            const { error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: email,  // Use email as user_id
                words_remaining: 5000,
                total_words: 5000,
                plagiat_check_remaining: 10,
                total_plagiat_checks: 10,
                plan: 'Prøvekonto'
              })
            if (subscriptionError) {
              console.error('Error adding user to subscriptions:', subscriptionError)
              // Don't throw here, as the user account was created successfully
            }
          } catch (subscriptionError) {
            console.error('Error adding user to subscriptions:', subscriptionError)
            // Don't throw here, as the user account was created successfully
          }

          // Handle affiliate signup
          const affiliateCode = getAffiliateCookie() || localStorage.getItem('affiliateCode');
          if (affiliateCode) {
            await trackAffiliateSignup(affiliateCode);
            removeAffiliateCookie();
            localStorage.removeItem('affiliateCode');
          }

          console.log('User registered and added to subscriptions')
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error)
      setError(error instanceof Error ? error.message : 'En feil oppstod. Vennligst prøv igjen.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    signIn('google', { callbackUrl: '/write' })
  }

  const trackAffiliateSignup = async (affiliateCode: string) => {
    try {
      const response = await fetch('/api/affiliate-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateCode })
      });
      if (!response.ok) {
        throw new Error('Failed to track affiliate signup');
      }
    } catch (error) {
      console.error('Error tracking affiliate signup:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            ref={popupRef}
            initial={{ rotateY: -180 }}
            animate={{ rotateY: isVisible ? 0 : -180 }}
            exit={{ rotateY: 0 }}
            transition={{ duration: 0.5 }}
            style={{ perspective: 1000 }}
          >
            <Card className="w-full max-w-md relative bg-white dark:bg-gray-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-700 dark:text-gray-200">Opprett en Innhold.AI-konto</CardTitle>
              </CardHeader>
              <button className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" onClick={onClose}>
                <X size={20} />
              </button>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handleGoogleAuth} 
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2 px-4 border border-gray-300 rounded shadow-sm flex items-center justify-center"
                  size="lg"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path fill="none" d="M1 1h22v22H1z"/>
                  </svg>
                  Fortsett med Google
                </Button>
                
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Eller bruk e-post
                </div>

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
                  <div className="relative mb-4">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Bekreft passord"
                      className="w-full pr-10 dark:bg-gray-700 dark:text-white"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
                  {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
                  <Button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrerer...
                      </>
                    ) : (
                      'Registrer deg'
                    )}
                  </Button>
                </form>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Har du allerede en konto?{' '}
                  <button 
                    onClick={onSwitchToLogin}
                    className="text-blue-500 hover:underline cursor-pointer dark:text-blue-400"
                  >
                    Logg inn her
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
