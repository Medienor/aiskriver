'use client'

import { Suspense } from 'react'
import { signIn, useSession, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getAffiliateCookie, removeAffiliateCookie } from '../../utils/cookies'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function AuthContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const clickTracked = useRef(false)

  const trackAffiliateClick = useCallback(async (ref: string) => {
    if (clickTracked.current) return;
    try {
      const response = await fetch('/api/track-affiliate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('Affiliate click tracked successfully', data.affiliateClicks);
        clickTracked.current = true;
        // Store the affiliate code
        localStorage.setItem('affiliateCode', ref);
      }
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else {
      const ref = searchParams?.get('ref');
      if (ref && !clickTracked.current) {
        trackAffiliateClick(ref);
      }
    }
  }, [status, router, searchParams, trackAffiliateClick]);

  const trackAffiliateSignup = async (userEmail: string) => {
    const affiliateCode = getAffiliateCookie() || localStorage.getItem('affiliateCode');
    if (affiliateCode) {
      try {
        const response = await fetch('/api/affiliate-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ affiliateCode, userEmail })
        });
        if (!response.ok) {
          throw new Error('Failed to track affiliate signup');
        }
        const data = await response.json();
        console.log('Affiliate signup tracked:', data);
        removeAffiliateCookie();
        localStorage.removeItem('affiliateCode');
      } catch (error) {
        console.error('Error tracking affiliate signup:', error);
      }
    }
  };

  const handleGoogleAuth = () => {
    signIn('google', { 
      callbackUrl: '/dashboard',
      redirect: false
    }).then((result) => {
      if (result?.ok) {
        // The sign-in was successful, but we don't have the user email here
        // We need to fetch the session to get the user email
        getSession().then((session) => {
          if (session?.user?.email) {
            trackAffiliateSignup(session.user.email);
          }
        });
      }
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      if (isLogin) {
        // Sign in
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
          return;
        }
        router.push('/dashboard')
      } else {
        // Sign up
        const affiliateCode = getAffiliateCookie() || localStorage.getItem('affiliateCode');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              referred_by: affiliateCode || null
            }
          }
        })
        if (error) {
          if (error.status === 429) {
            throw new Error('Too many signup attempts. Please try again later.')
          }
          throw error
        }
        if (data.user) {
          if (data.user.identities && data.user.identities.length === 0) {
            // User already exists
            setError('An account with this email already exists. Please try logging in.')
          } else {
            // User created successfully, but needs to confirm email
            setMessage('Vennligst sjekk e-posten din for en bekreftelseslenke for å fullføre registreringen.')
            
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
                  plan: 'Prøvekonto',
                  referred_by: affiliateCode || null  // Add this line
                })
              if (subscriptionError) {
                console.error('Error adding user to subscriptions:', subscriptionError)
              }

              // Handle affiliate signup
              if (affiliateCode) {
                await trackAffiliateSignup(email);
              }

              console.log('User registered and added to subscriptions')
            } catch (error) {
              console.error('Error in post-registration process:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return <div>Laster...</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md mb-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Logg inn eller registrer
        </h1>
        
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-200 dark:bg-gray-600 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                isLogin 
                  ? 'bg-white text-gray-900 dark:bg-gray-300 dark:text-gray-800 shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Logg inn
            </button>
            <button
              className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                !isLogin 
                  ? 'bg-white text-gray-900 dark:bg-gray-300 dark:text-gray-800 shadow' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Registrer
            </button>
          </div>
        </div>

        <button
          onClick={handleGoogleAuth}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 mb-4"
        >
          <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
            <path fill="none" d="M1 1h22v22H1z" />
          </svg>
          {isLogin ? 'Logg inn med Google' : 'Registrer med Google'}
        </button>
        
        <div className="text-center my-4 text-gray-500 dark:text-gray-400">Eller bruk e-post</div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              E-post
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-2 relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Passord
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 mt-6"
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
            </button>
          </div>
          
          {/* New small text with link */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Du godkjenner våre <Link href="/brukervilkar" className="text-gray-500 dark:text-gray-400 underline">vilkår</Link> når du oppretter en konto
          </p>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                {isLogin ? 'Logger inn...' : 'Registrerer...'}
              </>
            ) : (
              isLogin ? 'Logg inn' : 'Registrer'
            )}
          </button>
          
          {/* Green checkmark with dark grey text */}
          <div className="flex items-center justify-center mt-4 text-green-500">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">Ingen behov for kredittkort</span>
          </div>
        </form>
      </div>
      
      {/* Updated testimonial without background color and image */}
      <div className="max-w-2xl text-center text-gray-700 dark:text-gray-300">
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          ))}
        </div>
        <p className="text-lg italic mb-2">
          &quot;Innhold.AI har revolusjonert måten jeg skaper innhold på. Det er et uunnværlig verktøy for enhver innholdsskaper i Norge.&quot;
        </p>
        <p className="font-semibold">- Sebastian Gerhardsen, Innholdsskaper</p>
      </div>
    </div>
  )
}

export default function Auth() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}