'use client';
import { useState, useEffect } from 'react';
import { BLOGS, CATEGORIES, ASSESSMENTS } from './data';

export default function BlogHub() {
  const [theme, setTheme] = useState('light');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('nri-theme') || 'light';
    setTheme(saved);
  }, []);

  const isDark = theme === 'dark';

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nri-theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
  }

  const filtered = BLOGS.filter(b => {
    const matchCategory = activeCategory === 'all' || b.category === activeCategory;
    const matchSearch = !searchQuery ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const featured = BLOGS.filter(b => b.featured);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* NAV */}
      <nav style={{ background: 'var(--bg-nav)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--accent)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>NT</span>
            </div>
            <span className="font-serif text-lg tracking-wide" style={{ color: 'var(--text-nav)' }}>NRI Tax Suite</span>
          </a>
          <div className="flex gap-3 items-center">
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.12)', color: 'var(--accent)', border: '1px solid rgba(196,154,60,0.3)' }}>
              {isDark ? '\u2600' : '\u263D'}
            </button>
            <a href="/client" className="px-5 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
              Start Filing &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {isDark && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(196,154,60,0.08) 0%, transparent 70%)' }} />}
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-16 pb-12 relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ background: 'var(--bg-badge)', color: 'var(--text-badge)' }}>
            NRI Knowledge Hub &middot; FY 2025-26 &middot; Updated March 2026
          </div>
          <h1 className="font-serif text-4xl md:text-5xl mb-4" style={{ lineHeight: 1.15 }}>
            Expert NRI Tax <span style={{ color: 'var(--accent)' }}>Guides & Insights</span>
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            Authoritative guides by CA Mayank Wadhera (CA | CS | CMA | IBBI Registered Valuer).
            Every number verified for AY 2026-27. Built from analysis of 4,800+ expert discussions.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 md:px-12 pb-20">

        {/* SEARCH + CATEGORIES */}
        <div className="mb-10">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search guides... (try: property sale, TDS, DTAA, NRE, FEMA)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl text-sm"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg opacity-40">🔍</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  background: activeCategory === cat.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: activeCategory === cat.id ? 'var(--text-on-cta)' : 'var(--text-secondary)',
                  border: `1px solid ${activeCategory === cat.id ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* FEATURED GUIDES */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl mb-6">Featured Guides</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {featured.slice(0, 2).map(blog => (
                <a
                  key={blog.slug}
                  href={`/blog/${blog.slug}`}
                  className="group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{blog.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: `${blog.color}20`, color: blog.color }}>
                          {blog.category.toUpperCase()}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{blog.readTime} read</span>
                      </div>
                      <h3 className="font-serif text-xl mb-1 group-hover:underline">{blog.title}</h3>
                      <p className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{blog.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{blog.excerpt}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {blog.keyNumbers.map((kn, i) => (
                      <div key={i} className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-primary)' }}>
                        <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{kn.value}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{kn.label}</div>
                      </div>
                    ))}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* SELF-ASSESSMENT TOOLS */}
        {activeCategory === 'all' && !searchQuery && (
          <section className="mb-14">
            <h2 className="font-serif text-2xl mb-2">Quick Self-Assessments</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Interactive tools to answer your most pressing NRI tax questions in under 3 minutes.</p>
            <div className="grid md:grid-cols-3 gap-4">
              {ASSESSMENTS.map(a => (
                <a
                  key={a.slug}
                  href={`/blog/assess/${a.slug}`}
                  className="group rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div className="text-2xl mb-3">{a.icon}</div>
                  <h3 className="font-serif text-lg mb-1">{a.title}</h3>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--accent)' }}>{a.subtitle}</p>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{a.description}</p>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{a.questions} questions</span>
                    <span>&middot;</span>
                    <span>{a.time}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ALL GUIDES */}
        <section>
          <h2 className="font-serif text-2xl mb-6">
            {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'all' ? 'All Guides & Articles' : CATEGORIES.find(c => c.id === activeCategory)?.label}
            <span className="text-sm font-normal ml-2" style={{ color: 'var(--text-muted)' }}>({filtered.length})</span>
          </h2>

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg" style={{ color: 'var(--text-muted)' }}>No guides found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(blog => (
                <a
                  key={blog.slug}
                  href={`/blog/${blog.slug}`}
                  className="group rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  {/* Color bar */}
                  <div className="h-1.5" style={{ background: blog.color }} />

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{blog.icon}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: `${blog.color}15`, color: blog.color }}>
                        {blog.category.toUpperCase()}
                      </span>
                      <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{blog.readTime}</span>
                    </div>

                    <h3 className="font-serif text-lg mb-1 group-hover:underline decoration-1 underline-offset-2">{blog.title}</h3>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--accent)' }}>{blog.subtitle}</p>
                    <p className="text-sm line-clamp-2 mb-4" style={{ color: 'var(--text-secondary)' }}>{blog.excerpt}</p>

                    {/* Quick answer preview */}
                    <div className="rounded-lg p-3 mb-3" style={{ background: 'var(--bg-primary)', borderLeft: `3px solid ${blog.color}` }}>
                      <p className="text-xs font-medium mb-1" style={{ color: blog.color }}>Quick Answer</p>
                      <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{blog.quickAnswer}</p>
                    </div>

                    {/* Key numbers */}
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
          )}
        </section>

        {/* CTA SECTION */}
        <section className="mt-16 rounded-2xl p-8 md:p-12 text-center" style={{ background: 'var(--bg-nav)' }}>
          <h2 className="font-serif text-2xl md:text-3xl mb-3" style={{ color: 'var(--text-on-dark)' }}>
            Ready for Expert NRI Tax Advisory?
          </h2>
          <p className="text-sm mb-6 max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            CA Mayank Wadhera and the MKW Advisors team handle everything — from tax computation to ITR filing to repatriation. Serving NRIs across 30+ countries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/client" className="px-8 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
              Free Tax Assessment &rarr;
            </a>
            <a href="https://wa.me/919667744073" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105" style={{ border: '1px solid rgba(196,154,60,0.4)', color: 'var(--accent)' }}>
              WhatsApp: +91-96677 44073
            </a>
          </div>
          <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
            MKW Advisors &middot; Legal Suvidha &middot; DigiComply &middot; CA | CS | CMA | IBBI Registered Valuer
          </p>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ background: 'var(--bg-footer)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>&copy; 2026 MKW Advisors. CA | CS | CMA | IBBI Registered Valuer</p>
          <div className="flex gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a href="/blog" className="hover:underline" style={{ color: 'var(--accent)' }}>Knowledge Hub</a>
            <a href="/client" className="hover:underline">Start Filing</a>
            <a href="/terms" className="hover:underline">Terms</a>
            <a href="/privacy" className="hover:underline">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
