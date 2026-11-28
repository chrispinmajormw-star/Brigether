'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/components/Icons';

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) api.myMeetings().then(setMeetings).catch(() => {});
  }, [user]);

  async function startMeeting(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const m = await api.createMeeting({ title: title.trim() || 'Instant meeting' });
      router.push(`/meeting/lobby?code=${m.code}`);
    } catch (err: any) { alert(err.message); }
    finally { setBusy(false); }
  }

  function joinByCode(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length >= 4) router.push(`/meeting/lobby?code=${c}`);
  }

  async function copyLink(c: string) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const link = `${window.location.origin}${base}/meeting/lobby/?code=${c}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(c);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  }

  if (loading) return <AppShell><p className="text-slate-500">Loading…</p></AppShell>;

  return (
    <AppShell name={user?.displayName}>
      <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {user?.displayName}</h1>
      <p className="text-slate-500 mt-1">Start a new meeting or join one with a code.</p>

      <div className="grid md:grid-cols-2 gap-5 mt-8">
        <form onSubmit={startMeeting} className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-brand text-white grid place-items-center"><Icon name="video" /></span>
            <h2 className="font-semibold text-lg">New meeting</h2>
          </div>
          <input className="input" placeholder="Meeting name (optional)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Starting…' : 'Start meeting'}</button>
        </form>

        <form onSubmit={joinByCode} className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-100 text-ink grid place-items-center"><Icon name="link" /></span>
            <h2 className="font-semibold text-lg">Join with a code</h2>
          </div>
          <input className="input uppercase tracking-widest" placeholder="Enter meeting code" maxLength={12} value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn-secondary w-full" disabled={code.trim().length < 4}>Join meeting</button>
        </form>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-lg mb-3">Your meetings</h2>
        {meetings.length === 0 ? (
          <div className="card text-center py-10">
            <p className="font-medium">No meetings yet</p>
            <p className="text-sm text-slate-500 mt-1">Your meetings will show up here after you start one.</p>
          </div>
        ) : (
          <ul className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {meetings.map((m) => (
              <li key={m.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{m.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Code <span className="font-mono tracking-wider">{m.code}</span></p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="btn-secondary !py-2 !px-3 text-sm" onClick={() => copyLink(m.code)}>
                    <Icon name={copied === m.code ? 'check' : 'copy'} className="w-4 h-4" />
                    <span className="hidden sm:inline">{copied === m.code ? 'Copied' : 'Copy link'}</span>
                  </button>
                  <button className="btn-primary !py-2 text-sm" onClick={() => router.push(`/meeting/lobby?code=${m.code}`)}>Join</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}