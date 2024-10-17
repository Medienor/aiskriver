import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ref } = req.body

  console.log('Tracking affiliate click for ref:', ref)

  if (!ref) {
    return res.status(400).json({ error: 'Affiliate code is required' })
  }

  try {
    // Get the current data
    const { data: currentData, error: fetchError } = await supabase
      .from('affiliate_stats')
      .select('affiliate_clicks, user_email')
      .eq('affiliate_code', ref)
      .single()

    if (fetchError) throw fetchError

    if (!currentData) {
      return res.status(404).json({ error: 'Affiliate code not found' })
    }

    console.log('Current affiliate clicks:', currentData.affiliate_clicks)

    // Increment the affiliate_clicks
    const { data, error } = await supabase
      .from('affiliate_stats')
      .update({ affiliate_clicks: (currentData.affiliate_clicks || 0) + 1 })
      .eq('affiliate_code', ref)
      .select('affiliate_clicks')
      .single()

    if (error) throw error

    console.log('Affiliate clicks after increment:', data.affiliate_clicks)

    // Record the click activity
    await supabase
      .from('affiliate_activity')
      .insert({ user_email: currentData.user_email, action_type: 'click' })

    console.log('Affiliate click tracked and activity recorded')

    return res.status(200).json({ success: true, affiliateClicks: data.affiliate_clicks })
  } catch (error) {
    console.error('Error tracking affiliate click:', error)
    return res.status(500).json({ error: 'Failed to track affiliate click' })
  }
}