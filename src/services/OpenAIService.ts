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
}

export async function* generateArticle(formData: FormData): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch('/api/generate-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: formData.description, stream: true }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`Failed to generate article: ${errorData.error || response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            return;
          }
          try {
            const parsedData = JSON.parse(data);
            if (parsedData.content) {
              yield parsedData.content;
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating article:', error);
    throw error;
  }
}