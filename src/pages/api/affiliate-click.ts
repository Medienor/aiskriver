import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { affiliateCode } = req.body

    if (!affiliateCode) {
      return res.status(400).json({ error: 'Affiliate code is required' })
    }

    try {
      // First, get the current click count
      const { data: currentData, error: fetchError } = await supabase
        .from('affiliate_stats')
        .select('total_clicks, user_email')
        .eq('affiliate_code', affiliateCode)
        .single()

      if (fetchError) throw fetchError

      if (!currentData) {
        return res.status(404).json({ error: 'Affiliate code not found' })
      }

      // Increment the click count
      const { data, error } = await supabase
        .from('affiliate_stats')
        .update({ total_clicks: currentData.total_clicks + 1 })
        .eq('affiliate_code', affiliateCode)
        .select('user_email')
        .single()

      if (error) throw error

      // Record the click activity
      await supabase
        .from('affiliate_activity')
        .insert({ user_email: currentData.user_email, action_type: 'click' })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error updating click count:', error)
      return res.status(500).json({ error: 'Failed to update click count' })
    }
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}