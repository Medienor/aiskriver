import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, html_content, status } = req.body

  if (!id || !html_content || !status) {
    return res.status(400).json({ error: 'ID, html_content, and status are required' })
  }

  try {
    const { error } = await supabase
      .from('content')
      .update({ html_content, status })
      .eq('id', id)

    if (error) throw error

    res.status(200).json({ message: 'Article updated successfully' })
  } catch (error) {
    console.error('Error updating article:', error)
    res.status(500).json({ error: 'Failed to update article' })
  }
}