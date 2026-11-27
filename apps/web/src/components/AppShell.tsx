'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon, Logo } from './Icons';
import { api } from '@/lib/api';

const nav = [
  { href: '/dashboard', icon: 'home', label: 'Dashboard' },
  { href: '/join', icon: 'link', label: 'Join a meeting' },
];

export function AppShell({ children, name }: { children: React.ReactNode; name?: string }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();

  async function logout() {
    await api.logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="bg-white rounded-[2rem] shadow-sm flex min-h-[calc(100vh-1rem)] md:min-h-[calc(100vh-3rem)] p-2 md:p-3 gap-2 md:gap-4">
        <aside className="w-14 md:w-[72px] bg-panel rounded-3xl flex flex-col items-center py-4 gap-3 shrink-0">
          <Logo />
          <nav className="flex flex-col gap-3 mt-4" aria-label="Main">
            {nav.map((n) => {
              const active = pathname.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} title={n.label} aria-label={n.label}
                  className={`w-10 h-10 rounded-full grid place-items-center transition ${active ? 'bg-brand text-white' : 'text-gray-400 hover:bg-white'}`}>
                  <Icon name={n.icon} />
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col items-center gap-3">
            {name && (
              <button onClick={logout} title="Sign out" aria-label="Sign out"
                className="w-10 h-10 rounded-full grid place-items-center text-gray-400 hover:bg-white">
                <Icon name="logout" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-bubble/20 text-bubble font-semibold grid place-items-center">
              {(name ?? 'G').charAt(0).toUpperCase()}
            </div>
          </div>
        </aside>
        <main id="main" className="flex-1 min-w-0 p-2 md:p-4">{children}</main>
      </div>
    </div>
  );
}