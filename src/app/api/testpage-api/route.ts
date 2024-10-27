import { NextResponse } from 'next/server';
import axios from 'axios';
import { scrapeContent } from '@/lib/scrapeContent';
import { chatWithOpenAI } from '@/services/ai-chat-openai-service';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

let openAICallCount = 0;

export async function POST(req: Request) {
  console.log('testpage-api POST called');
  const encoder = new TextEncoder();

  try {
    const { query } = await req.json();
    console.log('Received query:', query);

    console.log('Performing Bing search');
    const searchResponse = await axios.get(`${BASE_URL}/api/bing-search-chat?query=${encodeURIComponent(query)}&count=6`);
    const searchResults = searchResponse.data.webPages;
    const relatedSearches = searchResponse.data.relatedSearches || [];
    console.log('Bing search results:', searchResults.length);

    console.log('Scraping content from search results');
    const scrapedContents = await Promise.all(
      searchResults.slice(0, 6).map(async (result: any) => {
        const content = await scrapeContent(result.url);
        return {
          url: result.url,
          content: content ? content.slice(0, 500) : ''
        };
      })
    );
    console.log('Scraped content from', scrapedContents.length, 'results');

    const combinedContent = scrapedContents
      .filter(item => item.content)
      .map((item, index) => `Source ${index + 1} <a href="${item.url}">${item.url}</a>:\n${item.content}`)
      .join('\n\n');

    console.log('Preparing messages for OpenAI');
    const messages = [
      { role: "system" as const, content: 'You are a helpful assistant that provides informative responses based on search results. Format your response using only HTML tags <h3> for important titles, <p> for paragraphs, <ul> and <li> for lists, and <a> for relevant links. Do not use any other HTML tags.' },
      { role: "user" as const, content: `The user has searched for "${query}". Your task is to interpret the intent behind this search query and use the information I provide from relevant sources to craft an informative and context-appropriate response. It is essential that you analyze the nature of the query first. Follow these steps for crafting a response that best serves the user's needs:

Determine the Query Context: Identify if the search query implies a specific intent, such as:

Pricing Information: If the query includes terms like "cost," "price," "affordable," or similar, focus on providing an accurate breakdown of prices, cost factors, and any variations in costs.
Academic or Research-Oriented Inquiry: If the query is structured to seek in-depth knowledge, analysis, theories, or background information, provide a comprehensive, factual response with a balanced perspective, omitting speculation or simplified explanations.
Technical or Practical Instructions: For queries that seem related to how-to guides, setup instructions, troubleshooting, or technical specifics, structure your response as a step-by-step or detailed practical guide, including relevant technical terms or procedures.
General Knowledge or Informational Content: If the query appears open-ended or general, aim to give a well-rounded overview that covers major points without unnecessary detail.
Information Extraction and Relevance: Only extract relevant information from the provided content, focusing on the specific angle of the user's query. Avoid including redundant or tangential information that doesn't directly address the search query's intent.

Concise and Contextual Presentation: Present the information in a clear, structured way that highlights key points relevant to the query type. Avoid direct citations of sources; instead, synthesize the information into a coherent, informative list or paragraph that flows naturally and logically.

User-Centric Language: Use language that matches the user's likely level of expertise based on the query context. For general or beginner queries, use simplified language. For more advanced, technical queries, don't shy away from precise terminology and a more sophisticated tone.

Additional Guidelines:

Do Not Rephrase the User's Query: Avoid repeating or rephrasing what the user searched for. Begin directly with relevant information without restating the query or assuming the users intent.
Skip Conclusions and Summaries: Do not include any summary or concluding statements, like "In conclusion." Focus solely on presenting the necessary information concisely and in direct response to the query, without general takeaways or further reading suggestions.
Direct, Factual Information Only: Present only the essential details, avoiding commentary or additional context beyond the information provided.

Information Sources Provided: ${combinedContent}

Based on these steps, generate a response that best serves the user's query intent. Aim to provide clarity, relevance, and an actionable or insightful response aligned with the nature of their search.` }
    ];

    console.log('Calling OpenAI');
    openAICallCount++;
    console.log(`OpenAI call count: ${openAICallCount}`);
    const stream = await chatWithOpenAI(messages);

    console.log('Creating ReadableStream for response');
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send search results first
          controller.enqueue(encoder.encode('[SEARCH_RESULTS]'));
          controller.enqueue(encoder.encode(JSON.stringify(searchResults)));
          controller.enqueue(encoder.encode('\n\n'));

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            controller.enqueue(encoder.encode(content));
          }
          // Send related searches after the main content
          controller.enqueue(encoder.encode('\n\n[RELATED_SEARCHES]'));
          controller.enqueue(encoder.encode(JSON.stringify(relatedSearches)));
          controller.enqueue(encoder.encode('[DONE]'));
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      },
    });

    console.log('Sending response');
    return new Response(readable, {
      headers: { 'Content-Type': 'text/event-stream' },
    });

  } catch (error: unknown) {
    console.error('Error in testpage-api:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Internal Server Error', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
