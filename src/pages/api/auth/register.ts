import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      // Check if the user already exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', email)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingUser) {
        // If the user doesn't exist, create a new entry
        const { data, error } = await supabase
          .from('user_subscriptions')
          .insert({ 
            user_id: email, 
            words_remaining: 5000,
            plagiat_check_remaining: 10,  // Ensure this line is included
            total_words: 5000,  // Add this line if you're tracking total words
            total_plagiat_checks: 10  // Add this line if you're tracking total plagiarism checks
          })
          .select();

        if (error) throw error;

        res.status(200).json({ message: 'User registered successfully', data });
      } else {
        res.status(200).json({ message: 'User already registered', data: existingUser });
      }
    } catch (error) {
      console.error('Error in register handler:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}