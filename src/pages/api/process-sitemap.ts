import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import axios from 'axios';
import { parseString } from 'xml2js';

// Add type definitions for xml2js parsing result
interface SitemapXML {
  urlset: {
    url: Array<{ loc: string[] }>;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { sitemapId, sitemapUrl } = req.body;

  try {
    // Fetch the sitemap XML
    const response = await axios.get(sitemapUrl);
    const xml = response.data;

    // Parse the XML
    parseString(xml, async (err: Error | null, result: SitemapXML) => {
      if (err) {
        throw new Error('Failed to parse sitemap XML');
      }

      // Extract URLs from the sitemap
      const urls = result.urlset.url.map((item) => item.loc[0]);

      // Update the sitemap status and store the URLs
      const { error } = await supabase
        .from('sitemaps')
        .update({ 
          status: 'completed',
          urls: urls
        })
        .eq('id', sitemapId);

      if (error) {
        throw new Error('Failed to update sitemap status');
      }

      res.status(200).json({ message: 'Sitemap processed successfully' });
    });
  } catch (error) {
    console.error('Error processing sitemap:', error);

    // Update the sitemap status to error
    await supabase
      .from('sitemaps')
      .update({ status: 'error' })
      .eq('id', sitemapId);

    res.status(500).json({ message: 'Failed to process sitemap' });
  }
}