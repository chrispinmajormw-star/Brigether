'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { t } from '@/lib/strings';
import '@livekit/components-styles';

function RoomInner() {
  const search = useSearchParams();
  const code = (search.get('code') ?? '').toUpperCase();
  const router = useRouter();
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`brigether:join:${code}`);
    if (!raw) { router.replace(`/meeting/lobby?code=${code}`); return; }
    setInfo(JSON.parse(raw));
  }, [code, router]);

  if (!info) return <main id="main" className="p-8">{t('loading')}</main>;

  return (
    <main id="main" className="min-h-screen grid place-items-center px-4">
      <div className="card max-w-lg text-center space-y-3">
        <h1 className="text-2xl font-bold text-teal">{info.displayName} — you're in the room</h1>
        <p className="text-gray-700">
          Lobby handoff complete. LiveKit room connection is wired in Phase 2.
        </p>
        <p className="text-xs text-gray-500 break-all">Room: {info.room}</p>
        <button className="btn-primary" onClick={() => router.push('/dashboard')}>{t('dashboard')}</button>
      </div>
    </main>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <RoomInner />
    </Suspense>
  );
}