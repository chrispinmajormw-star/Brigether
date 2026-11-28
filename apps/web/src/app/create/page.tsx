'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/useAuth';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/components/Icons';

function inviteLink(code: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return `${window.location.origin}${base}/meeting/lobby/?code=${code}`;
}

export default function CreatePage() {
  const { user, loading } = useAuth(true);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [meeting, setMeeting] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      setMeeting(await api.createMeeting({ title: title.trim() || 'New meeting' }));
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteLink(meeting.code));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  if (loading) return <AppShell><p className="text-ink/50">Loading…</p></AppShell>;

  return (
    <AppShell name={user?.displayName}>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Create a meeting</h1>
      <p className="text-ink/60 mt-2 mb-8">Set it up now, share the invite, and enter when you are ready.</p>

      {!meeting ? (
        <form onSubmit={create} className="card space-y-4 max-w-md mx-auto text-left">
          {error && <p role="alert" className="text-danger text-sm bg-danger/10 rounded-2xl px-4 py-2.5">{error}</p>}
          <label className="block">
            <span className="text-sm font-semibold">Meeting name</span>
            <input className="input mt-1.5" placeholder="e.g. Monday team check-in" maxLength={120}
              value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </label>
          <button className="btn-accent w-full" disabled={busy}>
            <Icon name="video" /> {busy ? 'Creating…' : 'Create meeting'}
          </button>
        </form>
      ) : (
        <div className="card space-y-5 max-w-md mx-auto">
          <div>
            <p className="text-sm text-ink/50">Your meeting is ready</p>
            <h2 className="text-xl font-extrabold">{meeting.title}</h2>
          </div>
          <div className="bg-sand rounded-2xl py-5">
            <p className="text-xs uppercase tracking-widest text-ink/50">Meeting code</p>
            <p className="font-mono text-3xl font-bold tracking-[0.3em] mt-1">{meeting.code}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={copy} className="btn-secondary !px-3">
              <Icon name={copied ? 'check' : 'copy'} className="w-4 h-4" /> {copied ? 'Copied' : 'Copy link'}
            </button>
            <a className="btn-secondary !px-3" target="_blank" rel="noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(`Join my Brigether meeting "${meeting.title}": ${inviteLink(meeting.code)} (code ${meeting.code})`)}`}>
              Share on WhatsApp
            </a>
          </div>
          <button className="btn-accent w-full" onClick={() => router.push(`/meeting/lobby?code=${meeting.code}`)}>
            Enter the meeting
          </button>
          <button className="text-sm text-ink/60 underline" onClick={() => { setMeeting(null); setTitle(''); }}>
            Create another
          </button>
          {process.env.NEXT_PUBLIC_DEMO === 'true' && (
            <p className="text-xs text-ink/50">Demo mode: guests can only join from this same browser for now.</p>
          )}
        </div>
      )}
    </AppShell>
  );
}