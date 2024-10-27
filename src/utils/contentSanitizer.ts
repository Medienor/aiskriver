export function sanitizeContent(html: string): string {
  // Create a temporary DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove all img tags
  const images = tempDiv.getElementsByTagName('img');
  for (let i = images.length - 1; i >= 0; i--) {
    const img = images[i];
    img.parentNode?.removeChild(img);
  }

  // Preserve citation attributes on spans
  const spans = tempDiv.querySelectorAll('span[style*="color: blue"]');
  spans.forEach(span => {
    const citation = span.getAttribute('data-citation');
    const format = span.getAttribute('citation-format');
    const source = span.getAttribute('source');
    
    // Create a new span with preserved attributes
    const newSpan = document.createElement('span');
    newSpan.style.color = 'blue';
    if (citation) newSpan.setAttribute('data-citation', citation);
    if (format) newSpan.setAttribute('citation-format', format);
    if (source) newSpan.setAttribute('source', source);
    newSpan.textContent = span.textContent;
    
    // Replace the old span with the new one
    span.parentNode?.replaceChild(newSpan, span);
  });

  // Return the sanitized HTML
  return tempDiv.innerHTML;
}