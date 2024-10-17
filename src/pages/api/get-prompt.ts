import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt ID' })
  }

  console.log('Fetching prompt for ID:', id);

  try {
    const { data, error } = await supabase
      .from('content')
      .select('prompt, outline_type, article_type, sitemap_urls, use_local_links')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST301') {
        return res.status(404).json({ error: 'Prompt not found' })
      }
      throw error;
    }

    if (!data) {
      console.log('No data found for ID:', id);
      return res.status(404).json({ error: 'Prompt not found' })
    }

    console.log('Prompt data retrieved:', data);
    res.status(200).json({
      prompt: data.prompt,
      outlineType: data.outline_type,
      articleType: data.article_type,
      sitemapUrls: data.sitemap_urls,
      useLocalLinks: data.use_local_links
    })
  } catch (error) {
    console.error('Error fetching prompt:', error)
    res.status(500).json({ error: 'Failed to fetch prompt' })
  }
}
