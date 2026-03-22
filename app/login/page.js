'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const supabase = createClient();

  useEffect(() => {
    const saved = localStorage.getItem('nri-theme') || 'light';
    setTheme(saved);
  }, []);

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('nri-theme', next);
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '');
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Check role and redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/dashboard';
        return;
      }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'client') {
        window.location.href = '/client';
      } else {
        window.location.href = '/dashboard';
      }
    }
  }

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-theme flex flex-col">
      {/* Minimal top bar with theme toggle */}
      <div className="flex items-center justify-between px-6 md:px-12 py-4">
        <a href="/" className="font-serif text-lg text-theme-accent tracking-wide font-bold">
          NRI Tax Suite
        </a>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 hover:scale-110"
          style={{
            background: isDark ? 'rgba(196,154,60,0.15)' : 'rgba(26,26,26,0.06)',
            color: 'var(--accent)',
          }}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '\u2600\uFE0F' : '\uD83C\uDF19'}
        </button>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="font-serif text-3xl font-bold text-theme mb-2">Welcome Back</h1>
            <p className="text-theme-secondary text-sm">Sign in to your account</p>
          </div>

          {/* Gold accent bar */}
          <div className="flex justify-center mb-6 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <div
              className="h-[3px] w-16 rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))' }}
            />
          </div>

          {/* Card */}
          <div
            className="card-theme p-8 shadow-sm animate-fade-in-up"
            style={{ animationDelay: '120ms' }}
          >
            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block text-xs font-semibold text-theme-secondary mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="input-theme"
                  placeholder="you@email.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-xs font-semibold text-theme-secondary mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input-theme"
                  placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                />
              </div>

              {error && (
                <div className="mb-4 rounded-lg px-4 py-2.5 text-xs font-medium" style={{
                  background: 'rgba(160,72,72,0.08)',
                  border: '1px solid rgba(160,72,72,0.2)',
                  color: 'var(--red)',
                }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-dark w-full py-3">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-theme-muted">
              New here?{' '}
              <a href="/signup" className="text-theme-accent font-semibold hover:underline">
                Create an account
              </a>
            </div>
            <div className="mt-2 text-center text-xs text-theme-muted">
              NRI client?{' '}
              <a href="/client" className="text-theme-accent font-semibold hover:underline">
                Start filing directly &rarr;
              </a>
            </div>
          </div>

          {/* Footer trust text */}
          <div className="text-center mt-8 animate-fade-in-up" style={{ animationDelay: '240ms' }}>
            <div className="flex items-center justify-center gap-2 text-theme-muted">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-[11px] tracking-wide">Protected by enterprise-grade encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
