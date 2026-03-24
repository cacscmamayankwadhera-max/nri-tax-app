import { notFound } from 'next/navigation';
import { promises as fs } from 'fs';
import path from 'path';
import { BLOGS } from '../data';
import BlogPostClient from './BlogPostClient';

export async function generateMetadata({ params }) {
  const { slug } = await params;
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
    // Strip frontmatter (between --- markers)
    const fmEnd = content.indexOf('---', 4);
    const body = fmEnd > 0 ? content.slice(fmEnd + 3).trim() : content;
    return body;
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const blog = BLOGS.find(b => b.slug === slug);

  if (!blog) {
    notFound();
  }

  const blogContent = await loadBlogContent(slug);

  return <BlogPostClient blog={blog} blogContent={blogContent} />;
}
