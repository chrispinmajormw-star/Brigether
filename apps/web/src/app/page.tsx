import Link from 'next/link';
import { Icon, Logo } from '@/components/Icons';
import { Backdrop } from '@/components/Centered';
import { Door } from '@/components/Door';

const pillars = [
  { icon: 'signal', title: 'Made for slow networks', text: 'Quality adapts, and audio-only keeps you talking.' },
  { icon: 'link', title: 'No download', text: 'Share a code. Guests join from the browser.' },
  { icon: 'lock', title: 'Private by default', text: 'Encrypted calls, and you decide who joins.' },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      <Backdrop />
      <header className="relative z-20 flex justify-center pt-5 px-4">
        <nav className="bg-white/90 backdrop-blur border border-ink/10 shadow-lg shadow-ink/5 rounded-full pl-3 pr-2 py-2 flex items-center gap-1">
          <Logo text size="w-8 h-8" />
          <span className="w-px h-6 bg-ink/10 mx-3" />
          <Link href="/login" className="px-4 py-2 rounded-full text-sm font-semibold text-ink/70 hover:bg-sand">Sign in</Link>
          <Link href="/signup" className="px-4 py-2 rounded-full text-sm font-semibold bg-ink text-white hover:bg-ink/85">Sign up</Link>
        </nav>
      </header>

      <main id="main" className="relative z-10 max-w-3xl mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.05]">
          Bring everyone into the same <span className="text-brand">circle</span>.
        </h1>
        <p className="mt-6 text-lg text-ink/65 max-w-xl mx-auto">
          Video meetings that stay clear on weak connections and low-end phones.
        </p>

        <div className="mt-10">
          <Door guest />
        </div>

        <ul className="mt-20 grid sm:grid-cols-3 gap-8 text-center">
          {pillars.map((p) => (
            <li key={p.title}>
              <div className="w-12 h-12 rounded-full bg-white border border-ink/10 shadow-sm grid place-items-center mx-auto mb-3 text-forest">
                <Icon name={p.icon} />
              </div>
              <h2 className="font-bold">{p.title}</h2>
              <p className="text-sm text-ink/60 mt-1">{p.text}</p>
            </li>
          ))}
        </ul>
      </main>

      <footer className="relative z-10 text-center text-sm text-ink/50 pb-8">
        © 2026 Brigether · Bringing people together
      </footer>
    </div>
  );
}