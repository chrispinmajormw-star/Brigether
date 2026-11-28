'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon, Logo } from '@/components/Icons';
import { Backdrop } from '@/components/Centered';

type Msg = { from: string; text: string; me?: boolean };

function RoomInner() {
  const search = useSearchParams();
  const code = (search.get('code') ?? '').toUpperCase();
  const router = useRouter();

  const [info, setInfo] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

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
      .catch(() => { setCamOn(false); setMicOn(false); });
  }, [code, router]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream, info, camOn]);

  useEffect(() => () => stream?.getTracks().forEach((tk) => tk.stop()), [stream]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, chatOpen]);

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
  async function copyInvite() {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
    const link = `${window.location.origin}${base}/meeting/lobby/?code=${code}`;
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  }
  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: info.displayName, text, me: true }]);
    setDraft('');
  }

  if (!info) return <main id="main" className="min-h-screen bg-ink grid place-items-center text-white/60">Joining…</main>;

  const initial = info.displayName.charAt(0).toUpperCase();
  const ctrl = 'w-12 h-12 rounded-full grid place-items-center transition';

  return (
    <div className="relative min-h-screen bg-ink text-white flex flex-col">
      <Backdrop dark />

      <header className="relative z-10 flex justify-center pt-4 px-4">
        <div className="bg-white/10 backdrop-blur rounded-full pl-3 pr-1.5 py-1.5 flex items-center gap-3 text-sm">
          <Logo size="w-7 h-7" light />
          <span className="font-mono tracking-[0.25em] font-semibold">{code}</span>
          {info.lowBandwidth && <span className="text-xs bg-brand/25 text-brand px-2.5 py-1 rounded-full">Low-data</span>}
          <button onClick={copyInvite} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full inline-flex items-center gap-2 font-medium">
            <Icon name={copied ? 'check' : 'copy'} className="w-4 h-4" /> {copied ? 'Copied' : 'Invite'}
          </button>
        </div>
      </header>

      <main id="main" className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-4 pb-32 gap-5">
        <div className="w-full max-w-4xl aspect-video max-h-[62vh] rounded-[2rem] overflow-hidden bg-white/5 ring-1 ring-white/10 relative grid place-items-center">
          <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover -scale-x-100 ${camOn ? '' : 'hidden'}`} />
          {!camOn && (
            <div className="w-28 h-28 rounded-full bg-brand text-ink text-5xl font-extrabold grid place-items-center">{initial}</div>
          )}
          <span className="absolute left-4 bottom-4 bg-black/60 text-sm px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
            {!micOn && <Icon name="micOff" className="w-3.5 h-3.5 text-red-400" />}
            {info.displayName} (You)
          </span>
        </div>
        <p className="text-sm text-white/55 text-center">
          Waiting for others. Share the code <span className="font-mono tracking-widest text-white">{code}</span> to invite them.
        </p>
      </main>

      {chatOpen && (
        <aside aria-label="Chat"
          className="fixed inset-0 sm:inset-auto sm:right-5 sm:top-20 sm:bottom-28 sm:w-80 bg-white text-ink sm:rounded-3xl shadow-2xl flex flex-col z-30">
          <div className="h-14 px-5 flex items-center justify-between border-b border-ink/10 shrink-0">
            <h2 className="font-bold">Chat</h2>
            <button onClick={() => setChatOpen(false)} aria-label="Close chat" className="p-2 rounded-full hover:bg-sand">
              <Icon name="x" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
            {msgs.length === 0 && <p className="text-sm text-ink/50 text-center mt-6">No messages yet. Say hello!</p>}
            {msgs.map((m, i) => (
              <div key={i} className={m.me ? 'flex justify-end' : ''}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${m.me ? 'bg-ink text-white' : 'bg-sand'}`}>
                  {!m.me && <p className="text-xs font-semibold text-ink/50">{m.from}</p>}
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="p-3 border-t border-ink/10 flex gap-2 shrink-0">
            <input className="input !py-2.5" placeholder="Send a message" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <button className="w-11 h-11 rounded-full bg-brand text-ink grid place-items-center shrink-0" aria-label="Send">
              <Icon name="send" className="w-4 h-4" />
            </button>
          </form>
        </aside>
      )}

      <footer className="fixed bottom-5 inset-x-0 flex justify-center z-20 px-4">
        <div className="bg-white text-ink rounded-full p-2 flex items-center gap-2 shadow-2xl">
          <button onClick={toggleMic} aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'} aria-pressed={!micOn}
            className={`${ctrl} ${micOn ? 'bg-sand hover:bg-ink/10' : 'bg-danger text-white'}`}>
            <Icon name={micOn ? 'mic' : 'micOff'} />
          </button>
          <button onClick={toggleCam} aria-label={camOn ? 'Turn off camera' : 'Turn on camera'} aria-pressed={!camOn}
            className={`${ctrl} ${camOn ? 'bg-sand hover:bg-ink/10' : 'bg-danger text-white'}`}>
            <Icon name={camOn ? 'video' : 'videoOff'} />
          </button>
          <button onClick={() => setChatOpen(!chatOpen)} aria-label="Toggle chat" aria-pressed={chatOpen}
            className={`${ctrl} ${chatOpen ? 'bg-brand' : 'bg-sand hover:bg-ink/10'}`}>
            <Icon name="chat" />
          </button>
          <button onClick={leave} className="h-12 px-6 rounded-full bg-danger text-white font-semibold hover:brightness-110">Leave</button>
        </div>
      </footer>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <RoomInner />
    </Suspense>
  );
}