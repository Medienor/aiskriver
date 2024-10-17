import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { talkingPoints, keywords, tone, audience, model, language, hiddenPrompt, customFields, hideFields } = body;

    const promptParts = [`${hiddenPrompt}\nSkriv en tekst om følgende:`];

    // Add custom fields to the prompt
    Object.entries(customFields).forEach(([key, value]) => {
      if (!hideFields.includes(key) && body[key]) {
        if (typeof value === 'object' && value !== null && 'label' in value && typeof value.label === 'string') {
          promptParts.push(`${value.label}: ${body[key]}`);
        }
      }
    });

    if (talkingPoints) promptParts.push(`Detaljer: ${talkingPoints}`);
    if (keywords) promptParts.push(`Bruk følgende nøkkelord i teksten: ${keywords}`);
    if (tone) promptParts.push(`Din tone i teksten skal være: ${tone}`);
    if (audience) promptParts.push(`Målgruppen teksten skal passe til skal være: ${audience}`);
    if (language) promptParts.push(`Språket du skal skrive på er: ${language}`);

    promptParts.push("Vennligst generer en velstrukturert og sammenhengende tekst som inkluderer disse elementene og gi det til meg i markdown format, svaret ditt skal være kun svaret. Du skal ikke svar meg tilbake eller kommunisere med meg, din jobb er å produsere innhold basert på mine kommandoer. Ikke bruk ` backticks eller skriv teksten i code blocks, skriv teksten i ren markdown. Det er viktig at titler skrives i norsk format, altså kun en stor forbokstav.");

    const prompt = promptParts.join('\n');

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    // Set up streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error in AI writer API:', error);
    return NextResponse.json({ error: 'An error occurred while generating the content.' }, { status: 500 });
  }
}