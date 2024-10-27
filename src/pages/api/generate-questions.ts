import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { topic, contentId } = req.body

  console.log('Received request:', { topic, contentId });

  if (!topic || !contentId) {
    console.log('Missing topic or contentId');
    return res.status(400).json({ error: 'Topic and contentId are required' })
  }

  try {
    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Make sure this is the correct model name
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates relevant questions based on a given topic.' },
        { role: 'user', content: `Generate 5 questions based on this topic: ${topic}. Keep the questions short and relevant. Return the response as a JSON array of strings. The questions must be in Norwegian.` }
      ],
      max_tokens: 150,
    })

    console.log('OpenAI API response:', response);

    const content = response.choices[0].message.content
    if (!content) {
      console.log('No content generated from OpenAI');
      throw new Error('No content generated')
    }

    console.log('Raw content from OpenAI:', content);

    let questions;
    try {
      // Remove Markdown code block syntax if present
      const cleanedContent = content.replace(/```json\n|\n```/g, '').trim();
      questions = JSON.parse(cleanedContent);
      console.log('Parsed questions:', questions);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }

    console.log('Updating Supabase content...');
    const { data, error } = await supabase
      .from('content')
      .update({ questions: questions })
      .eq('id', contentId)
      .select()

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error('Failed to update content with questions')
    }

    console.log('Supabase update result:', data);

    res.status(200).json({ success: true, questions })
  } catch (error) {
    console.error('Error generating questions:', error)
    res.status(500).json({ error: 'An error occurred while generating questions' })
  }
}
