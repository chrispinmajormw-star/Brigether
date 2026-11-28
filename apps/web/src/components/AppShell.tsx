'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from './Icons';
import { Backdrop } from './Centered';
import { api } from '@/lib/api';

export function AppShell({ children, name }: { children: React.ReactNode; name?: string }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  async function logout() {
    await api.logout();
    router.push('/login');
  }

  const link = (href: string, label: string) => (
    <Link href={href}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${pathname.startsWith(href) ? 'bg-ink text-white' : 'text-ink/70 hover:bg-sand'}`}>
      {label}
    </Link>
  );

  return (
    <div className="relative min-h-screen">
      <Backdrop />
      <header className="relative z-20 flex justify-center pt-5 px-4">
        <nav aria-label="Main" className="bg-white/90 backdrop-blur border border-ink/10 shadow-lg shadow-ink/5 rounded-full pl-3 pr-2 py-2 flex items-center gap-1">
          <Link href="/dashboard" aria-label="Brigether home" className="mr-2"><Logo size="w-8 h-8" /></Link>
          {link('/dashboard', 'Home')}
          {link('/create', 'Create')}
          {link('/join', 'Join')}
          {name && (
            <>
              <span className="w-px h-6 bg-ink/10 mx-2" />
              <span className="w-8 h-8 rounded-full bg-brand text-ink font-bold grid place-items-center" title={name}>
                {name.charAt(0).toUpperCase()}
              </span>
              <button onClick={logout} className="px-3 py-2 rounded-full text-sm font-semibold text-ink/60 hover:text-ink">Sign out</button>
            </>
          )}
        </nav>
      </header>
      <main id="main" className="relative z-10 max-w-2xl mx-auto px-4 pt-14 pb-16 text-center">{children}</main>
    </div>
  );
}