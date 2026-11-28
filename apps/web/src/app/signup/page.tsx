'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Logo } from '@/components/Icons';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await api.signup({ email, password, displayName });
      router.push('/dashboard');
    } catch (err: any) { setError(err.message ?? 'Something went wrong'); }
    finally { setBusy(false); }
  }

  return (
    <main id="main" className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8" aria-label="Back to home"><Logo text size="w-10 h-10" /></Link>
        <form onSubmit={onSubmit} className="card space-y-5 p-8">
          <div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Free to start. It takes under a minute.</p>
          </div>
          {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-xl px-4 py-2.5">{error}</p>}
          <label className="block">
            <span className="text-sm font-medium">Your name</span>
            <input className="input mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={60} autoComplete="name" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input type="email" className="input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input type="password" className="input mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
            <span className="text-xs text-slate-500 mt-1 block">At least 8 characters</span>
          </label>
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="text-sm text-slate-600 text-center mt-6">
          Already have an account? <Link href="/login" className="text-brand-dark font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}