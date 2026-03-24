'use client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/theme-provider';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BLOGS } from '../data';

export default function BlogPost() {
  const { slug } = useParams();
  const { theme, toggleTheme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [blogContent, setBlogContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareMsg, setShareMsg] = useState('');
  const [emailResult, setEmailResult] = useState('');
  const [resultEmail, setResultEmail] = useState('');
  const contentRef = useRef(null);
  const blog = BLOGS.find(b => b.slug === slug);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/blog?slug=${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.content) setBlogContent(data.content);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const el = contentRef.current;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isDark = theme === 'dark';

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4">Guide Not Found</h1>
          <a href="/blog" className="text-sm underline" style={{ color: 'var(--accent)' }}>Back to Knowledge Hub</a>
        </div>
      </div>
    );
  }

  const relatedBlogs = BLOGS.filter(b => b.slug !== slug && (b.category === blog.category || b.tags.some(t => blog.tags.includes(t)))).slice(0, 6);

  // Next/Prev navigation
  const currentIdx = BLOGS.findIndex(b => b.slug === slug);
  const prevBlog = currentIdx > 0 ? BLOGS[currentIdx - 1] : null;
  const nextBlog = currentIdx < BLOGS.length - 1 ? BLOGS[currentIdx + 1] : null;

  // Share + email
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = blog ? `${blog.title} — ${blog.subtitle}` : '';

  const handleShare = (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const urls = {
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      copy: null,
    };
    if (platform === 'copy') {
      navigator.clipboard?.writeText(shareUrl).then(() => { setShareMsg('Link copied!'); setTimeout(() => setShareMsg(''), 2000); });
    } else {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  const handleEmailSave = (e) => {
    e.preventDefault();
    if (!resultEmail) return;
    const leads = JSON.parse(localStorage.getItem('nri-leads') || '[]');
    leads.push({ email: resultEmail, source: `blog-${slug}`, ts: new Date().toISOString() });
    localStorage.setItem('nri-leads', JSON.stringify(leads));
    setEmailResult('sent');
    setResultEmail('');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1" style={{ background: 'var(--border)' }}>
        <div className="h-full transition-all duration-150" style={{ width: `${progress}%`, background: blog.color }} />
      </div>

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
            <a href="/blog" className="text-sm" style={{ color: 'var(--text-muted)' }}>Knowledge Hub</a>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{ background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.12)', color: 'var(--accent)', border: '1px solid rgba(196,154,60,0.3)' }}>
              {isDark ? '\u2600' : '\u263D'}
            </button>
            <a href="/client" className="px-5 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
              Free Assessment &rarr;
            </a>
          </div>
        </div>
      </nav>

      {/* ARTICLE HEADER */}
      <header className="relative overflow-hidden">
        {isDark && <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(196,154,60,0.06) 0%, transparent 70%)' }} />}
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-8 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <a href="/blog" className="hover:underline" style={{ color: 'var(--accent)' }}>Knowledge Hub</a>
            <span>/</span>
            <span>{blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{blog.icon}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${blog.color}20`, color: blog.color }}>
              {blog.category.toUpperCase()}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{blog.readTime} read</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl mb-2" style={{ lineHeight: 1.2 }}>
            {blog.title}
          </h1>
          <p className="text-lg font-medium mb-6" style={{ color: 'var(--accent)' }}>
            {blog.subtitle}
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 mb-6 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-serif font-bold text-sm" style={{ background: 'var(--accent)', color: 'var(--text-on-cta)' }}>
              MW
            </div>
            <div>
              <p className="text-sm font-semibold">CA Mayank Wadhera</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                CA | CS | CMA | IBBI Registered Valuer &middot; MKW Advisors
              </p>
            </div>
            <div className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
              Updated March 2026
            </div>
          </div>

          {/* Key Numbers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {blog.keyNumbers.map((kn, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--accent)' }}>{kn.value}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{kn.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Answer */}
          <div className="rounded-xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `4px solid ${blog.color}` }}>
            <p className="text-xs font-bold mb-2" style={{ color: blog.color }}>QUICK ANSWER</p>
            <p className="text-sm leading-relaxed">{blog.quickAnswer}</p>
          </div>
        </div>
      </header>

      {/* ARTICLE BODY */}
      <div ref={contentRef} className="max-w-3xl mx-auto px-6 py-8">
        <div className="prose-custom">
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {blog.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Full blog content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
              <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>Loading guide...</p>
            </div>
          ) : blogContent ? (
            <div className="blog-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="font-serif text-3xl mt-10 mb-4" style={{ color: 'var(--text-primary)' }}>{children}</h1>,
                  h2: ({ children }) => <h2 className="font-serif text-2xl mt-10 mb-4 pb-2" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>{children}</h2>,
                  h3: ({ children }) => <h3 className="font-serif text-xl mt-8 mb-3" style={{ color: 'var(--text-primary)' }}>{children}</h3>,
                  h4: ({ children }) => <h4 className="font-bold text-base mt-6 mb-2">{children}</h4>,
                  p: ({ children }) => <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{children}</p>,
                  strong: ({ children }) => <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{children}</strong>,
                  a: ({ href, children }) => {
                    if (href?.startsWith('/')) return <a href={href} className="font-medium underline underline-offset-2" style={{ color: 'var(--accent)' }}>{children}</a>;
                    return <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2" style={{ color: 'var(--accent)' }}>{children}</a>;
                  },
                  ul: ({ children }) => <ul className="text-sm mb-4 pl-5 space-y-1.5" style={{ color: 'var(--text-secondary)', listStyleType: 'disc' }}>{children}</ul>,
                  ol: ({ children }) => <ol className="text-sm mb-4 pl-5 space-y-1.5" style={{ color: 'var(--text-secondary)', listStyleType: 'decimal' }}>{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="rounded-xl p-5 my-6" style={{ background: isDark ? 'rgba(196,154,60,0.08)' : 'rgba(196,154,60,0.06)', borderLeft: '4px solid var(--accent)' }}>
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 rounded-xl" style={{ border: '1px solid var(--border)' }}>
                      <table className="w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead style={{ background: isDark ? 'var(--bg-card)' : 'var(--bg-primary)' }}>{children}</thead>,
                  th: ({ children }) => <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>{children}</th>,
                  td: ({ children }) => <td className="px-4 py-3 text-sm" style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{children}</td>,
                  tr: ({ children }) => <tr className="transition-colors" style={{ }}>{children}</tr>,
                  code: ({ className, children }) => {
                    const isBlock = /language-/.test(className || '');
                    return isBlock
                      ? <code className="block rounded-xl p-4 my-4 text-xs font-mono overflow-x-auto" style={{ background: isDark ? '#0f1625' : '#f8f6f2', color: 'var(--text-secondary)' }}>{children}</code>
                      : <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--bg-card)', color: 'var(--accent)' }}>{children}</code>;
                  },
                  pre: ({ children }) => <pre className="rounded-xl p-4 my-4 overflow-x-auto text-xs" style={{ background: isDark ? '#0f1625' : '#f8f6f2' }}>{children}</pre>,
                  hr: () => <hr className="my-8" style={{ borderColor: 'var(--border)' }} />,
                }}
              >
                {blogContent}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-3xl mb-4">📖</p>
              <h3 className="font-serif text-xl mb-2">Guide Coming Soon</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>This guide is being prepared. Get personalized advice now.</p>
              <a href="/client" className="inline-block px-6 py-3 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
                Get Free Tax Assessment &rarr;
              </a>
            </div>
          )}
        </div>

        {/* MID-ARTICLE CTA */}
        <div className="my-10 rounded-xl p-6" style={{ background: isDark ? 'rgba(196,154,60,0.08)' : 'rgba(196,154,60,0.06)', border: '1px solid rgba(196,154,60,0.2)' }}>
          <div className="flex items-start gap-4">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-bold mb-1">Need personalized advice?</p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Every NRI situation is unique. Our AI-powered tool analyzes your specific case in under 2 minutes.
              </p>
              <a href="/client" className="inline-block px-5 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--accent)', color: 'var(--text-on-cta)' }}>
                Start Your Free Assessment
              </a>
            </div>
          </div>
        </div>

        {/* SHARE BUTTONS */}
        <div className="flex items-center gap-3 mb-10 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>SHARE:</span>
          <button onClick={() => handleShare('whatsapp')} className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105" style={{ background: '#25D366', color: '#fff' }}>WhatsApp</button>
          <button onClick={() => handleShare('twitter')} className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105" style={{ background: '#1DA1F2', color: '#fff' }}>Twitter</button>
          <button onClick={() => handleShare('linkedin')} className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105" style={{ background: '#0077B5', color: '#fff' }}>LinkedIn</button>
          <button onClick={() => handleShare('copy')} className="px-3 py-1.5 rounded-lg text-xs transition-all hover:scale-105" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            {shareMsg || 'Copy Link'}
          </button>
        </div>

        {/* EMAIL THIS GUIDE */}
        <div className="rounded-xl p-5 mb-10" style={{ background: isDark ? 'rgba(196,154,60,0.06)' : 'rgba(196,154,60,0.04)', border: '1px solid rgba(196,154,60,0.2)' }}>
          {emailResult === 'sent' ? (
            <div className="text-center">
              <p className="text-sm font-bold">&#x2705; Saved! Check your email for the guide + bonus tax checklist.</p>
            </div>
          ) : (
            <form onSubmit={handleEmailSave} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-bold mb-0.5">Email this guide to yourself</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Get a copy + our free NRI tax checklist</p>
              </div>
              <input type="email" placeholder="your@email.com" value={resultEmail} onChange={e => setResultEmail(e.target.value)} required className="px-4 py-2.5 rounded-lg text-sm w-full sm:w-64" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }} />
              <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-bold flex-shrink-0" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>Send &rarr;</button>
            </form>
          )}
        </div>

        {/* RELATED GUIDES (expanded to 6) */}
        {relatedBlogs.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif text-2xl mb-2">Keep Reading</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Related guides you might find useful</p>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedBlogs.map(rb => (
                <a key={rb.slug} href={`/blog/${rb.slug}`} className="group rounded-xl p-4 transition-all hover:scale-[1.02]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="h-1 rounded-full mb-3" style={{ background: rb.color }} />
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{rb.icon}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{rb.readTime}</span>
                  </div>
                  <h3 className="font-serif text-sm mb-1 group-hover:underline">{rb.title}</h3>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{rb.excerpt}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* NEXT / PREV NAVIGATION */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {prevBlog ? (
            <a href={`/blog/${prevBlog.slug}`} className="rounded-xl p-4 transition-all hover:scale-[1.01]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>&larr; Previous</p>
              <p className="text-sm font-bold line-clamp-1">{prevBlog.icon} {prevBlog.title}</p>
            </a>
          ) : <div />}
          {nextBlog ? (
            <a href={`/blog/${nextBlog.slug}`} className="rounded-xl p-4 text-right transition-all hover:scale-[1.01]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Next &rarr;</p>
              <p className="text-sm font-bold line-clamp-1">{nextBlog.title} {nextBlog.icon}</p>
            </a>
          ) : <div />}
        </div>

        {/* AUTHOR BIO */}
        <div className="rounded-2xl p-6 mb-12" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-serif font-bold text-xl flex-shrink-0" style={{ background: 'var(--accent)', color: 'var(--text-on-cta)' }}>
              MW
            </div>
            <div>
              <h3 className="font-serif text-lg mb-1">CA Mayank Wadhera</h3>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--accent)' }}>CA | CS | CMA | IBBI Registered Valuer</p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                Founder of MKW Advisors, specializing in NRI taxation, cross-border advisory, and capital gains planning.
                Part of the Legal Suvidha & DigiComply professional services ecosystem. Serving NRIs across 30+ countries.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="https://wa.me/919667744073" target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  WhatsApp
                </a>
                <a href="mailto:contact@mkwadvisors.com" className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  Email
                </a>
                <a href="/client" className="text-xs px-3 py-1.5 rounded-lg font-bold" style={{ background: 'var(--accent)', color: 'var(--text-on-cta)' }}>
                  Book Consultation
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--bg-nav)' }}>
          <h2 className="font-serif text-2xl mb-3" style={{ color: 'var(--text-on-dark)' }}>
            Get Expert Help with Your NRI Taxes
          </h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
            Our AI analyzes your situation in under 2 minutes. CA-reviewed computation. Professional deliverables.
          </p>
          <a href="/client" className="inline-block px-8 py-3 rounded-lg font-bold text-sm transition-all hover:scale-105" style={{ background: 'var(--bg-cta)', color: 'var(--text-on-cta)' }}>
            Start Free Assessment &rarr;
          </a>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mt-12" style={{ background: 'var(--bg-footer)', borderTop: '1px solid var(--border)' }}>
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
