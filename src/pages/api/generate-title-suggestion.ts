import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { parse } from 'node-html-parser'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { content } = req.body

  if (!content) {
    return res.status(400).json({ error: 'Content is required' })
  }

  try {
    const root = parse(content);
    const { lastTitle, lastFourParagraphs } = extractRelevantContent(root);

    const prompt = `
      Based on the following content, generate an appropriate h2 title that summarizes the main points or theme:

      Last Title: ${lastTitle}

      Last Four Paragraphs:
      ${lastFourParagraphs.join('\n\n')}

      Please provide the title in HTML format, using the <h2> tag. Please try to keep the title short and to the point. Ensure that only the first letter of the title is capitalized, unless there are proper nouns that require capitalization.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
    });

    let suggestedTitle = completion.choices[0].message.content?.trim() || '';

    // Remove ```html, ```, and ''' characters
    suggestedTitle = suggestedTitle.replace(/```html|```|'''/g, '');

    // Extract the title text without HTML tags
    const titleText = suggestedTitle.replace(/<\/?h2>/g, '').trim();

    // Add hashtags and arrow
    const formattedTitle = `## ${titleText} ↓`;

    res.status(200).json({ title: formattedTitle, rawTitle: titleText });
  } catch (error) {
    console.error('Error generating title suggestion:', error);
    res.status(500).json({ error: 'An error occurred while generating the title suggestion' });
  }
}

function extractRelevantContent(root: any): { lastTitle: string, lastFourParagraphs: string[] } {
  let lastTitle = '';
  const paragraphs: string[] = [];
  const contentNodes = root.childNodes.filter((node: any) => node.nodeType === 1);

  for (let i = contentNodes.length - 1; i >= 0; i--) {
    const node = contentNodes[i];
    if (node.tagName === 'P') {
      paragraphs.unshift(node.textContent.trim());
      if (paragraphs.length === 4) break;
    } else if ((node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3') && !lastTitle) {
      lastTitle = node.textContent.trim();
    }
  }

  return { lastTitle, lastFourParagraphs: paragraphs };
}
