import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FormData } from '../../../types/FormData';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const formData: FormData = await request.json();

  const prompt = `Skriv en innholdsrik artikkel om ${formData.title}. Må være minst 2000 ord. 2-3 paragrafer mellom hver h2/h3. Forenkle setninger. Titler pakkes inn i <h1> eller <h2> og tekst pakkes inn i <p>, ikke inkludert noe annet en h1,h2,h3,p og ul.

    #VELDIG VIKTIG#: Når du skriver titler ta kun stor fortegn på første bokstav i h2 og h3, ikke noe annet.

    ${formData.additionalInfo ? `Her er litt ekstra informasjon om emnet:\n${formData.additionalInfo}\n\nBruk denne informasjonen for å berike artikkelen.` : ''}

    ${formData.articleStructure ? formData.articleStructure : ''}

    ${formData.includeSources ? `Her er en liste over relevante lenker om emnet: ${formData.relevantLinks}. Pakk inn relevante nøkkelord med en relevant lenke. Ikke bruk mer enn 3 til 5 lenker maksimalt!` : ''}

    ${formData.includeSources ? "Bruk <a> tagger for lenker med style='color: #06f;'." : ""}`;

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  const encoder = new TextEncoder();

  return new NextResponse(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(encoder.encode(content));
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    }
  );
}