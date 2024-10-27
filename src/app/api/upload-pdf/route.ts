import { NextRequest, NextResponse } from 'next/server'
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
      public: false
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

export const maxDuration = 60 // sets timeout to 60 seconds
export const dynamic = 'force-dynamic' // makes the route fully dynamic

export async function POST(req: NextRequest) {
  try {
    await ensureBucketExists()

    const { file, articleId, name, chatUuid } = await req.json();

    console.log('📥 Received PDF upload request:', { 
      fileName: name,
      articleId,
      chatUuid
    });

    if (!file || !articleId || !name || !chatUuid) {
      return NextResponse.json({ 
        error: 'File, article ID, name, or chat UUID is missing' 
      }, { status: 400 });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(file.split(',')[1], 'base64');

    // Generate a unique filename
    const fileName = `${uuidv4()}.pdf`;

    // Upload file to Supabase Storage
    console.log('📤 Attempting to upload file to Supabase storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('❌ Supabase storage upload error:', uploadError);
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    console.log('✅ File uploaded successfully:', uploadData);

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    // Insert initial record into search_snippets table with chat_uuid
    console.log('📝 Creating search snippet with chat UUID:', chatUuid);
    const { data: snippetData, error: snippetError } = await supabase
      .from('search_snippets')
      .insert({
        article_id: articleId,
        chat_uuid: chatUuid, // Add chat UUID here
        title: name,
        url: publicUrl,
        text: 'Processing PDF...',
        favicon_url: '/pdf-icon.png',
        summary: 'PDF is being processed...',
        is_pdf: true,
        file_name: name,
      })
      .select()
      .single();

    if (snippetError) {
      console.error('❌ Error inserting snippet:', snippetError);
      throw new Error(`Error inserting snippet: ${snippetError.message}`);
    }

    console.log('✅ Search snippet created successfully with chat UUID:', chatUuid);

    // Start asynchronous processing
    processPdfContent(snippetData.id, fileBuffer);

    return NextResponse.json({
      id: snippetData.id,
      url: publicUrl,
      chat_uuid: chatUuid, // Include chat UUID in response
      message: 'PDF uploaded successfully. Content is being processed.',
    })
  } catch (error) {
    console.error('❌ Error processing PDF:', error)
    return NextResponse.json({ error: 'Error processing PDF' }, { status: 500 })
  }
}

async function processPdfContent(snippetId: string, fileBuffer: Buffer) {
  try {
    console.log('🔄 Processing PDF content for snippet:', snippetId);
    // Extract text content from PDF
    const pdfData = await pdf(fileBuffer);
    const pdfContent = pdfData.text;

    // Extract URLs from the PDF content
    const pdfSources = extractUrls(pdfContent);

    // Generate AI summary
    const pdfSummary = await summarizeText(pdfContent);

    // Update the record in search_snippets table
    const { error: updateError } = await supabase
      .from('search_snippets')
      .update({
        text: pdfContent,
        summary: pdfSummary,
        pdf_content: pdfContent,
        pdf_summary: pdfSummary,
        pdf_sources: pdfSources,
      })
      .eq('id', snippetId);

    if (updateError) {
      console.error('❌ Error updating snippet:', updateError);
    } else {
      console.log('✅ PDF content processed and updated successfully');
    }
  } catch (error) {
    console.error('❌ Error processing PDF content:', error);
  }
}
