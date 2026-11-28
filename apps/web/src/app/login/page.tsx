'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Centered } from '@/components/Centered';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setBusy(true);
    try {
      await api.login({ email, password });
      router.push('/dashboard');
    } catch (err: any) { setError(err.message ?? 'Something went wrong'); }
    finally { setBusy(false); }
  }

  return (
    <Centered>
      <form onSubmit={onSubmit} className="card space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-ink/60 text-sm mt-1">Sign in to start or join a meeting.</p>
        </div>
        {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-2xl px-4 py-2.5">{error}</p>}
        <label className="block">
          <span className="text-sm font-semibold">Email</span>
          <input type="email" className="input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Password</span>
          <input type="password" className="input mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        <button className="btn-accent w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="text-sm text-ink/60 text-center mt-6">
        New here? <Link href="/signup" className="font-semibold text-ink underline">Create an account</Link>
      </p>
    </Centered>
  );
}