'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from '@/app/theme-provider';
import { TOPICS, ASSESSMENTS } from './data';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';

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
  { flag: 'https://flagcdn.com/w40/us.png', name: 'USA', slug: 'us-nri-tax-guide', stat: 'FBAR + FATCA + PFIC' },
  { flag: 'https://flagcdn.com/w40/ae.png', name: 'UAE/Dubai', slug: 'uae-nri-tax-guide', stat: 'Zero-Tax Trap' },
  { flag: 'https://flagcdn.com/w40/gb.png', name: 'UK', slug: 'uk-nri-tax-guide', stat: 'DTAA 15%' },
  { flag: 'https://flagcdn.com/w40/ca.png', name: 'Canada', slug: 'canada-nri-tax-guide', stat: 'T1135 + RRSP' },
  { flag: 'https://flagcdn.com/w40/au.png', name: 'Australia', slug: 'australia-nri-tax-guide', stat: 'Super + CGT 50%' },
  { flag: 'https://flagcdn.com/w40/sg.png', name: 'Singapore', slug: 'singapore-nri-tax-guide', stat: 'DTAA 15%' },
  { flag: 'https://flagcdn.com/w40/de.png', name: 'Germany', slug: 'germany-nri-tax-guide', stat: 'DTAA 10%' },
  { flag: 'https://flagcdn.com/w40/sa.png', name: 'Saudi/GCC', slug: 'gulf-gcc-nri-tax-guide', stat: 'Zero Tax + EOSB' },
  { flag: 'https://flagcdn.com/w40/qa.png', name: 'Qatar', slug: 'gulf-gcc-nri-tax-guide', stat: 'DTAA 10%' },
  { flag: 'https://flagcdn.com/w40/om.png', name: 'Oman', slug: 'gulf-gcc-nri-tax-guide', stat: 'Golden Visa' },
  { flag: 'https://flagcdn.com/w40/kw.png', name: 'Kuwait', slug: 'gulf-gcc-nri-tax-guide', stat: 'No DTAA!' },
];

/* STATS_BAR is now computed inside the component to use dynamic blog count */

/* ─── Topic accent colors ─────────────────────────────────── */
const TOPIC_COLORS = {
  property: '#2A6B4A',
  country: '#1D4ED8',
  filing: '#B07D3A',
  income: '#7C3AED',
  banking: '#A04848',
  planning: '#059669',
  compliance: '#6B4C9A',
};

/* ─── Spotlight sections for the curated homepage ──────────── */
const SPOTLIGHT_SECTIONS = [
  { topicId: 'property', heading: 'Property & Capital Gains', icon: '\u{1F3E0}' },
  { topicId: 'country', heading: 'Country Guides', icon: '\u{1F30D}' },
  { topicId: 'filing', heading: 'Filing & TDS', icon: '\u{1F4CB}' },
];

