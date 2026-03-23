'use client';
import { useState, useEffect, useRef } from 'react';
import { BLOGS, CATEGORIES, ASSESSMENTS } from './data';

/* ─── Helpers ─────────────────────────────────────────────── */
function useSlider(items, autoMs = 5000) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => (i + 1) % items.length), autoMs);
    return () => clearInterval(timer.current);
  }, [items.length, autoMs]);
  const go = n => { clearInterval(timer.current); setIdx(n); };
  return [idx, go];
}

/* ─── Country Quick-Access Data ───────────────────────────── */
const COUNTRIES = [
  { flag: '🇺🇸', name: 'USA', slug: 'us-nri-tax-guide', stat: 'FBAR + FATCA + PFIC' },
  { flag: '🇦🇪', name: 'UAE/Dubai', slug: 'uae-nri-tax-guide', stat: 'Zero-Tax Trap' },
  { flag: '🇬🇧', name: 'UK', slug: 'dtaa-double-taxation-ftc', stat: 'DTAA 15%' },
  { flag: '🇨🇦', name: 'Canada', slug: 'canada-nri-tax-guide', stat: 'T1135 + RRSP' },
  { flag: '🇦🇺', name: 'Australia', slug: 'australia-nri-tax-guide', stat: 'Super + CGT 50%' },
  { flag: '🇸🇬', name: 'Singapore', slug: 'dtaa-double-taxation-ftc', stat: 'DTAA 15%' },
  { flag: '🇩🇪', name: 'Germany', slug: 'dtaa-double-taxation-ftc', stat: 'DTAA 10%' },
  { flag: '🇸🇦', name: 'Saudi/GCC', slug: 'gulf-gcc-nri-tax-guide', stat: 'Zero Tax + EOSB' },
  { flag: '🇶🇦', name: 'Qatar', slug: 'gulf-gcc-nri-tax-guide', stat: 'DTAA 10%' },
  { flag: '🇴🇲', name: 'Oman', slug: 'gulf-gcc-nri-tax-guide', stat: 'Golden Visa' },
  { flag: '🇰🇼', name: 'Kuwait', slug: 'gulf-gcc-nri-tax-guide', stat: 'No DTAA!' },
];

const STATS_BAR = [
  { value: '28+', label: 'Expert Guides' },
  { value: '167K+', label: 'Words of Content' },
  { value: '30+', label: 'Countries Covered' },
  { value: 'FY 2025-26', label: 'All Numbers Verified' },
];

