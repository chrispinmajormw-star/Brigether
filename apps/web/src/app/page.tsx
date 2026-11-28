'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon, Logo } from '@/components/Icons';

const features = [
  { icon: 'signal', title: 'Built for slow networks', text: 'Quality adjusts automatically, and audio-only mode keeps you in the conversation when data is weak.' },
  { icon: 'link', title: 'Join in seconds', text: 'Share a link or an 8-character code. Guests join from the browser with no download.' },
  { icon: 'lock', title: 'Private and secure', text: 'Calls are encrypted, and you control who is in your meeting.' },
];

const steps = [
  { n: '1', title: 'Create a meeting', text: 'Sign up free and start a meeting with one click.' },
  { n: '2', title: 'Share the code', text: 'Send the link or the code to your team.' },
  { n: '3', title: 'Talk, share, chat', text: 'Meet by video or audio, and chat while you talk.' },
];

export default function LandingPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  function join(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length >= 4) router.push(`/meeting/lobby?code=${c}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo text />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-ink">Sign in</Link>
          <Link href="/signup" className="btn-primary !py-2 text-sm">Sign up free</Link>
        </nav>
      </header>

      <main id="main">
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08]">
            Video meetings that work on <span className="text-brand">any connection</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 max-w-xl mx-auto">
            Brigether brings your team together with clear calls on slow networks and low-end phones.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary text-base px-7 py-3">
              <Icon name="video" /> Start a meeting
            </Link>
            <form onSubmit={join} className="flex gap-2">
              <input
                className="input uppercase tracking-widest sm:w-52"
                placeholder="Enter a code"
                aria-label="Meeting code"
                maxLength={12}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button className="btn-secondary" disabled={code.trim().length < 4}>Join</button>
            </form>
          </div>
          <p className="mt-4 text-sm text-slate-500">Free to start. No download needed.</p>
        </section>

        <section className="bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="w-11 h-11 rounded-xl bg-brand-soft text-brand grid place-items-center mb-4">
                  <Icon name={f.icon} />
                </div>
                <h2 className="font-semibold text-lg">{f.title}</h2>
                <p className="mt-1 text-slate-600 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full bg-ink text-white font-bold text-lg grid place-items-center mx-auto mb-4">{s.n}</div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="bg-ink rounded-3xl px-6 py-12 text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold">Ready to meet?</h2>
            <p className="mt-2 text-slate-300">Create your free account and start your first meeting in under a minute.</p>
            <Link href="/signup" className="btn-primary mt-6 text-base px-8 py-3">Get started</Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 Brigether</span>
          <span>Brigether, bringing people together.</span>
        </div>
      </footer>
    </div>
  );
}