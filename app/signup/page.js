'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (success) return (
    <div className="min-h-screen bg-[#f5f2ec] flex items-center justify-center">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center shadow-sm">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="font-serif text-xl font-bold mb-2">Account Created</h2>
        <p className="text-gray-500 text-sm mb-4">Check your email for a confirmation link. Once confirmed, you can sign in.</p>
        <a href="/login" className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-semibold text-sm inline-block">Go to Login</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f5f2ec] flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <a href="/" className="font-serif text-2xl font-bold text-[#C49A3C]">NRI TAX SUITE</a>
          <p className="text-gray-500 text-sm mt-2">Create your team account</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-300 outline-none" placeholder="Mayank Wadhera" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-300 outline-none" />
            </div>
            <div className="mb-6"></div>
            {error && <div className="text-red-600 text-xs mb-4 bg-red-50 p-2 rounded">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#C49A3C] text-[#1a1a1a] py-2.5 rounded-lg font-bold text-sm hover:bg-amber-400 transition disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-gray-400">
            Already have an account? <a href="/login" className="text-[#C49A3C] font-semibold hover:underline">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
