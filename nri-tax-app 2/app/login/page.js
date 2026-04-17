'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'client') {
        window.location.href = '/client';
      } else {
        window.location.href = '/dashboard';
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f2ec] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <a href="/" className="font-serif text-2xl font-bold text-[#C49A3C]">NRI TAX SUITE</a>
          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-300 outline-none" placeholder="you@email.com" />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-300 outline-none" placeholder="••••••••" />
            </div>
            {error && <div className="text-red-600 text-xs mb-4 bg-red-50 p-2 rounded">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-400">
            New here? <a href="/signup" className="text-[#C49A3C] font-semibold hover:underline">Create an account</a>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
            NRI client? <a href="/client" className="text-[#C49A3C] font-semibold hover:underline">Start filing directly →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
