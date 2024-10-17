import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Handle hash fragment for Supabase auth
  const hashParams = new URLSearchParams(requestUrl.hash.slice(1))
  const accessToken = hashParams.get('access_token')
  const refreshToken = hashParams.get('refresh_token')

  const supabase = createRouteHandlerClient({ cookies })

  if (accessToken && refreshToken) {
    // Set the session using the access token and refresh token
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    
    // Redirect to dashboard after successful authentication
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  } else if (code) {
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } catch (error) {
      console.error('Error during authentication:', error)
      // Redirect to login page with error message
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=AuthenticationFailed`)
    }
  }

  // If there's no code or token, redirect to the homepage
  return NextResponse.redirect(requestUrl.origin)
}