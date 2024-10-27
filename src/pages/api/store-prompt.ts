import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import OpenAI from 'openai'
import axios from 'axios'
import fetch from 'node-fetch'; // Make sure to import node-fetch
import { scrapeContent } from '@/lib/scrapeContent';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateTitle(theme: string): Promise<string> {
  const variantNumber = Math.floor(Math.random() * 25) + 1;
  const prompt = `Basert på dette tema: ${theme} gi meg en god overskrift til mitt dokument. Gi meg tittelen med kun en stor forbokstav, det er slik det skrives i Norge. Ikke gi meg noe annet enn kun tittelen og ikke putt den i "". Du har også 25 varianter du kan skrive denne tittelen på, denne skal skrives i variant nummer ${variantNumber} av 25. Det er svært viktig at denne tittelen skrives på norsk`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 50,
  });

  return completion.choices[0].message.content?.trim() || theme;
}

async function scrapeAndStoreContent(contentId: string, urls: string[]) {
  for (const url of urls) {
    try {
      console.log(`Starting to scrape URL: ${url}`);
      const scrapedText = await scrapeContent(url);

      const { data, error } = await supabase
        .from('scraped_content')
        .insert([
          {
            content_id: contentId,
            url: url,
            scraped_text: scrapedText
          }
        ]);

      if (error) {
        console.error('Error storing scraped content:', error);
      }
    } catch (error) {
      console.error(`Error scraping URL ${url}:`, error);
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the user's session
  const session = await getServerSession(req, res, authOptions)
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { 
    id, 
    prompt, 
    outline_type,
    article_type,
    projectId,
    keywords,
    description,
    tone,
    length,
    language,
    includeSources,
    numberOfSources,
    selectedSnippet,
    use_local_links,  // Change this line
    sitemap_id,       // Change this line
    academicLevel,
    vocationalProgram,
    subject,
    promptMemory,
    academic_level,
    search_urls,     // Add this line
    search_urls_news, // Add this line
    // ... other fields
    fetch_from_web,
  } = req.body

  console.log('Received data in store-prompt:', req.body);

  // Update these lines
  console.log('Received useLocalLinks:', use_local_links);
  console.log('Received sitemapId:', sitemap_id);

  try {
    // Fetch sitemap URLs if sitemap_id is provided and use_local_links is true
    let sitemapUrls = null;
    if (use_local_links && sitemap_id) {  // Update this line
      console.log('Fetching sitemap URLs for sitemapId:', sitemap_id);
      const { data: sitemapData, error: sitemapError } = await supabase
        .from('sitemaps')
        .select('urls')
        .eq('id', sitemap_id)  // Update this line
        .single()

      if (sitemapError) {
        console.error('Error fetching sitemap:', sitemapError);
        throw sitemapError;
      }
      sitemapUrls = sitemapData.urls;
      console.log('Fetched sitemap URLs:', sitemapUrls);
    } else {
      console.log('Skipping sitemap fetch: use_local_links or sitemap_id is falsy');
    }

    console.log('use_local_links:', use_local_links);
    console.log('sitemap_id:', sitemap_id);
    console.log('Fetched sitemap URLs:', sitemapUrls);

    // Fetch project name if projectId is provided
    let projectName = null;
    let projectIdNumber = null;
    if (projectId && projectId !== '') {
      projectIdNumber = parseInt(projectId, 10);
      const { data: projectData, error: projectError } = await supabase
        .from('project_folders')
        .select('name')
        .eq('id', projectIdNumber)
        .single()

      if (projectError) throw projectError
      projectName = projectData.name
    }

    console.log('Attempting to insert data:', {
      id, 
      title: prompt,
      prompt, 
      outline_type,
      article_type,
      user_id: session.user.email,
      // ... (log all other fields)
    });

    const status = outline_type === 'no-outline' ? 'generated' : 'draft';

    console.log('outline_type:', outline_type);
    console.log('status:', status);

    // Add this log
    console.log('Received length:', length);

    let title = prompt;
    let htmlContent = null;

    if (outline_type === 'no-outline') {
      title = await generateTitle(prompt); // Here we use 'prompt' as the theme
      htmlContent = `<h1>${title}</h1>`;
    }

    const insertObject = { 
      id, 
      title: title,
      prompt, 
      outline_type,
      article_type,
      project_id: projectIdNumber,
      project_name: projectName,
      keywords,
      description,
      tone,
      length,
      language,
      include_sources: includeSources,
      number_of_sources: numberOfSources,
      selected_snippet: selectedSnippet,
      use_local_links: use_local_links,
      sitemap_id: sitemap_id,
      sitemap_urls: sitemapUrls,
      search_urls: search_urls,
      search_urls_news: search_urls_news,
      academic_level: academicLevel,
      vocational_program: vocationalProgram,
      subject,
      status: status,
      user_id: session.user.email,
      html_content: htmlContent,
      fetch_from_web,
    };
    console.log('Object being inserted into Supabase:', insertObject);

    const { data, error } = await supabase
      .from('content')
      .insert([insertObject])
      .select()

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    // If a project was selected, link the article to the project folder
    if (projectIdNumber) {
      const { error: folderLinkError } = await supabase
        .from('folder_articles')
        .insert([
          {
            folder_id: projectIdNumber,
            article_id: id
          }
        ])

      if (folderLinkError) {
        console.error('Error linking article to folder:', folderLinkError)
      }
    }

    console.log('Prompt stored successfully:', data);

    // Only perform web search and scraping if fetch_from_web is true
    if (fetch_from_web) {
      if (search_urls) {
        const urlList = search_urls.split(',');
        await scrapeAndStoreContent(id, urlList);
      } else {
        console.log('No search_urls provided, skipping content scraping');
      }
    } else {
      console.log('fetch_from_web is false, skipping web search and content scraping');
    }

    console.log('Prompt and scraped content (if applicable) stored successfully:', data);
    res.status(200).json(data)
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Failed to store prompt or scraped content', details: error })
  }
}
