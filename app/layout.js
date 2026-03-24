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
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
