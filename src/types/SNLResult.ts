export type SNLResult = {
  id: string;
  title: string;
  content: string;
  article_id: string;
  article_type_id: number;
  headword: string;
  rank: number;
  snippet: string;
  article_url: string;
  article_url_json: string;
  authors: { full_name: string }[];
  changed_at: string;
};


export interface Citation {
  id: string;
  title: string;
  content: string;
  article_id: string;
  article_type_id: number;
  headword: string;
  rank: number;
  snippet: string;
  article_url: string;
  article_url_json: string;
  authors: { full_name: string }[];
  changed_at: string;
}

export interface CitationData {
  id: string;
  citation: string;
  full_citation: string;
  article_url: string;
  last_updated?: string;
  authors: string;
}
