export interface FormData {
  title: string;
  articleType: string;
  projectId: string | null;  // Make sure this is included
  keywords: string;
  description: string;
  tone: string;
  length: string;
  language: string;
  includeImages: boolean;
  includeVideos: boolean;
  includeSources: boolean;
  enableWebSearch: boolean;
  numberOfSources: number;
  selectedSnippet: string | null;  // Add this line
  selectedSitemap: string | null;
  useLocalLinks: boolean;  // Add this line
  sitemapUrls?: string[]; // Add this new field
}