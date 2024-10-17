import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, systemMessage } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemMessage || 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        const chunkContent = chunk.choices[0].delta.content;
        res.write(`data: ${chunkContent}\n\n`);
        if ('flush' in res) {
          (res as any).flush();
        }
      }
    }

    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Error in toolbar-openai:', error);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred: ' + (error as Error).message })}\n\n`);
  } finally {
    res.end();
  }
}