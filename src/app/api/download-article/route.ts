import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const { content, format } = await req.json();

    let fileBuffer: Buffer;
    let contentType: string;
    let fileName: string;

    if (format === 'pdf') {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(content);
      const pdfBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      // Convert Uint8Array to Buffer
      fileBuffer = Buffer.from(pdfBuffer);
      contentType = 'application/pdf';
      fileName = 'article.pdf';
    } else {
      fileBuffer = Buffer.from(content);
      contentType = 'text/html';
      fileName = 'article.html';
    }

    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error in download-article route:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}