/* ─── Main Page ───────────────────────────────────────────── */
export default function BlogHub() {
  const [theme, setTheme] = useState('light');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [showAllGuides, setShowAllGuides] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nri-theme') || 'light';
    setTheme(saved);
  }, []);

  const isDark = theme === 'dark';
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nri-theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
  };

  const featured = BLOGS.filter(b => b.featured);
  const [featIdx, featGo] = useSlider(featured, 6000);

  const filtered = BLOGS.filter(b => {
    const matchCat = activeCategory === 'all' || b.category === activeCategory;
    const matchSearch = !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const displayBlogs = showAllGuides || searchQuery || activeCategory !== 'all' ? filtered : filtered.slice(0, 9);

  const handleLeadSubmit = e => {
    e.preventDefault();
    if (!email) return;
    // Store lead locally (would normally go to Supabase)
    const leads = JSON.parse(localStorage.getItem('nri-leads') || '[]');
    leads.push({ email, source: 'blog-hub', ts: new Date().toISOString() });
    localStorage.setItem('nri-leads', JSON.stringify(leads));
    setLeadSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ══ NAV ══ */}
      <nav style={{ background: 'var(--bg-nav)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--accent)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>NT</span>
            </div>
            <span className="font-serif text-lg tracking-wide" style={{ color: 'var(--text-nav)' }}>NRI Tax Suite</span>
          </a>
          <div className="flex gap-3 items-center">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110" style={{ background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.12)', color: 'var(--accent)', border: '1px solid rgba(196,154,60,0.3)' }}>
              {isDark ? '\u2600' : '\u263D'}
            </button>
            <a href="/client" className="px-5 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
              Free Assessment &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden">
        {isDark && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(196,154,60,0.08) 0%, transparent 70%)' }} />}
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-10 relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ background: 'var(--bg-badge)', color: 'var(--text-badge)' }}>
            NRI Knowledge Hub &middot; FY 2025-26 &middot; Updated March 2026
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-4" style={{ lineHeight: 1.15 }}>
            The NRI Tax <span style={{ color: 'var(--accent)' }}>Knowledge Hub</span>
          </h1>
          <p className="text-lg max-w-2xl mb-8" style={{ color: 'var(--text-secondary)' }}>
            India&apos;s most comprehensive NRI tax resource. Expert guides by CA Mayank Wadhera covering every aspect of NRI taxation, compliance, and financial planning.
          </p>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS_BAR.map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{s.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pb-20">

        {/* ══ FEATURED SLIDER ══ */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl mb-6">Featured Guides</h2>
            <div className="relative">
              {/* Slider content */}
              <a
                href={`/blog/${featured[featIdx]?.slug}`}
                className="block rounded-2xl p-6 md:p-8 transition-all duration-500"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{featured[featIdx]?.icon}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${featured[featIdx]?.color}20`, color: featured[featIdx]?.color }}>
                        {featured[featIdx]?.category.toUpperCase()}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{featured[featIdx]?.readTime} read</span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl mb-2">{featured[featIdx]?.title}</h3>
                    <p className="text-sm font-semibold mb-3" style={{ color: 'var(--accent)' }}>{featured[featIdx]?.subtitle}</p>
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{featured[featIdx]?.excerpt}</p>
                    {/* Quick answer */}
                    <div className="rounded-lg p-4" style={{ background: 'var(--bg-primary)', borderLeft: `4px solid ${featured[featIdx]?.color}` }}>
                      <p className="text-xs font-bold mb-1" style={{ color: featured[featIdx]?.color }}>QUICK ANSWER</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{featured[featIdx]?.quickAnswer}</p>
                    </div>
                  </div>
                  <div className="md:w-64 flex-shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                      {featured[featIdx]?.keyNumbers.map((kn, i) => (
                        <div key={i} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                          <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{kn.value}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{kn.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <span className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                        Read Full Guide &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </a>
              {/* Slider dots */}
              <div className="flex justify-center gap-2 mt-4">
                {featured.map((_, i) => (
                  <button key={i} onClick={() => featGo(i)} className="w-2.5 h-2.5 rounded-full transition-all duration-300" style={{ background: i === featIdx ? 'var(--accent)' : 'var(--border)', transform: i === featIdx ? 'scale(1.3)' : 'scale(1)' }} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ COUNTRY QUICK-ACCESS WITH ARROWS ══ */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl mb-2">Guides by Country</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Country-specific tax guides tailored to your jurisdiction.</p>
            <div className="relative">
              {/* Left arrow */}
              <button
                onClick={() => { const el = document.getElementById('country-scroll'); if (el) el.scrollBy({ left: -300, behavior: 'smooth' }); }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg transition-all hover:scale-110 hidden md:flex"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent)' }}
                aria-label="Scroll left"
              >
                &larr;
              </button>
              {/* Scrollable row */}
              <div id="country-scroll" className="flex gap-3 overflow-x-auto pb-2 px-1 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                {COUNTRIES.map(c => (
                  <a key={c.name} href={`/blog/${c.slug}`} className="flex-shrink-0 w-36 rounded-xl p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="text-3xl mb-2">{c.flag}</div>
                    <div className="text-sm font-bold mb-1">{c.name}</div>
                    <div className="text-xs" style={{ color: 'var(--accent)' }}>{c.stat}</div>
                  </a>
                ))}
              </div>
              {/* Right arrow */}
              <button
                onClick={() => { const el = document.getElementById('country-scroll'); if (el) el.scrollBy({ left: 300, behavior: 'smooth' }); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg transition-all hover:scale-110 hidden md:flex"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--accent)' }}
                aria-label="Scroll right"
              >
                &rarr;
              </button>
            </div>
          </section>
        )}

        {/* ══ LEAD CAPTURE — Free Tax Checklist ══ */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-14 rounded-2xl p-6 md:p-8" style={{ background: isDark ? 'rgba(196,154,60,0.06)' : 'linear-gradient(135deg, #fef9ee 0%, #fdf2d8 100%)', border: '1px solid rgba(196,154,60,0.2)' }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="text-3xl mb-3">📋</div>
                <h3 className="font-serif text-xl mb-2">Free NRI Tax Checklist 2026</h3>
                <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Get our comprehensive 47-point NRI tax compliance checklist covering ITR filing, TDS, FEMA, DTAA, and property transactions — used by 2,800+ NRI clients.
                </p>
                <ul className="text-xs mt-3 space-y-1" style={{ color: 'var(--text-muted)' }}>
                  <li>&#x2713; Pre-filing checklist (AIS/26AS reconciliation)</li>
                  <li>&#x2713; TDS optimization guide</li>
                  <li>&#x2713; Country-specific DTAA quick-reference card</li>
                  <li>&#x2713; Property sale tax computation template</li>
                </ul>
              </div>
              <div className="w-full md:w-80">
                {leadSubmitted ? (
                  <div className="text-center p-6 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="text-3xl mb-2">&#x2705;</div>
                    <p className="text-sm font-bold mb-1">Thank you!</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your checklist will be sent shortly. Meanwhile, try our free tax assessment.</p>
                    <a href="/client" className="inline-block mt-3 px-5 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                      Start Assessment &rarr;
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="p-5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-sm font-bold mb-3">Get your free checklist</p>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg text-sm mb-3"
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <button type="submit" className="w-full px-4 py-3 rounded-lg text-sm font-bold transition-all hover:scale-[1.02]" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                      Download Free Checklist &rarr;
                    </button>
                    <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>No spam. Unsubscribe anytime.</p>
                  </form>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ══ SELF-ASSESSMENT TOOLS ══ */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl mb-2">Interactive Tools</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Answer your most pressing NRI tax questions in under 3 minutes — no signup required.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {ASSESSMENTS.map(a => (
                <a key={a.slug} href={`/blog/assess/${a.slug}`} className="group rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{a.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-serif text-lg mb-0.5 group-hover:underline">{a.title}</h3>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>{a.subtitle}</p>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>{a.questions} questions</span>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>{a.time}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ══ SEARCH + CATEGORIES ══ */}
        <div className="mb-8">
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="Search 28+ guides... (try: property sale, TDS, FBAR, DTAA, NRE, FEMA, ESOP)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl text-sm transition-all focus:shadow-lg"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-40">&#x1F50D;</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105" style={{ background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-card)', color: activeCategory === cat.id ? 'var(--text-on-cta)' : 'var(--text-secondary)', border: `1px solid ${activeCategory === cat.id ? 'var(--accent)' : 'var(--border)'}` }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ ALL GUIDES GRID ══ */}
        <section>
          <h2 className="font-serif text-2xl mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'all' ? 'All Guides & Articles' : CATEGORIES.find(c => c.id === activeCategory)?.label}
            <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>({filtered.length})</span>
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-3xl mb-3">&#x1F50D;</p>
              <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No guides found for &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search term or browse by category.</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayBlogs.map(blog => (
                  <a key={blog.slug} href={`/blog/${blog.slug}`} className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="h-1.5" style={{ background: blog.color }} />
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{blog.icon}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: `${blog.color}15`, color: blog.color }}>{blog.category.toUpperCase()}</span>
                        <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{blog.readTime}</span>
                      </div>
                      <h3 className="font-serif text-lg mb-1 group-hover:underline decoration-1 underline-offset-2">{blog.title}</h3>
                      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>{blog.subtitle}</p>
                      <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>{blog.excerpt}</p>
                      <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--bg-primary)', borderLeft: `3px solid ${blog.color}` }}>
                        <p className="text-xs font-medium mb-1" style={{ color: blog.color }}>Quick Answer</p>
                        <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{blog.quickAnswer}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {blog.keyNumbers.slice(0, 4).map((kn, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold" style={{ color: 'var(--accent)' }}>{kn.value}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{kn.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* Show more button */}
              {!showAllGuides && !searchQuery && activeCategory === 'all' && filtered.length > 9 && (
                <div className="text-center mt-8">
                  <button onClick={() => setShowAllGuides(true)} className="px-8 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    Show All {filtered.length} Guides &darr;
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ══ MID-PAGE LEAD CAPTURE — WhatsApp CTA ══ */}
        <section className="mt-14 mb-14 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="text-4xl">&#x1F4AC;</div>
          <div className="flex-1">
            <h3 className="font-serif text-xl mb-1">Have a Specific NRI Tax Question?</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              WhatsApp CA Mayank Wadhera directly. Get expert answers within 24 hours — no obligation, no charge for initial consultation.
            </p>
          </div>
          <a href="https://wa.me/919667744073?text=Hi%2C%20I%20have%20a%20question%20about%20NRI%20tax%20filing" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105 flex-shrink-0" style={{ background: '#25D366', color: '#fff' }}>
            WhatsApp Now &rarr;
          </a>
        </section>

        {/* ══ TRUST SIGNALS ══ */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl mb-6 text-center">Why NRIs Trust MKW Advisors</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: '&#x1F393;', title: 'Qualified Expert', desc: 'CA Mayank Wadhera — CA, CS, CMA, IBBI Registered Valuer' },
                { icon: '&#x1F30D;', title: '30+ Countries', desc: 'Serving NRIs across USA, UK, UAE, Canada, Singapore, Australia' },
                { icon: '&#x1F916;', title: 'AI-Powered', desc: '10 specialist AI modules analyze your case in under 2 minutes' },
                { icon: '&#x1F4C4;', title: 'Professional Deliverables', desc: 'Computation sheets, advisory memos, engagement documents' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl mb-2" dangerouslySetInnerHTML={{ __html: item.icon }} />
                  <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ BOTTOM CTA ══ */}
        <section className="rounded-2xl p-8 md:p-12 text-center" style={{ background: 'var(--bg-nav)' }}>
          <h2 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: 'var(--text-on-dark)' }}>
            Ready for Expert NRI Tax Advisory?
          </h2>
          <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            Our AI analyzes your situation in under 2 minutes. CA-reviewed computation. Professional deliverables delivered digitally.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/client" className="px-8 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
              Free Tax Assessment &rarr;
            </a>
            <a href="https://wa.me/919667744073" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105" style={{ border: '1px solid rgba(196,154,60,0.4)', color: 'var(--accent)' }}>
              WhatsApp: +91-96677 44073
            </a>
            <a href="mailto:contact@mkwadvisors.com" className="px-6 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105" style={{ border: '1px solid rgba(196,154,60,0.4)', color: 'var(--accent)' }}>
              Email Us
            </a>
          </div>
          <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            MKW Advisors &middot; Legal Suvidha &middot; DigiComply &middot; CA | CS | CMA | IBBI Registered Valuer
          </p>
        </section>
      </div>

      {/* ══ FOOTER ══ */}
      <footer style={{ background: 'var(--bg-footer)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--accent)' }}>
                  <span className="text-[10px] font-bold" style={{ color: 'var(--accent)' }}>NT</span>
                </div>
                <span className="font-serif text-sm" style={{ color: 'var(--accent)' }}>NRI Tax Suite</span>
              </div>
              <p className="text-xs max-w-xs" style={{ color: 'var(--text-muted)' }}>
                AI-powered NRI tax filing, advisory, and compliance by MKW Advisors.
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-on-dark)' }}>Resources</p>
                <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <a href="/blog" className="hover:underline" style={{ color: 'var(--accent)' }}>Knowledge Hub</a>
                  <a href="/blog/nri-property-sale-capital-gains" className="hover:underline">Property Sale Guide</a>
                  <a href="/blog/us-nri-tax-guide" className="hover:underline">US NRI Guide</a>
                  <a href="/blog/uae-nri-tax-guide" className="hover:underline">UAE NRI Guide</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-on-dark)' }}>Company</p>
                <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <a href="/client" className="hover:underline">Start Filing</a>
                  <a href="/terms" className="hover:underline">Terms</a>
                  <a href="/privacy" className="hover:underline">Privacy</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-on-dark)' }}>Contact</p>
                <div className="flex flex-col gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <a href="https://wa.me/919667744073" className="hover:underline">WhatsApp</a>
                  <a href="mailto:contact@mkwadvisors.com" className="hover:underline">Email</a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            &copy; 2026 MKW Advisors &middot; Legal Suvidha &middot; DigiComply &middot; CA | CS | CMA | IBBI Registered Valuer
          </div>
        </div>
      </footer>
    </div>
  );
}
