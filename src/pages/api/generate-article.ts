import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, stream = true } = req.body

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing prompt' })
    }

    if (stream) {
      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      })

      const stream = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || ''
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`)
        }
      }

      res.write(`data: [DONE]\n\n`)
      res.end()
    } else {
      // Non-streaming response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      })
      const content = completion.choices[0]?.message?.content || ''
      res.status(200).json({ content })
    }
  } catch (error) {
    console.error('Error generating article:', error)
    res.status(500).json({ error: 'Failed to generate article', details: error instanceof Error ? error.message : 'Unknown error' })
  }
}