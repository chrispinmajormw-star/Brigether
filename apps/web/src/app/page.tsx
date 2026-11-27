import Link from 'next/link';
import { t } from '../lib/strings';

export default function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only absolute top-2 left-2 bg-teal-600 text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 z-50"
      >
        Skip to content
      </a>
      <main id="main" className="min-h-screen flex flex-col">
        <header className="px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
              B
            </div>
            <span className="font-semibold text-teal-700 text-lg">{t('brand')}</span>
          </div>
          <nav className="flex gap-3" aria-label="Main navigation">
            <Link href="/login" className="px-4 py-2 text-teal-700 font-medium hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400">
              {t('signIn')}
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-yellow-400 text-gray-900 font-semibold rounded hover:bg-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600 transition">
              {t('signUp')}
            </Link>
          </nav>
        </header>

        <section className="flex-1 grid place-items-center px-6 text-center py-20">
          <div className="max-w-2xl">
            {/* Hero illustration placeholder */}
            <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center">
              <svg className="w-14 h-14 text-teal-600" fill="none" viewBox="0 0 48 48" stroke="currentColor" aria-hidden="true">
                <circle cx="24" cy="24" r="22" strokeWidth="2" />
                <path d="M16 24a8 8 0 1116 0 8 8 0 01-16 0z" strokeWidth="2" />
                <path d="M8 40c0-6 7-10 16-10s16 4 16 10" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-teal-700 mb-4 leading-tight">
              {t('tagline')}
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
              Low‑bandwidth video meetings designed for teams across Malawi and Sub‑Saharan Africa.
              Works on slow connections and low‑end phones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600"
              >
                {t('signUp')}
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border-2 border-teal-600 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 text-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
              >
                {t('signIn')}
              </Link>
            </div>
          </div>
        </section>

        {/* Features strip */}
        <section className="bg-teal-50 py-12 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: '📶', title: 'Works on 2G/3G', desc: 'Audio-only fallback, adaptive quality, designed for real African networks.' },
              { icon: '🔗', title: 'Join by link or code', desc: 'No downloads needed. Just share a link or 8-character code.' },
              { icon: '🔒', title: 'Secure by default', desc: 'WebRTC DTLS-SRTP encryption. Self-hostable. No mandatory third parties.' },
            ].map(f => (
              <div key={f.title}>
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-teal-800 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="px-6 py-5 text-sm text-gray-400 text-center border-t">
          © {new Date().getFullYear()} {t('brand')} · Built for Sub‑Saharan Africa
        </footer>
      </main>
    </>
  );
}
