import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const COPYSCAPE_API_URL = 'https://www.copyscape.com/api/';
const USERNAME = 'cptghost';
const API_KEY = 'sv8fi88hv6t0zf6v';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  const strippedText = stripHtml(text);

  console.log('Stripped text (first 200 characters):', strippedText.substring(0, 200));
  console.log('Total stripped text length:', strippedText.length);

  if (strippedText.split(/\s+/).length < 15) {
    return res.status(400).json({ message: 'At least 15 words are required to perform a search' });
  }

  try {
    const params = new URLSearchParams({
      u: USERNAME,
      k: API_KEY,
      o: 'csearch',
      e: 'UTF-8',
      t: strippedText,
      c: '1',
      f: 'json',
    });

    console.log('Sending request to Copyscape API');
    const response = await axios.post(COPYSCAPE_API_URL, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    console.log('Received response from Copyscape API');
    const data = response.data;

    if (data.error) {
      console.error('Copyscape API error:', data.error);
      throw new Error(data.error);
    }

    const result = {
      isPlagiarized: data.count > 0,
      percentPlagiarized: data.count > 0 ? (data.result[0].plagpercent || 0) : 0,
      sources: data.result ? data.result.map((source: any) => ({
        url: source.url,
        title: source.title,
        matchedWords: source.wordsmatched,
        percentMatched: source.plagpercent,
      })) : [],
    };

    console.log('Processed result:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error checking plagiarism:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    res.status(500).json({ message: 'Error checking plagiarism', error: error.message });
  }
}