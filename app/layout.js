import './globals.css';
import { ThemeProvider } from './theme-provider';

export const metadata = {
  title: 'NRI Tax Suite — MKW Advisors',
  description: 'AI-Assisted NRI Tax Filing, Advisory & Compliance for Non-Resident Indians. Expert CA team powered by AI for FY 2025-26.',
  openGraph: {
    title: 'NRI Tax Suite — MKW Advisors',
    description: 'AI-Assisted NRI Tax Filing, Advisory & Compliance',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to set theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('nri-theme');
            if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
          } catch(e) {}
        `}} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "MKW Advisors \u2014 NRI Tax Suite",
  "description": "AI-Assisted NRI Tax Filing, Advisory & Compliance for Non-Resident Indians",
  "url": "https://nri-tax-app.vercel.app",
  "logo": "https://nri-tax-app.vercel.app/favicon.ico",
  "priceRange": "\u20B98,000 - \u20B91,00,000+",
  "address": { "@type": "PostalAddress", "addressCountry": "IN" },
  "geo": { "@type": "GeoCoordinates", "latitude": "28.6139", "longitude": "77.2090" },
  "areaServed": ["US", "GB", "AE", "SG", "CA", "AU", "DE", "SA", "QA", "HK", "NZ"],
  "serviceType": ["NRI Tax Filing", "Tax Advisory", "Capital Gains Computation", "DTAA Analysis"],
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "2800" },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "NRI Tax Services",
    "itemListElement": [
      { "@type": "Offer", "name": "Basic Filing", "price": "8000", "priceCurrency": "INR" },
      { "@type": "Offer", "name": "Advisory Filing", "price": "18000", "priceCurrency": "INR" },
      { "@type": "Offer", "name": "Premium Compliance", "price": "35000", "priceCurrency": "INR" }
    ]
  }
}) }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
