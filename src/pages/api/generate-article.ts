import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { supabase } from '../../lib/supabase'
import { generateEnhancedArticle } from '../../services/EnhancedArticleService'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id, suggestTitle, contentForTitleSuggestion } = req.body

  if (!id) {
    return res.status(400).json({ error: 'ID is required' })
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    console.log('Retrieved content data:', JSON.stringify(data, null, 2));

    let customPrompt
    if (suggestTitle) {
      customPrompt = createTitleSuggestionPrompt(contentForTitleSuggestion)
    } else {
      // Ensure we're passing the correct length for Standard artikkel
      if (data.article_type === 'Standard artikkel') {
        data.length = data.length || data.wordCount || '1500'; // Use wordCount as fallback
      }
      customPrompt = createCustomPrompt(data)
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

    for await (const chunk of stream) {
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

    if (!suggestTitle) {
      const { error: updateError } = await supabase
        .from('content')
        .update({ html_content: generatedContent, status: 'generated' })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }
    }
  } catch (error) {
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

function createCustomPrompt(formData: any): string {
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
      basePrompt += ' Bruk standard overskrifter som Introduksjon, Metoder, Resultater, Diskusjon, Konklusjon.';
      break;
    case 'creative':
      basePrompt += ' Generer kreative og engasjerende overskrifter basert på artikkelens innhold.';
      break;
  }

  basePrompt += `\n\nVennligst skriv en omfattende artikkel basert på disse parametrene.`;

  return basePrompt;
}