/* ─── Blog Card Component ─────────────────────────────────── */
function BlogCard({ blog }) {
  return (
    <a
      href={`/blog/${blog.slug}`}
      className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="h-1" style={{ background: blog.color }} />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide"
            style={{ background: `${blog.color}12`, color: blog.color }}
          >
            {blog.category.toUpperCase()}
          </span>
          <span className="text-[11px] ml-auto" style={{ color: 'var(--text-muted)' }}>
            {blog.readTime}
          </span>
        </div>
        <h4 className="font-serif font-bold text-[15px] leading-snug mb-1.5 group-hover:underline decoration-1 underline-offset-2 line-clamp-2">
          {blog.title}
        </h4>
        <p className="text-xs line-clamp-1 mb-3" style={{ color: 'var(--text-secondary)' }}>
          {blog.excerpt}
        </p>
        <div className="flex items-center gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          {blog.keyNumbers.slice(0, 2).map((kn, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span className="font-bold" style={{ color: 'var(--accent)' }}>{kn.value}</span>
              <span style={{ color: 'var(--text-muted)' }}>{kn.label}</span>
            </div>
          ))}
        </div>
      </div>
    </a>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function BlogHubClient({ blogs }) {
  const { theme, toggleTheme } = useTheme();
  const [activeTopic, setActiveTopic] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const isDark = theme === 'dark';

  const STATS_BAR = [
    { value: String(blogs.length), label: 'Expert Guides' },
    { value: '576K+', label: 'Words of Content' },
    { value: '30+', label: 'Countries Covered' },
    { value: 'FY 2025-26', label: 'All Numbers Verified' },
  ];

  const featured = blogs.filter(b => b.featured);
  const [featIdx, featGo] = useSlider(featured, 6000);

  /* Filtered blogs for search or topic selection */
  const filtered = useMemo(() => {
    return blogs.filter(b => {
      const matchTopic = activeTopic === 'all' || b.topic === activeTopic;
      const matchSearch = !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTopic && matchSearch;
    });
  }, [blogs, activeTopic, searchQuery]);

  /* Topic counts for the browse-all grid */
  const topicCounts = useMemo(() => {
    const counts = {};
    blogs.forEach(b => { counts[b.topic] = (counts[b.topic] || 0) + 1; });
    return counts;
  }, [blogs]);

  /* Blogs grouped by topic for spotlight sections */
  const blogsByTopic = useMemo(() => {
    const grouped = {};
    blogs.forEach(b => {
      if (!grouped[b.topic]) grouped[b.topic] = [];
      grouped[b.topic].push(b);
    });
    return grouped;
  }, [blogs]);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog-hub' }),
      });
    } catch (e) {
      // Fallback to localStorage if API fails
      const leads = JSON.parse(localStorage.getItem('nri-leads') || '[]');
      leads.push({ email, source: 'blog-hub', ts: new Date().toISOString() });
      localStorage.setItem('nri-leads', JSON.stringify(leads));
    }
    setLeadSubmitted(true);
    setEmail('');
  };

  /* Which topic is currently selected (for header display) */
  const currentTopic = TOPICS.find(t => t.id === activeTopic);

  return (
    <div className="min-h-screen page-enter" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* ══ NAV ══ */}
      <NavBar />

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
        {activeTopic === 'all' && !searchQuery && (
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
        {activeTopic === 'all' && !searchQuery && (
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
                    <div className="mb-2"><img src={c.flag} alt={c.name} width={32} height={22} className="rounded-sm mx-auto" /></div>
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
        {activeTopic === 'all' && !searchQuery && (
          <section className="mb-14 rounded-2xl p-6 md:p-8" style={{ background: isDark ? 'rgba(196,154,60,0.06)' : 'linear-gradient(135deg, #fef9ee 0%, #fdf2d8 100%)', border: '1px solid rgba(196,154,60,0.2)' }}>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="text-3xl mb-3">{'\u{1F4CB}'}</div>
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
        {activeTopic === 'all' && !searchQuery && (
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

        {/* ══ SEARCH + TOPIC FILTERS ══ */}
        <div className="mb-8">
          <div className="relative mb-5">
            <input
              type="text"
              placeholder="Search 97 guides... (try: property sale, TDS, FBAR, DTAA, NRE, FEMA, ESOP)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl text-sm transition-all focus:shadow-lg"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-40">&#x1F50D;</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {TOPICS.map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                title={topic.desc || ''}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 flex-shrink-0"
                style={{
                  background: activeTopic === topic.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: activeTopic === topic.id ? 'var(--text-on-cta)' : 'var(--text-secondary)',
                  border: `1px solid ${activeTopic === topic.id ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {topic.icon} {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ CONTENT AREA ══ */}
        <section>
          {searchQuery ? (
            /* ── SEARCH RESULTS ── */
            <>
              <h2 className="font-serif text-2xl mb-6">
                Results for &ldquo;{searchQuery}&rdquo;
                <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>({filtered.length})</span>
              </h2>
              {filtered.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-3xl mb-3">&#x1F50D;</p>
                  <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No guides found for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Try a different search term or browse by topic.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(blog => <BlogCard key={blog.slug} blog={blog} />)}
                </div>
              )}
            </>

          ) : activeTopic !== 'all' ? (
            /* ── SPECIFIC TOPIC SELECTED ── */
            <>
              {/* Topic header */}
              <div className="mb-8 rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `3px solid ${TOPIC_COLORS[activeTopic] || 'var(--accent)'}` }}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{currentTopic?.icon}</span>
                  <div>
                    <h2 className="font-serif text-2xl mb-1">{currentTopic?.label}</h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{currentTopic?.desc}</p>
                  </div>
                  <span className="ml-auto px-3 py-1 rounded-full text-sm font-bold" style={{ background: `${TOPIC_COLORS[activeTopic] || 'var(--accent)'}15`, color: TOPIC_COLORS[activeTopic] || 'var(--accent)' }}>
                    {filtered.length} guides
                  </span>
                </div>
              </div>
              {filtered.length === 0 ? (
                <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-3xl mb-3">&#x1F50D;</p>
                  <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>No guides found in this topic.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map(blog => <BlogCard key={blog.slug} blog={blog} />)}
                </div>
              )}
            </>

          ) : (
            /* ── CURATED HOMEPAGE (All + no search) ── */
            <div>
              {/* Spotlight Sections — 3 topics x 3 cards each */}
              <div className="space-y-10 mb-14">
                {SPOTLIGHT_SECTIONS.map(section => {
                  const topicBlogs = (blogsByTopic[section.topicId] || []).slice(0, 3);
                  const accentColor = TOPIC_COLORS[section.topicId] || 'var(--accent)';
                  if (topicBlogs.length === 0) return null;
                  return (
                    <div key={section.topicId}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-serif text-xl flex items-center gap-2.5">
                          <span className="text-2xl">{section.icon}</span>
                          <span>{section.heading}</span>
                        </h3>
                        <button
                          onClick={() => setActiveTopic(section.topicId)}
                          className="text-sm font-medium transition-all hover:underline underline-offset-2"
                          style={{ color: accentColor }}
                        >
                          View all {topicCounts[section.topicId] || 0} &rarr;
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {topicBlogs.map(blog => <BlogCard key={blog.slug} blog={blog} />)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Browse All Topics — grid of topic navigation cards */}
              <div>
                <h3 className="font-serif text-2xl mb-6">Browse All Topics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {TOPICS.filter(t => t.id !== 'all').map(topic => {
                    const count = topicCounts[topic.id] || 0;
                    const accentColor = TOPIC_COLORS[topic.id] || 'var(--accent)';
                    return (
                      <button
                        key={topic.id}
                        onClick={() => setActiveTopic(topic.id)}
                        className="group rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `3px solid ${accentColor}` }}
                      >
                        <div className="text-3xl mb-3">{topic.icon}</div>
                        <div className="font-serif font-bold text-sm mb-1 group-hover:underline underline-offset-2">{topic.label}</div>
                        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{topic.desc}</p>
                        <div className="text-xs font-bold" style={{ color: accentColor }}>{count} guides &rarr;</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
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
        {activeTopic === 'all' && !searchQuery && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl mb-6 text-center">Why NRIs Trust MKW Advisors</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { icon: '\u{1F393}', title: 'Qualified Expert', desc: 'CA Mayank Wadhera — CA, CS, CMA, IBBI Registered Valuer' },
                { icon: '\u{1F30D}', title: '30+ Countries', desc: 'Serving NRIs across USA, UK, UAE, Canada, Singapore, Australia' },
                { icon: '\u{1F916}', title: 'AI-Powered', desc: '10 specialist AI modules analyze your case in under 2 minutes' },
                { icon: '\u{1F4C4}', title: 'Professional Deliverables', desc: 'Computation sheets, advisory memos, engagement documents' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="text-2xl mb-2">{item.icon}</div>
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
      <Footer />
    </div>
  );
}
