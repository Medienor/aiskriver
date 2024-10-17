import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { content, isPdf } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'No content provided for summarization' }, { status: 400 });
    }

    const promptPrefix = isPdf 
      ? "The following is the content of a PDF document. Please summarize it: "
      : "Please summarize the following text: ";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes text." },
        { role: "user", content: `${promptPrefix}${content}\n\nProvide a summary in Norwegian. If you use any HTML tags, only use <h2> and <p>.` }
      ],
      max_tokens: 16000
    });

    const summary = response.choices[0].message.content || "Unable to generate summary.";

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarization API:', error);
    return NextResponse.json({ error: 'An error occurred while summarizing the text.' }, { status: 500 });
  }
}