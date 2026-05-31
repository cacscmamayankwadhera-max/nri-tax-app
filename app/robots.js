export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nri.mkwadvisors.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api/'],
      },
      {
        userAgent: 'GPTBot',
        allow: ['/', '/llms.txt'],
        disallow: ['/dashboard', '/admin', '/api/'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: ['/', '/llms.txt'],
        disallow: ['/dashboard', '/admin', '/api/'],
      },
      {
        userAgent: 'Google-Extended',
        allow: ['/', '/llms.txt'],
        disallow: ['/dashboard', '/admin', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
