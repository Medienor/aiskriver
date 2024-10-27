import { NextResponse } from 'next/server';
import axios from 'axios';

const BING_AUTOSUGGEST_ENDPOINT = process.env.BING_AUTOSUGGEST_V7_ENDPOINT;
const BING_SUBSCRIPTION_KEY = process.env.BING_SEARCH_V7_SUBSCRIPTION_KEY;

export async function GET(request: Request) {
  console.log('Autosuggest API called');
  const startTime = Date.now();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  console.log(`Query received: "${query}"`);
  console.log(`BING_AUTOSUGGEST_ENDPOINT: ${BING_AUTOSUGGEST_ENDPOINT}`);
  console.log(`BING_SUBSCRIPTION_KEY set: ${!!BING_SUBSCRIPTION_KEY}`);

  if (!query) {
    console.log('Error: Query parameter is missing');
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    console.log(`Sending request to Bing Autosuggest API for query: "${query}"`);
    const response = await axios.get(BING_AUTOSUGGEST_ENDPOINT!, {
      params: {
        q: query,
        mkt: 'nb-NO',  // Changed to Norwegian
      },
      headers: {
        'Ocp-Apim-Subscription-Key': BING_SUBSCRIPTION_KEY,
      },
    });

    console.log('Received response from Bing Autosuggest API');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Autosuggest API request completed in ${duration}ms`);

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching autosuggest results:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error response:', error.response?.data);
      console.error('Error config:', error.config);
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`Autosuggest API request failed after ${duration}ms`);

    return NextResponse.json({ error: 'Failed to fetch suggestions', details: error.message }, { status: 500 });
  }
}