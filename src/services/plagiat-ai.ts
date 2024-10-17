export const streamCompletion = async (
    prompt: string,
    onChunk: (chunk: string) => void,
    systemMessage: string = 'You are a helpful assistant.'
  ) => {
    const response = await fetch('/api/plagiat-openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, systemMessage }),
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }
  
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          onChunk(data);
        }
      }
    }
  };