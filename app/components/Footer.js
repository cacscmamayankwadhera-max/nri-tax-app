'use client';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Start Filing', href: '/client' },
  { label: 'Knowledge Hub', href: '/blog' },
  { label: 'Track Case', href: '/portal' },
  { label: 'Team Login', href: '/login' },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-footer)',
        transition: 'background-color 0.3s ease',
      }}
      role="contentinfo"
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

          {/* Column 1: Branding */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '1px solid var(--accent)' }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: 'var(--accent)', fontFamily: 'system-ui' }}
                >
                  NT
                </span>
              </div>
              <span
                className="font-serif text-lg tracking-wide font-bold"
                style={{ color: 'var(--accent)' }}
              >
                NRI Tax Suite
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              AI-Assisted NRI Tax Filing, Advisory &amp; Compliance
            </p>
            <p
              className="text-xs mt-3"
              style={{ color: 'var(--text-muted)' }}
            >
              CA | CS | CMA | IBBI Registered Valuer
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: 'var(--text-on-dark)' }}
            >
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors duration-200"
                    style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: 'var(--text-on-dark)' }}
            >
              Contact
            </h3>
            <ul className="flex flex-col gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
              <li>
                <a
                  href="mailto:tax@mkwadvisors.com"
                  className="transition-colors duration-200 flex items-center gap-2"
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  tax@mkwadvisors.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919667744073"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 flex items-center gap-2"
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.319 0-4.476-.67-6.31-1.823l-.452-.278-2.65.889.889-2.65-.278-.452A9.953 9.953 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
                  </svg>
                  +91 96677 44073
                </a>
              </li>
              <li
                className="flex items-center gap-2 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mon&ndash;Sat 10AM&ndash;7PM IST
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-muted)',
          }}
        >
          <span>&copy; {new Date().getFullYear()} MKW Advisors. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a
              href="/privacy"
              className="transition-colors duration-200"
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              style={{ color: 'var(--text-muted)' }}
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="transition-colors duration-200"
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              style={{ color: 'var(--text-muted)' }}
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
