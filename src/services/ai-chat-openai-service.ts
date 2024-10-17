import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function chatWithOpenAI(messages: OpenAI.Chat.ChatCompletionMessageParam[]) {
  return openai.chat.completions.create({
    model: "gpt-4o-mini", // or use "gpt-3.5-turbo" if you prefer
    messages: [
      { role: "system", content: "You are an AI Chat assistant and you work for the service called Innhold.AI. Your job is only to help me as the user regarding the topic we are working on." },
      ...messages
    ],
    stream: true,
  });
}