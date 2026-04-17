'use client';
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/app/theme-provider';
import { usePathname } from 'next/navigation';
import { Menu, X, Sun, Moon, BookOpen, FileText, Search, User, LogIn } from 'lucide-react';

export default function NavBar({ variant = 'solid' }) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (variant !== 'transparent') return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [variant]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

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

  function isActive(href) {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 transition-all duration-300 backdrop-saturate-150"
        style={{
          background: isTransparent ? 'transparent' : 'var(--bg-nav)',
          boxShadow: isTransparent ? 'none' : '0 18px 50px rgba(0,0,0,0.18)',
          backdropFilter: isTransparent ? 'none' : 'blur(18px)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-5 md:px-10 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5" aria-label="NRI Tax Suite home">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ border: '1.5px solid var(--accent)', background: 'rgba(4,107,210,0.08)' }}>
              <span className="text-[11px] font-bold tracking-tight" style={{ color: 'var(--accent)' }}>NT</span>
            </div>
            <span className="font-serif text-base tracking-wide hidden sm:inline" style={{ color: 'var(--text-nav, #fff)' }}>
              NRI Tax Suite
            </span>
          </a>

          {/* Desktop — center links (client-facing) */}
          <div className="hidden md:flex items-center gap-2">
            {[
              { label: 'Knowledge Hub', href: '/blog', icon: BookOpen },
              { label: 'Start Filing', href: '/client', icon: FileText },
              { label: 'Track Case', href: '/portal', icon: Search },
              { label: 'My Cases', href: '/my-cases', icon: User },
            ].map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <a key={link.href} href={link.href}
                  className={`nav-link ${active ? 'nav-link-active' : ''}`}
                >
                  <Icon size={15} style={{ opacity: 0.75 }} />
                  {link.label}
                </a>
              );
            })}
          </div>

          {/* Desktop — right side (secondary actions) */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={toggleTheme}
              className="nav-icon-button"
              style={{ color: 'var(--accent)' }}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            <div className="w-px h-5 bg-white/10" />

            <a href="/login" className="nav-cta">
              <LogIn size={13} />
              Team
            </a>
          </div>

          {/* Mobile — right side */}
          <div className="flex md:hidden items-center gap-1.5">
            <button onClick={toggleTheme}
              className="nav-icon-button"
              style={{ color: 'var(--accent)' }}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={() => setMenuOpen(true)}
              className="nav-icon-button"
              style={{ color: 'rgba(255,255,255,0.85)' }}
              aria-label="Open menu" aria-expanded={menuOpen}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer backdrop */}
      <div
        className={`fixed inset-0 z-[60] transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[70] w-[280px] flex flex-col transition-transform duration-300 ease-out md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--bg-nav)' }}
        role="dialog" aria-modal="true" aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-14">
          <span className="font-serif text-base" style={{ color: 'var(--text-nav, #fff)' }}>Menu</span>
          <button onClick={() => setMenuOpen(false)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ color: 'rgba(255,255,255,0.7)' }}
            aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="h-px mx-5" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Primary links — for NRI clients */}
        <div className="px-4 pt-4 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            For NRI Clients
          </p>
          {[
            { label: 'Start Filing', href: '/client', icon: FileText, desc: 'Begin your tax assessment' },
            { label: 'Track Your Case', href: '/portal', icon: Search, desc: 'Check case progress' },
            { label: 'My Cases', href: '/my-cases', icon: User, desc: 'View all your cases' },
            { label: 'Knowledge Hub', href: '/blog', icon: BookOpen, desc: '100+ tax guides' },
          ].map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <a key={link.href} href={link.href}
                className="flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200"
                style={{
                  color: active ? 'var(--accent)' : 'rgba(255,255,255,0.85)',
                  background: active ? 'rgba(4,107,210,0.08)' : 'transparent',
                }}>
                <Icon size={18} className="mt-0.5 flex-shrink-0" style={{ opacity: 0.6 }} />
                <div>
                  <div className="text-sm font-medium">{link.label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{link.desc}</div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="h-px mx-5" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Secondary — for team */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
            For Team
          </p>
          <a href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <LogIn size={16} style={{ opacity: 0.5 }} />
            Team Login
          </a>
        </div>

        {/* Drawer CTA */}
        <div className="mt-auto px-5 pb-6">
          <a href="/client"
            className="block w-full text-center px-5 py-3 rounded-xl text-sm font-bold transition-all duration-300"
            style={{ background: 'var(--accent)', color: '#1a1a1a' }}>
            Start Filing →
          </a>
          <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
            MKW Advisors · CA · CS · CMA
          </p>
        </div>
      </div>
    </>
  );
}
