import Link from 'next/link';
import { Icon, Logo } from '@/components/Icons';

const features = [
  { icon: 'signal', title: 'Works on 2G/3G', text: 'Audio-only fallback and adaptive quality, designed for real African networks.' },
  { icon: 'link', title: 'Join by link or code', text: 'No downloads needed. Share a link or an 8-character code.' },
  { icon: 'lock', title: 'Secure by default', text: 'WebRTC DTLS-SRTP encryption. Self-hostable. No mandatory third parties.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="bg-white rounded-[2rem] shadow-sm min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-3rem)] flex flex-col p-4 md:p-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-semibold text-lg">Brigether</span>
          </div>
          <nav className="flex gap-2">
            <Link href="/login" className="btn-soft">Sign in</Link>
            <Link href="/signup" className="btn-primary">Create account</Link>
          </nav>
        </header>

        <main id="main" className="flex-1 grid lg:grid-cols-2 gap-10 items-center py-10">
          <section>
            <p className="inline-block bg-brand-soft text-brand text-sm font-medium px-3 py-1 rounded-full mb-4">
              Built for Sub-Saharan Africa
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Brigether, bringing people together.
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Low-bandwidth video meetings for teams across Malawi and Sub-Saharan Africa.
              Works on slow connections and low-end phones.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/signup" className="btn-primary text-lg px-7 py-3">Create account</Link>
              <Link href="/join" className="btn-soft text-lg px-7 py-3">Join with a code</Link>
            </div>
          </section>

          <section aria-hidden="true" className="bg-surface rounded-3xl p-4">
            <div className="bg-white rounded-2xl p-3 space-y-3">
              <div className="flex items-center justify-between px-1">
                <p className="font-semibold">Our Weekly Design Meeting</p>
                <span className="text-xs bg-danger/10 text-danger px-2 py-1 rounded-full">Recording</span>
              </div>
              <div className="aspect-video rounded-2xl bg-gradient-to-br from-brand to-bubble grid place-items-center text-white text-6xl font-bold">A</div>
              <div className="grid grid-cols-4 gap-2">
                {['M', 'T', 'C'].map((l) => (
                  <div key={l} className="aspect-square rounded-2xl bg-panel grid place-items-center text-xl font-semibold text-bubble">{l}</div>
                ))}
                <div className="aspect-square rounded-2xl bg-ink text-white grid place-items-center text-xl font-semibold">+18</div>
              </div>
              <div className="flex justify-center gap-3 pt-1">
                <span className="w-10 h-10 rounded-full bg-panel grid place-items-center"><Icon name="mic" /></span>
                <span className="w-10 h-10 rounded-full bg-panel grid place-items-center"><Icon name="video" /></span>
                <span className="px-5 h-10 rounded-full bg-danger text-white grid place-items-center text-sm font-medium">Leave</span>
              </div>
            </div>
          </section>
        </main>

        <section className="grid md:grid-cols-3 gap-4 pb-6">
          {features.map((f) => (
            <div key={f.title} className="bg-panel rounded-3xl p-6">
              <div className="w-11 h-11 rounded-full bg-brand text-white grid place-items-center mb-3">
                <Icon name={f.icon} />
              </div>
              <h2 className="font-semibold mb-1">{f.title}</h2>
              <p className="text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </section>

        <footer className="text-center text-sm text-gray-500">© 2026 Brigether · Built for Sub-Saharan Africa</footer>
      </div>
    </div>
  );
}