export function fixStreamedHTML(chunk: string): string {
    const tagMap: { [key: string]: string } = {
      '1': 'h1',
      '2': 'h2',
      '3': 'h3',
      'p': 'p',
      'li': 'li',
    };
  
    let fixedChunk = chunk.replace(/(\d+|p|li)>/g, (match, p1) => {
      const tag = tagMap[p1] || p1;
      return `<${tag}>`;
    });
  
    fixedChunk = fixedChunk.replace(/>>/g, '</');
  
    // Handle unclosed tags
    const openTags: string[] = [];
    fixedChunk = fixedChunk.replace(/<(\w+)>|<\/(\w+)>/g, (match, openTag, closeTag) => {
      if (openTag) {
        openTags.push(openTag);
        return match;
      } else if (closeTag) {
        if (openTags[openTags.length - 1] === closeTag) {
          openTags.pop();
          return match;
        } else {
          // If the closing tag doesn't match the last opened tag, ignore it
          return '';
        }
      }
      return match;
    });
  
    // Close any remaining open tags
    while (openTags.length > 0) {
      const tag = openTags.pop();
      fixedChunk += `</${tag}>`;
    }
  
    return fixedChunk;
  }