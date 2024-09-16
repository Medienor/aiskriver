import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function POST(request: Request) {
  try {
    const { content, format } = await request.json();

    let fileBuffer: Buffer;
    let contentType: string;
    let fileName: string;

    if (format === 'pdf') {
      // Generate PDF
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(content);
      fileBuffer = await page.pdf({ format: 'A4' });
      await browser.close();

      contentType = 'application/pdf';
      fileName = 'article.pdf';
    } else if (format === 'docx') {
      // Generate DOCX
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(content)],
            }),
          ],
        }],
      });

      fileBuffer = await Packer.toBuffer(doc);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileName = 'article.docx';
    } else {
      throw new Error('Invalid format');
    }

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error in download-article API route:', error);
    return NextResponse.json({ error: 'Failed to generate file' }, { status: 500 });
  }
}