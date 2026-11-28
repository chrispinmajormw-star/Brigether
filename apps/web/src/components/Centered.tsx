import Link from 'next/link';
import { Logo } from './Icons';

const rings = [
  { s: 380, d: 46, dot: 'bg-brand' },
  { s: 640, d: 78, dot: 'bg-forest' },
  { s: 900, d: 110, dot: 'bg-brand' },
  { s: 1180, d: 150, dot: 'bg-forest' },
];

export function Backdrop({ dark = false }: { dark?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {rings.map((r) => (
        <div
          key={r.s}
          className={`absolute left-1/2 top-1/2 rounded-full border animate-orbit motion-reduce:animate-none ${dark ? 'border-white/10' : 'border-ink/10'}`}
          style={{ width: r.s, height: r.s, marginLeft: -r.s / 2, marginTop: -r.s / 2, animationDuration: `${r.d}s` }}
        >
          <span className={`absolute left-1/2 -top-1.5 -ml-1.5 w-3 h-3 rounded-full ${dark && r.dot === 'bg-forest' ? 'bg-white/50' : r.dot}`} />
        </div>
      ))}
    </div>
  );
}

export function Centered({ children, width = 'max-w-md' }: { children: React.ReactNode; width?: string }) {
  return (
    <div className="relative min-h-[100dvh] grid place-items-center px-4 py-8">
      <Backdrop />
      <main id="main" className={`relative z-10 w-full ${width}`}>
        <Link href="/" className="flex justify-center mb-8" aria-label="Back to home"><Logo text size="w-10 h-10" /></Link>
        {children}
      </main>
    </div>
  );
}