import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from '../../../lib/supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
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
                plan: 'free'
              });

            if (error) {
              console.error('Error creating new user:', error);
              return false;
            }
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
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
  events: {
    async signIn({ user }) {
      if (user.email) {
        try {
          // Check if the user exists in the user_subscriptions table
          const { data: existingUser, error: fetchError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.email)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error checking existing user:', fetchError);
            return;
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
                plan: 'free'
              });

            if (error) {
              console.error('Error creating new user:', error);
            }
          }
        } catch (error) {
          console.error('Error in signIn event:', error);
        }
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  basePath: "http://localhost:3000/api/auth",
}

export default NextAuth(authOptions)