import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, outlineType, userEmail } = req.body

  if (!prompt || !userEmail) {
    return res.status(400).json({ error: 'Prompt and user email are required' })
  }

  const contentId = uuidv4()

  try {
    // Create a new content entry in Supabase
    const { error: insertError } = await supabase
      .from('content')
      .insert({ 
        id: contentId,
        title: prompt.substring(0, 100), // Use the first 100 characters of the prompt as the title
        status: 'generating', 
        prompt, 
        outline_type: outlineType,
        user_id: userEmail
      })

    if (insertError) throw insertError

    // Send the content ID back to the client
    res.status(200).json({ contentId })

    // Start the OpenAI generation in the background
    generateContent(contentId, prompt)
  } catch (error) {
    console.error('Error initiating article generation:', error)
    res.status(500).json({ error: 'An error occurred while initiating article generation' })
  }
}

async function generateContent(contentId: string, prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    })

    const generatedContent = completion.choices[0]?.message?.content || ''

    // Update the content in Supabase with the generated content
    const { error: updateError } = await supabase
      .from('content')
      .update({ html_content: generatedContent, status: 'generated' })
      .eq('id', contentId)

    if (updateError) {
      console.error('Error updating content:', updateError)
    }
  } catch (error) {
    console.error('Error generating content:', error)
    await supabase
      .from('content')
      .update({ status: 'error' })
      .eq('id', contentId)
  }
}