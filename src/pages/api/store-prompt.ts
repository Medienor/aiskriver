import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/pages/api/auth/[...nextauth]'  // Updated import path

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
    academic_level
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

    const initialContent = outline_type === 'no-outline' ? '<h1>Uten tittel</h1>' : null;
    const status = outline_type === 'no-outline' ? 'generated' : 'draft';

    console.log('outline_type:', outline_type);
    console.log('status:', status);

    // Add this log
    console.log('Received length:', length);

    const { data, error } = await supabase
      .from('content')
      .insert([
        { 
          id, 
          title: outline_type === 'no-outline' ? 'Uten tittel' : prompt,
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
          academic_level: academicLevel,
          vocational_program: vocationalProgram,
          subject,
          status: status,
          user_id: session.user.email,
          html_content: initialContent
        }
      ])
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

    console.log('Prompt stored successfully:', data)
    res.status(200).json(data)
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ error: 'Failed to store prompt', details: error })
  }
}
