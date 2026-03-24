'use client';
import { useTheme } from '@/app/theme-provider';

export default function TermsOfService() {
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
            {isDark ? '\u2600' : '\u263D'}
          </button>
          <a href="/" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-on-dark)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >{'\u2190'} Back to Home</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Terms of Service</h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>Last updated: 23 March 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {/* 1 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>1. Service Description</h2>
            <p>
              NRI Tax Suite, operated by MKW Advisors, provides AI-assisted tax advisory and filing services
              for Non-Resident Indians (NRIs). The platform uses artificial intelligence to analyse your tax
              position, generate computation sheets, advisory memos, and assist in return preparation.
            </p>
            <p className="mt-3">
              <strong>Important:</strong> Our service is an advisory and facilitation tool. It is not a substitute
              for independent professional advice from a qualified Chartered Accountant (CA) or tax practitioner.
              All AI-generated analysis is reviewed by qualified professionals before being used in any filing or
              formal advisory deliverable.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>2. User Obligations</h2>
            <p>By using our services, you agree to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>Provide accurate and complete information about your income, assets, residential status, and all other details relevant to your tax filing.</li>
              <li>Submit all required documents (AIS, 26AS, Form 16, sale deeds, bank statements, etc.) in a timely manner as requested by the team.</li>
              <li>Review all deliverables (computation sheets, advisory memos, draft returns) before approving them for filing.</li>
              <li>Notify us promptly of any errors, omissions, or changes in your information after submission.</li>
              <li>Not use the platform for any unlawful purpose, including tax evasion or fraudulent filing.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>3. Limitation of Liability</h2>
            <p>
              NRI Tax Suite and MKW Advisors provide advisory services only. While we take every reasonable care
              to ensure accuracy of our analysis and computations:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>The final responsibility for the accuracy of your tax return lies with you and/or your authorised Chartered Accountant.</li>
              <li>We are not liable for any penalties, interest, or adverse consequences arising from incorrect or incomplete information provided by you.</li>
              <li>Our liability is limited to the fees paid for the specific engagement in question.</li>
              <li>We do not guarantee any specific tax outcome, refund amount, or assessment result.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>4. AI Disclaimer</h2>
            <p>
              Our platform uses artificial intelligence (powered by large language models) to analyse tax positions,
              generate computations, and draft advisory content. You acknowledge and agree that:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>AI-generated analysis is a starting point and is always reviewed by qualified tax professionals before being finalised.</li>
              <li>AI systems may occasionally produce inaccurate or incomplete results. Our professional review layer is designed to catch and correct such issues.</li>
              <li>No AI output is directly filed or sent to clients without human review and approval.</li>
              <li>You should not rely solely on any AI-generated output without professional verification.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>5. Data Handling</h2>
            <p>
              Your personal and financial data is stored securely and handled with strict confidentiality:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              <li>All data is stored on encrypted cloud infrastructure (Supabase) with access controls.</li>
              <li>Your data is not shared with any third parties, except as required for the AI analysis component (see our Privacy Policy for details).</li>
              <li>Access to client data is restricted to authorised team members working on your engagement.</li>
              <li>Data is retained in accordance with Indian tax law requirements (minimum 7 years).</li>
            </ul>
            <p className="mt-3">
              For full details on data collection, storage, and your rights, please refer to our{' '}
              <a href="/privacy" style={{ color: 'var(--accent)' }} className="underline hover:opacity-80 transition-opacity">Privacy Policy</a>.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>6. Payment Terms</h2>
            <ul className="list-disc ml-6 space-y-1.5">
              <li>Service fees are as quoted in the engagement scope provided to you after the initial diagnostic.</li>
              <li>Payment is due as per the terms specified in your engagement letter (typically 50% advance, 50% on delivery).</li>
              <li>Fees are non-refundable once work has commenced on your engagement, as professional time and AI resources are allocated immediately.</li>
              <li>Any additional scope beyond the original engagement will be quoted separately and requires your written approval before proceeding.</li>
              <li>GST (as applicable) will be charged in addition to the quoted professional fees.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>7. Governing Law and Jurisdiction</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of India.
              Any disputes arising out of or in connection with these terms shall be subject to the
              exclusive jurisdiction of the courts of Delhi, India.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>8. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service at any time. Material changes will be
              communicated via email to active clients. Continued use of the platform after changes are
              posted constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-serif text-lg font-bold mb-3 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid rgba(196,154,60,0.3)' }}>9. Contact</h2>
            <p>
              For any questions regarding these terms, please contact us:
            </p>
            <div className="mt-3 rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>MKW Advisors — NRI Tax Desk</p>
              <p className="mt-1">Email: <a href="mailto:tax@mkwadvisors.com" style={{ color: 'var(--accent)' }} className="underline">tax@mkwadvisors.com</a></p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 mt-12" style={{ background: 'var(--bg-footer)', color: 'var(--text-muted)' }}>
        <div className="font-serif font-bold tracking-wide mb-2" style={{ color: 'var(--accent)' }}>MKW Advisors</div>
        <p className="text-xs">NRI Tax Desk &middot; CA &middot; CS &middot; CMA Certified</p>
        <div className="flex justify-center gap-6 mt-4 text-xs">
          <a href="/terms" style={{ color: 'var(--accent)' }} className="hover:opacity-80 transition-opacity">Terms of Service</a>
          <a href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-on-dark)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
          >Privacy Policy</a>
        </div>
        <p className="text-xs mt-4" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>&copy; {new Date().getFullYear()} MKW Advisors. All rights reserved.</p>
      </footer>
    </div>
  );
}
