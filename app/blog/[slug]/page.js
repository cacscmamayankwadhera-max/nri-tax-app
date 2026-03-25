import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import { BLOGS } from '../data';
import BlogPostClient from './BlogPostClient';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const blog = BLOGS.find(b => b.slug === slug);
  if (!blog) return { title: 'Guide Not Found — NRI Tax Suite' };
  return {
    title: `${blog.title} — NRI Tax Suite`,
    description: blog.excerpt || blog.subtitle || '',
    openGraph: {
      title: blog.title,
      description: blog.excerpt || blog.subtitle || '',
      type: 'article',
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

async function loadBlogContent(slug) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return null;
  const filePath = path.join(process.cwd(), 'content', 'blogs', `${slug}.md`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    // Strip frontmatter: content between first --- and second ---
    const match = content.match(/^---[\s\S]*?---\s*/);
    const body = match ? content.slice(match[0].length).trim() : content.trim();
    return body;
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = params;
  const blog = BLOGS.find(b => b.slug === slug);

  if (!blog) {
    notFound();
  }

  const blogContent = await loadBlogContent(slug);

  return <BlogPostClient blog={blog} blogContent={blogContent} />;
}
