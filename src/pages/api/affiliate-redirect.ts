import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'
import { setAffiliateCookie } from '../../utils/cookies'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { ref } = req.query

  if (!ref) {
    return res.status(400).json({ error: 'Affiliate code is required' })
  }

  try {
    // First, get the current click count
    const { data: currentData, error: fetchError } = await supabase
      .from('affiliate_stats')
      .select('total_clicks, user_email')
      .eq('affiliate_code', ref)
      .single()

    if (fetchError) throw fetchError

    if (!currentData) {
      return res.status(404).json({ error: 'Affiliate code not found' })
    }

    // Increment the click count
    const { error } = await supabase
      .from('affiliate_stats')
      .update({ total_clicks: currentData.total_clicks + 1 })
      .eq('affiliate_code', ref)

    if (error) throw error

    // Record the click activity
    await supabase
      .from('affiliate_activity')
      .insert({ user_email: currentData.user_email, action_type: 'click' })

    // Set the affiliate cookie
    setAffiliateCookie(ref as string)

    res.redirect(302, `/auth?ref=${ref}`)
  } catch (error) {
    console.error('Error tracking affiliate click:', error)
    res.status(500).json({ error: 'Failed to track affiliate click' })
  }
}