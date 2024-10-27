import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages, articleContent, articleId, pdfContent } = await req.json()

  try {
    console.log('Received messages:', messages);
    console.log('PDF content received:', pdfContent ? 'Yes (length: ' + pdfContent.length + ')' : 'No');

    // Filter out 'search' messages and transform them into 'assistant' messages
    const validMessages = messages.map((msg: any) => {
      if (msg.role === 'search') {
        return {
          role: 'assistant',
          content: `Search results: ${msg.content}\n${msg.searchResults?.map((result: any, index: number) => 
            `${index + 1}. ${result.title}: ${result.summary}`
          ).join('\n')}\n\nFull text of search results:\n${msg.fullText}`
        };
      }
      return msg;
    }).filter((msg: any) => ['system', 'assistant', 'user'].includes(msg.role));

    // Create a context string that includes both article and PDF content
    const contextString = `
You are an AI Chat assistant working for Innhold.AI. You are helping with an article.

ARTICLE CONTENT:
${articleContent}

${pdfContent ? `PDF CONTENT:
${pdfContent}

Please consider both the article content and PDF content in your responses. If a user asks about specific information, check both sources.` : ''}

Instructions:
1. Use both the article content and PDF content (if available) to provide comprehensive answers
2. If information appears in both sources, mention this and note any differences
3. When formatting responses:
   - Use <b> tags for bold text
   - Use <h3> tags for smaller headings
   - Use <ul> and <li> tags for lists
4. Provide specific, contextual answers based on the available content
5. Never give generic answers - always reference specific information from the article or PDF`;

    console.log('Sending request to OpenAI with context and messages');

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: contextString
        },
        ...validMessages
      ],
      stream: true,
    });

    console.log('Received stream from OpenAI');

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          console.log('Sending chunk to client:', content);
          controller.enqueue(encoder.encode(content));
        }
        controller.enqueue(encoder.encode('[DONE]'));
        controller.close();
        console.log('Stream closed');
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in AI chat API route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}