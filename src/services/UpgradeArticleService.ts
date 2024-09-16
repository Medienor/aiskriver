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

export interface UpgradeSettings {
  splitParagraphs: boolean;
  removeConclusions: boolean;
  reduceRepetition: boolean;
  simplifyComplexSentences: boolean;
  expandParagraphs: boolean;
}

export async function upgradeSelectedText(content: string): Promise<string> {
  console.log('upgradeSelectedText function called');
  console.log('Content length:', content.length);
  const prompt = createUpgradePrompt(content);
  console.log('Created upgrade prompt (first 200 characters):', prompt.substring(0, 200));

  try {
    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    console.log('Received response from OpenAI');
    return completion.choices[0].message.content || '';
  } catch (error) {
    console.error('Error in upgradeSelectedText:', error);
    throw error;
  }
}

function createUpgradePrompt(content: string): string {
  return `Ekspander og skriv mer om denne informasjonen ${content}. Vennligst gi meg det tilbake i to paragrafer med mellom 90 og 120 ord i hver paragraf. Det er viktig at paragrafene er skrevet på en måte som er enkel å forstå og skal ha følelsen av at det er skrevet av et ekte menneske. Vennligst også bruk mellomrom mellom paragrafene ved å bruke 2 stykker <br>.`;
}

// Remove this line as it's causing the duplicate export error
// export { upgradeSelectedText };