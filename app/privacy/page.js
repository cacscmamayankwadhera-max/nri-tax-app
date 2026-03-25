'use client';
import { useTheme } from '@/app/theme-provider';

export default function PrivacyPolicy() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      {/* Nav */}
      <nav style={{ background: 'var(--bg-nav)' }} className="px-6 h-14 flex items-center justify-between">
        <a href="/" className="font-serif font-bold tracking-wide" style={{ color: 'var(--accent)' }}>NRI TAX SUITE</a>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--accent)' }}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
          <a href="/" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-on-dark)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >{'\u2190'} Back to Home</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Last updated: 23 March 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {/* 1 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>1. Data We Collect</h2>
            <p>To provide our tax advisory and filing services, we collect the following information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Personal identifiers:</strong> Full name, email address, phone number, country of residence.</li>
              <li><strong>Financial details:</strong> Income details (salary, rental, interest, dividends, capital gains), property sale/purchase information, asset declarations, bank account details (NRO/NRE).</li>
              <li><strong>Tax-related documents:</strong> AIS, 26AS, TIS, Form 16, sale deeds, bank statements, and other documents you upload or share for your engagement.</li>
              <li><strong>Residency information:</strong> Passport details, travel history, days of stay in India.</li>
              <li><strong>Communication records:</strong> Emails, messages, and notes exchanged during your engagement.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>2. Purpose of Data Collection</h2>
            <p>Your data is used exclusively for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Tax computation:</strong> Calculating your tax liability, capital gains, income from house property, and other heads of income.</li>
              <li><strong>Advisory services:</strong> Generating professional advisory memos, residency analysis, DTAA analysis, and tax planning recommendations.</li>
              <li><strong>Return filing:</strong> Preparing and filing your Income Tax Return with the Indian Income Tax Department.</li>
              <li><strong>Client communication:</strong> Sending you updates on your case status, deliverables, and any queries from our team.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>3. Data Storage</h2>
            <p>
              Your data is stored securely on <strong>Supabase</strong>, a cloud database platform. Key security measures include:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>Encryption at rest using AES-256 for all stored data.</li>
              <li>Encryption in transit using TLS 1.2+ for all data transfers.</li>
              <li>Row-level security policies ensuring team members only access cases assigned to them.</li>
              <li>Regular automated backups with point-in-time recovery.</li>
              <li>Infrastructure hosted on SOC 2 Type II certified cloud providers.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>4. Data Retention</h2>
            <p>
              We retain your data for a minimum of <strong>7 years</strong> from the date of the relevant assessment year,
              in compliance with Indian tax law requirements. This is necessary because:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>Income tax assessments can be reopened up to 4 years (6 years in certain cases) after the end of the assessment year.</li>
              <li>Supporting documentation may be required for responding to notices or reassessment proceedings.</li>
              <li>Professional standards require retention of working papers and client records.</li>
            </ul>
            <p className="mt-3">After the retention period, data is securely deleted or anonymised.</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>5. Third-Party Data Sharing</h2>
            <p>We share your data only with the following third parties, strictly for the purposes described:</p>
            <div className="mt-3 rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Anthropic AI (Claude)</p>
              <p>
                Your case data (income details, property information, residency status) is sent to Anthropic&apos;s
                AI models for analysis, computation verification, and advisory content generation. Key safeguards:
              </p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>No personal identifiers (name, email, phone, PAN) are stored by the AI provider.</li>
                <li>Data sent to AI is used only for generating your specific analysis and is not used for AI model training.</li>
                <li>AI outputs are always reviewed by our qualified professionals before delivery.</li>
              </ul>
            </div>
            <p className="mt-3">
              We do <strong>not</strong> sell, rent, or share your personal data with any other third parties for marketing
              or any purpose unrelated to your tax engagement.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>6. Your Rights</h2>
            <p>As a client, you have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Access:</strong> Request a copy of all personal data we hold about you.</li>
              <li><strong>Correction:</strong> Request correction of any inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> Request deletion of your data, subject to our legal retention obligations (7-year minimum for tax records).</li>
              <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{' '}
              <a href="mailto:tax@mkwadvisors.com" style={{ color: 'var(--accent)' }} className="underline hover:opacity-80 transition-opacity">tax@mkwadvisors.com</a>.
              We will respond within 30 days.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>7. Cookies</h2>
            <p>
              Our platform uses <strong>minimal cookies</strong>, limited to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li><strong>Authentication session cookie:</strong> Required to keep you logged in to the team dashboard. This is a functional cookie and cannot be disabled while using the platform.</li>
              <li><strong>Theme preference:</strong> A local storage entry to remember your light/dark mode preference.</li>
            </ul>
            <p className="mt-3">
              We do not use any analytics, tracking, advertising, or third-party cookies.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated to
              active clients via email. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>9. Contact</h2>
            <p>
              For any questions or concerns about this Privacy Policy or your data, please contact us:
            </p>
            <div className="mt-3 rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>MKW Advisors — NRI Tax Desk</p>
              <p className="mt-1">Email: <a href="mailto:tax@mkwadvisors.com" style={{ color: 'var(--accent)' }} className="underline">tax@mkwadvisors.com</a></p>
              <p className="mt-1">Phone: <a href="tel:+919667744073" style={{ color: 'var(--accent)' }} className="underline">+91-96677 44073</a></p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 mt-12" style={{ background: 'var(--bg-footer)', color: 'var(--text-muted)' }}>
        <div className="font-serif font-bold tracking-wide mb-2" style={{ color: 'var(--accent)' }}>MKW Advisors</div>
        <p className="text-xs">NRI Tax Desk &middot; CA &middot; CS &middot; CMA Certified</p>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <a href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-on-dark)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >Terms of Service</a>
          <a href="/privacy" style={{ color: 'var(--accent)' }} className="hover:opacity-80 transition-opacity">Privacy Policy</a>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>&copy; {new Date().getFullYear()} MKW Advisors. All rights reserved.</p>
      </footer>
    </div>
  );
}
