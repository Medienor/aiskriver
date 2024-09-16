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

export async function* upgradeFullArticle(content: string, settings: UpgradeSettings): AsyncGenerator<string> {
  console.log('upgradeFullArticle function called with settings:', settings);
  console.log('Content length:', content.length);
  const prompt = createUpgradePrompt(content, settings);
  console.log('Created upgrade prompt (first 200 characters):', prompt.substring(0, 200));

  try {
    console.log('Calling OpenAI API...');
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      if (chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    console.error('Error in upgradeFullArticle:', error);
    throw error;
  }
}

function createUpgradePrompt(content: string, settings: UpgradeSettings): string {
  const promptParts = ["Din jobb er å forbedre hele denne artikkelen så mye du kan."];

  if (settings.splitParagraphs) {
    promptParts.push("Del opp paragrafer til 1-3 setninger.");
  }
  if (settings.removeConclusions) {
    promptParts.push("Fjern konklusjon midt i paragrafer.");
  }
  if (settings.reduceRepetition) {
    promptParts.push("Minsk repetering.");
  }
  if (settings.simplifyComplexSentences) {
    promptParts.push("Forenkle komplekse setninger.");
  }
  if (settings.expandParagraphs) {
    promptParts.push("Utvid og ekspander paragrafer.");
  }

  promptParts.push(`Her har du artikkelen:\n\n${content}\n\nDet er viktig du gir meg hele artikkelen tilbake helt komplett med justeringene og oppgraderingene jeg spurte etter.`);

  return promptParts.join(" ");
}