import { NextApiRequest, NextApiResponse } from 'next';
import Cors from 'cors';
import Exa from 'exa-js';

const cors = Cors({
  methods: ['POST', 'GET', 'HEAD'],
});

function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not set' });
  }

  const exa = new Exa(apiKey);

  try {
    console.log('Forwarding request to Exa API:', JSON.stringify(req.body, null, 2));

    const { query, options } = req.body;
    const result = await exa.searchAndContents(query, options);

    console.log('Raw Exa API response:', JSON.stringify(result, null, 2));

    // Log details for each result
    result.results.forEach((result: any, index: number) => {
      console.log(`Result ${index + 1}:`);
      console.log('Title:', result.title);
      console.log('URL:', result.url);
      console.log('Text:', result.text);
      console.log('Highlights:', result.highlights);
      console.log('Summary:', result.summary);
      console.log('---');
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error proxying to Exa API:', error);
    res.status(500).json({ error: 'An error occurred while proxying to Exa API' });
  }
}