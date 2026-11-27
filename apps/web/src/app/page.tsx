import { useAuth } from '@/lib/useAuth';
import Link from 'next/link';
import { t } from '@/lib/strings';

export default function LandingPage() {
  // Skip link for accessibility
  // Note: the class "sr-only" hides the link visually but shows it when focused
  // Tailwind "focus:not-sr-only" makes it visible on focus
  const skipLink = <a href="#main" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-teal text-white px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-gold">Skip to content</a>;

  return (
    {skipLink}

    <main id="main" className="min-h-screen flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center text-white font-bold">B</div>
          <span className="font-semibold text-teal">{t('brand')}</span>
        </div>
        <nav className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-teal font-medium hover:underline">{t('signIn')}</Link>
          <Link href="/signup" className="btn-gold">{t('signUp')}</Link>
        </nav>
      </header>

      <section className="flex-1 grid place-items-center px-6 text-center">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-teal mb-4">{t('tagline')}</h1>
          <p className="text-lg text-gray-700 mb-8">
            Low‑bandwidth video meetings designed for teams across Malawi and Sub‑Saharan Africa.
            Works on slow connections and low‑end phones.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="btn-gold text-lg px-6 py-3">{t('signUp')}</Link>
            <Link href="/join" className="btn-primary text-lg px-6 py-3">{t('joinMeeting')}</Link>
          </div>
        </div>
      </section>

      <footer className="px-6 py-4 text-sm text-gray-500 text-center">
        {t('brand')} · {t('tagline')}
      </footer>
    </main>
  );
}
