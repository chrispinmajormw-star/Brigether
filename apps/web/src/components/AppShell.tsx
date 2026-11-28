'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Icons';
import { api } from '@/lib/api';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/join', label: 'Join a meeting' },
];

export function AppShell({ children, name }: { children: React.ReactNode; name?: string }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  async function logout() {
    await api.logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" aria-label="Brigether home"><Logo text /></Link>
            <nav className="hidden sm:flex gap-1" aria-label="Main">
              {nav.map((n) => (
                <Link key={n.href} href={n.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${pathname.startsWith(n.href) ? 'bg-brand-soft text-brand-dark' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          {name && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-slate-600">{name}</span>
              <span className="w-9 h-9 rounded-full bg-brand text-white font-semibold grid place-items-center">
                {name.charAt(0).toUpperCase()}
              </span>
              <button onClick={logout} className="text-sm font-medium text-slate-500 hover:text-ink">Sign out</button>
            </div>
          )}
        </div>
      </header>
      <main id="main" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}