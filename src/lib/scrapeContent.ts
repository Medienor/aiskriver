import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeContent(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      responseType: 'arraybuffer'
    });

    // Check content type
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('text/html')) {
      console.log(`Skipping non-HTML content: ${url}`);
      return null;
    }

    // Detect encoding and decode content
    const encoding = detectEncoding(response.data);
    const html = new TextDecoder(encoding).decode(response.data);

    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, iframe, header, nav, footer, .ads, #ads, .sidebar, .comments').remove();

    // Focus on main content areas
    const mainContent = $('main, #main, .main, article, .article, .content, .post');

    let content = '';
    if (mainContent.length > 0) {
      content = mainContent.text();
    } else {
      content = $('body').text();
    }

    // Clean up the text
    content = content
      .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
      .replace(/\n+/g, '\n')  // Replace multiple newlines with a single newline
      .trim();  // Remove leading and trailing whitespace

    // Remove any remaining HTML tags
    content = content.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    content = decodeHTMLEntities(content);

    // Check if the content is valid
    if (!isValidContent(content)) {
      console.log(`Skipping invalid content: ${url}`);
      return null;
    }

    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

function detectEncoding(buffer: Buffer): string {
  // Simple encoding detection, can be expanded for more accurate results
  const utf8 = buffer.toString('utf8');
  const ascii = buffer.toString('ascii');

  if (utf8 === ascii) {
    return 'ascii';
  } else {
    return 'utf8';
  }
}

function isValidContent(text: string): boolean {
  // Check if the text contains a high percentage of printable ASCII characters
  const printableASCII = text.replace(/[^\x20-\x7E]/g, '');
  const validRatio = printableASCII.length / text.length;

  // Check for minimum content length and valid character ratio
  return text.length > 100 && validRatio > 0.9;
}

function decodeHTMLEntities(text: string) {
  const entities = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'"
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, function(match) {
    return (entities as { [key: string]: string })[match] || match;
  });
}
