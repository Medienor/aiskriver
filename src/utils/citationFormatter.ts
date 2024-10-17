// Add these helper functions at the top of the file

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function decodeURL(url: string): string {
  try {
    return decodeURIComponent(url);
  } catch (error) {
    console.error('Error decoding URL:', error);
    return url;
  }
}

// Update the Citation interface to make title optional
interface Citation {
  id: string;
  article_id: string;
  citation: string;
  full_citation: string;
  title?: string;
  article_url?: string;
  authors?: string;
  last_updated?: string;  // Add this line
  // Add other fields as necessary, e.g.:
  // authors?: string[];
  // publicationDate?: string;
  // sourceName?: string;
  // volume?: string;
  // issue?: string;
  // pages?: string;
}

function formatAPA7(citation: Citation): string {
  console.log('Formatting APA7 citation:', citation);

  // Extract authors from the full_citation if authors field is not available
  const authors = citation.authors ? citation.authors.split(', ') : extractAuthors(citation.full_citation);
  
  // Format authors
  const authorString = formatAuthorsAPA(authors);
  console.log('Formatted authors:', authorString);
  
  // Extract year from last_updated if available, otherwise from full_citation
  const year = citation.last_updated 
    ? citation.last_updated.match(/\((\d{4})/)?.[1] || 'u.å.'
    : extractYear(citation.full_citation);
  console.log('Year:', year);
  
  // Capitalize the first letter of the title
  const title = citation.title ? capitalizeFirstLetter(citation.title) : extractTitle(citation.full_citation);
  console.log('Formatted title:', title);
  
  // Construct the APA citation
  let apaCitation = '';
  
  if (authorString) {
    apaCitation += `${authorString} `;
  }
  
  apaCitation += `(${year}). ${title}`;
  
  // Add "I Store norske leksikon" if it's from SNL
  if (citation.article_url && citation.article_url.includes('snl.no')) {
    apaCitation += '. I Store norske leksikon';
  }
  
  // Decode the URL
  if (citation.article_url) {
    apaCitation += `. ${decodeURL(citation.article_url)}`;
  }
  
  console.log('Final APA7 citation:', apaCitation.trim());
  return apaCitation.trim();
}

// Update this function to return a formatted string
function extractYearAndDate(fullCitation: string): string {
  const yearMatch = fullCitation.match(/\((\d{4})\)/);
  const dateMatch = fullCitation.match(/(\d{1,2})\.\s*(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)/i);
  
  let result = '(';
  if (yearMatch) {
    result += yearMatch[1];
  } else {
    result += 'u.å.';
  }
  
  if (dateMatch) {
    result += `, ${dateMatch[1]}. ${dateMatch[2].toLowerCase()}`;
  }
  
  result += ')';
  return result;
}

function formatMLA9(citation: Citation): string {
  // Use the title from the citation object, fallback to extracting from full_citation if not available
  const title = citation.title 
    ? `"${capitalizeFirstLetter(citation.title)}."` 
    : (extractTitle(citation.full_citation) ? `"${extractTitle(citation.full_citation)}."` : '');
  
  // Extract year from last_updated if available, otherwise from full_citation
  const year = citation.last_updated 
    ? citation.last_updated.match(/\((\d{4})/)?.[1] || ''
    : extractYear(citation.full_citation);
  
  // Get current date for "Lest" date in Norwegian format
  const currentDate = new Date();
  const norwegianMonths = ['jan.', 'feb.', 'mars', 'april', 'mai', 'juni',
    'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'des.'];
  const formattedDate = `${currentDate.getDate()}. ${norwegianMonths[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  
  // Construct the MLA citation
  let mlaCitation = title;  // Start with the title
  
  if (citation.article_url && citation.article_url.includes('snl.no')) {
    mlaCitation += ' Store norske leksikon,';
  }
  
  if (year) {
    mlaCitation += ` ${year},`;
  }
  
  // Decode and add the URL
  if (citation.article_url) {
    mlaCitation += ` ${decodeURL(citation.article_url)}`;
  }
  
  // Add the "Lest" date in Norwegian
  mlaCitation += `. Lest ${formattedDate}.`;
  
  return mlaCitation.trim();
}

function formatIEEE(citation: Citation): string {
  // Extract author information
  const authors = extractAuthors(citation.full_citation);
  
  // Format authors
  const authorString = formatAuthorsIEEE(authors);
  
  // Extract and format publication year
  const year = extractYear(citation.full_citation);
  
  // Format title (should be in quotes for IEEE)
  const title = `"${citation.title}"`;
  
  // Format source (e.g., journal name, conference name)
  const source = extractSource(citation.full_citation);
  
  // Extract volume and issue (if available)
  const { volume, issue } = extractVolumeAndIssue(citation.full_citation);
  
  // Extract page numbers (if available)
  const pages = extractPages(citation.full_citation);
  
  // Construct the IEEE citation
  let ieeeCitation = `${authorString}, ${title}, `;
  
  if (source) {
    ieeeCitation += `${source}, `;
  }
  
  if (volume) {
    ieeeCitation += `vol. ${volume}, `;
  }
  
  if (issue) {
    ieeeCitation += `no. ${issue}, `;
  }
  
  if (pages) {
    ieeeCitation += `pp. ${pages}, `;
  }
  
  ieeeCitation += `${getMonthAbbreviation(extractMonth(citation.full_citation))} ${year}`;
  
  // Add DOI or URL if available
  if (citation.article_url) {
    if (citation.article_url.startsWith('https://doi.org/')) {
      ieeeCitation += `, doi: ${citation.article_url.replace('https://doi.org/', '')}`;
    } else {
      ieeeCitation += `. [Online]. Available: ${decodeURL(citation.article_url)}`;
    }
  }
  
  ieeeCitation += '.';
  
  return ieeeCitation;
}

export function formatCitation(citation: Citation, style: string): {
  text: string;
  url: string | null;
} {
  let formattedText = '';
  const url = citation.article_url || null;

  switch (style) {
    case 'APA7':
      formattedText = formatAPA7(citation);
      break;
    case 'MLA9':
      formattedText = formatMLA9(citation);
      break;
    case 'IEEE':
      formattedText = formatIEEE(citation);
      break;
    default:
      formattedText = citation.full_citation;
  }

  // Remove the URL from the formatted text if it exists
  if (url) {
    formattedText = formattedText.replace(url, '').trim();
    // Remove any trailing punctuation after removing the URL
    formattedText = formattedText.replace(/[.,;]$/, '');
  }

  return { text: formattedText, url };
}

// Helper functions

function extractAuthors(fullCitation: string): string[] {
  const authorPart = fullCitation.split('(')[0].trim();
  if (authorPart.includes('&')) {
    return authorPart.split('&').map(author => author.trim());
  } else {
    return [authorPart];
  }
}

function formatAuthorsAPA(authors: string[]): string {
  if (authors.length === 0) {
    return '';
  }

  const formattedAuthors = authors.map(author => {
    const parts = author.split(' ').filter(part => part.length > 0);
    if (parts.length > 1) {
      const lastName = parts.pop() || '';
      const initials = parts.map(name => (name[0] || '').toUpperCase() + '.').join(' ');
      return `${lastName}, ${initials}`;
    }
    return author;
  });

  if (formattedAuthors.length === 1) {
    return formattedAuthors[0];
  } else if (formattedAuthors.length === 2) {
    return `${formattedAuthors[0]} & ${formattedAuthors[1]}`;
  } else if (formattedAuthors.length <= 20) {
    return formattedAuthors.slice(0, -1).join(', ') + `, & ${formattedAuthors[formattedAuthors.length - 1]}`;
  } else {
    return formattedAuthors.slice(0, 19).join(', ') + `, . . . ${formattedAuthors[formattedAuthors.length - 1]}`;
  }
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) {
    return ''; // If no author, MLA uses the title first, which is handled in the main function
  } else if (authors.length === 1) {
    const parts = authors[0].split(' ').filter(part => part.length > 0);
    if (parts.length > 1) {
      const lastName = parts.pop() || '';
      return `${lastName}, ${parts.join(' ')}`;
    }
    return authors[0];
  } else if (authors.length === 2) {
    return `${authors[0]}, and ${authors[1]}`;
  } else {
    return `${authors[0]}, et al.`;
  }
}

function extractYear(fullCitation: string): string {
  const match = fullCitation.match(/\((\d{4})\)/);
  return match ? match[1] : 'u.å.'; // 'u.å.' for 'uten årstall' (without year)
}

function extractSource(fullCitation: string): string {
  // This is a simplified extraction. You might need a more robust parser depending on your data.
  const parts = fullCitation.split('.');
  return parts.length > 2 ? parts[2].trim() : '';
}

function extractPublicationDate(fullCitation: string): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dateRegex = new RegExp(`(${months.join('|')})\\s+(\\d{1,2}),?\\s+(\\d{4})`, 'i');
  const match = fullCitation.match(dateRegex);
  return match ? `${match[1]} ${match[2]}, ${match[3]}` : '';
}

// Helper functions for IEEE formatting

function formatAuthorsIEEE(authors: string[]): string {
  if (authors.length === 1) {
    return authors[0];
  } else if (authors.length === 2) {
    return `${authors[0]} and ${authors[1]}`;
  } else if (authors.length > 2) {
    return `${authors[0]} et al.`;
  }
  return '';
}

function extractVolumeAndIssue(fullCitation: string): { volume: string | null, issue: string | null } {
  const match = fullCitation.match(/vol\.\s*(\d+)(?:,\s*no\.\s*(\d+))?/i);
  return {
    volume: match ? match[1] : null,
    issue: match && match[2] ? match[2] : null
  };
}

function extractPages(fullCitation: string): string | null {
  const match = fullCitation.match(/pp\.\s*(\d+(?:-\d+)?)/i);
  return match ? match[1] : null;
}

function extractMonth(fullCitation: string): string {
  const norwegianMonths = [
    'januar', 'februar', 'mars', 'april', 'mai', 'juni', 
    'juli', 'august', 'september', 'oktober', 'november', 'desember'
  ];
  const monthRegex = new RegExp(norwegianMonths.join('|'), 'i');
  const match = fullCitation.match(monthRegex);
  return match ? match[0].toLowerCase() : '';
}

function getMonthAbbreviation(month: string): string {
  const monthAbbreviations: { [key: string]: string } = {
    'Jan': 'Jan.', 'Feb': 'Feb.', 'Mar': 'Mar.', 'Apr': 'Apr.', 'May': 'May', 'Jun': 'Jun.',
    'Jul': 'Jul.', 'Aug': 'Aug.', 'Sep': 'Sep.', 'Oct': 'Oct.', 'Nov': 'Nov.', 'Dec': 'Dec.'
  };
  return monthAbbreviations[month] || '';
}

function extractDate(fullCitation: string): string {
  const dateRegex = /(\d{1,2})\.\s*(januar|februar|mars|april|mai|juni|juli|august|september|oktober|november|desember)/i;
  const match = fullCitation.match(dateRegex);
  return match ? `${match[1]}. ${match[2].toLowerCase()}` : '';
}

// Helper function to extract title from full citation
function extractTitle(fullCitation: string): string {
  const titleMatch = fullCitation.match(/\)\.\s*(.+?)\./);
  return titleMatch ? capitalizeFirstLetter(titleMatch[1]) : '';
}
