import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { supabase } from '../../lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Function to strip HTML tags
function stripHtmlTags(html: string): string {
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { articleId } = req.body;

  try {
    // Fetch content from Supabase
    const { data, error } = await supabase
      .from('content')
      .select('html_content')
      .eq('id', articleId)
      .single();

    if (error) throw error;

    const content = stripHtmlTags(data.html_content);

    // Generate keywords using OpenAI
    const prompt = `Basert på denne artikkelen og teksten skal du gi meg en JSON liste med relevante søkeord du kan finne i teksten. Det er svært viktig at det er korte søkeord fordi ditt svar skal brukes til å søke opp i Store Norske Leksikon og lengre søkeord er vanskelig å finne, du må vurdere tema og kategorien til teksten og du kan tenkte utenfor boksen og gjerne gi meg relevante søkeord som kanskje ikke dukker opp i teksten, men som faktisk er relatert til hovedkategorien teksten er skrevet i og omhandler. Du skal ikke inkludere ord som er ordklasse verb, adjektiv, pronomen, determinativ, preposisjon, adverb, subjunksjon, konjunksjon eller interjeksjon. Du skal kun gi meg JSON-listen tilbake, du skal ikke svare på noe annet eller bekrefte jobben etc. Her er teksten: ${content}`;

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    let buffer = '';
    for await (const chunk of stream) {
      buffer += chunk.choices[0]?.delta?.content || '';
      const words = buffer.match(/"([^"]+)"/g);
      if (words) {
        for (const word of words) {
          res.write(`data: ${word}\n\n`);
        }
        buffer = buffer.slice(buffer.lastIndexOf('"') + 1);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred', error: (error as Error).message });
  }
}
