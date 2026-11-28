'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Icons';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length < 4) { setError('Enter the meeting code you were given.'); return; }
    router.push(`/meeting/lobby?code=${c}`);
  }

  return (
    <main id="main" className="min-h-screen grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8" aria-label="Back to home"><Logo text size="w-10 h-10" /></Link>
        <form onSubmit={onSubmit} className="card space-y-5 p-8">
          <div>
            <h1 className="text-2xl font-bold">Join a meeting</h1>
            <p className="text-slate-500 text-sm mt-1">No account needed.</p>
          </div>
          {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-xl px-4 py-2.5">{error}</p>}
          <label className="block">
            <span className="text-sm font-medium">Meeting code</span>
            <input className="input mt-1.5 uppercase tracking-widest text-lg" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. DEMO1234" maxLength={12} autoFocus />
          </label>
          <button className="btn-primary w-full">Continue</button>
        </form>
      </div>
    </main>
  );
}