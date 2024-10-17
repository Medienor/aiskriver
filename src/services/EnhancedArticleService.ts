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

    // Create a list of links from search results
    const searchListOfLinks = urls.map(url => `<li>${url}</li>`).join('');

    // Create a list of links from sitemap if available
    let sitemapListOfLinks = '';
    if (formData.useLocalLinks && formData.sitemapUrls && formData.sitemapUrls.length > 0) {
      sitemapListOfLinks = formData.sitemapUrls.map((url: string) => `<li>${url}</li>`).join('');
    }

    // Create prompt using search results, sitemap links, and other form data
    const prompt = `
      Skriv en artikkel som bruker <h1>,<h2> og <h3> kombinert med paragrafer <p> og lister <li> om tema ${formData.title}.
      Bruk følgende informasjon som bakgrunn for artikkelen:
      ${summaries}

      Artikkeltype: ${formData.articleType}
      Nøkkelord: ${formData.keywords}
      Tone: ${formData.tone}
      Lengde på artikkelen (Det er svært viktig at du alltid skriver 2 til 3 paragrafer under hver seksjon/titte, dette er et krav.): ${formData.length}.
      Språk: ${formData.language}

      Her har du en liste over relevante lenker fra websøk:
      <ul>
      ${searchListOfLinks}
      </ul>

      ${formData.useLocalLinks ? `
      Her har du en liste over relevante lenker fra nettstedets sitemap du kan bruke. Ikke lenk opp til alle lenkene, kun de som passer til artikkelen og ikke lenk samme lenke flere ganger:
      <ul>
      ${sitemapListOfLinks}
      </ul>
      ` : ''}

      Pakk inn en eller flere relevante søkeord med valgfrie lenker fra disse listene. Det er viktig du bruker <a> på søkeordet du skal lenke til. Prioriter lenker fra sitemapet hvis de er tilgjengelige og relevante.

      ${formData.useLocalLinks ? `
      Husk: Ettersom du skriver innholdet, se om du finner relevante lenker fra nettstedets sitemap. Hvis du finner relevante lenker, lenk dem opp til passende søkeord i artikkelen.
      ` : ''}
    `;

    console.log('Prompt sent to OpenAI:', prompt);

    // Generate article using OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 16383,
    });

    return stream;
  } catch (error) {
    console.error('Error in generateEnhancedArticle:', error);
    throw error;
  }
}