import { BLOGS } from './data';
import BlogHubClient from './BlogHubClient';

export const metadata = {
  title: 'NRI Tax Knowledge Hub — MKW Advisors',
  description: 'Expert NRI tax guides covering property sales, capital gains, DTAA, ESOP, crypto, and filing for 30+ countries. 100+ free guides.',
  openGraph: {
    title: 'NRI Tax Knowledge Hub — MKW Advisors',
    description: '100+ expert guides on NRI taxation',
    type: 'website',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogHubPage() {
  return <BlogHubClient blogs={BLOGS} />;
}
