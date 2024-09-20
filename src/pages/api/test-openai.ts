import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { performWebSearch } from '../../services/ExaService';
import { supabase } from '../../lib/supabase';
import { generateEnhancedArticle } from '../../services/EnhancedArticleService';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function createCustomPrompt(formData: any): string {
  const basePrompt = `Skriv en artikkel som bruker <h1>,<h2> og <h3> kombinert med paragrafer <p> og lister <li> om tema ${formData.title}.`;

  const additionalDetails = `
    Artikkeltype: ${formData.articleType}
    Nøkkelord: ${formData.keywords}
    Beskrivelse: ${formData.description}
    Tone: ${formData.tone}
    Lengde på artikkelen (Det er svært viktig at du alltid skriver 2 til 3 paragrafer under hver seksjon/titte, dette er et krav.): ${formData.length}
    Språk: ${formData.language}
    Inkluder bilder: ${formData.includeImages ? 'Ja' : 'Nei'}
    Inkluder videoer: ${formData.includeVideos ? 'Ja' : 'Nei'}
    Inkluder kilder: ${formData.includeSources ? 'Ja' : 'Nei'}
    Tilleggsinformasjon: ${formData.additionalInfo || 'N/A'}
    Relevante lenker: ${formData.relevantLinks || 'N/A'}
  `;

  let prompt = `${basePrompt}\n\nBruk følgende detaljer i artikkelen:\n${additionalDetails}`;

  if (formData.selectedSnippet) {
    prompt += `\n\nVennligst inkorporer følgende innhold i artikkelen:\n${formData.selectedSnippet}`;
  }

  prompt += `\n\nVennligst skriv en omfattende artikkel basert på disse parametrene.`;

  return prompt;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const formData = req.body;

  if (!formData || !formData.title) {
    return res.status(400).json({ error: 'Form data is required' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  try {
    console.log('Calling OpenAI API...');

    let stream;
    if (formData.enableWebSearch) {
      stream = await generateEnhancedArticle(formData);
    } else {
      const customPrompt = createCustomPrompt(formData);
      console.log('Custom prompt:', customPrompt);
      stream = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: customPrompt }],
        stream: true,
        max_tokens: 16383,

      });
    }

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        const chunkContent = chunk.choices[0].delta.content;
        res.write(`data: ${chunkContent}\n\n`);
        if ('flush' in res) {
          (res as any).flush();
        }
      }
    }

    // Signal the end of the stream
    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Error in test-openai:', error);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred: ' + (error as Error).message })}\n\n`);
  } finally {
    res.end();
  }
}