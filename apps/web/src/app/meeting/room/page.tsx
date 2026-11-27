'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/components/Icons';

type Msg = { from: string; text: string; me?: boolean };

function RoomInner() {
  const search = useSearchParams();
  const code = (search.get('code') ?? '').toUpperCase();
  const router = useRouter();

  const [info, setInfo] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: 'Brigether', text: 'Welcome! This is a demo room. Chat stays in this browser.' },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`brigether:join:${code}`);
    if (!raw) { router.replace(`/meeting/lobby?code=${code}`); return; }
    const parsed = JSON.parse(raw);
    setInfo(parsed);
    const wantVideo = !parsed.lowBandwidth;
    setCamOn(wantVideo);
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: wantVideo })
      .then(setStream)
      .catch(() => setCamOn(false));
  }, [code, router]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream, info]);

  useEffect(() => () => stream?.getTracks().forEach((tk) => tk.stop()), [stream]);

  function toggleMic() {
    stream?.getAudioTracks().forEach((tk) => (tk.enabled = !micOn));
    setMicOn(!micOn);
  }
  function toggleCam() {
    stream?.getVideoTracks().forEach((tk) => (tk.enabled = !camOn));
    setCamOn(!camOn);
  }
  function leave() {
    stream?.getTracks().forEach((tk) => tk.stop());
    router.push('/');
  }
  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: info.displayName, text, me: true }]);
    setDraft('');
  }

  if (!info) return <AppShell><p>Loading…</p></AppShell>;

  return (
    <AppShell>
      <div className="grid xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 space-y-4">
          <header className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold">Meeting {info.room}</h1>
            <span className="text-xs bg-brand-soft text-brand px-3 py-1 rounded-full">
              {info.lowBandwidth ? 'Audio only' : 'Video on'}
            </span>
          </header>

          <div className="aspect-video bg-ink rounded-3xl overflow-hidden relative grid place-items-center">
            <video ref={videoRef} autoPlay muted playsInline
              className={`w-full h-full object-cover ${camOn ? '' : 'hidden'}`} />
            {!camOn && (
              <div className="w-24 h-24 rounded-full bg-bubble text-white text-4xl font-bold grid place-items-center">
                {info.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute left-4 bottom-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
              {info.displayName} (You)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="aspect-video rounded-2xl bg-panel border-2 border-dashed border-gray-300 grid place-items-center text-xs text-gray-400 text-center px-2">
                Waiting for participant
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={toggleMic} className={micOn ? 'btn-soft' : 'btn-gold'} aria-label="Toggle microphone">
              <Icon name={micOn ? 'mic' : 'micOff'} />
            </button>
            <button onClick={toggleCam} className={camOn ? 'btn-soft' : 'btn-gold'} aria-label="Toggle camera">
              <Icon name={camOn ? 'video' : 'videoOff'} />
            </button>
            <button onClick={leave} className="btn-danger px-8">Leave</button>
          </div>
        </section>

        <aside className="bg-panel rounded-3xl p-4 flex flex-col min-h-[420px]">
          <h2 className="font-semibold">Conversation <span className="text-orange-500">(1)</span></h2>
          <div className="flex items-center gap-3 bg-white rounded-2xl p-2 mt-3">
            <div className="w-9 h-9 rounded-full bg-bubble/20 text-bubble font-semibold grid place-items-center">
              {info.displayName.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium">{info.displayName}</p>
          </div>

          <h2 className="font-semibold mt-4 mb-2">Chat</h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={i} className={m.me ? 'flex justify-end' : ''}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${m.me ? 'bg-bubble text-white' : 'bg-white'}`}>
                  {!m.me && <p className="text-xs font-semibold text-gray-500">{m.from}</p>}
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 mt-3">
            <input className="input bg-white" placeholder="Type your message" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="w-11 h-11 rounded-full bg-brand text-white grid place-items-center shrink-0" aria-label="Send">
              <Icon name="send" className="w-4 h-4" />
            </button>
          </form>
        </aside>
      </div>
    </AppShell>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <RoomInner />
    </Suspense>
  );
}