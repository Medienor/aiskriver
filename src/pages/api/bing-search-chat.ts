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

  console.log('Bing Search Query:', query);

  try {
    let results;
    if (searchType === 'news') {
      results = await performSearch(newsSearchEndpoint, query as string, {
        count: count || 10,
        offset: offset || 0,
        safeSearch: safeSearch || 'Moderate',
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

      console.log('News URLs scraped:');
      parsedResults.newsArticles.forEach((article: any, index: number) => {
        console.log(`[${index + 1}] ${article.url}`);
      });

      res.status(200).json(parsedResults);
    } else {
      results = await performSearch(webSearchEndpoint, query as string, {
        count: count || 10,
        offset: offset || 0,
        safeSearch: safeSearch || 'Moderate',
        textFormat: 'HTML',
        responseFilter: 'Webpages,RelatedSearches',
      });

      // Log the entire search response object
      console.log('Full Bing Search API response:', JSON.stringify({
        _type: results._type,
        computation: results.computation,
        entities: results.entities,
        images: results.images,
        news: results.news,
        places: results.places,
        queryContext: results.queryContext,
        rankingResponse: results.rankingResponse,
        relatedSearches: results.relatedSearches,
        spellSuggestions: results.spellSuggestions,
        timeZone: results.timeZone,
        translations: results.translations,
        videos: results.videos,
        webPages: results.webPages
      }, null, 2));

      const webPages = results.webPages?.value || [];
      const relatedSearches = results.relatedSearches?.value || [];

      console.log('Web URLs scraped:');
      webPages.forEach((page: any, index: number) => {
        console.log(`[${index + 1}] ${page.url}`);
      });

      console.log('\nRelated Searches:');
      if (relatedSearches.length > 0) {
        relatedSearches.forEach((search: any, index: number) => {
          console.log(`[${index + 1}] ${search.text}`);
        });
      } else {
        console.log('No related searches found.');
      }

      const parsedResults = {
        webPages: webPages.map((page: any) => ({
          name: page.name,
          url: page.url,
          snippet: page.snippet,
          datePublished: page.datePublished,
          thumbnailUrl: page.thumbnailUrl,
        })),
        relatedSearches: relatedSearches.map((search: any) => search.text),
        totalEstimatedMatches: results.webPages?.totalEstimatedMatches || 0,
      };

      res.status(200).json({
        webPages: parsedResults.webPages,
        relatedSearches: parsedResults.relatedSearches,
        totalEstimatedMatches: parsedResults.totalEstimatedMatches
      });
    }
  } catch (error: any) {
    console.error('Bing Search API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    res.status(error.response?.status || 500).json({
      message: 'Error processing Bing Search request',
      error: error.message,
      status: error.response?.status
    });
  }
}
