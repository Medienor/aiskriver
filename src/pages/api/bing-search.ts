import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const subscription_key = process.env.BING_SEARCH_V7_SUBSCRIPTION_KEY;
const webSearchEndpoint = "https://api.bing.microsoft.com/v7.0/search";
const newsSearchEndpoint = "https://api.bing.microsoft.com/v7.0/news/search";

async function performSearch(endpoint: string, query: string, params: any) {
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
      ...params
    },
  });

  return response.data;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { query, offset, count, safeSearch, searchType } = req.query;

  console.log('Bing Search API Request:', {
    query,
    offset,
    count,
    safeSearch,
    searchType,
    subscription_key: subscription_key ? 'Set' : 'Not set'
  });

  try {
    let results;
    if (searchType === 'news') {
      console.log('Performing news search');
      results = await performSearch(newsSearchEndpoint, query as string, {
        count: count || 10,
        offset: offset || 0,
        safeSearch: safeSearch || 'Moderate',
      });

      console.log('Bing News Search API Response:', {
        status: 200,
        totalEstimatedMatches: results.totalEstimatedMatches,
        resultCount: results.value?.length || 0,
      });

      const parsedResults = {
        newsArticles: results.value.map((article: any) => ({
          name: article.name,
          url: article.url,
          description: article.description,
          datePublished: article.datePublished,
          provider: article.provider[0]?.name,
        })),
        totalEstimatedMatches: results.totalEstimatedMatches || 0,
      };

      res.status(200).json(parsedResults);
    } else {
      console.log('Performing web search');
      // Default to web search
      results = await performSearch(webSearchEndpoint, query as string, {
        count: count || 10,
        offset: offset || 0,
        safeSearch: safeSearch || 'Moderate',
        textFormat: 'HTML',
        responseFilter: 'Webpages',
      });

      console.log('Bing Web Search API Response:', {
        status: 200,
        headers: results.headers,
      });

      const webPages = results.webPages?.value || [];

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
        totalEstimatedMatches: results.webPages?.totalEstimatedMatches || 0,
      };

      res.status(200).json(parsedResults);
    }
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
