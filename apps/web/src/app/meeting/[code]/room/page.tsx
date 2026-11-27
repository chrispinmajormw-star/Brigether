"use client";

import {
  LiveKitRoom,
  ParticipantTile,
  GridLayout,
  ControlBar,
  useRoom,
} from '@livekit/components-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '../../../../lib/strings';
import '@livekit/components-react/dist/style.css';


export default function RoomPage() {
  const router = useRouter();
  const [joinInfo, setJoinInfo] = useState<any>(null);
  const [lowBandwidth, setLowBandwidth] = useState(false);

  useEffect(() => {
    // Extract meeting code from URL: /meeting/[code]/room
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
    return <main id="main" className="p-8">{t('loading')}</main>;
  }

  const { token, url, room, displayName } = joinInfo;

  // Options for LiveKit connection – adaptive streaming is disabled when low‑bandwidth mode is forced.
  const connectOptions = {
    autoSubscribe: true,
    adaptiveStream: !lowBandwidth,
  } as const;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      roomName={room}
      connectOptions={connectOptions}
      videoCodec="vp8"
      audioCodec="opus"
      participantIdentity={displayName}
    >
      <RoomInner
        displayName={displayName}
        room={room}
        lowBandwidth={lowBandwidth}
        setLowBandwidth={setLowBandwidth}
        onLeave={() => router.push('/dashboard')}
      />
    </LiveKitRoom>
  );
}

interface RoomInnerProps {
  displayName: string;
  room: string;
  lowBandwidth: boolean;
  setLowBandwidth: (v: boolean) => void;
  onLeave: () => void;
}

function RoomInner({ displayName, room, lowBandwidth, setLowBandwidth, onLeave }: RoomInnerProps) {
  const { room: lkRoom } = useRoom();

  // When low‑bandwidth mode is toggled, enable/disable local video publishing.
  useEffect(() => {
    if (!lkRoom) return;
    if (lowBandwidth) {
      // Turn off video – keep audio alive.
      lkRoom.localParticipant.setVideoEnabled(false);
    } else {
      // Re‑enable video publishing (LiveKit will negotiate appropriate simulcast layers).
      lkRoom.localParticipant.setVideoEnabled(true);
    }
  }, [lowBandwidth, lkRoom]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-teal text-white p-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{displayName} – {room}</h1>
        <button className="btn-primary" onClick={onLeave}>{t('leave')}</button>
      </header>

      {/* Video Grid */}
      <section className="flex-1 overflow-hidden">
        <GridLayout>
          <ParticipantTile />
        </GridLayout>
      </section>

      {/* Footer Controls */}
      <footer className="p-2 bg-gray-100 flex justify-center space-x-2 items-center">
        <ControlBar showChatInDrawer={false} />
        {/* Low‑bandwidth toggle – forces audio‑only when enabled */}
        <button
          className="btn-primary"
          onClick={() => setLowBandwidth(!lowBandwidth)}
        >
          {lowBandwidth ? 'High‑bandwidth' : 'Low‑bandwidth'}
        </button>
      </footer>
    </div>
  );
}
