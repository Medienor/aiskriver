import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabase } from '../../../lib/supabase'
import { Session } from "next-auth"
import { sendTelegramMessage } from '../../../services/TelegramService'

// Add this type declaration at the top of your file
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        if (error) {
          return null
        }
        return { id: data.user.id, email: data.user.email }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "credentials") {
        if (user.email) {
          try {
            // Check if the user already exists in Supabase
            const { data: existingUser, error: fetchError } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('user_id', user.email)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error('Error checking existing user:', fetchError);
              return false;
            }

            if (!existingUser) {
              // If the user doesn't exist, create a new entry
              const { error } = await supabase
                .from('user_subscriptions')
                .insert({ 
                  user_id: user.email, 
                  words_remaining: 5000,
                  total_words: 5000,
                  plagiat_check_remaining: 10,
                  total_plagiat_checks: 10,
                  plan: 'Prøvekonto'
                });

              if (error) {
                console.error('Error creating new user:', error);
                return false;
              }

              // Send Telegram notification for new user
              await sendTelegramMessage(`New user signed up: ${user.email}`);
            }
          } catch (error) {
            console.error('Error in signIn callback:', error);
            return false;
          }
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ''
      }
      return session
    },
  },
  pages: {
    signIn: '/auth',
  },
}

export default NextAuth(authOptions)