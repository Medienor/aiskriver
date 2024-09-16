import React from 'react';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface UserArticlesProps {
  articles: Article[];
}

export function UserArticles({ articles }: UserArticlesProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Dine artikler</h2>
      <div className="max-h-[250px] overflow-y-auto">
        {articles.length > 0 ? (
          <ul className="space-y-2">
            {articles.map((article) => (
              <li key={article.id} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                <Link href={`/article/${article.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {article.title}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(article.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No articles yet.</p>
        )}
      </div>
    </div>
  );
}