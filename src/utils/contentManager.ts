import { formatCitation } from './citationFormatter';
import React from 'react';
import ReactDOM from 'react-dom';

interface Citation {
  id: string;
  citation: string;
  full_citation: string;
  article_url?: string;
  article_id?: string; // Make article_id optional
  last_updated?: string;
}

export class ContentManager {
  private quill: any;
  private citations: Citation[];
  private isPremiumUser: boolean;
  private citationStyle: string;

  constructor(quill: any, citations: Citation[] | undefined, isPremiumUser: boolean, citationStyle: string) {
    this.quill = quill;
    this.citations = citations || [];
    this.isPremiumUser = isPremiumUser;
    this.citationStyle = citationStyle;
  }

  getContent(): string {
    if (this.quill) {
      let content = this.quill.root.innerHTML;
      
      if (this.isPremiumUser && this.citations.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.className = 'sources';
        sourcesDiv.innerHTML = `
          <h3 class="text-xl font-bold">Litteraturliste</h3>
          <ul class="list-disc pl-5">
            ${this.citations.map(citation => {
              // Use type assertion here
              const { text, url } = formatCitation(citation as any, this.citationStyle);
              return `
                <li class="mb-2 text-sm">
                  ${text}
                  ${url ? `<span class="citation-link" style="color: blue; cursor: pointer;">${url}</span>` : ''}
                </li>
              `;
            }).join('')}
          </ul>
        `;
        content += sourcesDiv.outerHTML;
      }
      
      return content;
    }
    return '';
  }

  handleCopy(): void {
    const content = this.getContent();
    
    // Create a temporary element
    const tempElement = document.createElement('div');
    tempElement.innerHTML = content;
    
    // Replace <br> tags with newline characters
    tempElement.innerHTML = tempElement.innerHTML.replace(/<br\s*\/?>/gi, '\n');
    
    // Replace </p> tags with two newline characters (for paragraph spacing)
    tempElement.innerHTML = tempElement.innerHTML.replace(/<\/p>/gi, '\n\n');
    
    // Replace other block-level elements with newline characters
    const blockElements = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li'];
    blockElements.forEach(tag => {
      const regex = new RegExp(`</${tag}>`, 'gi');
      tempElement.innerHTML = tempElement.innerHTML.replace(regex, '\n');
    });
    
    // Strip remaining HTML tags
    const textContent = tempElement.textContent || tempElement.innerText || '';
    
    // Normalize spaces and trim
    const normalizedContent = textContent.replace(/\s+/g, ' ').trim();
    
    // Use the Clipboard API to copy the text
    navigator.clipboard.writeText(normalizedContent).then(() => {
      this.showCopyNotification();
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  }

  private showCopyNotification(): void {
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-6 py-3 flex items-center space-x-4 z-50';
    notification.style.transition = 'opacity 0.3s ease-in-out';
    notification.style.opacity = '0';
    notification.style.minWidth = '220px'; // Make the notification wider
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="text-green-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span class="text-gray-800 font-medium text-sm">Teksten er kopiert</span>
    `;

    // Add the notification to the document
    document.body.appendChild(notification);

    // Fade in
    setTimeout(() => {
      notification.style.opacity = '1';
    }, 10);

    // Remove the notification after 2 seconds with fade out
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300); // Wait for fade out transition
    }, 2000);
  }

  handleDownload(): void {
    const element = document.createElement("a");
    const file = new Blob([this.getContent()], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = "article.html";
    document.body.appendChild(element);
    element.click();
  }
}
