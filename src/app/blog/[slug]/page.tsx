import { notFound } from 'next/navigation';

export default function BlogPost({ params }: { params: { slug: string } }) {
  // In a real application, you'd fetch the post data based on the slug
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// This is a placeholder function. In a real app, you'd fetch data from an API or database.
function getPostBySlug(slug: string) {
  const posts = {
    'first-post': { title: 'First Blog Post', content: '<p>This is my first blog post.</p>' },
    'second-post': { title: 'Second Blog Post', content: '<p>This is my second blog post.</p>' },
  };
  return posts[slug as keyof typeof posts];
}