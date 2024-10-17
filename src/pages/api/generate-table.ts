import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your environment variables
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { heading, paragraph } = req.body;

  if (!heading || !paragraph) {
    return res.status(400).json({ error: 'Missing heading or paragraph' });
  }

  const prompt = `You will have to make a HTML table for me, this table will be added under a section containing this title:${heading} and a paragraph that will be over the table,${paragraph}. The title and paragraph is just context for you to know what the table is about. The table will contain information about the topic ${heading} but you can use your own imagination to create an amazing table with unique data that is relevant to the topic of my article.
It's very important that you return me this HTML table in HTML format with no styling and no class names, just pure html table. Your job is to create a table that will be used in an article, based on the information you have recieved build a table for me. Do not include the content from the title or the paragraph into my table. Your response should only contain the HTML table and nothing else, this is very important.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that creates HTML tables based on given information" },
        { role: "user", content: prompt },
      ],
    });

    const tableHtml = completion.choices[0].message.content || '';
    res.status(200).json({ tableHtml });
  } catch (error) {
    console.error('Error generating table:', error);
    res.status(500).json({ error: 'Failed to generate table' });
  }
}