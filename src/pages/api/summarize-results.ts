import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function summarizeText(text: string, searchQuery: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du er en hjelpsom assistent som forenkler og oppsummerer tekst på norsk." },
        { role: "user", content: `Oppsumer den viktigste informasjonen du kan finne basert på søkeresultatet "${searchQuery}". Ikke inkluder andre ting som er urelevant til søkeresultatet og gjør det mest mulig konsist og kort. Her er teksten:\n\n${text}` }
      ],
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "Ingen oppsummering generert.";
  } catch (error) {
    console.error('Error in summarizeText:', error);
    return "Feil ved generering av oppsummering.";
  }
}

async function finalSummary(summaries: string[], searchQuery: string) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Du er en hjelpsom assistent som lager en omfattende oppsummering basert på flere kilder." },
        { role: "user", content: `Basert på følgende oppsummeringer, lag en liste med de viktigste detaljene om emnet "${searchQuery}". Gi informasjonen på norsk og vær så konkret og informativ som mulig. Del opp teksten i kategorier om det trengs med <h3> for overskrifter, <p> for korte paragraf og <li> for lister og bruk <br> for mellomrom. Både titler, paragraf og listen bør høre sammen basert på hva du skal skrive om. Her har du mer informasjon knyttet til tema, bruk det til å lage en kortfattet, konsist og enkel oppsumering basert på dine instrukser: \n\n${summaries.join('\n\n')} Husk også at det er svært viktig at du kun fokuserer dine svar på hoved tema som er "${searchQuery}", du skal ikke gi oss noe svar tilbake som er urelevant til søket og tema: ${searchQuery}` }
      ],
      stream: true,
    });

    return stream;
  } catch (error) {
    console.error('Error in finalSummary:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { results, searchQuery } = req.body;

  if (!Array.isArray(results) || typeof searchQuery !== 'string') {
    return res.status(400).json({ error: 'Invalid input. Expected an array of results and a search query string.' });
  }

  try {
    const summaries = await Promise.all(
      results.map(result => summarizeText(result.text, searchQuery))
    );

    const stream = await finalSummary(summaries, searchQuery);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in summarize-results:', error);
    res.status(500).json({ error: 'An error occurred while summarizing the results.' });
  }
}