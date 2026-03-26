import { BLOGS } from './blog/data';

export default function sitemap() {
  const baseUrl = 'https://nri-tax-app-cacscmamayankwadhera-maxs-projects.vercel.app';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/client`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/portal`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/my-cases`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const blogPages = BLOGS.map(blog => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}
