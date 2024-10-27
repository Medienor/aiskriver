import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { supabase } from '../../lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define an interface for the scraped content
interface ScrapedContent {
  url: string;
  scraped_text: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, suggestTitle, contentForTitleSuggestion } = req.body

  if (!id) {
    return res.status(400).json({ error: 'ID is required' })
  }

  // Add this line to create an AbortController
  const abortController = new AbortController();

  try {
    const { data, error } = await supabase
      .from('content')
      .select('*, user_subscriptions!inner(words_remaining, user_id)')
      .eq('id', id)
      .single()

    if (error) throw error

    console.log('Retrieved content data:', JSON.stringify(data, null, 2));

    let customPrompt
    if (suggestTitle) {
      customPrompt = createTitleSuggestionPrompt(contentForTitleSuggestion)
    } else {
      // Fetch scraped content if fetch_from_web is true
      let scrapedContent: ScrapedContent[] = []
      if (data.fetch_from_web === 'true' || data.fetch_from_web === true) {
        console.log('Fetching scraped content...');
        const { data: scrapedData, error: scrapedError } = await supabase
          .from('scraped_content')
          .select('url, scraped_text')
          .eq('content_id', id)
          .limit(10)

        if (scrapedError) throw scrapedError

        scrapedContent = scrapedData as ScrapedContent[]
        console.log(`Fetched ${scrapedContent.length} scraped content items`);
      } else {
        console.log('Skipping scraped content fetch as fetch_from_web is false');
      }

      // Ensure we're passing the correct length for Standard artikkel
      if (data.article_type === 'Standard artikkel') {
        data.length = data.length || data.wordCount || '1500'; // Use wordCount as fallback
      }
      customPrompt = createCustomPrompt(data, scrapedContent)
    }

    // Log the final prompt
    console.log("FINAL PROMPT SENT TO OPEN AI:", customPrompt);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    })

    // Determine max_tokens based on article type
    let max_tokens = 4096
    if (data.article_type === 'Standard artikkel') {
      const wordCount = parseInt(data.length) || 0
      if (wordCount > 1500) {
        max_tokens = 16384
      }
    } else if (data.article_type === 'Studentoppgave' || data.article_type === 'SEO-artikkel') {
      max_tokens = 16384
    }

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: customPrompt }],
      stream: true,
      max_tokens: suggestTitle ? 50 : max_tokens,
    })

    let generatedContent = ''

    // Add this event listener to handle client disconnection
    req.on('close', () => {
      console.log('Client disconnected');
      abortController.abort();
    });

    for await (const chunk of stream) {
      // Check if the request has been aborted
      if (abortController.signal.aborted) {
        console.log('Stream aborted');
        break;
      }

      if (chunk.choices[0]?.delta?.content) {
        const chunkContent = chunk.choices[0].delta.content
        generatedContent += chunkContent
        res.write(`data: ${chunkContent}\n\n`)
        if ('flush' in res) {
          (res as any).flush()
        }
      }
    }

    res.write('data: [DONE]\n\n')

    if (!suggestTitle && !abortController.signal.aborted) {
      // Count words in the generated content
      const wordCount = generatedContent.trim().split(/\s+/).length

      // Update the content in Supabase
      const { error: updateContentError } = await supabase
        .from('content')
        .update({ html_content: generatedContent, status: 'generated' })
        .eq('id', id)

      if (updateContentError) throw updateContentError

      // Deduct words from user's balance
      const newWordsRemaining = Math.max(data.user_subscriptions.words_remaining - wordCount, 0)
      const { error: updateSubscriptionError } = await supabase
        .from('user_subscriptions')
        .update({ words_remaining: newWordsRemaining })
        .eq('user_id', data.user_subscriptions.user_id)

      if (updateSubscriptionError) throw updateSubscriptionError

      // Log word count and remaining words server-side only
      console.log(`Words generated: ${wordCount}, Words remaining: ${newWordsRemaining}`);
    }
  } catch (error) {
    console.error('Error in article generation:', error)
    res.write(`data: ${JSON.stringify({ error: 'An error occurred while generating the article' })}\n\n`)
  } finally {
    res.end()
  }
}

function createTitleSuggestionPrompt(contentForTitleSuggestion: string): string {
  return `Based on the following content, suggest an appropriate h2 title that summarizes the main points or theme:

${contentForTitleSuggestion}

Please provide only the title with ## hashtags in front of it for markdown formatting, nothing else.`;
}

