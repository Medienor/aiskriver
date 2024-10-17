import Exa from "exa-js";

const exa = new Exa(process.env.NEXT_PUBLIC_EXA_API_KEY || '');

const cache: { [key: string]: any } = {};

function encodeNorwegianCharacters(str: string): string {
  return str
    .replace(/æ/g, '%C3%A6')
    .replace(/ø/g, '%C3%B8')
    .replace(/å/g, '%C3%A5')
    .replace(/Æ/g, '%C3%86')
    .replace(/Ø/g, '%C3%98')
    .replace(/Å/g, '%C3%85');
}

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return '/default-favicon.png'; // Provide a default favicon path
  }
}

function getFeaturedImageUrl(result: any): string | null {
  // Try to find a featured image URL from the Exa.js result
  if (result.image) {
    return result.image;
  }
  
  // If no specific image field, try to find an image URL in the metadata
  if (result.metadata && Array.isArray(result.metadata)) {
    const ogImage = result.metadata.find((meta: any) => 
      meta.name === 'og:image' || meta.property === 'og:image'
    );
    if (ogImage && ogImage.content) {
      return ogImage.content;
    }
  }

  // If no image found, return null
  return null;
}

export async function performQuickWebSearch(query: string) {
  const encodedQuery = encodeNorwegianCharacters(query);
  const searchQuery = `site:.no ${encodedQuery}`;

  if (cache[searchQuery]) {
    console.log('Returning cached results');
    return cache[searchQuery];
  }

  try {
    console.log('Performing quick Exa search with query:', searchQuery);

    const searchOptions = {
      type: "auto",
      useAutoprompt: true,
      numResults: 10,
      text: true,
      highlights: {
        numSentences: 2
      },
      summary: true,
      metadata: true
    };

    console.log('Exa API request options:', JSON.stringify(searchOptions, null, 2));

    const response = await fetch('/api/exa-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        options: searchOptions
      }),
    });

    const result = await response.json();

    console.log('Full Exa API response:', JSON.stringify(result, null, 2));
    console.log('Resolved search type:', result.resolvedSearchType);
    console.log('Autoprompt:', result.autopromptString);

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

    if (result.results.length === 0) {
      console.log("No results found.");
      return { finalSummaryStream: new ReadableStream(), results: [] };
    }

    const summaryResponse = await fetch('/api/summarize-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ results: result.results, searchQuery: query }),
    });

    // Return the response body as a ReadableStream
    const finalSummaryStream = summaryResponse.body;

    if (!finalSummaryStream) {
      throw new Error('No response body');
    }

    const sortedResults = result.results.sort((a: any, b: any) => (b.score ?? 0) - (a.score ?? 0));

    const formattedResults = sortedResults.map((result: any) => ({
      title: result.title || 'No title',
      url: result.url,
      snippet: result.text?.substring(0, 200) || '', // Keep a short snippet for preview
      text: result.text || '', // Include the full text
      favicon: getFaviconUrl(result.url),
      image: getFeaturedImageUrl(result), // Use the new function here
      score: result.score ?? 0,
      publishedDate: result.publishedDate,
      highlights: result.highlights,
    }));

    return { finalSummaryStream, results: formattedResults };
  } catch (error) {
    console.error('Error in quick Exa search:', error);
    return { finalSummaryStream: new ReadableStream(), results: [] };
  }
}