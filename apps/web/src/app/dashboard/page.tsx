'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { AppShell } from '@/components/AppShell';
import { Door } from '@/components/Door';
import { Icon } from '@/components/Icons';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function DashboardPage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (user) api.myMeetings().then(setMeetings).catch(() => {});
  }, [user]);

  async function startMeeting(title: string) {
    setBusy(true);
    try {
      const m = await api.createMeeting({ title });
      router.push(`/meeting/lobby?code=${m.code}`);
    } catch (err: any) { alert(err.message); }
    finally { setBusy(false); }
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

  if (loading) return <AppShell><p className="text-ink/50">Loading…</p></AppShell>;

  return (
    <AppShell name={user?.displayName}>
      <p className="text-ink/50 font-medium">{greeting()}</p>
      <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-1">{user?.displayName}</h1>
      <p className="text-ink/60 mt-3 mb-8">Who are you meeting today?</p>

      <Door busy={busy} onStart={startMeeting} />

      <section className="mt-16 text-left max-w-md mx-auto">
        <h2 className="text-center text-sm font-bold uppercase tracking-widest text-ink/40 mb-4">Recent meetings</h2>
        {meetings.length === 0 ? (
          <p className="text-center text-sm text-ink/50">Nothing here yet. Your meetings will appear after you start one.</p>
        ) : (
          <ul className="space-y-2">
            {meetings.map((m) => (
              <li key={m.id} className="bg-white border border-ink/10 rounded-2xl p-3 pl-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{m.title}</p>
                  <p className="text-xs text-ink/50 font-mono tracking-widest">{m.code}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => copyLink(m.code)} aria-label="Copy invite link"
                    className="w-10 h-10 rounded-full bg-sand grid place-items-center hover:bg-ink hover:text-white transition">
                    <Icon name={copied === m.code ? 'check' : 'copy'} className="w-4 h-4" />
                  </button>
                  <button onClick={() => router.push(`/meeting/lobby?code=${m.code}`)} className="btn-primary !py-2 !px-5 text-sm">Join</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}