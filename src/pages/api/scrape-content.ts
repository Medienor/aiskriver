import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style').remove();

    // Extract the text content
    const content = $('body').text().trim();

    res.status(200).json({ content });
  } catch (error) {
    console.error('Error scraping content:', error);
    res.status(500).json({ message: 'Error scraping content', error: (error as Error).message });
  }
}
