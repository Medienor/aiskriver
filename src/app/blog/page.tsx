import Link from 'next/link';

export default function BlogIndex() {
  // In a real application, you'd fetch this data from an API or database
  const posts = [
    { id: 1, title: 'First Blog Post', slug: 'first-post', excerpt: 'A brief introduction to our first topic...' },
    { id: 2, title: 'Second Blog Post', slug: 'second-post', excerpt: 'Exploring another interesting subject...' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Latest Posts</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <Link href={`/blog/${post.slug}`} className="block hover:bg-gray-50 transition duration-150">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
                <p className="text-gray-600">{post.excerpt}</p>
                <span className="inline-block mt-4 text-blue-600 hover:text-blue-800">Read more →</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}