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

  async function startMeeting() {
    setBusy(true);
    try {
      const m = await api.createMeeting({ title: title.trim() || 'Instant meeting' });
      router.push(`/meeting/lobby?code=${m.code}`);
    } catch (e: any) { alert(e.message); }
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
    try { await navigator.clipboard.writeText(link); setCopied(c); setTimeout(() => setCopied(null), 1500); } catch {}
  }

  if (loading) return <AppShell><p>Loading…</p></AppShell>;

  return (
    <AppShell name={user?.displayName}>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Hi {user?.displayName} 👋</h1>
        <p className="text-gray-500">Start a meeting or join one with a code.</p>
      </header>

      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="bg-surface rounded-3xl p-5 space-y-3">
            <h2 className="font-semibold">Start a meeting</h2>
            <input className="input bg-white" placeholder="Meeting title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <button className="btn-primary w-full" onClick={startMeeting} disabled={busy}>
              <Icon name="video" /> {busy ? 'Starting…' : 'Start now'}
            </button>
          </section>

          <form onSubmit={joinByCode} className="bg-surface rounded-3xl p-5 space-y-3">
            <h2 className="font-semibold">Join with a code</h2>
            <input className="input bg-white uppercase tracking-widest" placeholder="DEMO1234" maxLength={12}
              value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn-gold w-full">Join</button>
          </form>
        </div>

        <section className="lg:col-span-3 bg-surface rounded-3xl p-5">
          <h2 className="font-semibold mb-3">Your meetings</h2>
          {meetings.length === 0 ? (
            <p className="text-gray-500">No meetings yet. Start one!</p>
          ) : (
            <ul className="space-y-2">
              {meetings.map((m) => (
                <li key={m.id} className="bg-white rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-brand-soft text-brand grid place-items-center shrink-0"><Icon name="video" /></div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{m.title}</p>
                      <p className="text-xs text-gray-500">Code {m.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="btn-soft !px-3" onClick={() => copyLink(m.code)} aria-label="Copy link">
                      <Icon name="copy" className="w-4 h-4" /> {copied === m.code ? 'Copied' : ''}
                    </button>
                    <button className="btn-primary" onClick={() => router.push(`/meeting/lobby?code=${m.code}`)}>Join</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}