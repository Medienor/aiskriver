import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import { summarizeText } from '@/services/library-summarize-ai'
import pdf from 'pdf-parse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET_NAME = 'pdfs'

async function ensureBucketExists() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('Error listing buckets:', listError)
    throw new Error('Unable to list storage buckets')
  }

  const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME)

  if (!bucketExists) {
    console.log(`Bucket '${BUCKET_NAME}' does not exist. Creating...`)
    const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: false  // Set to true if you want the files to be publicly accessible
    })
    
    if (createError) {
      console.error('Error creating bucket:', createError)
      throw new Error(`Failed to create bucket '${BUCKET_NAME}'`)
    }
    
    console.log(`Bucket '${BUCKET_NAME}' created successfully`)
  } else {
    console.log(`Bucket '${BUCKET_NAME}' already exists`)
  }
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlRegex);
  return urls || [];
}

export async function POST(req: Request) {
  try {
    await ensureBucketExists()

    const { file, articleId, name } = await req.json();

    if (!file || !articleId || !name) {
      return NextResponse.json({ error: 'File, article ID, or name is missing' }, { status: 400 });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(file.split(',')[1], 'base64');

    // Extract text content from PDF
    const pdfData = await pdf(fileBuffer);
    const pdfContent = pdfData.text;

    // Extract URLs from the PDF content
    const pdfSources = extractUrls(pdfContent);

    // Generate AI summary
    const pdfSummary = await summarizeText(pdfContent);

    // Generate a unique filename
    const fileName = `${uuidv4()}.pdf`;

    // Upload file to Supabase Storage
    console.log('Attempting to upload file to Supabase storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    console.log('File uploaded successfully:', uploadData);

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Insert new record into search_snippets table
    const { data: snippetData, error: snippetError } = await supabase
      .from('search_snippets')
      .insert({
        article_id: articleId,
        title: name, // Changed from `Uploaded PDF: ${name}` to just `name`
        url: publicUrl,
        text: pdfContent, // Changed from 'PDF Document' to actual PDF content
        favicon_url: '/pdf-icon.png',
        summary: pdfSummary, // Use the AI-generated summary here
        is_pdf: true,
        file_name: name,
        pdf_content: pdfContent,
        pdf_summary: pdfSummary,
        pdf_sources: pdfSources, // This is already an array, so we don't need to wrap it
      })
      .select()
      .single();

    if (snippetError) {
      throw new Error(`Error inserting snippet: ${snippetError.message}`);
    }

    return NextResponse.json({
      id: snippetData.id,
      url: publicUrl,
      message: 'PDF uploaded and processed successfully',
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json({ error: 'Error processing PDF' }, { status: 500 })
  }
}