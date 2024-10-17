import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const subscription_key = process.env.BING_SEARCH_V7_SUBSCRIPTION_KEY;
const endpoint = "https://api.bing.microsoft.com/v7.0/search";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, offset, count, safeSearch } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  console.log('Bing Search API Request:', {
    endpoint,
    query,
    offset,
    count,
    safeSearch,
    subscription_key: subscription_key ? 'Set' : 'Not set'
  });

  try {
    const response = await axios.get(endpoint, {
      headers: {
        'Ocp-Apim-Subscription-Key': subscription_key!,
        'Accept': 'application/json',
        'Accept-Language': 'nb-NO'
      },
      params: {
        q: query,
        mkt: 'nb-NO',
        setLang: 'nb-NO',
        count: count || 10,
        offset: offset || 0,
        safeSearch: safeSearch || 'Moderate',
        textFormat: 'HTML',
        responseFilter: 'Webpages',
      },
    });

    console.log('Bing Search API Response:', {
      status: response.status,
      headers: response.headers,
    });

    const webPages = response.data.webPages?.value || [];

    console.log('\nWeb Pages Results:');
    webPages.forEach((page: any, index: number) => {
      console.log(`\n[Result ${index + 1}]`);
      console.log(`Name: ${page.name}`);
      console.log(`URL: ${page.url}`);
      console.log(`Snippet: ${page.snippet}`);
    });

    const parsedResults = {
      webPages: webPages.map((page: any) => ({
        name: page.name,
        url: page.url,
        snippet: page.snippet,
        datePublished: page.datePublished,
        thumbnailUrl: page.thumbnailUrl,
      })),
      totalEstimatedMatches: response.data.webPages?.totalEstimatedMatches || 0,
    };

    res.status(200).json(parsedResults);
  } catch (error: any) {
    console.error('Bing Search API Error:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      } : 'No response'
    });

    if (error.response) {
      res.status(error.response.status).json({
        message: 'Bing API error',
        error: error.response.data
      });
    } else if (error.request) {
      res.status(500).json({
        message: 'No response received from Bing API',
        error: error.message
      });
    } else {
      res.status(500).json({
        message: 'Error setting up the request',
        error: error.message
      });
    }
  }
}
