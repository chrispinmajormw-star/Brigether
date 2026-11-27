"use client";

import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  ControlBar,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '../../../lib/strings';
import '@livekit/components-react/dist/style.css';

export default function RoomPage() {
  const router = useRouter();
  const [joinInfo, setJoinInfo] = useState<any>(null);
  const [lowBandwidth, setLowBandwidth] = useState(false);

  useEffect(() => {
    const code = window.location.pathname.split('/')[2];
    const raw = sessionStorage.getItem(`brigether:join:${code}`);
    if (!raw) {
      router.replace(`/meeting/${code}/lobby`);
      return;
    }
    const info = JSON.parse(raw);
    setJoinInfo(info);
    setLowBandwidth(!!info.lowBandwidth);
    sessionStorage.removeItem(`brigether:join:${code}`);
  }, [router]);

  if (!joinInfo) {
    return (
      <main className="min-h-screen flex items-center justify-center text-teal-700 text-lg">
        {t('loading')}
      </main>
    );
  }

  const { token, url, room, displayName } = joinInfo;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      roomName={room}
      connectOptions={{ autoSubscribe: true, adaptiveStream: !lowBandwidth }}
      video={!lowBandwidth}
      audio={true}
    >
      <div className="flex flex-col h-screen bg-gray-900 text-white">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-2 bg-teal-800 shadow">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-yellow-400 text-gray-900 flex items-center justify-center font-bold text-sm">B</div>
            <span className="font-semibold text-sm">{room}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Low-bandwidth toggle */}
            <button
              role="switch"
              aria-checked={lowBandwidth}
              onClick={() => setLowBandwidth(v => !v)}
              className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border transition ${lowBandwidth ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'border-white text-white hover:bg-white/10'}`}
            >
              📶 {lowBandwidth ? 'Audio only' : 'Low bandwidth'}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-xs px-3 py-1 bg-red-500 hover:bg-red-400 text-white rounded-full transition"
            >
              {t('leave')}
            </button>
          </div>
        </header>

        {/* Video grid */}
        <main className="flex-1 overflow-hidden p-2">
          <GridLayout>
            <ParticipantTile />
          </GridLayout>
        </main>

        {/* Controls */}
        <footer className="bg-gray-800 px-4 py-2 flex justify-center">
          <ControlBar />
        </footer>
      </div>
    </LiveKitRoom>
  );
}
