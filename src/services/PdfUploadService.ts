import { v4 as uuidv4 } from 'uuid';

interface UploadPdfParams {
  file: File;
  articleId: string;
  chatUuid: string;
}

export async function uploadPdf({ file, articleId, chatUuid }: UploadPdfParams) {
  try {
    console.log('🔄 Starting PDF upload process:', { 
      fileName: file.name,
      chatUuid // Log to verify we have it
    });
    
    const base64File = await fileToBase64(file);

    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64File,
        articleId,
        name: file.name,
        chatUuid // Make sure we're sending it
      }),
    });

    if (!response.ok) {
      throw new Error('PDF upload failed');
    }

    const result = await response.json();

    // Verify the chatUuid is in the response
    console.log('📤 PDF upload successful, chat UUID:', chatUuid);

    return {
      ...result,
      chat_uuid: chatUuid // Ensure it's included in the return object
    };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}