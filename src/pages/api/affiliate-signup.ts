import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { affiliateCode, userEmail } = req.body

  console.log('Received affiliate signup request:', { affiliateCode, userEmail });

  if (!affiliateCode || !userEmail) {
    console.log('Missing required fields:', { affiliateCode, userEmail });
    return res.status(400).json({ error: 'Affiliate code and user email are required' })
  }

  try {
    // Get the affiliate's data
    const { data: affiliateData, error: affiliateError } = await supabase
      .from('affiliate_stats')
      .select('user_email, affiliate_code, total_signups')
      .eq('affiliate_code', affiliateCode)
      .single()

    if (affiliateError) throw affiliateError

    if (!affiliateData) {
      return res.status(404).json({ error: 'Affiliate code not found' })
    }

    // Update affiliate stats
    const { data: updateData, error: updateError } = await supabase
      .from('affiliate_stats')
      .update({ total_signups: (affiliateData.total_signups || 0) + 1 })
      .eq('affiliate_code', affiliateCode)
      .select('total_signups')
      .single()

    if (updateError) throw updateError

    // Record the signup activity
    const { error: activityError } = await supabase
      .from('affiliate_activity')
      .insert({ 
        user_email: affiliateData.user_email, 
        action_type: 'signup', 
        referred_email: userEmail 
      })

    if (activityError) throw activityError

    console.log('Affiliate signup tracked successfully:', {
      affiliateCode: affiliateData.affiliate_code,
      affiliateEmail: affiliateData.user_email,
      newSignupEmail: userEmail,
      totalSignups: updateData.total_signups
    })

    return res.status(200).json({ 
      success: true, 
      totalSignups: updateData.total_signups,
      message: 'Affiliate signup tracked successfully'
    })
  } catch (error) {
    console.error('Error tracking affiliate signup:', error)
    return res.status(500).json({ error: 'Failed to track affiliate signup' })
  }
}