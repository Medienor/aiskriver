export interface FormData {
  title: string;
  articleType: string;
  projectId: string;  // Make sure this is included
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
}