function createCustomPrompt(formData: any, scrapedContent: ScrapedContent[]): string {
  let basePrompt = `Skriv en artikkel som bruker <h1>,<h2> og <h3> kombinert med paragrafer <p> tema ${formData.prompt}, ikke bruk <li> eller <ul> lister. Skriv titler i Norsk format som kun er en stor forbokstav i begynnelsen av hver tittel. Det er svært viktig at du kun bruker h1,h2,h3 og ikke # eller ##`;

  basePrompt += `
    Artikkeltype: ${formData.article_type || 'Standard artikkel'}
  `;

  console.log('Article type:', formData.article_type);
  console.log('Word count:', formData.length);

  if (formData.article_type === 'Studentoppgave') {
    basePrompt = `Jeg skal skrive en studentoppgave. Skriv oppgaven min med <h1>,<h2> og <h3> for overskrifter, <p> for paragrafer, ikke bruk <ul> eller lister i Studentoppgaven. Oppgaven omhandler tema "${formData.prompt || 'ikke spesifisert'}", faget er ${formData.subject || 'ikke spesifisert'}, og jeg studerer foreløpig på ${formData.academic_level || 'ikke spesifisert'}`;
    
    if (formData.academic_level === 'Yrkesfaglige utdanningsprogram' && formData.vocational_program) {
      basePrompt += ` med fokus på ${formData.vocational_program}`;
    }

    // Add word count instruction if over 1500 words
    const wordCount = parseInt(formData.length) || 0;
    if (wordCount > 1500) {
      basePrompt += `\n\nDu skal skrive denne artikkelen med ${wordCount} ord, dette er kjempe viktig!`;
    }

    basePrompt += `\n\nVennligst skriv en omfattende studentoppgave om temaet "${formData.prompt}" for faget ${formData.subject} basert på disse parametrene. Bruk <h1>,<h2> og <h3> for overskrifter, <p> for paragrafer, ikke bruk <ul> eller lister i Studentoppgaven. Skriv titler i norsk format med kun stor forbokstav i begynnelsen av hver tittel.`;
  } else if (formData.article_type === 'SEO-artikkel') {
    console.log('SEO Article Data:');
    console.log('use_local_links:', formData.use_local_links);
    console.log('sitemap_id:', formData.sitemap_id);
    console.log('sitemap_urls:', formData.sitemap_urls);

    basePrompt += `
      Prosjekt: ${formData.project_name || 'Ikke spesifisert'} (ID: ${formData.project_id || 'Ikke spesifisert'})
      Nøkkelord: ${formData.keywords || 'Ikke spesifisert'}
      Beskrivelse: ${formData.description || 'Ikke spesifisert'}
      Tone: ${formData.tone || 'Ikke spesifisert'}
      Lengde på artikkelen: ${formData.length || 'Ikke spesifisert'}
      Språk: ${formData.language || 'Norsk'}
      Inkluder kilder: ${formData.include_sources ? 'Ja' : 'Nei'}
      Antall kilder: ${formData.number_of_sources || 'N/A'}
    `;

    if (formData.use_local_links && formData.sitemap_urls) {
      console.log('Adding sitemap URLs to prompt');
      basePrompt += `\n\nBruk lokale lenker: Ja\nHer har du mange relevante lenker fra nettsiden du skal skrive en artikkel til. Ettersom du skriver innholdet, kan du se om du finner relevante lenker fra mitt sidekart. Om du finner relevante lenker, kan du lenke dem opp til relevante søkeord. Her er mitt nettkart:\n${formData.sitemap_urls}`;
    } else {
      console.log('No sitemap URLs found or use_local_links is false');
    }
  } else if (formData.article_type === 'Standard artikkel') {
    const wordCount = formData.length || '1500'; // Use the stored length
    console.log('Word count for Standard artikkel:', wordCount); // Add this log
    basePrompt += `\n\nDu skal skrive denne artikkelen her ${wordCount} ord, det er svært viktig! Skriv en standard artikkel basert på temaet og de gitte parametrene.`;
  }

  switch (formData.outline_type) {
    case 'no-outline':
      basePrompt += ' Ikke inkluder noen standard overskrifter, la innholdet flyte naturlig.';
      break;

    case 'standard':
      basePrompt += ' Bruk standard overskrifter som Introduksjon, Metoder(Minst 2 avsnitt), Resultater, Diskusjon, Konklusjon. Titler skal være skrevet i norsk stil og format. Her er regler som er svært viktig at du følger, les nøye: Tidlig i Introduksjonen vil jeg at du referer til en relevant kilde vi har lagt med og nevner relevant fakta som er viktig til tema og gjerne lenker videre til kilden på et relevant søkeord, lenken skal pakkes inn i en html <a> tag med en relevant ord som passer til teksten. Det er svært viktig at hver tittel får minimum 2 avsnitt hver, ikke noe mindre en dette. Det er viktig at du prøver å legge til relevant informasjon som gjør teksten mer innholdsrik. Du kan være kreativ med hvordan du formulerer avsnittene, men de må være naturlige og passe til temaet. Du kan også direkte sitere relevant informasjon jeg har gitt deg, men du må refere det til nettsiden informasjonen ble hentet ifra. Følg alle disse reglene og produser en fantastisk artikkel.';
      break;
      
    case 'creative':
      basePrompt += ' Generer kreative og engasjerende overskrifter basert på artikkelens innhold. Titler skal være skrevet i norsk stil og format.';
      break;
  }

  // Add scraped content to the prompt if available
  if (scrapedContent.length > 0) {
    basePrompt += `\n\nHer er relevant informasjon jeg fant på nettet du kan bruke til å skrive artikkelen din:\n`;
    
    // Only add the first 2 scraped contents
    scrapedContent.slice(0, 2).forEach((item, index) => {
      basePrompt += `Fra ${item.url} fant jeg: ${item.scraped_text}\n\n`;
    
      // Log a small part (50 characters) of the scraped content
      console.log(`Scraped content ${index + 1} (first 50 chars):`, item.scraped_text.substring(0, 50));
    });
    
    // Add the full list of URLs
    const fullListOfUrls = scrapedContent.map(item => item.url).join(', ');
    basePrompt += `\nHer er en liste over relevante lenker du kan lenke til i artikkelen: ${fullListOfUrls}. Bruk disse underveis i artikkelen på relevante ord du mener kan passe. Ikke legg dem nederst men pakk dem i <a> i relevante ord som er naturlig i teksten..`;
    
    basePrompt += `\nVennligst bruk denne informasjonen for å berike artikkelen, men ikke kopier direkte. Omformulér og integrer informasjonen på en naturlig måte.`;
  }

  basePrompt += `\n\nVennligst skriv en omfattende artikkel basert på disse parametrene.`;

  return basePrompt;
}
