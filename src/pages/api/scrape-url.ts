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

  const startTime = Date.now();
  console.log(`Starting scrape for URL: ${url}`);

  try {
    console.log('Fetching webpage...');
    const response = await axios.get(url, { timeout: 10000 }); // Increased timeout to 10 seconds
    const html = response.data;
    console.log('Webpage fetched successfully');

    console.log('Parsing HTML...');
    const $ = cheerio.load(html);

    // Remove script tags, style tags, and comments
    $('script, style, comment').remove();

    // Extract the entire content
    const content = $('body').text().trim();

    // Extract the title
    const title = $('title').text().trim();

    console.log('HTML parsed successfully');
    console.log('Scraped content:');
    console.log('Title:', title);
    console.log('Content preview:', content.substring(0, 200) + '...');

    const endTime = Date.now();
    const scrapingTime = endTime - startTime;
    console.log(`Scrape completed in ${scrapingTime}ms`);

    res.status(200).json({ title, content, scrapingTime });
  } catch (error) {
    console.error('Error scraping URL:', error);
    res.status(500).json({ message: 'Error scraping URL', error: (error as Error).message });
  }
}
