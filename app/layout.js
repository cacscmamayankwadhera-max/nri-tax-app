'use client';
import './globals.css';
import { useEffect, useState } from 'react';

export default function RootLayout({ children }) {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('nri-theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : '');
  }, []);

  return (
    <html lang="en" data-theme={theme === 'dark' ? 'dark' : undefined}>
      <head>
        <title>NRI Tax Suite — MKW Advisors</title>
        <meta name="description" content="AI-Assisted NRI Tax Filing, Advisory & Compliance" />
      </head>
      <body>{children}</body>
    </html>
  );
}
