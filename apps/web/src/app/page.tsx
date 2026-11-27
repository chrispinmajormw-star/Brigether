import Link from 'next/link';
import { Icon, Logo } from '@/components/Icons';

const greetings = ['Muli bwanji', 'Karibu', 'Sawubona', 'Dumela', 'Akwaaba'];

const features = [
  { icon: 'signal', title: 'Works on 2G/3G', text: 'Audio-only fallback and adaptive quality, designed for real African networks.', tone: 'bg-sun text-ink' },
  { icon: 'link', title: 'Join by link or code', text: 'No downloads needed. Share a link or an 8-character code.', tone: 'bg-bubble text-white' },
  { icon: 'lock', title: 'Secure by default', text: 'WebRTC DTLS-SRTP encryption. Self-hostable. No mandatory third parties.', tone: 'bg-brand text-white' },
];

const people = [
  { n: 'Chikondi', c: 'bg-sun text-ink' },
  { n: 'Amara', c: 'bg-bubble text-white' },
  { n: 'Kofi', c: 'bg-brand text-white' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-3rem)] flex flex-col">
        <div className="kente h-2" />
        <div className="flex flex-col flex-1 p-4 md:p-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="w-11 h-11" />
              <span className="font-bold text-xl">Brigether</span>
            </div>
            <nav className="flex gap-2">
              <Link href="/login" className="btn-soft">Sign in</Link>
              <Link href="/signup" className="btn-primary">Create account</Link>
            </nav>
          </header>

          <main id="main" className="flex-1 grid lg:grid-cols-2 gap-10 items-center py-10">
            <section>
              <div className="flex flex-wrap gap-2 mb-5" aria-label="Greetings from across Africa">
                {greetings.map((g, i) => (
                  <span key={g} className={`text-sm font-medium px-3 py-1 rounded-full ${
                    i % 3 === 0 ? 'bg-sun/30 text-ink' : i % 3 === 1 ? 'bg-brand-soft text-brand-dark' : 'bg-bubble/15 text-bubble'}`}>
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-[1.1] mb-5">
                Brigether, <span className="text-brand">bringing people</span> together.
              </h1>
              <p className="text-lg text-ink/70 mb-8 max-w-lg">
                Video meetings built for Africa. They work on slow connections and low-end phones,
                so your team stays connected from Lilongwe to Lagos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/signup" className="btn-sun text-lg px-8 py-3">Start for free</Link>
                <Link href="/join" className="btn-soft text-lg px-8 py-3">Join with a code</Link>
              </div>
            </section>

            <section aria-hidden="true" className="bg-surface rounded-[2rem] p-4">
              <div className="bg-white rounded-3xl p-3 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="font-semibold">Lilongwe Team Check-in</p>
                  <span className="text-xs bg-danger/10 text-danger px-2 py-1 rounded-full">● Live</span>
                </div>
                <div className="aspect-video rounded-3xl bg-brand-dark diamonds grid place-items-center relative overflow-hidden">
                  <div className="w-24 h-24 rounded-full bg-sun text-ink text-4xl font-bold grid place-items-center">T</div>
                  <span className="absolute left-3 bottom-3 bg-black/40 text-white text-xs px-3 py-1 rounded-full">Thandi</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {people.map((p) => (
                    <div key={p.n} className={`aspect-square rounded-2xl grid place-items-center text-xl font-semibold ${p.c}`}>
                      {p.n.charAt(0)}
                    </div>
                  ))}
                  <div className="aspect-square rounded-2xl bg-ink text-white grid place-items-center text-lg font-semibold">+18</div>
                </div>
                <div className="flex justify-center gap-3 pt-1">
                  <span className="w-11 h-11 rounded-full bg-panel grid place-items-center"><Icon name="mic" /></span>
                  <span className="w-11 h-11 rounded-full bg-panel grid place-items-center"><Icon name="video" /></span>
                  <span className="px-6 h-11 rounded-full bg-danger text-white grid place-items-center text-sm font-medium">Leave</span>
                </div>
              </div>
            </section>
          </main>

          <section className="grid md:grid-cols-3 gap-4 pb-6">
            {features.map((f) => (
              <div key={f.title} className="bg-panel rounded-3xl p-6 border-t-4 border-sun">
                <div className={`w-12 h-12 rounded-2xl grid place-items-center mb-3 ${f.tone}`}>
                  <Icon name={f.icon} />
                </div>
                <h2 className="font-semibold text-lg mb-1">{f.title}</h2>
                <p className="text-sm text-ink/70">{f.text}</p>
              </div>
            ))}
          </section>

          <footer className="text-center text-sm text-ink/60">© 2026 Brigether · Built for Sub-Saharan Africa</footer>
        </div>
        <div className="kente h-2" />
      </div>
    </div>
  );
}