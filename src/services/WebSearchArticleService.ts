import { performWebSearch } from './ExaService';
import { generateArticle } from './OpenAIService';
import { supabase } from '../lib/supabase';
import { FormData } from '../types/FormData';

async function summarizeWebSearchResults(results: any[]): Promise<string> {
  const summaries = results.map(result => result.summary).join(' ');
  const prompt = `Summarize the most important parts of this information in 3 to 5 paragraphs and give it back to me in Norwegian language, do not give back unrelevant information outside the topic, do not mention websites. Just summarize the content which is being talked about\n\n${summaries}`;

  try {
    const response = await fetch('/api/generate-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, stream: false }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to generate summary: ${errorData.error}`);
    }

    const data = await response.json();
    console.log('OpenAI summary response:', data.content);
    return data.content || '';

  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

export async function generateArticleWithWebSearch(formData: FormData, articleId: string): Promise<void> {
  try {
    // Perform web search
    const searchResults = await performWebSearch(formData.title);
    console.log('Exa.js search results:', searchResults);

    // Extract URLs from search results
    const urls = searchResults.map(result => result.url);

    // Summarize web search results
    const summary = await summarizeWebSearchResults(searchResults);
    console.log('Summary sent to OpenAI for article generation:', summary);

    // Generate final article
    let finalPrompt = `
      Bruk følgende sammendrag som ekstra kontekst for å generere en artikkel i HTML format (Kun med <h1>, <h2>, <h3> <p> og <ul> tags, ikke noe annet.):
      ${summary}

      Her har du viktige detaljer på hvordan artikkelen skal se ut, det er særdeles viktig at du forholder deg til disse reglene:
      Title: ${formData.title}
      Article Type: ${formData.articleType}
      Keywords: ${formData.keywords}
      Description: ${formData.description}
      Tone: ${formData.tone}
      Length: ${formData.length}
      Language: ${formData.language}
      Include Images: ${formData.includeImages}
      Include Videos: ${formData.includeVideos}
      Include Sources: ${formData.includeSources}
    `.trim();

    if (formData.includeSources) {
      finalPrompt += `
        
        Her er en liste over lenker: ${urls.join(', ')}
        Velg de beste lenkene basert på nøkkelordmatch og lenk dem. Du kan gjøre dette ved å pakke nøkkelordet inn i en <a>-tag og legge til lenken som en href. Vennligst IKKE legg til mer enn ${formData.numberOfSources} lenker.
      `;
    }

    console.log('Final prompt sent to OpenAI:', finalPrompt);

    let fullContent = '';
    for await (const chunk of generateArticle({ ...formData, description: finalPrompt })) {
      fullContent += chunk;
      // Update the article with the generated content
      const { error: updateError } = await supabase
        .from('articles')
        .update({ 
          html: fullContent,
          status: 'generating'
        })
        .eq('articleid', articleId);

      if (updateError) {
        console.error('Error updating article content:', updateError);
        // Continue generating content even if update fails
      }
    }

    // Final update to set status to 'generated'
    const { error: finalUpdateError } = await supabase
      .from('articles')
      .update({ 
        status: 'generated',
        web_search_summary: summary
      })
      .eq('articleid', articleId);

    if (finalUpdateError) {
      console.error('Error updating final article status:', finalUpdateError);
      throw new Error(`Failed to update article status: ${finalUpdateError.message}`);
    }

  } catch (error) {
    console.error('Error in generateArticleWithWebSearch:', error);
    // Attempt to update the article status to 'error' if something goes wrong
    try {
      await supabase
        .from('articles')
        .update({ status: 'error' })
        .eq('articleid', articleId);
    } catch (updateError) {
      console.error('Failed to update article status to error:', updateError);
    }
    throw error;
  }
}