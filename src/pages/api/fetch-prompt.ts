import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt ID' })
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .select('prompt, outline_type, html_content, status')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    if (!data) {
      return res.status(404).json({ error: 'Prompt not found' })
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching prompt:', error)
    res.status(500).json({ error: 'Failed to fetch prompt' })
  }
}