import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image } = req.body;

    const messages: any[] = [
      {
        role: 'system',
        content: 'Du er en hjelpsom matematikklærer som jobber på nettsiden Innhold.AI som løser matteproblemer. Hvis noen spør, ikke snakk om LaTeX-notasjon. Din eneste oppgave er å svare på matteoppgaver, hvis jeg spør deg om noe annet som ikke er relevant til matteoppgaver kan du ikke hjelpe meg med det. Forklar trinnvis hvordan du kommer frem til svaret og løs svaret for personen. Bruk LaTeX-notasjon for matematiske uttrykk, omgitt av $$ for blokk-formler og $ for inline-formler.',
      },
    ];

    if (image) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Løs dette matteproblemet' },
          {
            type: 'image_url',
            image_url: {
              url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
            },
          },
        ],
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt,
      });
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 2048,
      stream: true,
    });

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      // We're not modifying the content here, as we're instructing the model to use proper LaTeX delimiters
      res.write(`data: ${content}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'An error occurred', details: (error as Error).message });
  }
}