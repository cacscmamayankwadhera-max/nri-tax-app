'use client';
import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('nri-cookie-consent');
    if (!consent) {
      setTimeout(() => setShow(true), 2000); // Show after 2s
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-0">
      <div className="max-w-2xl mx-auto md:mb-6 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-lg"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
        <p className="text-xs text-theme-secondary flex-1">
          We use essential cookies for platform functionality. No tracking cookies. See our <a href="/privacy" className="text-theme-accent underline">Privacy Policy</a>.
        </p>
        <button onClick={() => { localStorage.setItem('nri-cookie-consent', 'true'); setShow(false); }}
          className="btn-primary text-xs py-2 px-4 flex-shrink-0">
          Got it
        </button>
      </div>
    </div>
  );
}
