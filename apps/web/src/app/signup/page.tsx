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
    <main id="main" className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <div className="flex items-center gap-3 mb-2">
          <Logo />
          <h1 className="text-2xl font-bold">Create your account</h1>
        </div>
        {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-2xl px-4 py-2">{error}</p>}
        <label className="block">
          <span className="text-sm font-medium">Display name</span>
          <input className="input mt-1" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={60} autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password (8+ characters)</span>
          <input type="password" className="input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
        </label>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Loading…' : 'Create account'}</button>
        <p className="text-sm text-gray-600 text-center">
          Have an account? <Link href="/login" className="text-brand font-medium">Sign in</Link>
        </p>
      </form>
    </main>
  );
}