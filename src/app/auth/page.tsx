'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { getAffiliateCookie, removeAffiliateCookie } from '../../utils/cookies'

export default function Auth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    } else {
      // Handle affiliate referral
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        localStorage.setItem('affiliateCode', ref);
        trackAffiliateClick(ref);
      }
    }
  }, [status, router])

  const trackAffiliateClick = async (affiliateCode: string) => {
    try {
      const response = await fetch('/api/affiliate-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ affiliateCode })
      });
      if (!response.ok) {
        throw new Error('Failed to track affiliate click');
      }
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  };

  const handleGoogleAuth = () => {
    signIn('google', { callbackUrl: '/dashboard' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        console.log('User logged in:', data)
        router.push('/dashboard')
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          // Add user to user_subscriptions table
          const { error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: data.user.email,  // Using email as user_id
              words_remaining: 5000,
              total_words: 5000,
              plagiat_check_remaining: 10,
              total_plagiat_checks: 10,
              plan: 'free'
            })
          if (subscriptionError) throw subscriptionError

          // Handle affiliate signup
          const affiliateCode = getAffiliateCookie() || localStorage.getItem('affiliateCode');
          if (affiliateCode) {
            await trackAffiliateSignup(affiliateCode);
            removeAffiliateCookie();
            localStorage.removeItem('affiliateCode');
          }

          console.log('User registered and added to subscriptions')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error)
      setError('An error occurred. Please try again.')
    }
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

  if (status === 'loading') {
    return <div>Laster...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          Logg inn eller registrer
        </h1>
        
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md ${isLogin ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Logg inn
            </button>
            <button
              className={`px-4 py-2 rounded-md ${!isLogin ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
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
          <div className="mb-6 relative">
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
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
          >
            {isLogin ? 'Logg inn' : 'Registrer'}
          </button>
        </form>
      </div>
    </div>
  )
}