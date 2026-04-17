'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import NavBar from '@/app/components/NavBar';

function readTokensFromUrl() {
  const out = { access_token: '', refresh_token: '', type: '' };

  // Supabase can return tokens in the URL hash (implicit flow) or query.
  const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : '';
  const search = typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '';

  const parse = (str) => {
    const params = new URLSearchParams(str);
    return {
      access_token: params.get('access_token') || '',
      refresh_token: params.get('refresh_token') || '',
      type: params.get('type') || '',
    };
  };

  const fromHash = parse(hash);
  const fromSearch = parse(search);

  return {
    access_token: fromHash.access_token || fromSearch.access_token || '',
    refresh_token: fromHash.refresh_token || fromSearch.refresh_token || '',
    type: fromHash.type || fromSearch.type || '',
  };
}

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);

  const [stage, setStage] = useState('loading'); // loading | ready | success | error
  const [error, setError] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function init() {
      setError('');
      const { access_token, refresh_token } = readTokensFromUrl();
      if (!access_token || !refresh_token) {
        setStage('error');
        setError('Reset link is missing required tokens. Please request a new password reset email.');
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        setStage('error');
        setError(sessionError.message || 'Unable to initialize reset session. Please request a new link.');
        return;
      }

      // Clean URL (remove tokens)
      try {
        window.history.replaceState(null, '', '/reset-password');
      } catch {}

      setStage('ready');
    }
    init();
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!pw || pw.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (pw !== pw2) {
      setError('Passwords do not match.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);

    if (updateError) {
      setStage('error');
      setError(updateError.message || 'Failed to update password. Please try again.');
      return;
    }

    setStage('success');
  }

  return (
    <div className="min-h-screen bg-theme flex flex-col">
      <NavBar />
      <div id="main-content" className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="font-serif text-3xl font-bold text-theme mb-2">Set a New Password</h1>
            <p className="text-theme-secondary text-sm">Choose a strong password for your team account.</p>
          </div>

          <div className="card-theme p-8 shadow-sm animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            {stage === 'loading' && (
              <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
                <p className="text-theme-muted mt-4 text-sm">Preparing secure reset…</p>
              </div>
            )}

            {stage === 'success' && (
              <div className="text-center">
                <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium" style={{
                  background: 'rgba(42,107,74,0.08)',
                  border: '1px solid rgba(42,107,74,0.2)',
                  color: 'var(--green)',
                }}>
                  Password updated successfully. You can now sign in.
                </div>
                <a href="/login" className="btn-dark w-full py-3 inline-block text-center">
                  Go to Login
                </a>
              </div>
            )}

            {stage === 'error' && (
              <div className="text-center">
                <div className="mb-4 rounded-lg px-4 py-3 text-sm font-medium" style={{
                  background: 'rgba(160,72,72,0.08)',
                  border: '1px solid rgba(160,72,72,0.2)',
                  color: 'var(--red)',
                }}>
                  {error || 'Something went wrong.'}
                </div>
                <a href="/login" className="text-xs text-theme-accent font-semibold hover:underline">
                  Back to login
                </a>
              </div>
            )}

            {stage === 'ready' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-theme-secondary mb-1.5 uppercase tracking-wide">
                    New password
                  </label>
                  <input
                    type="password"
                    value={pw}
                    onChange={e => setPw(e.target.value)}
                    required
                    className="input-theme"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-theme-secondary mb-1.5 uppercase tracking-wide">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={pw2}
                    onChange={e => setPw2(e.target.value)}
                    required
                    className="input-theme"
                    placeholder="Repeat password"
                    autoComplete="new-password"
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

                <button type="submit" disabled={saving} className="btn-dark w-full py-3">
                  {saving ? 'Saving...' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

