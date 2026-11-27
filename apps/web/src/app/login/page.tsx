"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { t } from '../../lib/strings';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-full bg-teal-100 items-center justify-center text-2xl mb-2">B</div>
          <h1 className="text-2xl font-bold text-teal-700">{t('signIn')}</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your Brigether account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600"
          >
            {loading ? t('loading') : t('signIn')}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-600">
          {t('noAccount')}{' '}
          <Link href="/signup" className="text-teal-600 hover:underline font-medium">{t('signUp')}</Link>
        </p>
      </div>
    </main>
  );
}
