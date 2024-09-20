export async function* streamMatteProblem(prompt: string, imageDataUrl?: string | null) {
  const response = await fetch('/api/matteloser', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, image: imageDataUrl }),
  });

  if (!response.ok) {
    throw new Error('Failed to solve math problem');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('data: ')) {
        const data = trimmedLine.slice(6);
        if (data === '[DONE]') {
          return;
        }
        if (data) {
          yield data;
        }
      }
    }
  }
}