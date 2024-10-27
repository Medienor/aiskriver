import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('generate-dropdown-content API called');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { 
    selectedOption,
    closestParagraph,
    closestTitle,
    h1Title
  } = req.body

  console.log('Selected option:', selectedOption);
  console.log('Closest paragraph:', closestParagraph || 'No nearby paragraph');
  console.log('Closest title:', closestTitle);
  console.log('H1 Title:', h1Title);

  if (!selectedOption || !h1Title) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Selected option and H1 title are required' })
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  })

  try {
    let promptInstruction = '';

    switch (selectedOption) {
      case 'Tekst':
        promptInstruction = `Basert på artikkeltittelen "${h1Title}" og den nærmeste overskriften "${closestTitle || 'Ingen nærliggende overskrift'}", skriv et kort avsnitt på 40-60 ord som passer naturlig inn i konteksten. Det siste avsnittet var: "${closestParagraph || 'Ingen nærliggende avsnitt'}". Sørg for at det nye avsnittet flyter godt med det eksisterende innholdet.`;
        break;
      case 'Tittel 2':
        promptInstruction = `Basert på artikkeltittelen "${h1Title}" og det siste avsnittet "${closestParagraph || 'Ingen nærliggende avsnitt'}", foreslå en passende Heading 2 (H2) overskrift som introduserer en ny hovedseksjon i artikkelen. Overskriften bør være kort, informativ og relevant for artikkelens overordnede tema. Du skal kun gi meg en overskrift, ingen forklaringer, du skal ikke bruke ## før tittel eller noe annet. Du skal kun gi meg en kort og relevant tittel knyttet til tema.`;
        break;
      case 'Tittel 3':
        promptInstruction = `Gitt artikkeltittelen "${h1Title}", den nærmeste overskriften "${closestTitle || 'Ingen nærliggende overskrift'}" og det siste avsnittet "${closestParagraph || 'Ingen nærliggende avsnitt'}", foreslå en passende Heading 3 (H3) overskrift som introduserer en underseksjon. Overskriften bør være kort og direkte relatert til den overordnede seksjonen. Du skal kun gi meg en overskrift, ingen forklaringer, du skal ikke bruke ## før tittel eller noe annet. Du skal kun gi meg en kort og relevant tittel knyttet til tema.`;
        break;
      case 'Punktliste':
      case 'Nummerert liste':
        promptInstruction = `Basert på artikkeltittelen "${h1Title}", den nærmeste overskriften "${closestTitle || 'Ingen nærliggende overskrift'}" og det siste avsnittet "${closestParagraph || 'Ingen nærliggende avsnitt'}", lag en kort liste med 3-5 punkter som er relevante for temaet. Sørg for at listen passer naturlig inn i konteksten.`;
        break;
      default:
        promptInstruction = `Basert på artikkeltittelen "${h1Title}", den valgte opsjonen "${selectedOption}", den nærmeste overskriften "${closestTitle || 'Ingen nærliggende overskrift'}" og det siste avsnittet "${closestParagraph || 'Ingen nærliggende avsnitt'}", generer passende innhold som passer naturlig inn i konteksten av artikkelen.`;
    }

    const prompt = `
      ${promptInstruction}

      VIKTIGE REGLER:
      1. Skriv alltid på norsk, uansett hva.
      2. Opptre som en ekte person med stor kunnskap om emnet ${h1Title}.
      3. Det genererte innholdet ditt skal flyte naturlig med den eksisterende teksten.
      4. Hold deg strengt til ordantallet eller formatet som er spesifisert i instruksjonen.
      5. Oppretthold en profesjonell og informativ tone.
      6. Ikke gjenta informasjon som allerede er til stede i artikkelen.
      7. Sørg for at svaret ditt er relevant for den nåværende seksjonen eller konteksten.

      Generer innholdet nå:
    `;

    console.log('Generated prompt:', prompt);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: true,
      max_tokens: 150,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        const chunkContent = chunk.choices[0].delta.content
        console.log('Received chunk from OpenAI:', chunkContent);
        res.write(`data: ${chunkContent}\n\n`)
        if ('flush' in res) {
          (res as any).flush()
        }
      }
    }
    
    res.write('data: [DONE]\n\n')
  } catch (error: unknown) {
    console.error('Error generating content:', error)
    res.write(`data: ${JSON.stringify({ error: 'An error occurred while generating the content' })}\n\n`)
  } finally {
    res.end()
  }
}
