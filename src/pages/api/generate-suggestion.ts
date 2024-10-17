import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { parse } from 'node-html-parser'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function extractRelevantContent(root: any, selectionStart: number, clientData: any): { 
  h1: string, 
  relevantContent: string, 
  lastParagraph: string, 
  currentTitle: string, 
  isNewTitleWithoutContent: boolean,
  isNewLineAfterH1: boolean,
  currentH2: string
} {
  let h1 = '';
  let relevantContent = '';
  const lastParagraph = clientData.currentParagraph || '';
  const currentTitle = clientData.closestH2Title?.title || '';
  const isNewTitleWithoutContent = false;
  const isNewLineAfterH1 = false;
  const currentH2 = clientData.closestH2Title?.level === 'h2' ? clientData.closestH2Title.title : '';

  const nodes = root.querySelectorAll('h1, h2, h3, p');
  const relevantNodes = [];
  let foundCurrentTitle = false;

  // Iterate through nodes in reverse order
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    
    if (node.tagName === 'H1') {
      h1 = node.textContent.trim();
      break; // Stop when we reach H1
    }

    if (foundCurrentTitle) {
      relevantNodes.unshift(node); // Add to the beginning of the array
    }

    if ((node.tagName === 'H2' || node.tagName === 'H3') && node.textContent.trim() === currentTitle) {
      foundCurrentTitle = true;
      relevantNodes.unshift(node); // Include the current title
    }
  }

  relevantContent = relevantNodes.map(node => {
    if (node.tagName === 'H2' || node.tagName === 'H3') {
      return `[${node.tagName}] ${node.textContent.trim()}`;
    } else {
      return node.textContent.trim();
    }
  }).join('\n\n');

  return { 
    h1, 
    relevantContent, 
    lastParagraph, 
    currentTitle, 
    isNewTitleWithoutContent,
    isNewLineAfterH1,
    currentH2
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('generate-suggestion API called');
  
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { 
    content, 
    relevantContent, 
    selectionStart, 
    isNewEmptyLine, 
    currentParagraph, 
    closestH2Title, 
    currentSentence, 
    isSentenceEnd,
    currentTitle,
    surroundingContext
  } = req.body

  console.log('Received content length:', content?.length || 'undefined');
  console.log('Received relevant content length:', relevantContent?.length || 'undefined');
  console.log('Received selectionStart:', selectionStart);
  console.log('Is new empty line:', isNewEmptyLine);
  console.log('XXX CLOSEST PARAGRAPH:', currentParagraph || 'undefined');
  console.log('XXX CLOSEST TITLE:', closestH2Title ? `${closestH2Title.level}: ${closestH2Title.title}` : 'undefined');
  console.log('XXX CURRENT SENTENCE:', currentSentence || 'undefined');
  console.log('Is sentence end:', isSentenceEnd);
  console.log('Current title:', currentTitle ? `${currentTitle.level}: ${currentTitle.text}` : 'undefined');

  if (!content || !relevantContent || selectionStart === undefined || isNewEmptyLine === undefined) {
    console.log('Missing required fields');
    return res.status(400).json({ error: 'Content, relevant content, selection start, and isNewEmptyLine are required' })
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  })

  try {
    const root = parse(content);
    const extractedContent = extractRelevantContent(root, selectionStart, {
      currentParagraph,
      closestH2Title,
      currentSentence
    });
    
    console.log('Extracted content:', extractedContent);

    const { h1, relevantContent: extractedRelevantContent, lastParagraph, currentTitle: extractedCurrentTitle, isNewTitleWithoutContent, isNewLineAfterH1, currentH2 } = extractedContent;
    
    console.log('Extracted H1:', h1);
    console.log('Extracted relevant content:', extractedRelevantContent);
    console.log('Last paragraph (upwards):', lastParagraph);
    console.log('Current title (closest upwards):', extractedCurrentTitle);
    console.log('Is new title without content:', isNewTitleWithoutContent);
    console.log('Current H2 is:', currentH2);

    // Use the client-provided data for the prompt
    const titleToUse = closestH2Title?.title || '';

    let promptInstruction = '';
    const articleContext = relevantContent.split('\n\n').slice(0, 2).join('\n\n');

    if (isNewEmptyLine) {
      promptInstruction = `Artikkel Tittel: ${h1}\n\nGjeldende H2 Seksjon: ${currentH2}\n\nInnhold: ${extractedRelevantContent}\n\nSiste Avsnitt: ${lastParagraph || '(tomt)'}\n\nBasert på dette innholdet og den gjeldende H2-seksjonen, vennligst generer et avsnitt på 75 til 100 ord som passer sømløst med det eksisterende innholdet og fortsetter diskusjonen innenfor den gjeldende seksjonen.`;
    } else if (isNewLineAfterH1) {
      promptInstruction = `Du skriver en introduksjon for en artikkel med tittelen "${h1}". Vennligst generer et kort introduksjonsavsnitt på 75-100 ord som setter konteksten for artikkelen og engasjerer leseren. Dette bør gi en generell oversikt over hva artikkelen vil dekke.`;
    } else if (isNewTitleWithoutContent) {
      if (currentH2 === titleToUse) {
        promptInstruction = `Artikkel Tittel: ${h1}\n\nArtikkel Kontekst: ${articleContext}\n\nGjeldende H2 Seksjon: ${currentH2}\n\nDu starter en ny hovedseksjon av artikkelen. Basert på artikkeltittelen, konteksten og den gjeldende H2-seksjonstittelen, vennligst generer et avsnitt på 75-100 ord som introduserer denne seksjonen. Dette bør gi kontekst for hva denne seksjonen vil dekke og hvordan den relaterer seg til den overordnede artikkelen.`;
      } else {
        promptInstruction = `Artikkel Tittel: ${h1}\n\nGjeldende H2 Seksjon: ${currentH2}\n\nGjeldende Underseksjon: ${titleToUse}\n\nBasert på artikkeltittelen, den gjeldende H2-seksjonen og underseksjonstittelen, vennligst generer et avsnitt på 75-100 ord som starter denne underseksjonen. Dette bør fortsette artikkelen sømløst, gi relevant informasjon eller utvide emnet som introduseres av den gjeldende tittelen.`;
      }
    } else if (isSentenceEnd) {
      promptInstruction = `Basert på dette avsnittet "${currentSentence}" - Gi et kort, innsiktsfullt svar på spørsmålet, ta hensyn til konteksten. Generer 15 til 30 ord.`;
    } else {
      // This is for continuing a sentence or paragraph
      promptInstruction = `Basert på dette avsnittet "${currentSentence}" - Fortsett teksten naturlig, oppretthold stilen og fokuset i innholdet. Generer 15 til 30 ord.`;
    }

    const prompt = `
      ${promptInstruction}

      VIKTIGE REGLER:
      1. Skriv alltid på norsk, uansett hva.
      2. Opptre som en ekte person med stor kunnskap om emnet ${h1}.
      3. Det genererte innholdet ditt skal flyte naturlig med den eksisterende teksten.
      4. Hold deg strengt til ordantallet som er spesifisert i instruksjonen.
      5. Oppretthold stilen, tonen og fokuset i det eksisterende innholdet.
      6. Ikke gjenta informasjon som allerede er til stede i artikkelen.
      7. Sørg for at svaret ditt er relevant for den nåværende seksjonen eller konteksten.

      Generer innholdet nå:
    `;

    console.log('Generated prompt:', prompt);

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      stream: true,
      max_tokens: isNewLineAfterH1 || isNewTitleWithoutContent ? 150 : isNewEmptyLine ? 100 : 50,
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
    console.error('Error generating suggestion:', error)
    res.write(`data: ${JSON.stringify({ error: 'An error occurred while generating the suggestion' })}\n\n`)
  } finally {
    res.end()
  }
}
