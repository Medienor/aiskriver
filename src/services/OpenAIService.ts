import OpenAI from 'openai';

function getOpenAIKey() {
  if (typeof window !== 'undefined') {
    // Client-side
    return process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  } else {
    // Server-side
    return process.env.OPENAI_API_KEY || '';
  }
}

const openai = new OpenAI({
  apiKey: getOpenAIKey(),
  dangerouslyAllowBrowser: true
});

interface FormData {
  title: string;
  articleType: string;
  keywords: string;
  description: string;
  tone: string;
  length: string;
  language: string;
  includeImages: boolean;
  includeVideos: boolean;
  includeSources: boolean;
  enableWebSearch: boolean;
  additionalInfo?: string;
  relevantLinks?: string;
  selectedSnippet: string | null;
}

export async function* generateArticle(formData: FormData): AsyncGenerator<string, void, unknown> {
  try {
    const prompt = createPrompt(formData);
    console.log('Calling OpenAI API for article generation...');
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-4', // or whichever model you prefer
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        console.log('Chunk received:', chunk.choices[0].delta.content); // Log each chunk
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    console.error('Error generating article:', error);
    throw error;
  }
}

function createPrompt(formData: FormData): string {
  let prompt = `Write an article with the following details:
    Title: ${formData.title}
    Type: ${formData.articleType}
    Keywords: ${formData.keywords}
    Description: ${formData.description}
    Tone: ${formData.tone}
    Length: ${formData.length}
    Language: ${formData.language}
    Include Images: ${formData.includeImages}
    Include Videos: ${formData.includeVideos}
    Include Sources: ${formData.includeSources}
    Enable Web Search: ${formData.enableWebSearch}
    Additional Info: ${formData.additionalInfo || 'N/A'}
    Relevant Links: ${formData.relevantLinks || 'N/A'}`;

  if (formData.selectedSnippet) {
    prompt += `\n\nPlease incorporate the following snippet into the article:\n${formData.selectedSnippet}`;
  }
    
  prompt += `\n\nPlease write a comprehensive article based on these parameters.`;

  return prompt;
}

export async function* streamTestPrompt(prompt: string): AsyncGenerator<string, void, unknown> {
  try {
    console.log('Calling OpenAI API for test prompt...');
    
    const stream = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        console.log('Chunk received:', chunk.choices[0].delta.content);
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    console.error('Error streaming test prompt:', error);
    throw error;
  }
}