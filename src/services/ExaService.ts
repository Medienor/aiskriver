import Exa from 'exa-js';

const exa = new Exa(process.env.NEXT_PUBLIC_EXA_API_KEY);

function encodeNorwegianCharacters(str: string): string {
  return str
    .replace(/æ/g, '%C3%A6')
    .replace(/ø/g, '%C3%B8')
    .replace(/å/g, '%C3%A5')
    .replace(/Æ/g, '%C3%86')
    .replace(/Ø/g, '%C3%98')
    .replace(/Å/g, '%C3%85');
}

export async function performWebSearch(title: string, category?: string) {
  try {
    const encodedTitle = encodeNorwegianCharacters(title);
    const query = `site:.no ${encodedTitle}`;
    console.log('Performing Exa search with query:', query);
    
    const searchOptions: any = {
      type: "auto",
      useAutoprompt: true,
      numResults: 3,
      text: true,
      summary: true
    };

    if (category) {
      searchOptions.category = category;
    }

    const response = await exa.searchAndContents(query, searchOptions);
    
    if (response.results.length === 0) {
      console.log("No results found. Consider broadening your search.");
      return [];
    }

    console.log('Exa.js search result URLs:');
    response.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.url}`);
    });

    const formattedResults = response.results.map((result, index) => {
      console.log(`Result ${index + 1}:`);
      console.log(`Title: ${result.title?.substring(0, 80) || 'No title'}...`);
      console.log(`URL: ${result.url}`);
      console.log(`Text: ${(result.text || 'Not available').substring(0, 80)}...`);
      // Remove the line logging the summary
      console.log(`Score: ${result.score}`);
      console.log('---');

      return {
        title: result.title || null,
        url: result.url,
        text: result.text || 'No text available', // Use only result.text
        summary: result.text ? result.text.substring(0, 200) + '...' : 'No summary available' // Create a summary from text
      };
    });

    console.log(`Autoprompt: ${response.autopromptString}`);

    return formattedResults;
  } catch (error) {
    console.error('Error in Exa search:', error);
    return [];
  }
}