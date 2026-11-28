'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from './Icons';

export function Door({
  guest = false, busy = false, onStart, initial = 'start',
}: {
  guest?: boolean;
  busy?: boolean;
  onStart?: (title: string) => void;
  initial?: 'start' | 'join';
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'start' | 'join'>(initial);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');

  function join(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length >= 4) router.push(`/meeting/lobby?code=${c}`);
  }
  function start(e: React.FormEvent) {
    e.preventDefault();
    onStart?.(title.trim() || 'Instant meeting');
  }

  const tabs = [
    { id: 'start' as const, label: 'Start a meeting' },
    { id: 'join' as const, label: 'Join a meeting' },
  ];

  return (
    <div className="bg-white rounded-[2rem] border border-ink/10 shadow-xl shadow-ink/5 p-3 w-full max-w-md mx-auto text-left">
      <div role="tablist" className="grid grid-cols-2 bg-sand rounded-full p-1">
        {tabs.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`py-2.5 rounded-full text-sm font-semibold transition ${tab === t.id ? 'bg-ink text-white' : 'text-ink/60 hover:text-ink'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4 pt-5">
        {tab === 'start' ? (
          guest ? (
            <div className="space-y-4 text-center">
              <p className="text-ink/70 text-sm">Create a free account and your meeting is ready in one click.</p>
              <Link href="/signup" className="btn-accent w-full"><Icon name="video" /> Create free account</Link>
              <p className="text-sm text-ink/60">Already have one? <Link href="/login" className="font-semibold text-ink underline">Sign in</Link></p>
            </div>
          ) : (
            <form onSubmit={start} className="space-y-4">
              <input className="input" placeholder="Meeting name (optional)" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
              <button className="btn-accent w-full" disabled={busy}><Icon name="video" /> {busy ? 'Starting…' : 'Start meeting'}</button>
            </form>
          )
        ) : (
          <form onSubmit={join} className="space-y-4">
            <input className="input text-center text-lg uppercase tracking-[0.3em] font-semibold" placeholder="MEETING CODE"
              aria-label="Meeting code" maxLength={12} value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn-primary w-full" disabled={code.trim().length < 4}>Join meeting</button>
          </form>
        )}
      </div>
    </div>
  );
}