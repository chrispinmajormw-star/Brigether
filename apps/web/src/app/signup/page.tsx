'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Centered } from '@/components/Centered';

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
    <Centered>
      <form onSubmit={onSubmit} className="card space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold">Create your account</h1>
          <p className="text-ink/60 text-sm mt-1">Free to start. It takes under a minute.</p>
        </div>
        {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-2xl px-4 py-2.5">{error}</p>}
        <label className="block">
          <span className="text-sm font-semibold">Your name</span>
          <input className="input mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={60} autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Email</span>
          <input type="email" className="input mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Password</span>
          <input type="password" className="input mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          <span className="text-xs text-ink/50 mt-1 block">At least 8 characters</span>
        </label>
        <button className="btn-accent w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="text-sm text-ink/60 text-center mt-6">
        Already have an account? <Link href="/login" className="font-semibold text-ink underline">Sign in</Link>
      </p>
    </Centered>
  );
}