import { v4 as uuidv4 } from 'uuid';

export async function uploadPdf(file: File, articleId: string) {
  try {
    // Convert file to base64
    const base64File = await fileToBase64(file);

    // Send the file to your server
    const response = await fetch('/api/upload-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: base64File,
        articleId: articleId,
        name: file.name,
      }),
    });

    if (!response.ok) {
      throw new Error('PDF upload failed');
    }

    const result = await response.json();

    return {
      id: result.id,
      title: file.name,
      url: result.url,
      text: 'PDF Document',
      favicon_url: '/pdf-icon.png',
      summary: `Uploaded PDF: ${file.name}`,
      is_pdf: true,
      file_name: file.name,
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