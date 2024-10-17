import React from 'react';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900">My Blog</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-6">{children}</main>
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-4xl mx-auto py-4 text-center text-gray-600">
          © {new Date().getFullYear()} My Blog
        </div>
      </footer>
    </div>
  );
}