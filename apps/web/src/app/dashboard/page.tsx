import Link from 'next/link';
import { t } from '../../lib/strings';

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">B</div>
          <span className="font-semibold text-teal-700 text-lg">{t('brand')}</span>
        </div>
        <Link
          href="/signup"
          className="text-sm text-gray-500 hover:text-teal-600"
        >
          {t('signOut')}
        </Link>
      </header>

      {/* Body */}
      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-teal-700">{t('dashboard')}</h1>
          <Link
            href="/meeting/create"
            className="px-5 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-600 text-sm"
          >
            + {t('createMeeting')}
          </Link>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 48 48" stroke="currentColor">
              <circle cx="24" cy="24" r="22" strokeWidth="2" />
              <path d="M24 16v16M16 24h16" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">{t('noMeetingsYet')}</h2>
          <p className="text-sm text-gray-500 mb-6">Start your first meeting or join one with a code.</p>
          <div className="flex gap-3">
            <Link
              href="/meeting/create"
              className="px-6 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition text-sm"
            >
              {t('createMeeting')}
            </Link>
            <Link
              href="/join"
              className="px-6 py-2 border border-teal-600 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition text-sm"
            >
              {t('joinMeeting')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
