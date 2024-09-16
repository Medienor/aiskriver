import axios from 'axios';

export interface CopyscapeResult {
  isPlagiarized: boolean;
  percentPlagiarized: number;
  sources: Array<{
    url: string;
    title: string;
    matchedWords: number;
    percentMatched: number;
  }>;
}

export async function checkPlagiarism(text: string): Promise<CopyscapeResult> {
  try {
    console.log('Content being sent to Copyscape (first 200 characters):', text.substring(0, 200));
    console.log('Total content length:', text.length);
    const response = await axios.post('/api/check-plagiarism', { text });
    return response.data;
  } catch (error) {
    console.error('Error checking plagiarism:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw new Error('Failed to check plagiarism. Please try again.');
  }
}