'use client';
import { useState } from 'react';
import { useTheme } from '@/app/theme-provider';
import { createClient } from '@/lib/supabase-browser';
import NavBar from '@/app/components/NavBar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const { theme, toggleTheme } = useTheme();
  const supabase = createClient();

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

  async function handleResetPassword(e) {
    e.preventDefault();
    setError('');
    setResetLink('');
    const cleanedEmail = (email || '').trim().toLowerCase();
    if (!cleanedEmail) { setError('Enter your email address first'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanedEmail }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok || data.error) { setError(data.error || 'Could not send reset link. Please try again.'); return; }
      if (data.actionLink) setResetLink(data.actionLink);
      setResetSent(true);
    } catch {
      setLoading(false);
      setError('Network error. Please check your connection and try again.');
    }
  }

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen bg-theme flex flex-col">
      <NavBar />

      {/* Form area */}
      <div id="main-content" className="flex-1 flex items-center justify-center px-6 pb-12">
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
            {resetMode ? (
              resetSent ? (
                <div className="text-center">
                  {resetLink ? (
                    <>
                      <div className="mb-3 rounded-lg px-4 py-3 text-xs font-medium text-left" style={{
                        background: 'rgba(196,154,60,0.08)', border: '1px solid rgba(196,154,60,0.25)', color: 'var(--accent)',
                      }}>
                        Email delivery is not configured yet. Copy this link and open it in your browser to reset your password:
                      </div>
                      <div className="mb-3 rounded-lg px-3 py-2 text-xs break-all text-left" style={{
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all',
                      }}>
                        {resetLink}
                      </div>
                      <button type="button" onClick={() => { try { navigator.clipboard.writeText(resetLink); } catch {} }}
                        className="btn-dark w-full py-2 mb-4 text-xs">
                        Copy Link
                      </button>
                    </>
                  ) : (
                    <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium" style={{
                      background: 'rgba(42,107,74,0.08)', border: '1px solid rgba(42,107,74,0.2)', color: 'var(--green)',
                    }}>
                      Password reset email sent. Check your inbox.
                    </div>
                  )}
                  <button type="button"
                    onClick={() => { setResetMode(false); setResetSent(false); setResetLink(''); setError(''); }}
                    className="text-xs text-theme-accent font-semibold hover:underline">
                    Back to login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword}>
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
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => { setResetMode(false); setError(''); }}
                      className="text-xs text-theme-accent font-semibold hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              )
            ) : (
              <>
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
                  <div className="mb-1">
                    <label className="block text-xs font-semibold text-theme-secondary mb-1.5 uppercase tracking-wide">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="input-theme"
                      placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                    />
                  </div>
                  <div className="mb-6 text-right">
                    <button type="button" onClick={() => setResetMode(true)} className="text-xs text-theme-accent hover:underline mt-1">
                      Forgot password?
                    </button>
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

                <div className="mt-5 text-center">
                  <p className="text-xs text-theme-muted">
                    Need team access? <a href="mailto:tax@mkwadvisors.com" className="text-theme-accent hover:underline">Contact your administrator</a>
                  </p>
                </div>
                <div className="mt-2 text-center text-xs text-theme-muted">
                  NRI client?{' '}
                  <a href="/client" className="text-theme-accent font-semibold hover:underline">
                    Start filing directly &rarr;
                  </a>
                </div>
              </>
            )}
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
