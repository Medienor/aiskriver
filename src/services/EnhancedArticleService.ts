import { performWebSearch } from './ExaService';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEnhancedArticle(formData: any) {
  try {
    // Perform web search
    const searchResults = await performWebSearch(formData.title);
    console.log('Exa.js search results:', searchResults);

    // Extract summaries and URLs from search results
    const summaries = searchResults.map(result => result.summary).join(' ');
    const urls = searchResults.map(result => result.url);

    // Create a list of links
    const listOfLinks = urls.map(url => `<li>${url}</li>`).join('');

    // Create prompt using search results and list of links
    const prompt = `
      Skriv en artikkel som bruker <h1>,<h2> og <h3> kombinert med paragrafer <p> og lister <li> om tema ${formData.title}.
      Bruk følgende informasjon som bakgrunn for artikkelen:
      ${summaries}

      Artikkeltype: ${formData.articleType}
      Nøkkelord: ${formData.keywords}
      Tone: ${formData.tone}
      Lengde minimum: ${formData.length} (Skriv alltid to eller fler paragrafer under titler)
      Språk: ${formData.language}

      Her har du en liste over relevante lenker:
      <ul>
      ${listOfLinks}
      </ul>
      Pakk inn en eller flere relevante søkeord med valgfrie lenker fra denne listen. Det er viktig du bruker <a> på søkeordet du skal lenke til.
    `;

    console.log('Prompt sent to OpenAI:', prompt);

    // Generate article using OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error in generateEnhancedArticle:', error);
    throw error;
  }
}