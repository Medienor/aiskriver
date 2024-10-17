export async function summarizeText(content: string, isPdf: boolean = false): Promise<string> {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, isPdf }),
    });

    if (!response.ok) {
      throw new Error('Failed to summarize text');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error in summarization:', error);
    return 'Failed to generate summary.';
  }
}