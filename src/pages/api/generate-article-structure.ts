import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { prompt } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    const result = completion.choices[0].message.content || '';
    res.status(200).json({ result });
  } catch (error) {
    console.error('Error generating article structure:', error);
    res.status(500).json({ error: 'Failed to generate article structure' });
  }
}