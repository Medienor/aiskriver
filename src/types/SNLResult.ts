export type SNLResult = {
  id: string;
  title: string;
  content: string;
  article_id: string;
  article_type_id: number;
  headword: string;
  snippet: string;
  article_url: string;
  article_url_json: string;
  authors: { full_name: string }[];
  changed_at: string;
};
