'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Icons';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length < 4) { setError('Enter a meeting code'); return; }
    router.push(`/meeting/lobby?code=${c}`);
  }

  return (
    <main id="main" className="min-h-screen grid place-items-center px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 p-8">
        <div className="flex items-center gap-3 mb-2">
          <Logo />
          <h1 className="text-2xl font-bold">Join a meeting</h1>
        </div>
        {error && <p role="alert" className="text-danger text-sm">{error}</p>}
        <label className="block">
          <span className="text-sm font-medium">Meeting code</span>
          <input className="input mt-1 uppercase tracking-widest" value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="DEMO1234" maxLength={12} required autoFocus />
        </label>
        <button className="btn-primary w-full">Join now</button>
      </form>
    </main>
  );
}