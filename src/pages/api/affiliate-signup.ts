import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { affiliateCode } = req.body

    if (!affiliateCode) {
      return res.status(400).json({ error: 'Affiliate code is required' })
    }

    const { data, error } = await supabase
      .from('affiliate_stats')
      .update({ total_signups: supabase.rpc('increment', { inc: 1 }) })
      .eq('affiliate_code', affiliateCode)
      .select('user_email')
      .single()

    if (error) {
      console.error('Error updating signup count:', error)
      return res.status(500).json({ error: 'Failed to update signup count' })
    }

    if (data) {
      await supabase
        .from('affiliate_activity')
        .insert({ user_email: data.user_email, action_type: 'signup' })
    }

    return res.status(200).json({ success: true })
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}