'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/theme-provider';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Knowledge Hub', href: '/blog' },
  { label: 'Start Filing', href: '/client' },
  { label: 'Track Case', href: '/portal' },
];

export default function NavBar({ variant = 'solid' }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for transparent variant
  useEffect(() => {
    if (variant !== 'transparent') return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll(); // set initial state
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close drawer on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [menuOpen, handleKeyDown]);

  const isTransparent = variant === 'transparent' && !scrolled;

  const navBg = isTransparent
    ? 'transparent'
    : 'var(--bg-nav)';

  const navShadow = isTransparent
    ? 'none'
    : '0 1px 0 0 rgba(255,255,255,0.06)';

  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: navBg,
          boxShadow: navShadow,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-3 logo-gold-underline"
            aria-label="NRI Tax Suite home"
          >
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
              className="font-serif text-lg tracking-wide"
              style={{ color: 'var(--text-nav)' }}
            >
              NRI Tax Suite
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium transition-colors duration-200 py-1"
                style={{
                  color: isActive(link.href)
                    ? 'var(--text-on-dark)'
                    : 'var(--text-muted)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(link.href)) e.currentTarget.style.color = 'var(--text-on-dark)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive(link.href)) e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: 'var(--accent)' }}
                  />
                )}
              </a>
            ))}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(196,154,60,0.3)',
              }}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to Luxury Consultancy theme' : 'Switch to Premium Financial theme'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Team Login */}
            <a
              href="/login"
              className="text-sm font-medium transition-colors duration-200"
              style={{
                color: isActive('/login') ? 'var(--text-on-dark)' : 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                if (!isActive('/login')) e.currentTarget.style.color = 'var(--text-on-dark)';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/login')) e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              Team Login
            </a>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(255,255,255,0.12)',
                color: 'var(--accent)',
                border: '1px solid rgba(196,154,60,0.3)',
              }}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
              style={{ color: 'var(--text-on-dark)' }}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-72 flex flex-col transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--bg-nav)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16">
          <span
            className="font-serif text-lg tracking-wide"
            style={{ color: 'var(--text-nav)' }}
          >
            NRI Tax Suite
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ color: 'var(--text-on-dark)' }}
            aria-label="Close navigation menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px mx-6" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Drawer links */}
        <div className="flex-1 px-6 py-6 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                color: isActive(link.href) ? 'var(--accent)' : 'var(--text-on-dark)',
                background: isActive(link.href) ? 'rgba(196,154,60,0.1)' : 'transparent',
              }}
            >
              {isActive(link.href) && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--accent)' }}
                />
              )}
              {link.label}
            </a>
          ))}

          <div className="h-px my-3" style={{ background: 'rgba(255,255,255,0.08)' }} />

          <a
            href="/login"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              color: isActive('/login') ? 'var(--accent)' : 'var(--text-muted)',
              background: isActive('/login') ? 'rgba(196,154,60,0.1)' : 'transparent',
            }}
          >
            {isActive('/login') && (
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--accent)' }}
              />
            )}
            Team Login
          </a>
        </div>

        {/* Drawer footer */}
        <div className="px-6 pb-8">
          <a
            href="/client"
            className="block w-full text-center px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'var(--bg-cta)',
              color: 'var(--text-on-cta)',
            }}
          >
            Start Filing &rarr;
          </a>
          <p
            className="text-center text-[10px] mt-4 tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            MKW Advisors &middot; CA &middot; CS &middot; CMA
          </p>
        </div>
      </div>
    </>
  );
}
