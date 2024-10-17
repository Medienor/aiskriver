import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages, articleContent, articleId } = await req.json()

  try {
    console.log('Received messages:', messages);

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

    console.log('Sending request to OpenAI with filtered messages:', validMessages);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are an AI Chat assistant working for Innhold.AI. You are helping with an article. Here's the current content of the article:

${articleContent}

Your job is to assist the user with any questions or tasks related to this article. If we ever reach a point where your answer will include bolded text, list or smaller headings please give them to be in their respective html brackets like <b>,<h3> or <li> / <ul>. Never give me generic answers, always be specific to the article and the user's question.`
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
          console.log('Received chunk:', content);
          controller.enqueue(encoder.encode(content));
        }
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