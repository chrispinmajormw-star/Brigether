import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input, Button } from '@/packages/ui/src/components';
import { t } from '@/lib/strings';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-bold text-teal text-center">{t('signIn')}</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <Input label={t('email')} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <Input label={t('password')} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? t('loading') : t('signIn')}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          {t('noAccount')} <Link href="/signup" className="text-teal hover:underline">{t('signUp')}</Link>
        </p>
      </div>
    </main>
  );
}
